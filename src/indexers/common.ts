import { DocumentRepository } from "../db/repository.js";
import { IndexingResult, RawDocument, SourceId } from "../types.js";
import { logger } from "../utils/logger.js";

export abstract class BaseIndexer {
  constructor(protected readonly repo: DocumentRepository) {}
  abstract readonly id: SourceId;
  abstract readonly description: string;
  protected abstract fetchDocuments(): AsyncGenerator<RawDocument>;

  async run(): Promise<IndexingResult> {
    const stats: IndexingResult = {
      source: this.id,
      processed: 0,
      inserted: 0,
      updated: 0,
      skipped: 0,
      failed: 0,
      durationMs: 0
    };
    const start = Date.now();

    for await (const doc of this.fetchDocuments()) {
      stats.processed += 1;
      try {
        const result = await this.repo.upsert(doc);
        stats[result.status] += 1;
      } catch (error) {
        stats.failed += 1;
        logger.error(`Failed to index ${this.id} document`, {
          error: (error as Error).message,
          source: this.id,
          url: doc.url
        });
      }
    }

    stats.durationMs = Date.now() - start;
    logger.info(`Indexer ${this.id} completed`, { ...stats });
    return stats;
  }
}
