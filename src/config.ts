import path from "path";
import { fileURLToPath } from "url";
import { SourceId } from "./types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

export interface AppConfig {
  dataDir: string;
  dbPath: string;
  concurrency: number;
  hyva: {
    baseUrl: string;
    maxPages: number;
  };
  mageos: {
    repoOwner: string;
    repoName: string;
    branch: string;
    includeDirs: string[];
  };
  satoshi: {
    notionUrl: string;
    githubRepo?: string;
  };
  allowedSources: SourceId[];
}

function env(name: string, fallback: string): string {
  return process.env[name] ?? fallback;
}

export const config: AppConfig = {
  dataDir: env("MCP_DOCS_DATA_DIR", path.join(projectRoot, "data")),
  dbPath: env("MCP_DOCS_DB_PATH", path.join(projectRoot, "data", "docs.db")),
  concurrency: Number(env("MCP_DOCS_CONCURRENCY", "4")),
  hyva: {
    baseUrl: env("HYVA_DOCS_URL", "https://docs.hyva.io/"),
    maxPages: Number(env("HYVA_MAX_PAGES", "120"))
  },
  mageos: {
    repoOwner: env("MAGEOS_REPO_OWNER", "mage-os"),
    repoName: env("MAGEOS_REPO_NAME", "devdocs"),
    branch: env("MAGEOS_BRANCH", "main"),
    includeDirs: env("MAGEOS_INCLUDE_DIRS", "guides,src/_data").split(",")
  },
  satoshi: {
    notionUrl: env(
      "SATOSHI_NOTION_URL",
      "https://scandiweb.notion.site/Hyv-Satoshi-theme-documentation-1adc346d72c080ffb1b2faa454d6739d"
    ),
    githubRepo: env("SATOSHI_GITHUB_REPO", "scandiweb/satoshi-hyva")
  },
  allowedSources: ["mageos", "hyva", "satoshi"]
};
