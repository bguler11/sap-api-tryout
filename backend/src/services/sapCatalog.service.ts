import fetch from 'node-fetch';
// @ts-ignore
import { HttpsProxyAgent } from 'https-proxy-agent';
import { getCommScenario } from './commScenarioMap';

import { getProxyAgent } from './proxyAgent';

const CATALOG_BASE = "https://api.sap.com/odata/1.0/catalog.svc";
const ARTIFACT_LIST_URL =
  `${CATALOG_BASE}/ContentEntities.ContentPackages('SAPS4HANACloud')/Artifacts` +
  `?$format=json&$filter=Type eq 'API' and State eq 'ACTIVE' and (SubType eq 'ODATA' or SubType eq 'ODATAV4' or SubType eq 'SOAP')` +
  `&$select=Name,DisplayName,Description,SubType,Version&$top=1000`;

const TIMEOUT_MS = 20000;

function getApiKey(): string {
  return process.env.SAP_API_KEY || '';
}

export interface CatalogApiResult {
  name: string;
  title: string;
  description: string;
  subType: string;
  version: string;
}

export interface CatalogApiDetail {
  name: string;
  title: string;
  sandboxUrl: string;
  serviceUrl: string;
  subType: string;
  communicationScenario: string | null;
}

let listCache: CatalogApiResult[] | null = null;
let listCachedAt: number | null = null;
const LIST_CACHE_TTL = 60 * 60 * 1000;

const detailCache = new Map<string, CatalogApiDetail>();

async function fetchWithTimeout(url: string, options: any = {}): Promise<any> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, { agent: getProxyAgent(), ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function apiKeyHeaders() {
  return { Accept: 'application/json', APIKey: getApiKey() };
}

// SAP, kimliksiz/gated katalog isteklerine HTTP 200 + text/html ile bir OAuth
// login yönlendirme sayfası döndürür. Bunu JSON sanıp parse etmek
// "Unexpected token '<'" hatasına yol açar; bu yüzden önceden tespit ediyoruz.
function isSapLoginHtml(body: string): boolean {
  const s = body.slice(0, 500).toLowerCase();
  return s.startsWith('<html') || s.includes('locationafterlogin') || s.includes('/oauth/authorize');
}

async function loadAllApis(): Promise<CatalogApiResult[]> {
  const now = Date.now();
  if (listCache && listCachedAt && now - listCachedAt < LIST_CACHE_TTL) {
    return listCache;
  }

  const results: CatalogApiResult[] = [];
  let url: string | null = ARTIFACT_LIST_URL;

  while (url) {
    const res = await fetchWithTimeout(url, { headers: apiKeyHeaders() });
    if (!res.ok) break;

    const json = await res.json() as any;
    const items: any[] = json?.d?.results || [];

    for (const item of items) {
      results.push({
        name: item.Name || '',
        title: item.DisplayName || item.Name || '',
        description: item.Description || '',
        subType: item.SubType || 'ODATA',
        version: item.Version || '1.0.0',
      });
    }

    const next = json?.d?.__next;
    url = next ? `${next}&$format=json` : null;
  }

  listCache = results;
  listCachedAt = Date.now();
  console.log(`SAP Catalog: ${results.length} API yüklendi`);
  return results;
}

export async function searchSapCatalog(query: string): Promise<CatalogApiResult[]> {
  if (!query || query.trim().length < 2) return [];

  const all = await loadAllApis();
  const q = query.toLowerCase().trim();

  return all
    .filter(a =>
      a.name.toLowerCase().includes(q) ||
      a.title.toLowerCase().includes(q)
    )
    .sort((a, b) => {
      const aStarts = a.title.toLowerCase().startsWith(q) ? 0 : 1;
      const bStarts = b.title.toLowerCase().startsWith(q) ? 0 : 1;
      return aStarts - bStarts;
    })
    .slice(0, 20);
}

export async function getApiDetail(apiName: string): Promise<CatalogApiDetail> {
  if (detailCache.has(apiName)) {
    return detailCache.get(apiName)!;
  }

  // SAP, detay + ServiceUrl taşıyan APIContent.APIs('...') entity'sini OAuth
  // arkasına aldı (APIKey ile HTTP 200 + login HTML döner). Jenerik Artifacts
  // entity'si ise hâlâ APIKey ile çalışıyor; oradan temel bilgileri alıp
  // sandbox/service URL'lerini kalıptan türetiyoruz.
  const url = `${CATALOG_BASE}/Artifacts(Name='${encodeURIComponent(apiName)}',Type='API')?$format=json`;
  const res = await fetchWithTimeout(url, { headers: apiKeyHeaders() });

  const raw: string = await res.text();
  if (isSapLoginHtml(raw)) {
    throw new Error("SAP API Hub kimlik hatası: katalog isteği login sayfasına yönlendirildi — SAP_API_KEY eksik veya geçersiz olabilir");
  }
  if (!res.ok) {
    throw new Error(`SAP Catalog API detayı alınamadı: HTTP ${res.status}`);
  }

  let json: any;
  try {
    json = JSON.parse(raw);
  } catch {
    throw new Error('SAP Catalog beklenmeyen (JSON olmayan) yanıt döndürdü');
  }
  const d = json?.d;
  if (!d || !d.Name) throw new Error(`"${apiName}" SAP Catalog'da bulunamadı`);

  const name: string = d.Name || apiName;
  const subType: string = (d.SubType || 'ODATA').toUpperCase();

  // Sandbox URL kalıbı yalnızca OData v2 için deterministik. v4 / SOAP'ta gerçek
  // path kalıptan çıkarılamaz → sandboxUrl boş kalır ve akış "Spec Yükle" yoluna
  // düşer (metadata.service bu durumda anlaşılır bir hata fırlatır).
  let sandboxUrl = '';
  let serviceUrl = '';
  if (subType === 'ODATA') {
    serviceUrl = `/sap/opu/odata/sap/${name}`;
    sandboxUrl = `https://sandbox.api.sap.com/s4hanacloud${serviceUrl}`;
  } else if (subType === 'SOAP') {
    serviceUrl = `/sap/bc/srt/scs_ext/sap/${name.toLowerCase()}`;
  }

  const detail: CatalogApiDetail = {
    name,
    title: d.DisplayName || d.Description || name,
    sandboxUrl,
    serviceUrl,
    subType,
    communicationScenario: getCommScenario(name),
  };

  detailCache.set(apiName, detail);
  return detail;
}

export async function getRawApiHubSpec(apiName: string): Promise<any> {
  const url = `${CATALOG_BASE}/APIContent.APIs('${encodeURIComponent(apiName)}')/$value?type=json`;
  const res = await fetchWithTimeout(url, { headers: apiKeyHeaders() });
  const raw: string = await res.text();
  if (isSapLoginHtml(raw)) {
    throw new Error("SAP API Hub ham spec uç noktasını artık APIKey ile vermiyor (OAuth gerekiyor) — \"Spec Yükle\" ile manuel yükleyebilirsiniz");
  }
  if (!res.ok) {
    throw new Error(`SAP API Hub'dan spec indirilemedi: HTTP ${res.status}`);
  }
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error('SAP API Hub beklenmeyen (JSON olmayan) yanıt döndürdü');
  }
}

export async function fetchSandboxMetadata(apiName: string): Promise<string> {
  const detail = await getApiDetail(apiName);

  if (!detail.sandboxUrl) {
    throw new Error(`${apiName} için sandbox URL bulunamadı`);
  }

  const metadataUrl = `${detail.sandboxUrl}/$metadata`;
  const res = await fetchWithTimeout(metadataUrl, {
    headers: { APIKey: getApiKey(), Accept: 'application/xml' },
  });

  if (!res.ok) {
    throw new Error(`Sandbox $metadata alınamadı: HTTP ${res.status} — ${metadataUrl}`);
  }

  return res.text();
}

export function preloadCatalog(): void {
  loadAllApis().catch(err =>
    console.warn('SAP Catalog ön yükleme başarısız:', err.message)
  );
}

export function getCatalogTitleMap(): Map<string, string> {
  const map = new Map<string, string>();
  if (!listCache) return map;
  for (const item of listCache) {
    map.set(item.name.toUpperCase(), item.title);
  }
  return map;
}
