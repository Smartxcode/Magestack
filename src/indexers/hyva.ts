import { config } from "../config.js";
import { BaseIndexer } from "./common.js";
import { DocumentRepository } from "../db/repository.js";
import { RawDocument } from "../types.js";
import { crawlSite } from "../crawlers/webCrawler.js";
import { htmlToText } from "../utils/htmlToText.js";

export class HyvaIndexer extends BaseIndexer {
  readonly id = "hyva" as const;
  readonly description = "Hyvä Docs crawler";

  constructor(repo: DocumentRepository) {
    super(repo);
  }

  protected async *fetchDocuments(): AsyncGenerator<RawDocument> {
    const { startUrl, maxPages } = config.hyva;
    const host = new URL(startUrl).host;
    for await (const page of crawlSite({
      startUrls: [startUrl],
      allowedHost: host,
      maxPages,
      minContentLength: 80,
      transform: ({ url, html, $ }) => {
        const title = ($("h1").first().text().trim() || $("title").text().trim() || url).trim();
        const main = $("main").html();
        const text = htmlToText(main ?? html);
        if (text.length < 80) {
          return null;
        }
        return { url, title, content: text };
      }
    })) {
      yield {
        source: "hyva",
        url: page.url,
        title: page.title,
        content: page.content,
        lastFetched: new Date()
      };
    }
  }
}
