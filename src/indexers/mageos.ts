import { load } from "cheerio";
import { config } from "../config.js";
import { BaseIndexer } from "./common.js";
import { DocumentRepository } from "../db/repository.js";
import { RawDocument } from "../types.js";
import { crawlSite } from "../crawlers/webCrawler.js";
import { htmlToText } from "../utils/htmlToText.js";
import { httpGet } from "../utils/http.js";
import { markdownToText } from "../utils/markdownToText.js";
import { logger } from "../utils/logger.js";

interface GithubTreeEntry {
  path: string;
  type: "blob" | "tree";
}

export class MageosIndexer extends BaseIndexer {
  readonly id = "mageos" as const;
  readonly description = "MageOS DevDocs crawler (website + GitHub)";

  constructor(repo: DocumentRepository) {
    super(repo);
  }

  protected async *fetchDocuments(): AsyncGenerator<RawDocument> {
    yield* this.fetchSite();
    yield* this.fetchGithub();
  }

  private async *fetchSite(): AsyncGenerator<RawDocument> {
    const { startUrl, maxPages } = config.mageos;
    const host = new URL(startUrl).host;

    for await (const page of crawlSite({
      startUrls: [startUrl],
      allowedHost: host,
      maxPages,
      minContentLength: 120,
      transform: ({ url, html }) => {
        const $ = load(html);
        const title = ($("h1").first().text().trim() || $("title").text().trim() || url).trim();
        const main = $("main").html() ?? html;
        const content = htmlToText(main);
        if (content.length < 120) {
          return null;
        }
        return { url, title, content };
      }
    })) {
      yield {
        source: "mageos",
        url: page.url,
        title: page.title,
        content: page.content,
        lastFetched: new Date()
      };
    }
  }

  private async *fetchGithub(): AsyncGenerator<RawDocument> {
    const { repoOwner, repoName, branch, includeDirs } = config.mageos;
    const headers: Record<string, string> = {};
    if (process.env.GITHUB_TOKEN) {
      headers.authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    const treeUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/git/trees/${branch}?recursive=1`;
    try {
      const treeRaw = await httpGet(treeUrl, { headers });
      const tree = JSON.parse(treeRaw) as { tree: GithubTreeEntry[] };
      const allowedPrefix = includeDirs.map((dir) => dir.replace(/^\/+|\/+$/g, ""));

      for (const entry of tree.tree) {
        if (entry.type !== "blob" || !entry.path.endsWith(".md")) continue;
        if (!allowedPrefix.some((prefix) => entry.path.startsWith(prefix))) continue;

        try {
          const markdown = await httpGet(
            `https://raw.githubusercontent.com/${repoOwner}/${repoName}/${branch}/${entry.path}`,
            { headers }
          );
          const title = extractTitle(markdown, entry.path);
          const content = markdownToText(markdown);
          const url = `https://github.com/${repoOwner}/${repoName}/blob/${branch}/${entry.path}`;
          yield {
            source: "mageos",
            url,
            title,
            content,
            lastFetched: new Date()
          };
        } catch (error) {
          logger.warn("Failed to fetch MageOS GitHub doc", {
            path: entry.path,
            error: (error as Error).message
          });
        }
      }
    } catch (error) {
      logger.warn("Failed to load MageOS GitHub tree", { error: (error as Error).message });
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
