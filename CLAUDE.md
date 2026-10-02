# profispojky-web

Web pro profispojky.cz (PROFI SPOJKY) – **katalogový web bez e-shopu**: produkty, technické specifikace, stažení katalogů, prodejní síť.

## Stav

- Root repa = **statický HTML prototyp** (vanilla HTML/CSS/JS, nasazený na Vercel s `noindex`).
- Cíl: z prototypu udělat produkční web dle návrhu (Claude Design canvas „Profispojky – návrh webu“) **včetně administrace**.
- Prototyp je referenční UI – vizuál a UX se z něj přebírá, data jsou zatím natvrdo v JS.

## Prototyp – mapa souborů

| Soubor | Obsah |
|---|---|
| `index.html` | Úvod |
| `produkty.html`, `divize-*.html` | Přehled produktů, 4 divize (Mosaz, Plast, Litina, Další sortiment) |
| `katalog.html` | Katalog řady (filtry tvar / PE / závit, fulltext) – data `ROWS` v `app.js` |
| `produkt.html?kod=` | Detail produktu podle kódu položky |
| `knihovna.html` | Knihovna médií (katalogy, certifikáty, videa) – data `DOCS` v `app.js` |
| `prodejni-sit.html` | Prodejní síť – data `window.PS_PARTNERS` v `partners.js` (kraje CZ/SK) |
| `znacky.html`, `o-firme.html`, `aktuality.html`, `kontakt.html` | Obsahové stránky |
| `styles.css` | Design tokens + komponenty |
| `icons.svg` | SVG sprite (`chev`, `box`, `x`, `file`, `play`) |
| `assets/` | Logo, fotky divizí, produktů (`assets/p/`), aktualit |

## Design tokens (`styles.css`)

- Barvy: navy `#1C2F5A` (z marketingových materiálů klienta), blue `#45C0EB`, blue-dark `#0B6A91`, bg-alt `#F4F6F8`, border `#E0E4EB`.
- Písma: Archivo (display), IBM Plex Sans (body), IBM Plex Mono (jen kódy položek).
- Divize nemají vlastní barvy – rozlišují se fotkou a názvem.

## Doménová pravidla (handoff z auditu 30. 9. 2026)

- **Business Central (BC) = master** pro kód položky, název, řadu a stav (aktivní / výprodej). Import CSV/XLSX. Na webu se BC nezmiňuje.
- Technické atributy, fotky a dokumenty se spravují v administraci a **párují přes kód položky**. Chybějící atribut se nezobrazuje.
- Typy výrobků (tvar: A, O, IM, OL, WO, TI, nástěnka…) se generují z atributu „typ“, ne ručně.
- Knihovna médií: dokument ↔ řada/produkt, pole *Vydáno* / *Platné do*, upozornění na expiraci certifikátů.
- SEO: 301 mapa ze stávajících URL profispojky.cz, indexovat hlavně stránky řad, `BreadcrumbList` schema.
- Nenavrženo v designu: výsledky hledání, detail aktuality, sekce Pro partnery, 404, rozbalené mobilní menu.

## Konvence

- UI texty česky, kód a identifikátory anglicky.
- Přístupnost: skutečné `<button>`/`<a>`/`<label>`, `:focus-visible`, kontrast min. 4.5:1, touch targets ≥ 44 px.
- Placeholdery `[ ]` = chybí vstup od klienta – nevymýšlet obsah, čísla ani technické parametry.
