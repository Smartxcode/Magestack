import { load } from "cheerio";

export function htmlToText(html: string): string {
  const $ = load(html);
  type Selection = ReturnType<typeof $>;

  const selectors = ["main", "article", "#content", "body"];
  let container: Selection | null = null;
  for (const selector of selectors) {
    const candidate = $(selector);
    if (candidate.length) {
      container = candidate;
      break;
    }
  }

  const text = (container ?? $("body")).text();
  return normalizeWhitespace(text);
}

export function normalizeWhitespace(input: string): string {
  return input.replace(/\s+/g, " ").trim();
}
