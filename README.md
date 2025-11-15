# MCP MageOS Docs Server

Local MCP server that ingests MageOS, Hyvä, and Satoshi documentation, indexes it in SQLite/FTS5, and exposes 60 specialized tools for Claude Desktop, VS Code, and any other MCP-aware host.

## Requirements
- Node.js 20+
- npm 9+
- Internet access during crawling
- Optional: `GITHUB_TOKEN` to avoid rate limits when reading GitHub trees

## Installation
```bash
npm install
npm run build
```

## Updating the documentation database
```bash
# all sources
npm run update
# Hyvä only
npm run update -- --sources=hyva
```
The SQLite database lives in `data/docs.db`. Override paths and crawler settings with `MCP_DOCS_DB_PATH`, `MCP_DOCS_DATA_DIR`, and the other variables defined in `src/config.ts`.

## Running the MCP server
```bash
npm start                # run the compiled CLI
npm run dev              # start via tsx for local development
node dist/cli.js --cron  # enable scheduled refresh
```
Flags:
- `--update` – crawl and exit.
- `--sources=mageos,hyva` – restrict the refresh to selected sources.
- `--update-on-start` – force a rebuild before the server starts serving requests.
- `--cron` – enable scheduler mode (default cron: `0 2 * * *`).

## MCP Tools
- Core utilities: `search_docs`, `get_doc`, `docs_status`, `refresh_docs`.
- 60 topic-specific commands (`hyva_*`, `mageos_*`, `satoshi_*`) aligned with the scenarios from `MCP-Magestack.txt`.

## Project structure
```
src/
├── cli.ts               # CLI entry point
├── server.ts            # STDIO-based MCP server
├── config.ts            # runtime configuration
├── db/                  # SQLite schema and repository
├── indexers/            # MageOS/Hyvä/Satoshi crawlers
├── mcp/                 # tool/topic registration
├── utils/               # http, parsing, hashing, logging
└── update.ts            # standalone update script
```

## Tests & linting
```bash
npm run test
npm run lint
```

## Publishing
```bash
npm publish --access public
```
After publishing, configure MCP hosts (e.g., Claude Desktop) as follows:
```json
{
  "mcpServers": {
    "mageosDocs": {
      "command": "npx",
      "args": ["@smartx/mcp-mageos-docs@latest"]
    }
  }
}
```

########

Lokalny serwer MCP, który pobiera dokumentację MageOS, Hyvä i Satoshi, indeksuje ją w SQLite/FTS5 i eksponuje 60 narzędzi do natychmiastowego użycia przez hosty MCP (Claude Desktop, VS Code, itp.).

## Wymagania
- Node.js 20+
- npm 9+
- Dostęp do internetu podczas indeksowania
- (opcjonalnie) `GITHUB_TOKEN` dla szybszego rate limitu podczas pobierania repozytoriów

## Instalacja
```bash
npm install
npm run build
```

## Aktualizacja bazy dokumentacji
```bash
# wszystkie źródła
npm run update
# tylko Hyvä
npm run update -- --sources=hyva
```
Baza SQLite znajduje się w `data/docs.db`. Środowisko można kontrolować zmiennymi `MCP_DOCS_DB_PATH`, `MCP_DOCS_DATA_DIR` i innymi z `src/config.ts`.

## Uruchamianie MCP
```bash
npm start                # uruchom build i serwer MCP
npm run dev              # CLI w trybie ts-node/tsx
node dist/cli.js --cron  # uruchom cronowe odświeżanie
```
Argumenty:
- `--update` – tylko zindeksuj i zakończ.
- `--sources=mageos,hyva` – ogranicz aktualizację do wybranych źródeł.
- `--update-on-start` – wymuś przebudowę indeksu przy starcie serwera MCP.
- `--cron` – włącz harmonogram aktualizacji (domyślnie `0 2 * * *`).

## MCP Tools
- `search_docs`, `get_doc`, `docs_status`, `refresh_docs`
- 60 tematycznych narzędzi (`hyva_*`, `mageos_*`, `satoshi_*`) odpowiadających sekcjom dokumentacji.

## Struktura projektu
```
src/
├── cli.ts               # punkt wejścia (bin)
├── server.ts            # uruchamia MCP w STDIO
├── config.ts            # konfiguracja źródeł
├── db/                  # schema i repozytorium SQLite
├── indexers/            # crawlerzy MageOS/Hyvä/Satoshi
├── mcp/                 # rejestracja narzędzi, tematy
├── utils/               # http, parsery, hash, logger
└── update.ts            # skrypt aktualizacji
```

## Testy i lint
```bash
npm run test
npm run lint
```

## Publikacja
```bash
npm publish --access public
```
Po publikacji host MCP (np. Claude Desktop) może używać serwera:
```json
{
  "mcpServers": {
    "mageosDocs": {
      "command": "npx",
      "args": ["@smartx/mcp-mageos-docs@latest"]
    }
  }
}
```
