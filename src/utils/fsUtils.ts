import { promises as fs } from "fs";
import path from "path";

export async function ensureDir(target: string): Promise<void> {
  await fs.mkdir(target, { recursive: true });
}

export async function writeFileSafe(target: string, content: string): Promise<void> {
  await ensureDir(path.dirname(target));
  await fs.writeFile(target, content, "utf8");
}

export async function readJSON<T>(target: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(target, "utf8");
    return JSON.parse(raw) as T;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return fallback;
    }
    throw error;
  }
}

export async function writeJSON(target: string, payload: unknown): Promise<void> {
  const serialized = JSON.stringify(payload, null, 2);
  await writeFileSafe(target, serialized);
}
