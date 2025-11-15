import { load } from "cheerio";
import { config } from "../config.js";
import { BaseIndexer } from "./common.js";
import { DocumentRepository } from "../db/repository.js";
import { httpGet } from "../utils/http.js";
import { htmlToText } from "../utils/htmlToText.js";
import { markdownToText } from "../utils/markdownToText.js";
import { RawDocument } from "../types.js";
import { logger } from "../utils/logger.js";
import { crawlSite } from "../crawlers/webCrawler.js";

interface GithubTreeEntry {
  path: string;
  type: "blob" | "tree";
}

export class SatoshiIndexer extends BaseIndexer {
  readonly id = "satoshi" as const;
  readonly description = "Satoshi Hyvä Theme (Notion + GitHub)";

  constructor(repo: DocumentRepository) {
    super(repo);
  }

  protected async *fetchDocuments(): AsyncGenerator<RawDocument> {
    yield* this.fetchNotion();
    yield* this.fetchGithub();
  }

  private async *fetchNotion(): AsyncGenerator<RawDocument> {
    const { notionUrl, maxPages } = config.satoshi;
    const host = new URL(notionUrl).host;
    for await (const page of crawlSite({
      startUrls: [notionUrl],
      allowedHost: host,
      maxPages,
      minContentLength: 80,
      transform: ({ url, html }) => {
        const $ = load(html);
        const title = ($("h1").first().text().trim() || $("title").text().trim() || url).trim();
        const main = $("[data-root]").html() ?? $("main").html() ?? html;
        const content = htmlToText(main ?? html);
        if (content.length < 80) {
          return null;
        }
        return { url, title, content };
      }
    })) {
      yield {
        source: "satoshi",
        url: page.url,
        title: page.title,
        content: page.content,
        lastFetched: new Date()
      };
    }
  }

  private async *fetchGithub(): AsyncGenerator<RawDocument> {
    if (!config.satoshi.githubRepo) {
      return;
    }
    const [owner, repoName] = config.satoshi.githubRepo.split("/");
    const headers: Record<string, string> = {};
    if (process.env.GITHUB_TOKEN) {
      headers.authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }
    const treeUrl = `https://api.github.com/repos/${owner}/${repoName}/git/trees/main?recursive=1`;
    try {
      const treeRaw = await httpGet(treeUrl, { headers });
      const tree = JSON.parse(treeRaw) as { tree: GithubTreeEntry[] };
      for (const entry of tree.tree) {
        if (entry.type !== "blob" || !entry.path.endsWith(".md")) continue;
        if (!(entry.path === "README.md" || entry.path.startsWith("docs/"))) continue;
        try {
          const markdown = await httpGet(
            `https://raw.githubusercontent.com/${owner}/${repoName}/main/${entry.path}`,
            { headers }
          );
          const title = extractTitle(markdown, entry.path);
          const content = markdownToText(markdown);
          const url = `https://github.com/${owner}/${repoName}/blob/main/${entry.path}`;
          yield {
            source: "satoshi",
            url,
            title,
            content,
            lastFetched: new Date()
          };
        } catch (error) {
          logger.warn("Failed to fetch Satoshi GitHub doc", {
            path: entry.path,
            error: (error as Error).message
          });
        }
      }
    } catch (error) {
      logger.warn("Failed to load Satoshi GitHub tree", { error: (error as Error).message });
    }
  }
}

function extractTitle(markdown: string, fallback: string): string {
  const heading = markdown.match(/^#\s+(.+)$/m);
  if (heading) {
    return heading[1].trim();
  }
  return fallback.replace(/\//g, " → ");
}
