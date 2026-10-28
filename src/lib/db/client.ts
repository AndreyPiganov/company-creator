import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { mkdirSync } from "node:fs";
import path from "node:path";
import * as schema from "./schema";

type DatabaseInstance = ReturnType<typeof drizzle<typeof schema>>;

const globalDatabase = globalThis as typeof globalThis & {
  companyCreatorDb?: DatabaseInstance;
};

function databasePath() {
  return process.env.DATABASE_PATH || path.join(process.cwd(), "data", "company-creator.sqlite");
}

function createDatabase(): DatabaseInstance {
  const filePath = databasePath();
  mkdirSync(path.dirname(filePath), { recursive: true });
  const sqlite = new Database(filePath);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS companies (
      id TEXT PRIMARY KEY NOT NULL,
      brand_name TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('draft', 'approved')),
      revision INTEGER NOT NULL,
      profile_json TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      approved_at TEXT
    );
    CREATE INDEX IF NOT EXISTS companies_status_idx ON companies(status);
    CREATE INDEX IF NOT EXISTS companies_updated_idx ON companies(updated_at);

    CREATE TABLE IF NOT EXISTS site_versions (
      id TEXT PRIMARY KEY NOT NULL,
      company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
      version INTEGER NOT NULL,
      language TEXT NOT NULL CHECK (language IN ('ru', 'de')),
      theme TEXT NOT NULL CHECK (theme IN ('forest', 'midnight', 'sand', 'berry')),
      snapshot_json TEXT NOT NULL,
      artifact_path TEXT NOT NULL,
      checksum TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE UNIQUE INDEX IF NOT EXISTS site_company_version_unique ON site_versions(company_id, version);
    CREATE INDEX IF NOT EXISTS site_company_idx ON site_versions(company_id);

    CREATE TABLE IF NOT EXISTS generation_jobs (
      id TEXT PRIMARY KEY NOT NULL,
      kind TEXT NOT NULL CHECK (kind IN ('company', 'site')),
      state TEXT NOT NULL,
      attempt INTEGER NOT NULL DEFAULT 0,
      cost_usd REAL NOT NULL DEFAULT 0,
      input_json TEXT NOT NULL,
      result_id TEXT,
      error TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS jobs_state_idx ON generation_jobs(state);
    CREATE INDEX IF NOT EXISTS jobs_updated_idx ON generation_jobs(updated_at);
  `);
  return drizzle(sqlite, { schema });
}

export function getDatabase(): DatabaseInstance {
  if (!globalDatabase.companyCreatorDb) {
    globalDatabase.companyCreatorDb = createDatabase();
  }
  return globalDatabase.companyCreatorDb;
}
