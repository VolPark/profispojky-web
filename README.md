# profispojky-web

Katalogový web [profispojky.cz](https://www.profispojky.cz) s administrací – Next.js 16 + Payload CMS 3 + Postgres.

- Web: `/` · Administrace: `/admin` · MCP server pro správu z Claude: `/api/mcp`
- Původní HTML prototyp: [`prototype/`](prototype/)

## Lokální vývoj

```bash
cp .env.example .env          # vyplň DATABASE_URL a PAYLOAD_SECRET
pnpm install
pnpm dev                      # http://localhost:3000
SEED_ADMIN_PASSWORD=… pnpm seed   # jednorázově naplní prázdnou DB obsahem z prototypu
```

Potřebuješ Postgres 16+ (lokálně nebo Supabase).

## Nasazení (Vercel)

Env proměnné projektu:

| Proměnná | Popis |
|---|---|
| `DATABASE_URL` | Postgres (Supabase – connection pooler, port 6543) |
| `PAYLOAD_SECRET` | náhodný řetězec ≥ 32 znaků |
| `NEXT_PUBLIC_SERVER_URL` | veřejná URL webu |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob – fotky a dokumenty |
| `ALLOW_INDEXING` | `true` až na ostré doméně |

Build (`vercel.json`) nejdřív spustí DB migrace (`pnpm payload migrate`), pak `next build`.

## Import z Business Central

Administrace → Katalog → Import z BC → nahraj export položek (XLSX/CSV). Rozpoznávané sloupce: *Kód/Číslo, Název/Popis, EAN, MJ, Řada, Stav* (CZ i EN). Po nahrání se zobrazí náhled změn; do katalogu se zapíše až po **Potvrdit import**.

Podrobnosti pro vývojáře a pravidla domény: [`CLAUDE.md`](CLAUDE.md).
