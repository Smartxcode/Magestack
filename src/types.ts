export type SourceId = "mageos" | "hyva" | "satoshi";

export interface RawDocument {
  source: SourceId;
  url: string;
  title: string;
  content: string;
  lastFetched: Date;
}

export interface StoredDocument extends RawDocument {
  id: number;
  contentHash: string;
}

export interface IndexingResult {
  source: SourceId;
  processed: number;
  inserted: number;
  updated: number;
  skipped: number;
  failed: number;
  durationMs: number;
}

export interface UpdateOptions {
  force?: boolean;
  sources?: SourceId[];
}
