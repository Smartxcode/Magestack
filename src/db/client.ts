import { promises as fs } from "fs";
import path from "path";
import sqlite3 from "sqlite3";
import { open, Database } from "sqlite";
import { ensureDir } from "../utils/fsUtils.js";
import { logger } from "../utils/logger.js";

export type Db = Database<sqlite3.Database, sqlite3.Statement>;

export async function initDb(dbPath: string): Promise<Db> {
  await ensureDir(path.dirname(dbPath));
  const db = await open({ filename: dbPath, driver: sqlite3.Database });
  await db.run("PRAGMA journal_mode = WAL");
  await db.run("PRAGMA synchronous = NORMAL");

  const schemaPath = path.resolve(path.dirname(new URL(import.meta.url).pathname), "schema.sql");
  const schema = await fs.readFile(schemaPath, "utf8");
  await db.exec(schema);
  logger.info("SQLite schema initialized", { path: dbPath });
  return db;
}
