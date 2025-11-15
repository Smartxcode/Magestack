import { marked } from "marked";
import { htmlToText } from "./htmlToText.js";

export function markdownToText(md: string): string {
  const html = marked.parse(md) as string;
  return htmlToText(html);
}
