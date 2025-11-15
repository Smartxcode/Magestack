# Repository Guidelines

## Project Structure & Module Organization
Follow the canonical layout sketched in `MCP-Magestack.txt`. Core logic lives in `src/`: `server.ts` exposes the MCP tools, `cli.ts` wires the npx entry point, `db/` holds `schema.sql` and helpers, `indexers/` contains one module per source (MageOS, Hyvä, Satoshi), and `utils/` stores shared helpers such as hashing and HTML/Markdown parsers. Compiled artifacts go to `dist/` and should never be edited manually. Keep SQLite files and downloaded crawls under `data/` so they can be gitignored yet easily purged during refreshes. Documentation and runnable examples belong in `docs/` to keep the README lightweight.

## Build, Test, and Development Commands
Run `npm install` once per environment to pull dependencies. Use `npm run dev` to start the CLI directly with `tsx` (passes through STDIO so Claude Desktop can attach). `npm run build` compiles TypeScript to `dist/` for npm publication, while `npm run test` (Vitest) and `npm run lint` (flat ESLint) guard regressions. `npm run check` wraps lint → test → build to mimic CI, so run it before pushing or tagging an npm release.

## Coding Style & Naming Conventions
All TypeScript files use 2-space indentation, semicolons, and strict TypeScript compiler options. Prefer functional utilities over implicit globals, and isolate side effects inside `services/` or `indexers/`. File names should be kebab-case (`hash-utils.ts`), classes PascalCase, functions camelCase, and constants SCREAMING_SNAKE. Use `logger.ts` instead of `console.log`, and document tricky flows with succinct comments referencing relevant sections of `MCP-Magestack.txt`. Run `npm run format` before pushing.

## Testing Guidelines
Vitest backs the suite; place specs in `tests/<feature>.spec.ts` mirroring the `src/` hierarchy. Every crawler and database mutator needs at least one deterministically replayable test that stubs remote sources, plus property tests for hashing/deduplication. Target ≥85% statement coverage (`npm run test -- --coverage`). Snapshot tests belong only to CLI output; avoid using them for SQLite contents unless paired with schema assertions.

## Indexing & Update Workflow
- `npm run update -- --sources=hyva,mageos` keeps the SQLite/FTS5 index in sync; omit `--sources` to crawl all three doc sets in sequence.
- MageOS docs pull from `https://github.com/mage-os/devdocs` via the GitHub API tree endpoint; the raw Markdown is converted through `marked` + `htmlToText`.
- Hyvä docs are crawled breadth-first starting at `https://docs.hyva.io/`; URLs stay within the same host, `<main>/<article>` are parsed, and thin pages (<40 chars) are skipped.
- Satoshi docs combine the public Notion mirror and the GitHub repo `scandiweb/satoshi-hyva`, segmented by headings to maximize snippet relevance.
- Each fetch becomes a `RawDocument` with deterministic SHA-256; `DocumentRepository.upsert` skips duplicates while refreshing `last_fetched`.
- Cron-driven refresh: run `node dist/cli.js --cron --update-on-start` on a server; default schedule `0 2 * * *` can be overridden with `MCP_DOCS_CRON`.

## MCP Tool Registry
- Core tools: `search_docs`, `get_doc`, `docs_status`, `refresh_docs` (manual re-index trigger that fan-outs to indexers).
- 60 curated tools from `src/mcp/topics.ts`: prefixes `hyva_*`, `mageos_*`, `satoshi_*` map directly to the spec in `MCP-Magestack.txt`. Each tool runs a scoped search query and returns structured metadata for the Agent.
- When adding a new topic: update `topics.ts`, rerun `npm run build`, and note the change here for other agents. Avoid removing or renaming existing commands because client-side workflows rely on the stable tool names.

## Agent Runbook
1. `npm install` (first checkout only).
2. `npm run update -- --sources=hyva` (or other subset) to hydrate `data/docs.db`.
3. `npm run dev` to boot the STDIO server locally and connect your MCP host.
4. Validate by calling `docs_status`, then sample a few topic tools (e.g., `hyva_components_library_overview`).
5. For releases: `npm run check`, `npm publish --access public`, and tag in GitHub. Update README + this file if the workflow changes.

## Commit & Pull Request Guidelines
Use Conventional Commits (`feat: add hyva indexer batching`) so change logs and npm releases stay automated. Each commit should bundle a logically complete change with updated tests/docs. PRs must summarize scope, link tracking issues, include reproduction steps, and attach CLI screenshots or logs for user-visible changes. Before requesting review, ensure `npm run check` passes and describe any follow-up work explicitly.

## Security & Configuration Tips
Never commit credentials; keep `.env` secrets local and document required keys inside `.env.example`. When exchanging SQLite artifacts, scrub PII and hashes that stem from private docs. Use readonly GitHub tokens for crawler fetches and rotate them quarterly, mirroring the automation policy laid out in `MCP-Magestack.txt`.
