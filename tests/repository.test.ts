import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { initDb } from "../src/db/client.js";
import { DocumentRepository } from "../src/db/repository.js";
import { RawDocument } from "../src/types.js";
import path from "path";
import { promises as fs } from "fs";
import { tmpdir } from "os";

const tempFiles: string[] = [];

describe("DocumentRepository", () => {
  afterEach(async () => {
    while (tempFiles.length) {
      const file = tempFiles.pop();
      if (!file) continue;
      await fs.rm(file, { force: true });
    }
  });

  it("stores and searches documents", async () => {
    const dbPath = path.join(tmpdir(), `mcp-docs-${Date.now()}.sqlite`);
    tempFiles.push(dbPath);
    const db = await initDb(dbPath);
    const repo = new DocumentRepository(db);

    const doc: RawDocument = {
      source: "mageos",
      url: "https://example.com/a",
      title: "MageOS Installation",
      content: "Installation guide for MageOS",
      lastFetched: new Date()
    };

    const insert = await repo.upsert(doc);
    expect(insert.status).toBe("inserted");

    const search = await repo.search("installation", "all", 10);
    expect(search.length).toBeGreaterThan(0);

    const fetched = await repo.getDocument(insert.id);
    expect(fetched?.title).toContain("MageOS Installation");

    const counts = await repo.countBySource();
    expect(counts.mageos).toBe(1);

    const update = await repo.upsert({ ...doc, content: "Updated installation steps", lastFetched: new Date() });
    expect(update.status).toBe("updated");

    await db.close();
  });
});
