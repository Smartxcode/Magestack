#!/usr/bin/env node
import { initDb } from "./db/client.js";
import { DocumentRepository } from "./db/repository.js";
import { runIndexers } from "./indexers/index.js";
import { config } from "./config.js";
import { startServer } from "./server.js";
import { SourceId } from "./types.js";
import { logger } from "./utils/logger.js";

function parseArg(flag: string): string | undefined {
  const prefix = `${flag}=`;
  const arg = process.argv.find((value) => value.startsWith(prefix));
  return arg ? arg.slice(prefix.length) : undefined;
}

function parseSources(value?: string): SourceId[] | undefined {
  if (!value) return undefined;
  const entries = value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean) as SourceId[];
  return entries.length ? entries : undefined;
}

(async () => {
  const dbPath = parseArg("--db") ?? config.dbPath;
  const sources = parseSources(parseArg("--sources"));
  const updateOnly = process.argv.includes("--update");
  const updateOnStart = process.argv.includes("--update-on-start");
  const enableCron = process.argv.includes("--cron");

  if (updateOnly) {
    const db = await initDb(dbPath);
    const repo = new DocumentRepository(db);
    await runIndexers(repo, { sources });
    process.exit(0);
  }

  await startServer({
    dbPath,
    updateOnStart,
    enableCron,
    initialSources: sources
  });
})().catch((error) => {
  logger.error("CLI failed", { error: (error as Error).stack });
  process.exit(1);
});
