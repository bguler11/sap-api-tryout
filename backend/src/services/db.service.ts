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
    CREATE TABLE IF NOT EXISTS environments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      base_url TEXT NOT NULL,
      username TEXT NOT NULL,
      password_encrypted TEXT NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
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

  saveDb();
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
    const row = stmt.getAsObject() as T;
    rows.push(row);
  }
  stmt.free();
  return rows;
}

function queryOne<T>(sql: string, params: any[] = []): T | null {
  const rows = queryAll<T>(sql, params);
  return rows[0] || null;
}

function run(sql: string, params: any[] = []): void {
  getDb().run(sql, params);
  saveDb();
}

export interface Environment {
  id: number;
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

export function getAllEnvironments(): Environment[] {
  return queryAll<Environment>(
    'SELECT id, name, base_url, username, description, created_at, updated_at FROM environments ORDER BY name'
  );
}

export function getEnvironmentById(id: number): EnvironmentWithPassword | null {
  const row = queryOne<any>(
    'SELECT id, name, base_url, username, password_encrypted, description, created_at, updated_at FROM environments WHERE id = ?',
    [id]
  );
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    base_url: row.base_url,
    username: row.username,
    password: decrypt(row.password_encrypted),
    description: row.description,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export function createEnvironment(data: {
  name: string;
  base_url: string;
  username: string;
  password: string;
  description?: string;
}): Environment {
  const passwordEncrypted = encrypt(data.password);
  run(
    'INSERT INTO environments (name, base_url, username, password_encrypted, description) VALUES (?, ?, ?, ?, ?)',
    [data.name, data.base_url, data.username, passwordEncrypted, data.description || null]
  );
  const row = queryOne<any>(
    'SELECT id, name, base_url, username, description, created_at, updated_at FROM environments ORDER BY id DESC LIMIT 1'
  );
  return row as Environment;
}

export function updateEnvironment(
  id: number,
  data: { name?: string; base_url?: string; username?: string; password?: string; description?: string }
): Environment | null {
  const existing = getEnvironmentById(id);
  if (!existing) return null;

  const passwordEncrypted = data.password ? encrypt(data.password) : null;

  if (passwordEncrypted) {
    run(
      'UPDATE environments SET name=?, base_url=?, username=?, password_encrypted=?, description=?, updated_at=CURRENT_TIMESTAMP WHERE id=?',
      [data.name ?? existing.name, data.base_url ?? existing.base_url, data.username ?? existing.username, passwordEncrypted, data.description ?? existing.description ?? null, id]
    );
  } else {
    run(
      'UPDATE environments SET name=?, base_url=?, username=?, description=?, updated_at=CURRENT_TIMESTAMP WHERE id=?',
      [data.name ?? existing.name, data.base_url ?? existing.base_url, data.username ?? existing.username, data.description ?? existing.description ?? null, id]
    );
  }

  return queryOne<Environment>(
    'SELECT id, name, base_url, username, description, created_at, updated_at FROM environments WHERE id=?',
    [id]
  );
}

export function deleteEnvironment(id: number): boolean {
  const before = queryAll('SELECT id FROM environments WHERE id=?', [id]);
  if (before.length === 0) return false;
  run('DELETE FROM environments WHERE id=?', [id]);
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
