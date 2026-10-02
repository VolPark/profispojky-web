# profispojky-web

Web pro profispojky.cz (PROFI SPOJKY) – **katalogový web bez e-shopu**: produkty, technické specifikace, stažení katalogů, prodejní síť. Dodavatel: SEBIT.

## Stack

- **Next.js 16 (App Router) + Payload CMS 3** v jedné aplikaci. Web = `src/app/(frontend)`, administrace = `/admin` (`src/app/(payload)`).
- **Postgres** (`@payloadcms/db-postgres`) – lokálně `docker-compose.yml` (Postgres 17). Produkce: **Neon** (projekt `profispojky-prod`, Free plan; před go-live přepnout na Launch) – kód přesto musí zůstat **DB-agnostický**: žádné `@supabase/*`, Supabase Auth/Storage, RLS, Edge Functions, Realtime ani nestandardní extensions (nejdřív se zeptat Vojty). Schéma jen přes migrace.
- **Soubory**: lokálně `/media`, na Vercelu **Vercel Blob** (`BLOB_READ_WRITE_TOKEN`, klientský upload kvůli 4,5MB limitu). Na webu se dokumenty odkazují přes stabilní adresu **`/soubory/<název>`** (`src/app/soubory/[name]/route.ts` → 302 na úložiště), nikdy přímo na doménu úložiště – odkazy přežijí změnu úložiště. Fotky se vkládají přímo z Blob (zmenšeniny thumb/card/large). Zálohy souborů zatím nejsou (rozhodnutí: spoléháme na Koš). **Pozor: tým je na Vercel Hobby** – při překročení limitů Vercel úložiště zablokuje (403 na všechny soubory, stalo se 2. 10. 2026 při importu); hromadné nahrávání jen po přechodu na Pro. **Preview** (deploy každého PR) má vlastní testovací DB, ale zatím sdílí úložiště s produkcí (soubory ve složce `preview/`) – katalog ani soubory se na preview neimportují (`MIGRATION_TOKEN` jen pro production). Až to Vercel dovolí: samostatný Blob store pro preview (`BLOB_READ_WRITE_TOKEN` jen pro Preview), pak složku `preview/` v `payload.config.ts` zrušit.
- Hosting: Vercel, projekt `profispojky-web` (tým `sebit-solutions-projects`).
- **ISR, revalidate 60 s** (`src/app/(frontend)/layout.tsx`): všechny stránky se předgenerují při buildu (`src/lib/static-params.ts`) a servírují z cache; změna z adminu je na webu do minuty (okamžitě v Náhledu). Při výpadku DB / chybě kódu Next.js dál servíruje **poslední funkční verzi** – ověřeno testem s vypnutou DB. Živě se renderuje jen hledání (`/katalog?q=`), `/health` a admin.
- **Nepoužívat `revalidatePath`/`revalidateTag` bez `'max'`** – zahodí cache a při výpadku DB web spadne (ověřeno). Build proto potřebuje DB.
- Přesměrování starých URL: `src/proxy.ts` – pro každou adresu mimo sekce webu dohledá řádek v kolekci Přesměrování (~4 300 řádků: produkty, kategorie, `download.php?fid=…`, aktuality), výsledek cachuje 5 min, při chybě nic nepřesměruje.
- **Obsah převzatý ze starého webu** (katalog ~4 050 položek, 157 souborů, videa, aktuality, stránky): záznamy mají `sourceUrl` (média, dokumenty). Převod: dočasný endpoint `POST /api/migration` (`src/endpoints/migration.ts`), zapnutý jen s env `MIGRATION_TOKEN` – po dokončení migrace env smazat a endpoint odstranit.

## Provoz a obnova (runbook)

Cíl: web běží bez podpory; když se něco rozbije, chodí e-mail s vysokou prioritou a web jede dál v předchozí verzi.

| Signál | Kde | Co dělá |
|---|---|---|
| Chyba serveru | `src/instrumentation.ts` → `src/lib/alert.ts` | e-mail přes Resend (`RESEND_API_KEY`, `ALERT_EMAIL_TO`), stejná chyba max 1×/30 min, max 10/h |
| Selhaný import z BC | `BcImports` confirm | e-mail; transakce vrácena, katalog beze změny |
| Health | `GET /health` | 200 = web + DB OK, 503 = DB nedostupná (návštěvníci mezitím vidí cache) – pro externí uptime monitor |
| Selhaný build/migrace | Vercel | nový deploy se nenasadí, běží předchozí; migrace má `timeout 300` |

**Když přijde alert / „web nefunguje“:**
1. Logy: Vercel MCP `get_runtime_logs` (projekt `prj_Z9sXDO685Tu5ojiJHHLXxxAPsN2E`, tým `team_hPCDy5a5xpBmTsGRIGEnVCGP`), `level: error`.
2. DB: Neon MCP – produkce `gentle-flower-63441150` (profispojky-prod, branch `production`, DB `profispojky`), preview `cold-smoke-61447884`; `run_sql` / `list_slow_queries`. Free plan: při vyčerpání 100 CU-h/měsíc Neon DB do konce měsíce vypne (web jede z cache, admin ne) → přepnout na Launch.
3. Rozbitý deploy → Vercel instant rollback na předchozí deployment (`request_rollback` / dashboard), oprava v kódu přes PR.
4. Smazaný/přepsaný obsah → admin: **Koš** (obnovit) nebo **Verze** (vrátit). Přes MCP: `PATCH deletedAt=null` s `?trash=true`.
5. Poškozená data v DB → Neon point-in-time restore / snapshot (nejdřív na nové větvi, ověřit, pak přepnout).
6. Neúspěšný import → nic se nezapsalo; zkontrolovat soubor (sloupce), nahrát znovu.

**Uživatelé adminu** (`src/collections/Users.ts`, e-maily `src/email/auth-emails.ts`):
- Účty zakládá jen Admin (Nastavení → Uživatelé): e-mail, jméno, role, libovolné dočasné heslo → uživateli přijde **pozvánka** s odkazem na nastavení vlastního hesla (platí 7 dní, jednorázový).
- **Zapomenuté heslo**: odkaz na přihlašovací stránce `/admin` → e-mail s odkazem (platí 1 h).
- Heslo min. 10 znaků; po 5 špatných pokusech zámek na 10 min (Admin může odemknout); přihlášení platí 8 h.
- Admin nemůže smazat sám sebe ani si odebrat roli Admin (web nesmí zůstat bez správce).
- E-maily jdou přes Resend (`RESEND_API_KEY`) z `EMAIL_FROM_ADDRESS` (teď `asistent@ai.sebit.cz` jako správce webu); lokálně bez klíče se jen logují.
- Odkaz „Přihlášení do administrace“ je v patičce webu.

**Ochrana proti redaktorům:** role (Editor nesahá na katalog), koš + verze všude, natrvalo maže jen Admin (`src/hooks/adminOnlyPermanentDelete.ts`), mazat strukturu (divize, značky, řady, obrázky, stránky) a měnit jejich URL smí jen Admin, BC pole jsou read-only.

## Příkazy

| Příkaz | Co dělá |
|---|---|
| `docker compose up -d` / `down -v` | lokální Postgres / reset dat |
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
| Infrastruktura | Claude Code | Vercel MCP (deploye, env, logy); DB dle zvolené platformy |

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

## Spuštění na profispojky.cz (go-live checklist)

Tento web nahradí současný profispojky.cz. Před přepnutím DNS:

- [x] Produkční DB: Neon `profispojky-prod` (Free) → `DATABASE_URL`, `PAYLOAD_SECRET`, `NEXT_PUBLIC_SERVER_URL` pro **production**
- [ ] Den před přepnutím DNS: Neon na **Launch** (PITR 7 dní, plánované snapshoty, bez limitu CU-h) + spending notification ~$25
- [ ] Testovací stupně: 1) `profispojky.sebit.cz` (interní), 2) `beta.profispojky.cz` (UAT business) – obě na produkčním prostředí, indexace vypnutá
- [ ] Migrace + import dat (obsah z preview nebo čistý seed + reálný import z BC)
- [x] **Mapa 301** ze všech URL starého webu (sitemap + výpisy kategorií + soubory) → kolekce Přesměrování
- [ ] Těsně před přepnutím DNS: znovu spustit převod ze starého webu (změny od posledního importu), pak `MIGRATION_TOKEN` smazat
- [ ] Účty redaktorů (pozvánky), admin SEBIT
- [ ] `NEXT_PUBLIC_SERVER_URL=https://www.profispojky.cz`, `ALLOW_INDEXING=true` (jen production)
- [ ] Doména ve Vercelu (`www.profispojky.cz` + redirect z apex), TTL DNS snížit den předem
- [ ] Po přepnutí: Google Search Console – nová sitemap, kontrola 404
- [ ] Volitelně: e-maily z domény `profispojky.cz` (ověřit doménu v Resendu) – až po spuštění
