# MCP MageOS Docs Server

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
