import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import fs from 'fs';
import path from 'path';
import { encrypt, decrypt } from './encryption.service';

const DB_PATH = path.join(__dirname, '..', '..', 'data', 'tryout.db');

let db: SqlJsDatabase;

function saveDb() {
  const data = db.export();
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

export async function initDb(): Promise<void> {
  const SQL = await initSqlJs();
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS environments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      base_url TEXT NOT NULL,
      username TEXT NOT NULL,
      password_encrypted TEXT NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS user_variants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      api_id TEXT NOT NULL,
      method TEXT NOT NULL,
      path TEXT NOT NULL,
      name TEXT NOT NULL,
      params TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS global_variants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      environment_id INTEGER NOT NULL,
      created_by INTEGER NOT NULL,
      api_id TEXT NOT NULL,
      method TEXT NOT NULL,
      path TEXT NOT NULL,
      name TEXT NOT NULL,
      params TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (environment_id) REFERENCES environments(id),
      FOREIGN KEY (created_by) REFERENCES users(id)
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS request_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      environment_id INTEGER,
      method TEXT NOT NULL,
      path TEXT NOT NULL,
      status_code INTEGER,
      duration_ms INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS environment_apis (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      environment_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      service_name TEXT NOT NULL,
      service_url TEXT NOT NULL,
      protocol TEXT NOT NULL DEFAULT 'OData',
      arrangement_status TEXT NOT NULL DEFAULT 'pending',
      spec_cache TEXT,
      spec_cached_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (environment_id) REFERENCES environments(id)
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS comm_scenario_map (
      service_name TEXT PRIMARY KEY,
      scenario_id TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  saveDb();
}

export interface CommScenarioEntry {
  service_name: string;
  scenario_id: string;
  updated_at: string;
}

export function getAllCommScenarios(): CommScenarioEntry[] {
  return queryAll<CommScenarioEntry>(
    'SELECT service_name, scenario_id, updated_at FROM comm_scenario_map ORDER BY service_name'
  );
}

export function getCommScenarioByName(serviceName: string): CommScenarioEntry | null {
  return queryOne<CommScenarioEntry>(
    'SELECT service_name, scenario_id, updated_at FROM comm_scenario_map WHERE service_name = ?',
    [serviceName.toUpperCase()]
  );
}

export function upsertCommScenarioBulk(entries: { service_name: string; scenario_id: string }[]): void {
  for (const e of entries) {
    run(
      'INSERT INTO comm_scenario_map (service_name, scenario_id, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP) ON CONFLICT(service_name) DO UPDATE SET scenario_id=excluded.scenario_id, updated_at=CURRENT_TIMESTAMP',
      [e.service_name.toUpperCase(), e.scenario_id]
    );
  }
}

export function deleteCommScenario(serviceName: string): boolean {
  const before = queryAll('SELECT service_name FROM comm_scenario_map WHERE service_name = ?', [serviceName.toUpperCase()]);
  if (before.length === 0) return false;
  run('DELETE FROM comm_scenario_map WHERE service_name = ?', [serviceName.toUpperCase()]);
  return true;
}

export function seedCommScenarios(map: Record<string, string>): void {
  for (const [serviceName, scenarioId] of Object.entries(map)) {
    const existing = queryOne('SELECT service_name FROM comm_scenario_map WHERE service_name = ?', [serviceName]);
    if (!existing) {
      run('INSERT INTO comm_scenario_map (service_name, scenario_id) VALUES (?, ?)', [serviceName, scenarioId]);
    }
  }
}

function getDb(): SqlJsDatabase {
  if (!db) throw new Error('DB henüz başlatılmadı');
  return db;
}

function queryAll<T>(sql: string, params: any[] = []): T[] {
  const stmt = getDb().prepare(sql);
  stmt.bind(params);
  const rows: T[] = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject() as T);
  }
  stmt.free();
  return rows;
}

function queryOne<T>(sql: string, params: any[] = []): T | null {
  return queryAll<T>(sql, params)[0] || null;
}

function run(sql: string, params: any[] = []): void {
  getDb().run(sql, params);
  saveDb();
}

export interface User {
  id: number;
  email: string;
  name?: string;
  created_at: string;
}

export interface UserWithHash extends User {
  password_hash: string;
}

export function createUser(data: { email: string; password_hash: string; name?: string }): User {
  run(
    'INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)',
    [data.email, data.password_hash, data.name || null]
  );
  return queryOne<User>(
    'SELECT id, email, name, created_at FROM users ORDER BY id DESC LIMIT 1'
  )!;
}

export function getUserByEmail(email: string): UserWithHash | null {
  return queryOne<UserWithHash>(
    'SELECT id, email, name, password_hash, created_at FROM users WHERE email = ?',
    [email]
  );
}

export function getUserById(id: number): User | null {
  return queryOne<User>(
    'SELECT id, email, name, created_at FROM users WHERE id = ?',
    [id]
  );
}

export interface Environment {
  id: number;
  user_id: number;
  name: string;
  base_url: string;
  username: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface EnvironmentWithPassword extends Environment {
  password: string;
}

export function getAllEnvironments(userId: number): Environment[] {
  return queryAll<Environment>(
    'SELECT id, user_id, name, base_url, username, description, created_at, updated_at FROM environments WHERE user_id = ? ORDER BY name',
    [userId]
  );
}

export function getEnvironmentById(id: number, userId: number): EnvironmentWithPassword | null {
  const row = queryOne<any>(
    'SELECT id, user_id, name, base_url, username, password_encrypted, description, created_at, updated_at FROM environments WHERE id = ? AND user_id = ?',
    [id, userId]
  );
  if (!row) return null;
  return { ...row, password: decrypt(row.password_encrypted) };
}

export function getEnvironmentByIdUnsafe(id: number): EnvironmentWithPassword | null {
  const row = queryOne<any>(
    'SELECT id, user_id, name, base_url, username, password_encrypted, description, created_at, updated_at FROM environments WHERE id = ?',
    [id]
  );
  if (!row) return null;
  return { ...row, password: decrypt(row.password_encrypted) };
}

export function createEnvironment(data: {
  user_id: number;
  name: string;
  base_url: string;
  username: string;
  password: string;
  description?: string;
}): Environment {
  const passwordEncrypted = encrypt(data.password);
  run(
    'INSERT INTO environments (user_id, name, base_url, username, password_encrypted, description) VALUES (?, ?, ?, ?, ?, ?)',
    [data.user_id, data.name, data.base_url, data.username, passwordEncrypted, data.description || null]
  );
  return queryOne<Environment>(
    'SELECT id, user_id, name, base_url, username, description, created_at, updated_at FROM environments ORDER BY id DESC LIMIT 1'
  )!;
}

export function updateEnvironment(id: number, userId: number, data: {
  name?: string; base_url?: string; username?: string; password?: string; description?: string;
}): Environment | null {
  const existing = getEnvironmentById(id, userId);
  if (!existing) return null;
  const passwordEncrypted = data.password ? encrypt(data.password) : null;
  if (passwordEncrypted) {
    run(
      'UPDATE environments SET name=?, base_url=?, username=?, password_encrypted=?, description=?, updated_at=CURRENT_TIMESTAMP WHERE id=? AND user_id=?',
      [data.name ?? existing.name, data.base_url ?? existing.base_url, data.username ?? existing.username, passwordEncrypted, data.description ?? existing.description ?? null, id, userId]
    );
  } else {
    run(
      'UPDATE environments SET name=?, base_url=?, username=?, description=?, updated_at=CURRENT_TIMESTAMP WHERE id=? AND user_id=?',
      [data.name ?? existing.name, data.base_url ?? existing.base_url, data.username ?? existing.username, data.description ?? existing.description ?? null, id, userId]
    );
  }
  return queryOne<Environment>(
    'SELECT id, user_id, name, base_url, username, description, created_at, updated_at FROM environments WHERE id=?',
    [id]
  );
}

export function deleteEnvironment(id: number, userId: number): boolean {
  const before = queryAll('SELECT id FROM environments WHERE id=? AND user_id=?', [id, userId]);
  if (before.length === 0) return false;
  run('DELETE FROM environments WHERE id=? AND user_id=?', [id, userId]);
  return true;
}

export interface Variant {
  id: number;
  api_id: string;
  method: string;
  path: string;
  name: string;
  params: Record<string, any>;
  created_at: string;
  scope: 'user' | 'global';
  environment_id?: number;
  created_by?: number;
  created_by_email?: string;
  environment_name?: string;
}

export function getUserVariants(userId: number, apiId: string, method: string, path: string): Variant[] {
  return queryAll<any>(
    'SELECT id, api_id, method, path, name, params, created_at FROM user_variants WHERE user_id=? AND api_id=? AND method=? AND path=? ORDER BY name',
    [userId, apiId, method, path]
  ).map(r => ({ ...r, params: JSON.parse(r.params), scope: 'user' as const }));
}

export function createUserVariant(data: {
  user_id: number;
  api_id: string;
  method: string;
  path: string;
  name: string;
  params: Record<string, any>;
}): Variant {
  run(
    'INSERT INTO user_variants (user_id, api_id, method, path, name, params) VALUES (?, ?, ?, ?, ?, ?)',
    [data.user_id, data.api_id, data.method, data.path, data.name, JSON.stringify(data.params)]
  );
  const row = queryOne<any>(
    'SELECT id, api_id, method, path, name, params, created_at FROM user_variants ORDER BY id DESC LIMIT 1'
  )!;
  return { ...row, params: JSON.parse(row.params), scope: 'user' as const };
}

export function deleteUserVariant(id: number, userId: number): boolean {
  const before = queryAll('SELECT id FROM user_variants WHERE id=? AND user_id=?', [id, userId]);
  if (before.length === 0) return false;
  run('DELETE FROM user_variants WHERE id=? AND user_id=?', [id, userId]);
  return true;
}

function extractTenantFromUrl(url: string): string {
  try {
    const cleanUrl = url.replace(/^(https?:\/\/)?(www\.)?/, '');
    const host = cleanUrl.split('/')[0].split(':')[0]; // Port ve path temizliği
    const parts = host.split('.');
    for (const part of parts) {
      if (part.toLowerCase().startsWith('my')) {
        return part;
      }
    }
    return parts[0] || 'SAP';
  } catch {
    return 'SAP';
  }
}

export function getGlobalVariants(environmentId: number, apiId: string, method: string, path: string): Variant[] {
  const env = queryOne<{ base_url: string }>('SELECT base_url FROM environments WHERE id = ?', [environmentId]);
  if (!env) return [];
  
  const cleanUrl = env.base_url.trim().toLowerCase().replace(/\/$/, '');
  
  // Aynı base_url adresine sahip tüm ortamları getir (normalleştirilmiş eşleşme)
  const envs = queryAll<{ id: number; base_url: string }>('SELECT id, base_url FROM environments');
  const matchingEnvIds = envs
    .filter(e => e.base_url.trim().toLowerCase().replace(/\/$/, '') === cleanUrl)
    .map(e => e.id);
    
  if (matchingEnvIds.length === 0) return [];

  // Mevcut apiId'nin service_name değerini bul
  const currentApi = queryOne<{ service_name: string }>('SELECT service_name FROM environment_apis WHERE id = ?', [Number(apiId)]);
  let matchingApiIds = [apiId];
  if (currentApi) {
    // Aynı service_name değerine sahip tüm yerel environment_api ID'lerini bul
    const matchingApis = queryAll<{ id: number }>('SELECT id FROM environment_apis WHERE service_name = ?', [currentApi.service_name]);
    matchingApiIds = matchingApis.map(a => String(a.id));
  }
  
  const envPlaceholders = matchingEnvIds.map(() => '?').join(',');
  const apiPlaceholders = matchingApiIds.map(() => '?').join(',');
  
  return queryAll<any>(
    `SELECT gv.id, gv.api_id, gv.method, gv.path, gv.name, gv.params, gv.created_at, gv.environment_id, gv.created_by, u.email as created_by_email, e.name as environment_name, e.base_url as environment_url
     FROM global_variants gv
     LEFT JOIN users u ON gv.created_by = u.id
     LEFT JOIN environments e ON gv.environment_id = e.id
     WHERE gv.environment_id IN (${envPlaceholders}) AND gv.api_id IN (${apiPlaceholders}) AND gv.method=? AND gv.path=?
     ORDER BY gv.name`,
    [...matchingEnvIds, ...matchingApiIds, method, path]
  ).map(r => {
    let systemLabel = 'SAP';
    if (r.environment_url) {
      systemLabel = extractTenantFromUrl(r.environment_url);
    }
    return {
      ...r,
      params: JSON.parse(r.params),
      scope: 'global' as const,
      environment_name: systemLabel
    };
  });
}

export function createGlobalVariant(data: {
  environment_id: number;
  created_by: number;
  api_id: string;
  method: string;
  path: string;
  name: string;
  params: Record<string, any>;
}): Variant {
  run(
    'INSERT INTO global_variants (environment_id, created_by, api_id, method, path, name, params) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [data.environment_id, data.created_by, data.api_id, data.method, data.path, data.name, JSON.stringify(data.params)]
  );
  const row = queryOne<any>(
    `SELECT gv.id, gv.api_id, gv.method, gv.path, gv.name, gv.params, gv.created_at, gv.environment_id, gv.created_by, u.email as created_by_email
     FROM global_variants gv LEFT JOIN users u ON gv.created_by = u.id
     ORDER BY gv.id DESC LIMIT 1`
  )!;
  return { ...row, params: JSON.parse(row.params), scope: 'global' as const };
}

export function deleteGlobalVariant(id: number, userId: number): boolean {
  const before = queryAll('SELECT id FROM global_variants WHERE id=? AND created_by=?', [id, userId]);
  if (before.length === 0) return false;
  run('DELETE FROM global_variants WHERE id=? AND created_by=?', [id, userId]);
  return true;
}

export interface EnvironmentApi {
  id: number;
  environment_id: number;
  name: string;
  description?: string;
  service_name: string;
  service_url: string;
  protocol: string;
  arrangement_status: 'ok' | 'failed' | 'pending';
  spec_cache?: string;
  spec_cached_at?: string;
  created_at: string;
}

export function getEnvironmentApis(environmentId: number): EnvironmentApi[] {
  return queryAll<EnvironmentApi>(
    'SELECT id, environment_id, name, description, service_name, service_url, protocol, arrangement_status, spec_cached_at, created_at FROM environment_apis WHERE environment_id = ? ORDER BY name',
    [environmentId]
  );
}

export function getEnvironmentApiById(id: number): EnvironmentApi | null {
  return queryOne<EnvironmentApi>(
    'SELECT id, environment_id, name, description, service_name, service_url, protocol, arrangement_status, spec_cache, spec_cached_at, created_at FROM environment_apis WHERE id = ?',
    [id]
  );
}

export function createEnvironmentApi(data: {
  environment_id: number;
  name: string;
  description?: string;
  service_name: string;
  service_url: string;
  protocol?: string;
  arrangement_status?: string;
}): EnvironmentApi {
  const existing = queryOne<{ id: number }>(
    'SELECT id FROM environment_apis WHERE environment_id = ? AND service_name = ?',
    [data.environment_id, data.service_name]
  );
  if (existing) throw new Error('Bu servis bu ortama zaten eklenmiş');
  run(
    'INSERT INTO environment_apis (environment_id, name, description, service_name, service_url, protocol, arrangement_status) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [data.environment_id, data.name, data.description || null, data.service_name, data.service_url, data.protocol || 'OData', data.arrangement_status || 'pending']
  );
  return queryOne<EnvironmentApi>(
    'SELECT id, environment_id, name, description, service_name, service_url, protocol, arrangement_status, spec_cached_at, created_at FROM environment_apis ORDER BY id DESC LIMIT 1'
  )!;
}

export function updateEnvironmentApiSpec(id: number, specJson: string): void {
  run(
    'UPDATE environment_apis SET spec_cache = ?, spec_cached_at = CURRENT_TIMESTAMP WHERE id = ?',
    [specJson, id]
  );
}

export function updateEnvironmentApiArrangement(id: number, status: 'ok' | 'failed' | 'pending'): void {
  run('UPDATE environment_apis SET arrangement_status = ? WHERE id = ?', [status, id]);
}

export function deleteEnvironmentApi(id: number): boolean {
  const before = queryAll('SELECT id FROM environment_apis WHERE id = ?', [id]);
  if (before.length === 0) return false;
  run('DELETE FROM environment_apis WHERE id = ?', [id]);
  return true;
}

export function addRequestHistory(data: {
  environment_id: number;
  method: string;
  path: string;
  status_code: number;
  duration_ms: number;
}) {
  run(
    'INSERT INTO request_history (environment_id, method, path, status_code, duration_ms) VALUES (?, ?, ?, ?, ?)',
    [data.environment_id, data.method, data.path, data.status_code, data.duration_ms]
  );
}

export function getRequestHistory(limit = 50) {
  return queryAll(
    `SELECT rh.id, rh.environment_id, rh.method, rh.path, rh.status_code, rh.duration_ms, rh.created_at, e.name as environment_name
     FROM request_history rh
     LEFT JOIN environments e ON rh.environment_id = e.id
     ORDER BY rh.created_at DESC
     LIMIT ?`,
    [limit]
  );
}
