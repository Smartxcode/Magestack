import { load } from "cheerio";
import { config } from "../config.js";
import { BaseIndexer } from "./common.js";
import { DocumentRepository } from "../db/repository.js";
import { httpGet } from "../utils/http.js";
import { htmlToText } from "../utils/htmlToText.js";
import { markdownToText } from "../utils/markdownToText.js";
import { RawDocument } from "../types.js";
import { logger } from "../utils/logger.js";

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
    try {
      const html = await httpGet(config.satoshi.notionUrl);
      const $ = load(html);
      const container = $("[data-root]").length ? $("[data-root]") : $("main");
      const sections = splitSections(container.html() || "");
      for (const section of sections) {
        yield {
          source: "satoshi",
          url: config.satoshi.notionUrl + (section.slug ? `#${section.slug}` : ""),
          title: section.title,
          content: section.content,
          lastFetched: new Date()
        };
      }
    } catch (error) {
      logger.warn("Failed fetching Notion docs", { error: (error as Error).message });
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

function splitSections(html: string): { title: string; content: string; slug: string }[] {
  const $ = load(html);
  const blocks: { title: string; content: string; slug: string }[] = [];
  let currentTitle = "Satoshi Theme";
  let currentSlug = "overview";
  let buffer: string[] = [];

  const pushBlock = () => {
    if (!buffer.length) return;
    const combined = buffer.join("\n");
    blocks.push({
      title: currentTitle,
      content: htmlToText(combined),
      slug: currentSlug
    });
    buffer = [];
  };

  $("h1, h2, h3, p, ul, ol, pre").each((_, el) => {
    const tag = el.tagName?.toLowerCase();
    if (!tag) return;
    if (tag.startsWith("h")) {
      pushBlock();
      currentTitle = $(el).text().trim() || currentTitle;
      currentSlug = slugify(currentTitle);
    }
    buffer.push($(el).toString());
  });
  pushBlock();
  return blocks;
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function extractTitle(markdown: string, fallback: string): string {
  const heading = markdown.match(/^#\s+(.+)$/m);
  if (heading) {
    return heading[1].trim();
  }
  return fallback.replace(/\//g, " → ");
}
