import fetch from 'node-fetch';
import { parseStringPromise } from 'xml2js';
import { getApiDetail } from './sapCatalog.service';
import { globalProxyAgent } from './proxyAgent';

const TIMEOUT_MS = 30000; // 30 saniyeye çıkarıldı

function getApiKey(): string {
  return process.env.SAP_API_KEY || '';
}

async function fetchWithTimeout(url: string, options: any): Promise<any> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, { agent: globalProxyAgent, ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export interface ParsedSpec {
  serviceName: string;
  serviceUrl: string;
  protocol: 'OData' | 'SOAP';
  openapi: object;
}

function safeAttr(obj: any, key: string, fallback = ''): string {
  if (!obj || !obj.$) return fallback;
  return obj.$[key] ?? fallback;
}

function edmToJsonType(edmType: string): string {
  const map: Record<string, string> = {
    'Edm.String': 'string',
    'Edm.Int16': 'integer',
    'Edm.Int32': 'integer',
    'Edm.Int64': 'integer',
    'Edm.Decimal': 'number',
    'Edm.Double': 'number',
    'Edm.Single': 'number',
    'Edm.Boolean': 'boolean',
    'Edm.DateTime': 'string',
    'Edm.DateTimeOffset': 'string',
    'Edm.Date': 'string',
    'Edm.TimeOfDay': 'string',
    'Edm.Guid': 'string',
    'Edm.Binary': 'string',
    'Edm.Byte': 'integer',
    'Edm.SByte': 'integer',
  };
  return map[edmType] || 'string';
}

function buildV2OpenApi(parsed: any, serviceName: string, serviceUrl: string, memberTitles: Record<string, string> = {}): object {
  const schema = parsed['edmx:Edmx']?.['edmx:DataServices']?.[0]?.['Schema']?.[0];
  if (!schema) throw new Error('V2 Schema bulunamadı');

  const entityTypes: Record<string, any> = {};
  const entitySets: any[] = [];

  for (const et of schema['EntityType'] || []) {
    const name = safeAttr(et, 'Name');
    const keys = (et['Key']?.[0]?.['PropertyRef'] || []).map((k: any) => safeAttr(k, 'Name'));
    const properties: Record<string, any> = {};
    for (const prop of et['Property'] || []) {
      const pname = safeAttr(prop, 'Name');
      const ptype = safeAttr(prop, 'Type', 'Edm.String');
      properties[pname] = {
        type: edmToJsonType(ptype),
        description: safeAttr(prop, 'sap:label') || safeAttr(prop, 'sap:quickinfo') || pname,
      };
    }
    entityTypes[name] = { keys, properties };
  }

  for (const ec of schema['EntityContainer'] || []) {
    for (const es of ec['EntitySet'] || []) {
      const esName = safeAttr(es, 'Name');
      const etName = safeAttr(es, 'EntityType').split('.').pop() || '';
      const creatable = safeAttr(es, 'sap:creatable', 'true') !== 'false';
      const updatable = safeAttr(es, 'sap:updatable', 'true') !== 'false';
      const deletable = safeAttr(es, 'sap:deletable', 'true') !== 'false';
      const label = memberTitles[esName] || esName;
      entitySets.push({ name: esName, entityType: etName, creatable, updatable, deletable, label });
    }
  }

  return buildPaths(entityTypes, entitySets, serviceUrl, serviceName);
}

function buildV4OpenApi(parsed: any, serviceName: string, serviceUrl: string, memberTitles: Record<string, string> = {}): object {
  const dataServices = parsed['edmx:Edmx']?.['edmx:DataServices']?.[0];
  const schemas: any[] = dataServices?.['Schema'] || [];

  const entityTypes: Record<string, any> = {};
  const entitySets: any[] = [];

  for (const schema of schemas) {
    for (const et of schema['EntityType'] || []) {
      const name = safeAttr(et, 'Name');
      const keys = (et['Key']?.[0]?.['PropertyRef'] || []).map((k: any) => safeAttr(k, 'Name'));
      const properties: Record<string, any> = {};
      for (const prop of et['Property'] || []) {
        const pname = safeAttr(prop, 'Name');
        const ptype = safeAttr(prop, 'Type', 'Edm.String');
        properties[pname] = {
          type: edmToJsonType(ptype),
          description: pname,
        };
      }
      entityTypes[name] = { keys, properties };
    }

    for (const ec of schema['EntityContainer'] || []) {
      for (const es of ec['EntitySet'] || []) {
        const esName = safeAttr(es, 'Name');
        const etName = safeAttr(es, 'EntityType').split('.').pop() || '';
        const label = memberTitles[esName] || esName;
        entitySets.push({ name: esName, entityType: etName, creatable: true, updatable: true, deletable: true, label });
      }
    }
  }

  return buildPaths(entityTypes, entitySets, serviceUrl, serviceName);
}

function buildPaths(
  entityTypes: Record<string, any>,
  entitySets: any[],
  serviceUrl: string,
  serviceName: string
): object {
  const paths: Record<string, any> = {};

  for (const es of entitySets) {
    const et = entityTypes[es.entityType];
    if (!et) continue;

    const collectionPath = `${serviceUrl}/${es.name}`;
    const keyParams = et.keys.map((k: string) => ({
      name: k,
      in: 'path' as const,
      required: true,
      schema: { type: et.properties[k]?.type || 'string' },
      description: et.properties[k]?.description || k,
    }));
    const keySegment = et.keys.length > 1
      ? `(${et.keys.map((k: string) => `${k}={${k}}`).join(',')})`
      : et.keys.length === 1 ? `('{${et.keys[0]}}')` : '';
    const singlePath = `${serviceUrl}/${es.name}${keySegment}`;
    const bodySchema = { type: 'object', properties: et.properties };

    const commonQueryParams = [
      { name: '$top', in: 'query', schema: { type: 'integer' }, description: 'Maksimum kayıt sayısı' },
      { name: '$skip', in: 'query', schema: { type: 'integer' }, description: 'Atlanacak kayıt sayısı' },
      { name: '$filter', in: 'query', schema: { type: 'string' }, description: 'OData filtre ifadesi' },
      { name: '$expand', in: 'query', schema: { type: 'string' }, description: 'İlişkili varlıkları genişlet' },
      { name: '$select', in: 'query', schema: { type: 'string' }, description: 'Seçilecek alanlar' },
      { name: '$orderby', in: 'query', schema: { type: 'string' }, description: 'Sıralama' },
    ];

    const tag = es.label || es.name;

    paths[collectionPath] = {
      get: {
        tags: [tag],
        summary: `${es.name} listesini getir`,
        operationId: `list_${es.name}`,
        parameters: commonQueryParams,
        responses: { '200': { description: 'Başarılı' } },
      },
      ...(es.creatable ? {
        post: {
          tags: [tag],
          summary: `${es.name} oluştur`,
          operationId: `create_${es.name}`,
          parameters: [],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: bodySchema } },
          },
          responses: { '201': { description: 'Oluşturuldu' } },
        },
      } : {}),
    };

    if (et.keys.length > 0) {
      paths[singlePath] = {
        get: {
          tags: [tag],
          summary: `${es.name} kaydını getir`,
          operationId: `get_${es.name}`,
          parameters: keyParams,
          responses: { '200': { description: 'Başarılı' } },
        },
        ...(es.updatable ? {
          patch: {
            tags: [tag],
            summary: `${es.name} güncelle`,
            operationId: `update_${es.name}`,
            parameters: keyParams,
            requestBody: {
              required: true,
              content: { 'application/json': { schema: bodySchema } },
            },
            responses: { '204': { description: 'Güncellendi' } },
          },
        } : {}),
        ...(es.deletable ? {
          delete: {
            tags: [tag],
            summary: `${es.name} sil`,
            operationId: `delete_${es.name}`,
            parameters: keyParams,
            responses: { '204': { description: 'Silindi' } },
          },
        } : {}),
      };
    }
  }

  return {
    openapi: '3.0.0',
    info: { title: serviceName, version: '1.0.0' },
    paths,
  };
}

async function fetchMemberTitles(sandboxUrl: string): Promise<Record<string, string>> {
  try {
    const res = await fetchWithTimeout(sandboxUrl + '/', {
      method: 'GET',
      headers: { APIKey: getApiKey(), Accept: 'application/xml' },
    });
    if (!res.ok) return {};
    const xml: string = await res.text();
    const parsed = await parseStringPromise(xml, { explicitArray: true, tagNameProcessors: [] });
    const collections = parsed?.['app:service']?.['app:workspace']?.[0]?.['app:collection'] || [];
    const map: Record<string, string> = {};
    for (const col of collections) {
      const href: string = col?.$?.href || '';
      const title: string = col?.['sap:member-title']?.[0] || '';
      if (href && title) map[href] = title;
    }
    return map;
  } catch {
    return {};
  }
}

export async function fetchAndParseMetadata(serviceName: string, cachedSpec?: string): Promise<ParsedSpec> {
  const detail = await getApiDetail(serviceName);
  const isSOAP = detail.subType === 'SOAP';

  let serviceUrl: string;
  let protocol: 'OData' | 'SOAP';

  if (isSOAP) {
    protocol = 'SOAP';
    serviceUrl = detail.serviceUrl || `/sap/bc/srt/scs_ext/sap/${serviceName}`;
  } else {
    protocol = 'OData';
    serviceUrl = detail.serviceUrl || `/sap/opu/odata/sap/${serviceName}`;
  }

  if (cachedSpec) {
    const openapi = JSON.parse(cachedSpec);
    return { serviceName, serviceUrl, protocol, openapi };
  }

  if (!detail.sandboxUrl) {
    throw new Error(`"${serviceName}" için sandbox URL bulunamadı — servis SAP Catalog'da kayıtlı olmayabilir`);
  }

  if (isSOAP) {
    const openapi = {
      openapi: '3.0.0',
      info: { title: serviceName, version: '1.0.0', description: 'SOAP API Placeholder' },
      paths: {},
      'x-spec-uploaded': false
    };
    return { serviceName, serviceUrl, protocol, openapi };
  }

  const [metadataRes, memberTitles] = await Promise.all([
    fetchWithTimeout(`${detail.sandboxUrl}/$metadata`, {
      method: 'GET',
      headers: { APIKey: getApiKey(), Accept: 'application/xml' },
    }),
    fetchMemberTitles(detail.sandboxUrl),
  ]);

  if (!metadataRes.ok) {
    throw new Error(`Sandbox $metadata alınamadı: ${detail.sandboxUrl}/$metadata → HTTP ${metadataRes.status}`);
  }

  const xml: string = await metadataRes.text();
  const parsed = await parseStringPromise(xml, { explicitArray: true, tagNameProcessors: [] });

  const isV4 = detail.subType === 'ODATAV4' || xml.includes('http://docs.oasis-open.org/odata/ns/edmx');

  const openapi = isV4
    ? buildV4OpenApi(parsed, serviceName, serviceUrl, memberTitles)
    : buildV2OpenApi(parsed, serviceName, serviceUrl, memberTitles);

  (openapi as any)['x-sap-comm-scenario'] = detail.communicationScenario;

  return { serviceName, serviceUrl, protocol, openapi };
}
