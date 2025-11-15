import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { DocumentRepository } from "../db/repository.js";
import { SourceId, IndexingResult } from "../types.js";
import { topicTools } from "./topics.js";

const sourceEnum = z.enum(["all", "mageos", "hyva", "satoshi"]);
const concreteSourceEnum = z.enum(["mageos", "hyva", "satoshi"]);

type SearchSource = z.infer<typeof sourceEnum>;

interface CoreToolOptions {
  triggerUpdate?: (sources?: SourceId[]) => Promise<IndexingResult[]>;
}

export function registerCoreTools(
  server: McpServer,
  repo: DocumentRepository,
  options: CoreToolOptions = {}
): void {
  server.registerTool(
    "search_docs",
    {
      title: "Search documentation",
      description: "Full-text search across MageOS, Hyvä and Satoshi indexes.",
      inputSchema: {
        query: z.string().min(2, "Query must be at least 2 characters"),
        source: sourceEnum.optional(),
        limit: z.number().int().min(1).max(50).optional()
      }
    },
    async ({ query, source = "all", limit = 20 }) => {
      const rows = await repo.search(query, source as SearchSource, limit);
      const body = formatResults(query, rows);
      return {
        content: [{ type: "text" as const, text: body }],
        structuredContent: {
          query,
          source,
          limit,
          results: rows
        }
      };
    }
  );

  server.registerTool(
    "get_doc",
    {
      title: "Get document",
      description: "Return the full document text for a specific ID.",
      inputSchema: {
        id: z.number().int().positive()
      }
    },
    async ({ id }) => {
      const doc = await repo.getDocument(id);
      if (!doc) {
        throw new Error(`Document ${id} not found`);
      }
      const text = `# ${doc.title}\nSource: ${doc.source}\nURL: ${doc.url}\nLast fetched: ${doc.lastFetched.toISOString()}\n\n${doc.content}`;
      return {
        content: [{ type: "text" as const, text }],
        structuredContent: { ...doc, lastFetched: doc.lastFetched.toISOString() }
      };
    }
  );

  server.registerTool(
    "docs_status",
    {
      title: "Documentation stats",
      description: "Return number of indexed documents per source and database path.",
      inputSchema: {}
    },
    async () => {
      const counts = await repo.countBySource();
      const text = Object.entries(counts)
        .map(([source, count]) => `${source}: ${count}`)
        .join("\n");
      return {
          content: [
            {
              type: "text" as const,
              text: `Indexed documents:\n${text}`
            }
          ],
        structuredContent: counts
      };
    }
  );

  if (options.triggerUpdate) {
    server.registerTool(
      "refresh_docs",
      {
        title: "Refresh documentation",
        description: "Trigger crawlers for selected sources and reindex documentation.",
        inputSchema: {
          sources: z.array(concreteSourceEnum).min(1).max(3).optional()
        }
      },
      async ({ sources }) => {
        const results = await options.triggerUpdate?.(sources as SourceId[] | undefined);
        return {
          content: [
            {
              type: "text" as const,
              text: `Reindex triggered. Results: ${JSON.stringify(results ?? [], null, 2)}`
            }
          ],
          structuredContent: { results }
        };
      }
    );

    const updateTools: Array<{ name: string; title: string; sources?: SourceId[] }> = [
      { name: "mcp_update_all", title: "MCP update all" },
      { name: "mcp_update_hyva", title: "MCP update Hyva", sources: ["hyva"] },
      { name: "mcp_update_satoshi", title: "MCP update Satoshi", sources: ["satoshi"] },
      { name: "mcp_update_mageos", title: "MCP update Mageos", sources: ["mageos"] }
    ];

    for (const tool of updateTools) {
      server.registerTool(
        tool.name,
        {
          title: tool.title,
          description: "Trigger documentation refresh for the specified sources.",
          inputSchema: {}
        },
        async () => {
          const results = await options.triggerUpdate?.(tool.sources);
          return {
            content: [
              {
                type: "text" as const,
                text: `${tool.title} finished. Results: ${JSON.stringify(results ?? [], null, 2)}`
              }
            ],
            structuredContent: { results }
          };
        }
      );
    }
  }
}

export function registerTopicTools(server: McpServer, repo: DocumentRepository): void {
  for (const topic of topicTools) {
    server.registerTool(
      topic.name,
      {
        title: topic.title,
        description: topic.description
      },
      async (_args: Record<string, unknown>) => {
        const rows = await repo.search(`${topic.query}`, topic.source, 6);
        const text = `Topic: ${topic.title}\nSource: ${topic.source}\nQuery: ${topic.query}\n\n${formatResultList(rows)}`;
        return {
          content: [{ type: "text" as const, text }],
          structuredContent: {
            topic: topic.name,
            query: topic.query,
            results: rows
          }
        };
      }
    );
  }
}

function formatResults(query: string, rows: Array<Record<string, unknown>>): string {
  if (!rows.length) {
    return `No results for: ${query}`;
  }
  return rows
    .map((row, index) => {
      const snippet = (row.snippet as string) ?? "";
      return `${index + 1}. [${row.source}] ${row.title}\n${row.url}\n${snippet}`;
    })
    .join("\n\n");
}

function formatResultList(rows: Array<Record<string, unknown>>): string {
  if (!rows.length) {
    return "Brak wyników w indeksie.";
  }
  return rows
    .map((row) => `- (${row.id}) ${row.title} → ${row.url}`)
    .join("\n");
}
