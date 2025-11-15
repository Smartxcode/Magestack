import { initDb } from "./db/client.js";
import { DocumentRepository } from "./db/repository.js";
import { runIndexers } from "./indexers/index.js";
import { config } from "./config.js";
import { logger } from "./utils/logger.js";

async function main() {
  const db = await initDb(config.dbPath);
  const repo = new DocumentRepository(db);
  const sourcesArg = process.argv.find((arg) => arg.startsWith("--sources="));
  const sources = sourcesArg ? (sourcesArg.split("=")[1].split(",") as typeof config.allowedSources) : undefined;
  const results = await runIndexers(repo, { sources });
  logger.info("Indexing finished", { results });
}

main().catch((error) => {
  logger.error("Update command failed", { error: (error as Error).stack });
  process.exit(1);
});
