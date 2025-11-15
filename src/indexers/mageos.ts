import { config } from "../config.js";
import { BaseIndexer } from "./common.js";
import { DocumentRepository } from "../db/repository.js";
import { httpGet } from "../utils/http.js";
import { markdownToText } from "../utils/markdownToText.js";
import { RawDocument } from "../types.js";
import { logger } from "../utils/logger.js";

interface GithubTreeEntry {
  path: string;
  type: "blob" | "tree";
}

export class MageosIndexer extends BaseIndexer {
  readonly id = "mageos" as const;
  readonly description = "MageOS DevDocs via GitHub";

  constructor(repo: DocumentRepository) {
    super(repo);
  }

  protected async *fetchDocuments(): AsyncGenerator<RawDocument> {
    const { repoOwner, repoName, branch, includeDirs } = config.mageos;
    const headers: Record<string, string> = {};
    if (process.env.GITHUB_TOKEN) {
      headers.authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    const treeUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/git/trees/${branch}?recursive=1`;
    const treeRaw = await httpGet(treeUrl, { headers });
    const tree = JSON.parse(treeRaw) as { tree: GithubTreeEntry[] };
    const allowedPrefix = includeDirs.map((dir) => dir.trim().replace(/^\/+|\/+$/g, ""));

    for (const entry of tree.tree) {
      if (entry.type !== "blob") continue;
      if (!entry.path.endsWith(".md")) continue;
      if (!allowedPrefix.some((prefix) => entry.path.startsWith(prefix))) continue;

      try {
        const rawMarkdown = await httpGet(
          `https://raw.githubusercontent.com/${repoOwner}/${repoName}/${branch}/${entry.path}`,
          { headers }
        );
        const title = extractTitle(rawMarkdown, entry.path);
        const content = markdownToText(rawMarkdown);
        const url = `https://github.com/${repoOwner}/${repoName}/blob/${branch}/${entry.path}`;
        yield {
          source: "mageos",
          url,
          title,
          content,
          lastFetched: new Date()
        };
      } catch (error) {
        logger.warn("Failed to fetch MageOS document", {
          path: entry.path,
          error: (error as Error).message
        });
      }
    }
  }
}

function extractTitle(markdown: string, fallback: string): string {
  const match = markdown.match(/^#\s+(.+)$/m);
  if (match) {
    return match[1].trim();
  }
  return fallback.replace(/\//g, " → ");
}
