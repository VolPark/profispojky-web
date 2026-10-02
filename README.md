# profispojky-web

Katalogový web [profispojky.cz](https://www.profispojky.cz) s administrací – Next.js 16 + Payload CMS 3 + Postgres.

- Web: `/` · Administrace: `/admin` · MCP server pro správu z Claude: `/api/mcp`
- Původní HTML prototyp: [`prototype/`](prototype/)

## Lokální vývoj

Potřebuješ Docker, Node 20+ a pnpm.

```bash
cp .env.example .env              # doplň PAYLOAD_SECRET (např. openssl rand -hex 32)
docker compose up -d              # Postgres 17 na localhost:5432
pnpm install
SEED_ADMIN_PASSWORD=… pnpm seed   # naplní prázdnou DB obsahem z prototypu, admin: admin@profispojky.local
pnpm dev                          # http://localhost:3000, admin na /admin
```

Reset DB do výchozího stavu: `docker compose down -v && docker compose up -d && pnpm seed`.

Lokálně se schéma DB synchronizuje automaticky (Payload `push`). **Po každé změně kolekcí** vytvoř migraci `pnpm payload migrate:create <nazev>` a commitni ji – produkce běží jen na migracích.

Kód je DB-agnostický: jen Postgres přes `@payloadcms/db-postgres`, soubory přes Payload storage adapter. Žádné `@supabase/*`, RLS ani nestandardní extensions – přechod na jinou DB = změna `DATABASE_URL` + `pnpm payload migrate` + `pg_dump`/`pg_restore`.

## Nasazení (Vercel)

Env proměnné projektu:

| Proměnná | Popis |
|---|---|
| `DATABASE_URL` | Postgres (produkční platforma zatím nerozhodnuta – Supabase / Neon / Vercel Postgres) |
| `PAYLOAD_SECRET` | náhodný řetězec ≥ 32 znaků |
| `NEXT_PUBLIC_SERVER_URL` | veřejná URL webu |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob – fotky a dokumenty |
| `ALLOW_INDEXING` | `true` až na ostré doméně |

Build (`vercel.json`) nejdřív spustí DB migrace (`pnpm payload migrate`), pak `next build`, který předgeneruje všechny stránky (build proto potřebuje DB). Když build nebo migrace selže, zůstává nasazená předchozí verze.

Volitelně: `RESEND_API_KEY`, `ALERT_EMAIL_TO`, `ALERT_EMAIL_FROM` – e-mail s vysokou prioritou při chybě serveru. `GET /health` pro uptime monitor.

## Import z Business Central

Administrace → Katalog → Import z BC → nahraj export položek (XLSX/CSV). Rozpoznávané sloupce: *Kód/Číslo, Název/Popis, EAN, MJ, Řada, Stav* (CZ i EN). Po nahrání se zobrazí náhled změn; do katalogu se zapíše až po **Potvrdit import**.

Podrobnosti pro vývojáře a pravidla domény: [`CLAUDE.md`](CLAUDE.md).
