# Repository Guidelines

## Project Structure & Module Organization
Follow the canonical layout sketched in `MCP-Magestack.txt`. Core logic lives in `src/`: `server.ts` exposes the MCP tools, `cli.ts` wires the npx entry point, `db/` holds `schema.sql` and helpers, `indexers/` contains one module per source (MageOS, Hyvä, Satoshi), and `utils/` stores shared helpers such as hashing and HTML/Markdown parsers. Compiled artifacts go to `dist/` and should never be edited manually. Keep SQLite files and downloaded crawls under `data/` so they can be gitignored yet easily purged during refreshes. Documentation and runnable examples belong in `docs/` to keep the README lightweight.

## Build, Test, and Development Commands
Run `npm install` once per environment to pull dependencies. Use `npm run dev` to start the MCP server with ts-node, hot-reloading against local docs. `npm run build` compiles TypeScript to `dist/` for npm publication. `npm run test` executes the unit/integration suite, while `npm run lint` and `npm run format` apply ESLint/Prettier rules. Before tagging a release, run `npm run check` (an aggregate script) to ensure build, lint, and test all pass in one shot.

## Coding Style & Naming Conventions
All TypeScript files use 2-space indentation, semicolons, and strict TypeScript compiler options. Prefer functional utilities over implicit globals, and isolate side effects inside `services/` or `indexers/`. File names should be kebab-case (`hash-utils.ts`), classes PascalCase, functions camelCase, and constants SCREAMING_SNAKE. Use `logger.ts` instead of `console.log`, and document tricky flows with succinct comments referencing relevant sections of `MCP-Magestack.txt`. Run `npm run format` before pushing.

## Testing Guidelines
Vitest backs the suite; place specs in `tests/<feature>.spec.ts` mirroring the `src/` hierarchy. Every crawler and database mutator needs at least one deterministically replayable test that stubs remote sources, plus property tests for hashing/deduplication. Target ≥85% statement coverage (`npm run test -- --coverage`). Snapshot tests belong only to CLI output; avoid using them for SQLite contents unless paired with schema assertions.

## Commit & Pull Request Guidelines
Use Conventional Commits (`feat: add hyva indexer batching`) so change logs and npm releases stay automated. Each commit should bundle a logically complete change with updated tests/docs. PRs must summarize scope, link tracking issues, include reproduction steps, and attach CLI screenshots or logs for user-visible changes. Before requesting review, ensure `npm run check` passes and describe any follow-up work explicitly.

## Security & Configuration Tips
Never commit credentials; keep `.env` secrets local and document required keys inside `.env.example`. When exchanging SQLite artifacts, scrub PII and hashes that stem from private docs. Use readonly GitHub tokens for crawler fetches and rotate them quarterly, mirroring the automation policy laid out in `MCP-Magestack.txt`.
