import "server-only";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import path from "node:path";
import fs from "node:fs";
import * as schema from "@/db/schema";

function resolveDbPath(): string {
  const raw = process.env.DATABASE_PATH ?? "./data/evalmedia.db";
  return path.isAbsolute(raw) ? raw : path.resolve(process.cwd(), raw);
}

function ensureDir(p: string) {
  const dir = path.dirname(p);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function createMigratedClient() {
  const dbPath = resolveDbPath();
  ensureDir(dbPath);
  const sqlite = new Database(dbPath);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");

  // Run migrations synchronously the first time the client is used.
  // We ship SQL migrations under ./drizzle and apply them here so
  // self-hosters do not need a separate migrate step.
  applyMigrations(sqlite);

  return drizzle(sqlite, { schema });
}

function applyMigrations(sqlite: Database.Database) {
  const migrationsDir = path.resolve(process.cwd(), "drizzle");
  if (!fs.existsSync(migrationsDir)) return;

  sqlite.exec(
    "CREATE TABLE IF NOT EXISTS __drizzle_migrations (id INTEGER PRIMARY KEY AUTOINCREMENT, hash TEXT NOT NULL UNIQUE, created_at INTEGER NOT NULL)",
  );
  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  const applied = new Set(
    sqlite
      .prepare("SELECT hash FROM __drizzle_migrations")
      .all()
      .map((r) => (r as { hash: string }).hash),
  );

  const insert = sqlite.prepare(
    "INSERT INTO __drizzle_migrations (hash, created_at) VALUES (?, ?)",
  );

  for (const file of files) {
    if (applied.has(file)) continue;
    const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
    sqlite.exec(sql);
    insert.run(file, Date.now());
  }
}

declare global {
  // eslint-disable-next-line no-var
  var __evalmediaDb: ReturnType<typeof createMigratedClient> | undefined;
}

export const db = globalThis.__evalmediaDb ?? createMigratedClient();
if (process.env.NODE_ENV !== "production") {
  globalThis.__evalmediaDb = db;
}
