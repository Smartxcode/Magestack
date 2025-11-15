import { load } from "cheerio";
import { httpGet } from "../utils/http.js";
import { htmlToText } from "../utils/htmlToText.js";
import { RawDocument } from "../types.js";
import { logger } from "../utils/logger.js";

export interface HyvaCrawlerOptions {
  baseUrl: string;
  maxPages: number;
}

export async function* crawlHyvaDocs(options: HyvaCrawlerOptions): AsyncGenerator<RawDocument> {
  const { baseUrl, maxPages } = options;
  const origin = new URL(baseUrl);
  const queue: string[] = [baseUrl];
  const visited = new Set<string>();

  while (queue.length > 0 && visited.size < maxPages) {
    const url = queue.shift()!;
    if (visited.has(url)) continue;
    visited.add(url);

    try {
      const html = await httpGet(url);
      const $ = load(html);
      const title = ($("h1").first().text() || $("title").text() || url).trim();
      const content = htmlToText(html);
      if (content.length > 40) {
        yield {
          source: "hyva",
          url,
          title,
          content,
          lastFetched: new Date()
        };
      }

      $("a[href]")
        .toArray()
        .forEach((anchor) => {
          const href = $(anchor).attr("href");
          if (!href) return;
          const nextUrl = normalizeUrl(url, href);
          if (!nextUrl) return;
          const nextOrigin = new URL(nextUrl);
          if (nextOrigin.host !== origin.host) return;
          if (visited.has(nextUrl)) return;
          if (!queue.includes(nextUrl) && queue.length + visited.size < maxPages) {
            queue.push(nextUrl);
          }
        });
    } catch (error) {
      logger.warn("Failed to crawl Hyvä page", { url, error: (error as Error).message });
    }
  }
}

function normalizeUrl(base: string, href: string): string | null {
  try {
    if (href.startsWith("mailto:")) return null;
    if (href.startsWith("#")) return null;
    const resolved = new URL(href, base);
    resolved.hash = "";
    return resolved.toString();
  } catch {
    return null;
  }
}
