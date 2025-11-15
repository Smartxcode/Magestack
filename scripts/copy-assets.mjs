import { mkdir, copyFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const src = path.join(projectRoot, "src", "db", "schema.sql");
const destDir = path.join(projectRoot, "dist", "db");
const dest = path.join(destDir, "schema.sql");

await mkdir(destDir, { recursive: true });
await copyFile(src, dest);
console.log(`[copy-assets] ${src} -> ${dest}`);
