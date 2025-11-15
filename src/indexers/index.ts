import { DocumentRepository } from "../db/repository.js";
import { UpdateOptions, IndexingResult, SourceId } from "../types.js";
import { MageosIndexer } from "./mageos.js";
import { HyvaIndexer } from "./hyva.js";
import { SatoshiIndexer } from "./satoshi.js";
import { logger } from "../utils/logger.js";

export async function runIndexers(repo: DocumentRepository, options: UpdateOptions = {}): Promise<IndexingResult[]> {
  const enabledSources = options.sources ?? (["mageos", "hyva", "satoshi"] as SourceId[]);
  const instances = [];

  if (enabledSources.includes("mageos")) {
    instances.push(new MageosIndexer(repo));
  }
  if (enabledSources.includes("hyva")) {
    instances.push(new HyvaIndexer(repo));
  }
  if (enabledSources.includes("satoshi")) {
    instances.push(new SatoshiIndexer(repo));
  }

  const results: IndexingResult[] = [];
  for (const indexer of instances) {
    logger.info(`Starting indexer ${indexer.id}`, { description: indexer.description });
    const result = await indexer.run();
    results.push(result);
  }
  return results;
}
