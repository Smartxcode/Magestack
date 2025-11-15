import { logger } from "./logger.js";

export interface FetchOptions {
  retry?: number;
  backoffMs?: number;
  headers?: Record<string, string>;
}

const DEFAULT_HEADERS = {
  "user-agent": "Smartx-MCP-Docs/1.0 (+https://github.com/Smartxcode/Magestack)"
};

export async function httpGet(url: string, options: FetchOptions = {}): Promise<string> {
  const retry = options.retry ?? 3;
  const backoffMs = options.backoffMs ?? 500;

  let attempt = 0;
  let lastError: unknown;

  while (attempt <= retry) {
    try {
      const response = await fetch(url, {
        headers: { ...DEFAULT_HEADERS, ...(options.headers ?? {}) }
      });

      if (!response.ok) {
        if (response.status >= 500 && attempt < retry) {
          throw new Error(`Temporary error ${response.status}`);
        }
        throw new Error(`Request failed with status ${response.status}`);
      }

      return await response.text();
    } catch (error) {
      lastError = error;
      attempt += 1;
      if (attempt > retry) {
        break;
      }
      const wait = backoffMs * attempt;
      logger.warn(`HTTP GET failed for ${url}, retrying in ${wait}ms`, {
        attempt,
        error: (error as Error).message
      });
      await new Promise((resolve) => setTimeout(resolve, wait));
    }
  }

  throw lastError;
}
