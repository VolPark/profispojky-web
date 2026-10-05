/**
 * Mezistránka „Generuji technický list…“: odkazy na webu vedou sem (/generuji-pdf?u=/technicky-list/…pdf).
 * Stránka hned přejde na PDF (location.replace – v historii nezůstane); prohlížeč ji nechá zobrazenou,
 * dokud PDF nepřijde, takže animace běží přesně po dobu generování. Statický obsah, bez DB.
 * Cíl se čte až v prohlížeči a povolí se jen cesta /technicky-list/… na tomto webu (žádné přesměrování jinam).
 */
const html = /* html */ `<!doctype html>
<html lang="cs">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Generuji technický list… | PROFI SPOJKY</title>
<link rel="icon" href="/logo.svg">
<style>
  :root { --navy: #1C2F5A; --blue: #45C0EB; --blue-dark: #0B6A91; --bg: #F4F6F8; --border: #E0E4EB; --muted: #5D6779 }
  * { box-sizing: border-box }
  html, body { height: 100% }
  body { margin: 0; background: var(--bg); color: var(--navy); font: 16px/1.5 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    display: flex; align-items: center; justify-content: center; padding: 24px }
  main { width: 100%; max-width: 420px; text-align: center }
  .logo { width: 170px; height: auto; margin-bottom: 36px }
  .sheet { position: relative; width: 132px; height: 170px; margin: 0 auto 32px; background: #fff; border: 1px solid var(--border);
    border-radius: 8px; box-shadow: 0 18px 40px -18px rgba(28, 47, 90, .35); overflow: hidden }
  .sheet::before { content: ""; position: absolute; left: 0; right: 0; top: 0; height: 6px; background: var(--blue) }
  .line { position: absolute; left: 16px; height: 6px; border-radius: 3px; background: var(--border); transform-origin: left; transform: scaleX(0);
    animation: write 2.4s ease-in-out infinite }
  .line.head { top: 22px; width: 60%; height: 9px; background: var(--navy) }
  .l1 { top: 42px; width: 78% } .l2 { top: 54px; width: 64% }
  .table { position: absolute; left: 16px; right: 16px; top: 76px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 5px }
  .cell { height: 9px; border-radius: 2px; background: var(--border); opacity: 0; animation: cell 2.4s ease-in-out infinite }
  .cell.h { background: var(--navy) }
  .scan { position: absolute; left: 0; right: 0; height: 26px; top: -26px;
    background: linear-gradient(180deg, rgba(69, 192, 235, 0), rgba(69, 192, 235, .35), rgba(69, 192, 235, 0)); animation: scan 2.4s linear infinite }
  .badge { position: absolute; right: 0; bottom: 14px; background: var(--blue-dark); color: #fff; font-weight: 700; font-size: 12px;
    letter-spacing: .08em; padding: 4px 10px 4px 8px; border-radius: 4px 0 0 4px }
  @keyframes write { 0%, 8% { transform: scaleX(0) } 35%, 85% { transform: scaleX(1) } 100% { transform: scaleX(1); opacity: 0 } }
  @keyframes cell { 0%, 30% { opacity: 0 } 50%, 85% { opacity: 1 } 100% { opacity: 0 } }
  @keyframes scan { 0% { top: -26px } 100% { top: 170px } }
  h1 { font-size: 20px; margin: 0 0 6px; font-weight: 700 }
  .code { font-family: ui-monospace, "SFMono-Regular", Menlo, monospace; color: var(--blue-dark); font-weight: 600; min-height: 1.5em }
  .bar { height: 4px; margin: 22px auto 14px; max-width: 260px; background: var(--border); border-radius: 2px; overflow: hidden; position: relative }
  .bar::after { content: ""; position: absolute; top: 0; bottom: 0; width: 40%; background: var(--blue); border-radius: 2px; animation: bar 1.3s ease-in-out infinite }
  @keyframes bar { 0% { left: -40% } 100% { left: 100% } }
  p.hint { color: var(--muted); font-size: 14px; margin: 0 }
  .fallback { display: none; margin-top: 18px; font-size: 14px }
  .fallback a { color: var(--blue-dark); font-weight: 600 }
  a:focus-visible { outline: 3px solid var(--blue); outline-offset: 2px }
  @media (prefers-reduced-motion: reduce) {
    .line, .cell, .scan, .bar::after { animation: none } .line { transform: scaleX(1) } .cell { opacity: 1 } .bar::after { left: 30% } }
</style>
</head>
<body>
<main role="status" aria-live="polite">
  <img class="logo" src="/logo.svg" alt="PROFI SPOJKY" width="170" height="33">
  <div class="sheet" aria-hidden="true">
    <span class="line head"></span><span class="line l1" style="animation-delay:.1s"></span><span class="line l2" style="animation-delay:.2s"></span>
    <div class="table">
      <span class="cell h"></span><span class="cell h" style="animation-delay:.05s"></span><span class="cell h" style="animation-delay:.1s"></span><span class="cell h" style="animation-delay:.15s"></span>
      <span class="cell" style="animation-delay:.2s"></span><span class="cell" style="animation-delay:.25s"></span><span class="cell" style="animation-delay:.3s"></span><span class="cell" style="animation-delay:.35s"></span>
      <span class="cell" style="animation-delay:.4s"></span><span class="cell" style="animation-delay:.45s"></span><span class="cell" style="animation-delay:.5s"></span><span class="cell" style="animation-delay:.55s"></span>
      <span class="cell" style="animation-delay:.6s"></span><span class="cell" style="animation-delay:.65s"></span><span class="cell" style="animation-delay:.7s"></span><span class="cell" style="animation-delay:.75s"></span>
    </div>
    <span class="scan"></span>
    <span class="badge">PDF</span>
  </div>
  <h1>Generuji technický list</h1>
  <div class="code" id="code"></div>
  <div class="bar" aria-hidden="true"></div>
  <p class="hint">Sestavujeme ho z aktuálních dat, obvykle to trvá několik sekund.</p>
  <p class="fallback" id="fallback">Trvá to déle než obvykle. <a id="link" href="/produkty">Otevřít technický list</a></p>
  <noscript><p class="hint" style="margin-top:18px">Zapněte JavaScript, nebo se vraťte na stránku produktu a otevřete PDF znovu.</p></noscript>
</main>
<script>
(function () {
  var target = null
  try {
    var u = new URL(new URLSearchParams(location.search).get('u') || '', location.origin)
    if (u.origin === location.origin && /^\\/technicky-list\\/[^?#]+\\.pdf$/.test(u.pathname)) target = u.pathname + u.search
  } catch (e) {}
  if (!target) { location.replace('/produkty'); return }
  var file = decodeURIComponent(target.split('?')[0].split('/').pop()).replace(/\\.pdf$/i, '')
  document.getElementById('code').textContent = file
  document.getElementById('link').href = target
  setTimeout(function () { document.getElementById('fallback').style.display = 'block' }, 20000)
  // nechat animaci jeden snímek vykreslit, pak přejít na PDF (stránka zůstane vidět, dokud PDF nepřijde)
  requestAnimationFrame(function () { requestAnimationFrame(function () { location.replace(target) }) })
})()
</script>
</body>
</html>`

export function GET() {
  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
      'X-Robots-Tag': 'noindex',
    },
  })
}
