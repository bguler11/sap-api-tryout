import fetch from 'node-fetch';
import { getCommScenario } from './commScenarioMap';
import { globalProxyAgent } from './proxyAgent';

const TIMEOUT_MS = 15000;
const ODATA4_PATH = '/sap/opu/odata4/sap/aps_com_ca_a4c_odata/srvd_a2x/sap/aps_com_ca_a4c_odata/0001';

function buildBasicAuth(username: string, password: string) {
  return 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64');
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

async function getArrangementScenarios(baseUrl: string, auth: string): Promise<string[] | null> {
  const url = `${baseUrl}${ODATA4_PATH}/CommunicationArrangements?$select=CommunicationScenarioID`;
  try {
    const res = await fetchWithTimeout(url, {
      method: 'GET',
      headers: { Authorization: auth, Accept: 'application/json' },
    });
    if (res.status === 401 || res.status === 403) return null;
    if (res.status >= 400) return null;
    const json = await res.json() as any;
    const entries: any[] = json?.value || [];
    return entries.map((e: any) => e.CommunicationScenarioID).filter(Boolean);
  } catch {
    return null;
  }
}

export async function checkArrangement(
  baseUrl: string,
  username: string,
  password: string,
  serviceName: string
): Promise<{ exists: boolean; checkable: boolean; scenarioId: string; noMapping: boolean }> {
  const scenarioId = getCommScenario(serviceName) ?? '';
  const auth = buildBasicAuth(username, password);
  const base = baseUrl.replace(/\/$/, '');
  const scenarios = await getArrangementScenarios(base, auth);

  if (scenarios === null) return { exists: false, checkable: false, scenarioId, noMapping: !scenarioId };
  if (!scenarioId) return { exists: false, checkable: true, scenarioId: '', noMapping: true };
  return { exists: scenarios.includes(scenarioId), checkable: true, scenarioId, noMapping: false };
}

export async function ensureArrangement(
  baseUrl: string,
  username: string,
  password: string,
  serviceName: string
): Promise<{ status: 'ok' | 'failed'; message: string }> {
  const check = await checkArrangement(baseUrl, username, password, serviceName);
  if (!check.checkable) return { status: 'failed', message: 'Communication Arrangement servisi erişilemiyor (401/403)' };
  if (check.exists) return { status: 'ok', message: `Arrangement mevcut (${check.scenarioId})` };
  return { status: 'failed', message: `${check.scenarioId} scenariosu tanımlanmamış` };
}
