import { load, CheerioAPI } from "cheerio";
import { httpGet } from "../utils/http.js";
import { htmlToText } from "../utils/htmlToText.js";
import { logger } from "../utils/logger.js";

export interface CrawlTransformArgs {
  url: string;
  html: string;
  $: CheerioAPI;
}

export interface CrawlResult {
  url: string;
  title: string;
  content: string;
}

export interface CrawlOptions {
  startUrls: string[];
  allowedHost: string;
  maxPages: number;
  minContentLength?: number;
  transform?: (args: CrawlTransformArgs) => CrawlResult | null;
}

const defaultTransform = ({ url, html, $ }: CrawlTransformArgs): CrawlResult | null => {
  const title = $("h1").first().text().trim() || $("title").text().trim() || url;
  const content = htmlToText(html);
  if (content.length < 80) {
    return null;
  }
  return { url, title, content };
};

export async function* crawlSite(options: CrawlOptions): AsyncGenerator<CrawlResult> {
  const queue = [...options.startUrls];
  const visited = new Set<string>();
  const limit = options.maxPages;
  const minLength = options.minContentLength ?? 80;
  const transform = options.transform ?? defaultTransform;

  while (queue.length > 0 && visited.size < limit) {
    const next = queue.shift();
    if (!next) continue;
    const normalized = normalizeUrl(next);
    if (!normalized || visited.has(normalized)) {
      continue;
    }
    if (!isAllowedHost(normalized, options.allowedHost)) {
      continue;
    }

    visited.add(normalized);
    let html: string;
    try {
      html = await httpGet(normalized);
    } catch (error) {
      logger.warn("Failed to fetch page", { url: normalized, error: (error as Error).message });
      continue;
    }

    const $ = load(html);
    const payload = transform({ url: normalized, html, $ });
    if (payload && payload.content.length >= minLength) {
      yield payload;
    }

    $("a[href]")
      .toArray()
      .forEach((el) => {
        const href = $(el).attr("href");
        if (!href) return;
        const candidate = normalizeUrl(href, normalized);
        if (!candidate) return;
        if (!isAllowedHost(candidate, options.allowedHost)) return;
        if (visited.has(candidate)) return;
        if (!queue.includes(candidate) && queue.length + visited.size < limit) {
          queue.push(candidate);
        }
      });
  }
}

function normalizeUrl(href: string, base?: string): string | null {
  try {
    const resolved = base ? new URL(href, base) : new URL(href);
    resolved.hash = "";
    if (!resolved.pathname.endsWith("/")) {
      resolved.pathname = resolved.pathname.replace(/\/+$/, "");
    }
    return resolved.toString();
  } catch {
    return null;
  }
}

function isAllowedHost(urlStr: string, allowedHost: string): boolean {
  try {
    const host = new URL(urlStr).host;
    return host === allowedHost;
  } catch {
    return false;
  }
}
