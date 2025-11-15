const levels = ["debug", "info", "warn", "error"] as const;
type Level = (typeof levels)[number];

const currentLevel: Level = (process.env.LOG_LEVEL as Level) || "info";
const levelIndex = levels.indexOf(currentLevel);

function format(level: Level, message: string): string {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
}

export function log(level: Level, message: string, meta?: Record<string, unknown>): void {
  if (levels.indexOf(level) < levelIndex) {
    return;
  }
  const formatted = format(level, message);
  if (meta) {
    console.log(formatted, JSON.stringify(meta));
  } else {
    console.log(formatted);
  }
}

export const logger = {
  debug: (message: string, meta?: Record<string, unknown>) => log("debug", message, meta),
  info: (message: string, meta?: Record<string, unknown>) => log("info", message, meta),
  warn: (message: string, meta?: Record<string, unknown>) => log("warn", message, meta),
  error: (message: string, meta?: Record<string, unknown>) => log("error", message, meta)
};
