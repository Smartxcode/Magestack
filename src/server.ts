import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import cron from "node-cron";
import { initDb } from "./db/client.js";
import { DocumentRepository } from "./db/repository.js";
import { config } from "./config.js";
import { registerCoreTools, registerTopicTools } from "./mcp/registerTools.js";
import { runIndexers } from "./indexers/index.js";
import { SourceId } from "./types.js";
import { logger } from "./utils/logger.js";

export interface StartServerOptions {
  dbPath?: string;
  updateOnStart?: boolean;
  enableCron?: boolean;
  cronExpression?: string;
  initialSources?: SourceId[];
}

export async function startServer(options: StartServerOptions = {}) {
  const dbPath = options.dbPath ?? config.dbPath;
  const db = await initDb(dbPath);
  const repo = new DocumentRepository(db);

  const server = new McpServer(
    {
      name: "mcp-mageos-docs",
      version: "1.0.0"
    },
    {
      instructions:
        "Use search_docs to find any fragment across MageOS/Hyvä/Satoshi documentation, then call get_doc for the full text. Dedicated topic tools (hyva_*, mageos_*, satoshi_*) instantly return curated excerpts for the most common workflows.",
      capabilities: {
        tools: {}
      }
    }
  );

  const triggerUpdate = async (sources?: SourceId[]) => {
    logger.info("Manual update requested", { sources });
    return runIndexers(repo, { sources });
  };

  registerCoreTools(server, repo, { triggerUpdate });
  registerTopicTools(server, repo);

  if (options.updateOnStart ?? process.env.MCP_DOCS_UPDATE_ON_START === "true") {
    await triggerUpdate(options.initialSources);
  }

  if (options.enableCron ?? process.env.MCP_DOCS_ENABLE_CRON === "true") {
    const expression = options.cronExpression ?? process.env.MCP_DOCS_CRON ?? "0 2 * * *";
    cron.schedule(expression, () => {
      triggerUpdate().catch((error) => logger.error("Scheduled update failed", { error: (error as Error).message }));
    });
    logger.info("Cron updates scheduled", { expression });
  }

  const transport = new StdioServerTransport();
  await server.connect(transport);
  logger.info("MCP server started", { dbPath });
  return { server, transport };
}
