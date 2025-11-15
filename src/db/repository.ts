import { Db } from "./client.js";
import { RawDocument, SourceId, StoredDocument } from "../types.js";
import { hashContent } from "../utils/hash.js";

export interface UpsertResult {
  status: "inserted" | "updated" | "skipped";
  id: number;
}

export class DocumentRepository {
  constructor(private readonly db: Db) {}

  async upsert(doc: RawDocument): Promise<UpsertResult> {
    const contentHash = hashContent(doc.content);
    const existing = await this.db.get<StoredDocument & { content_hash: string }>(
      "SELECT * FROM documents WHERE source = ? AND url = ?",
      doc.source,
      doc.url
    );

    if (existing) {
      if (existing.content_hash === contentHash) {
        await this.db.run(
          "UPDATE documents SET last_fetched = ? WHERE id = ?",
          doc.lastFetched.toISOString(),
          existing.id
        );
        return { status: "skipped", id: existing.id };
      }

      await this.db.run(
        `UPDATE documents
         SET title = ?, content = ?, content_hash = ?, last_fetched = ?
         WHERE id = ?`,
        doc.title,
        doc.content,
        contentHash,
        doc.lastFetched.toISOString(),
        existing.id
      );
      return { status: "updated", id: existing.id };
    }

    const result = await this.db.run(
      `INSERT INTO documents (source, url, title, content, content_hash, last_fetched)
       VALUES (?, ?, ?, ?, ?, ?)`,
      doc.source,
      doc.url,
      doc.title,
      doc.content,
      contentHash,
      doc.lastFetched.toISOString()
    );
    return { status: "inserted", id: result.lastID! };
  }

  async getDocument(id: number): Promise<StoredDocument | undefined> {
    const row = await this.db.get<{
      id: number;
      source: SourceId;
      url: string;
      title: string;
      content: string;
      contentHash: string;
      lastFetched: string;
    }>(
      "SELECT id, source, url, title, content, content_hash as contentHash, last_fetched as lastFetched FROM documents WHERE id = ?",
      id
    );
    if (!row) return undefined;
    return { ...row, lastFetched: new Date(row.lastFetched) };
  }

  async search(query: string, source: SourceId | "all", limit = 20) {
    const params: (string | number)[] = [query];
    let condition = "";
    if (source !== "all") {
      condition = "AND d.source = ?";
      params.push(source);
    }
    params.push(limit);
    return this.db.all(
      `SELECT d.id, d.source, d.url, d.title,
              snippet(documents_fts, 1, '<b>', '</b>', '...', 12) AS snippet
       FROM documents_fts f
       JOIN documents d ON d.id = f.rowid
       WHERE documents_fts MATCH ?
       ${condition}
       ORDER BY bm25(documents_fts)
       LIMIT ?`,
      ...params
    );
  }

  async countBySource(): Promise<Record<SourceId, number>> {
    const rows = await this.db.all<{ source: SourceId; count: number }[]>(
      "SELECT source, COUNT(*) as count FROM documents GROUP BY source"
    );
    const result: Record<SourceId, number> = {
      mageos: 0,
      hyva: 0,
      satoshi: 0
    };
    for (const row of rows) {
      result[row.source] = row.count;
    }
    return result;
  }

  async hasDocuments(): Promise<boolean> {
    const row = await this.db.get<{ count: number }>("SELECT COUNT(1) as count FROM documents");
    return (row?.count ?? 0) > 0;
  }
}
