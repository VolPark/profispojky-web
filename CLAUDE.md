# profispojky-web

Web pro profispojky.cz (PROFI SPOJKY) – **katalogový web bez e-shopu**: produkty, technické specifikace, stažení katalogů, prodejní síť. Dodavatel: SEBIT.

## Stack

- **Next.js 16 (App Router) + Payload CMS 3** v jedné aplikaci. Web = `src/app/(frontend)`, administrace = `/admin` (`src/app/(payload)`).
- **Postgres** (`@payloadcms/db-postgres`) – produkčně Supabase (org SEBIT Solutions), lokálně Postgres 16.
- **Soubory**: lokálně `/media`, na Vercelu **Vercel Blob** (`BLOB_READ_WRITE_TOKEN`, klientský upload kvůli 4,5MB limitu).
- Hosting: Vercel, projekt `profispojky-web` (tým `sebit-solutions-projects`).
- Všechny stránky webu jsou dynamické (`force-dynamic`) – změna v adminu je na webu hned, build nepotřebuje DB.

## Příkazy

| Příkaz | Co dělá |
|---|---|
| `pnpm dev` | dev server (schéma DB se synchronizuje automaticky – `push`) |
| `pnpm seed` | naplní prázdnou DB obsahem z prototypu (`SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`) |
| `pnpm test` | unit testy (vitest) – import z BC, stav produktu, expirace |
| `pnpm lint`, `pnpm typecheck` | ESLint, TypeScript |
| `pnpm generate:types` / `generate:importmap` | po změně kolekcí / admin komponent |
| `pnpm payload migrate:create <název>` | **po každé změně schématu** – produkce běží jen na migracích (`src/migrations`) |
| `pnpm payload migrate` | spustí migrace (na Vercelu automaticky v `buildCommand`, když je `DATABASE_URL`) |

## Kdo spravuje co

| Kdo | Kde | Jak |
|---|---|---|
| Lidé z PROFI SPOJKY | `/admin` | role **Editor** (aktuality, divize, značky, stránky, prodejní síť, kontakty) a **Správce katalogu** (navíc produkty, řady, dokumenty, import z BC) |
| SEBIT (dodavatel) | Claude Code / Cowork | MCP server webu `/api/mcp` (`@payloadcms/plugin-mcp`, `src/mcp/plugin.ts`) – klíč v adminu Nastavení → MCP klíče (jen role Admin), oprávnění per klíč, defaultně vše vypnuté |
| Infrastruktura | Claude Code | Supabase MCP (DB, SQL, logy), Vercel MCP (deploye, env, logy) |

## Struktura

| Cesta | Obsah |
|---|---|
| `src/collections/` | Payload kolekce (News, Divisions, Brands, Series, Products, Documents, BcImports, Partners, Contacts, Pages, Media, Users) |
| `src/globals/` | Homepage, SiteSettings |
| `src/access/roles.ts` | role a access helpery |
| `src/lib/bc-import/` | parse (XLSX/CSV) → diff → apply importu z Business Central |
| `src/lib/product-status.ts` | kdy je položka na webu / ve frontě „Doplnit obsah“ |
| `src/lib/queries.ts` | datová vrstva webu (Payload Local API) |
| `src/components/site/` | komponenty webu (klientské: HeaderBar, CatalogClient, LibraryClient, DealersClient) |
| `src/components/admin/` | admin: nástěnka, fronta „Doplnit obsah“, náhled importu |
| `src/seed/` | seed + `data.json` vytažená z prototypu |
| `prototype/` | původní statický HTML prototyp – **reference pro UI**, needitovat |

## Doménová pravidla

- **Business Central (BC) = master** pro kód, název, EAN, MJ, řadu a stav (aktivní / výprodej / neaktivní). Tato pole jsou v adminu jen ke čtení, mění je jen import. Na webu se BC nezmiňuje.
- Import: nahrání XLSX/CSV → náhled (nové / změněné / skryjí se) → **Potvrdit** (v transakci). Položka chybějící v exportu se skryje (`bcActive=false`), nemaže se. Nová položka se k řadě přiřadí přes `series.bcCode`.
- Položka je na webu jen když má fotku + aspoň jeden parametr + řadu, je aktivní v BC a má „Zobrazit na webu“. Jinak je ve frontě „Doplnit obsah“ (`/admin/doplnit-obsah`).
- Společné parametry (PN, těsnění, normy…) se vyplňují u **řady**, ne u položky. Chybějící atribut se na webu nezobrazuje.
- Typy výrobků (rozcestník „Vyberte typ výrobku“) se generují z hodnot `products.productType`.
- Knihovna: dokument ↔ řada/produkt, *Vydáno* / *Platné do*, 60 dní před expirací upozornění na nástěnce.
- Aktuality: Koncept / Publikováno / Naplánováno (= publikováno s datem v budoucnu, veřejný read filtruje `publishedAt <= now`).
- SEO: 301 přesměrování ve kolekci Přesměrování (catch-all `[...slug]`), indexovat hlavně stránky řad, `BreadcrumbList` + `Product` schema. Indexace vypnutá, dokud `ALLOW_INDEXING !== 'true'`.

## Design tokens (`src/app/(frontend)/styles.css`, převzato z prototypu)

- Barvy: navy `#1C2F5A`, blue `#45C0EB`, blue-dark `#0B6A91`, bg-alt `#F4F6F8`, border `#E0E4EB`.
- Písma: Archivo (display), IBM Plex Sans (body), IBM Plex Mono (kódy položek).
- Divize nemají vlastní barvy – rozlišují se fotkou a názvem.

## Konvence

- UI texty česky, kód a identifikátory anglicky.
- Přístupnost: skutečné `<button>`/`<a>`/`<label>`, `:focus-visible`, kontrast min. 4.5:1, touch targets ≥ 44 px.
- Placeholdery `[ ]` = chybí vstup od klienta – nevymýšlet obsah, čísla ani technické parametry.
- Cookie auth v Payload REST vyžaduje hlavičku `Origin` (CSRF) – při testech přes curl použij `Authorization: JWT <token>`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
