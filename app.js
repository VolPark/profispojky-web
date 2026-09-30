(function () {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const PARAMS = () => new URLSearchParams(location.search.length > 1 ? location.search : location.hash.replace(/^#/, ''));
  $$('form[action="katalog.html"]').forEach((f) => f.addEventListener('submit', (e) => {
    e.preventDefault(); const q = (f.querySelector('input[name="q"]') || {}).value || '';
    location.href = 'katalog.html#q=' + encodeURIComponent(q);
  }));
  window.addEventListener('hashchange', () => { if (/[=]/.test(location.hash)) location.reload(); });
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const ICON = {};
  ['chev','box','x','file','play'].forEach((n) => (ICON[n] = '<svg class="icon" aria-hidden="true"><use href="icons.svg#' + n + '"/></svg>'));

  /* ---------- header ---------- */
  const menuBtn = $('.menu-btn'), mnav = $('.mnav');
  if (menuBtn && mnav) menuBtn.addEventListener('click', () => {
    const open = mnav.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  const sBtn = $('.search-btn'), sPanel = $('.search-panel');
  if (sBtn && sPanel) sBtn.addEventListener('click', () => {
    const open = sPanel.classList.toggle('open');
    sBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) $('input', sPanel).focus();
  });

  /* ---------- data ---------- */
  const TVNAME = { A: 'vnější závit', O: 'svěrná', IM: 'závit v matici', OL: 'opravná', WO: 'koleno', TI: 'T kus', 'nástěnka': 'nástěnka' };
  const TVLONG = { A: 'A – spojka přímá s vnějším závitem', O: 'O – oboustranně svěrná spojka', IM: 'IM – vnitřní závit v převlečné matce', OL: 'OL – opravná spojka svěrná', WO: 'WO – koleno svěrné', TI: 'TI – T kus s vnitřním závitem', 'nástěnka': 'Nástěnka' };
  const IMG = {"30070002": "assets/p/171.jpg", "30000007": "assets/p/167.jpg", "30000011": "assets/p/167.jpg", "30000018": "assets/p/167.jpg", "30000021": "assets/p/167.jpg", "30000032": "assets/p/167.jpg", "30000035": "assets/p/167.jpg", "30000042": "assets/p/1116.jpg", "30150018": "assets/p/172.jpg", "30150020": "assets/p/173.jpg", "30150022": "assets/p/173.jpg", "30390015": "assets/p/180.jpg", "30250010": "assets/p/186.jpg", "30400003": "assets/p/174.jpg", "30800004": "assets/p/182.jpg", "30800005": "assets/p/182.jpg"};
  const ROWS = [
    ['30070002', 'BIM 20 × 3/4"', 'Spojka s vnitřním závitem v převlečné matici', 'IM', 20, '3/4"'],
    ['30000007', 'BA 20 × 1/2"', 'Spojka s vnějším závitem', 'A', 20, '1/2"'],
    ['30000011', 'BA 25 × 1/2"', 'Spojka s vnějším závitem', 'A', 25, '1/2"'],
    ['30000018', 'BA 32 × 1"', 'Spojka s vnějším závitem', 'A', 32, '1"'],
    ['30000021', 'BA 40 × 1"', 'Spojka s vnějším závitem', 'A', 40, '1"'],
    ['30000032', 'BA 63 × 2"', 'Spojka s vnějším závitem', 'A', 63, '2"'],
    ['30000035', 'BA 63 × 2 1/2"', 'Spojka s vnějším závitem', 'A', 63, '2 1/2"'],
    ['30000042', 'BA 90 × 3"', 'Spojka s vnějším závitem', 'A', 90, '3"'],
    ['30150018', 'BO 63 × 63', 'Spojka svěrná', 'O', 63, ''],
    ['30150020', 'BO 75 × 75', 'Spojka svěrná', 'O', 75, ''],
    ['30150022', 'BO 90 × 90', 'Spojka svěrná', 'O', 90, ''],
    ['30390015', 'BWO 90 × 90', 'Koleno svěrné', 'WO', 90, ''],
    ['30250010', 'BTI 32 × 1"', 'T kus odbočný s vnitřním závitem', 'TI', 32, '1"'],
    ['30400003', 'BOL 32 × 32', 'Spojka svěrná prodloužená', 'OL', 32, ''],
    ['30800004', 'B nástěnka 32 × 3/4"', 'Nástěnka', 'nástěnka', 32, '3/4"'],
    ['30800005', 'B nástěnka 32 × 1"', 'Nástěnka', 'nástěnka', 32, '1"'],
  ].map(([code, label, desc, tvar, pe, thr]) => ({ code, label, desc, tvar, pe, thr, img: IMG[code] || '' }));
  window.PS_ROWS = ROWS;

  /* ---------- catalog ---------- */
  const cat = $('#catalog');
  if (cat) {
    const params = PARAMS();
    const rada = (params.get('rada') || 'valvopat').toLowerCase();
    const st = { tvar: 'all', pe: new Set(), thr: new Set(), q: params.get('q') || '' };
    const tbody = $('#cat-rows'), countEl = $('#cat-count'), emptyEl = $('#cat-empty'), afEl = $('#active-filters');
    const qIn = $('#kat-q');
    if (rada !== 'valvopat') {
      $('#cat-other').hidden = false;
      $('#cat-other-name').textContent = decodeURIComponent(params.get('nazev') || rada);
      $('#cat-main').hidden = true;
    }
    if (params.get('typ')) {
      const n = $('#cat-typ'); n.hidden = false; $('#cat-typ-name').textContent = params.get('typ');
    }
    qIn.value = st.q;
    const TV = [['all', 'Vše'], ['A', 'A – vnější závit'], ['O', 'O – svěrná'], ['IM', 'IM – závit v matici'], ['OL', 'OL – opravná'], ['WO', 'WO – koleno'], ['TI', 'TI – T kus'], ['nástěnka', 'Nástěnka']];
    const tvBox = $('#tv');
    tvBox.innerHTML = TV.map(([id, l]) => `<button type="button" data-tv="${esc(id)}" aria-pressed="${id === 'all'}"><span>${esc(l)}</span><span>${id === 'all' ? ROWS.length : ROWS.filter((r) => r.tvar === id).length}</span></button>`).join('');
    tvBox.addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; st.tvar = b.dataset.tv; render(); });
    $$('input[name="pe"]').forEach((c) => c.addEventListener('change', () => { c.checked ? st.pe.add(+c.value) : st.pe.delete(+c.value); render(); }));
    $$('input[name="thr"]').forEach((c) => c.addEventListener('change', () => { c.checked ? st.thr.add(c.value) : st.thr.delete(c.value); render(); }));
    qIn.addEventListener('input', () => { st.q = qIn.value; render(); });
    const reset = () => { st.tvar = 'all'; st.pe.clear(); st.thr.clear(); st.q = ''; qIn.value = ''; $$('.checks input').forEach((c) => (c.checked = false)); render(); };
    $$('[data-reset]').forEach((b) => b.addEventListener('click', reset));
    afEl.addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b) return;
      const [k, v] = b.dataset.rm.split(':');
      if (k === 'tvar') st.tvar = 'all';
      if (k === 'pe') { st.pe.delete(+v); $(`input[name="pe"][value="${v}"]`).checked = false; }
      if (k === 'thr') { st.thr.delete(v); $$('input[name="thr"]').forEach((c) => { if (c.value === v) c.checked = false; }); }
      if (k === 'q') { st.q = ''; qIn.value = ''; }
      render();
    });
    // mobile sheet
    const filters = $('.filters'), ft = $('.filter-toggle');
    let scrim = null;
    const closeSheet = () => { filters.classList.remove('open'); if (scrim) { scrim.remove(); scrim = null; } ft.setAttribute('aria-expanded', 'false'); ft.focus(); };
    ft.addEventListener('click', () => {
      filters.classList.add('open'); ft.setAttribute('aria-expanded', 'true');
      scrim = document.createElement('div'); scrim.className = 'scrim'; scrim.addEventListener('click', closeSheet); document.body.appendChild(scrim);
      $('button, input', filters).focus();
    });
    $$('[data-close-sheet]').forEach((b) => b.addEventListener('click', closeSheet));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && filters.classList.contains('open')) closeSheet(); });

    function render() {
      const q = st.q.toLowerCase().trim();
      const list = ROWS.filter((r) => (st.tvar === 'all' || r.tvar === st.tvar)
        && (!st.pe.size || st.pe.has(r.pe)) && (!st.thr.size || st.thr.has(r.thr))
        && (!q || (r.code + ' ' + r.label + ' ' + r.desc).toLowerCase().includes(q)));
      $$('#tv button').forEach((b) => b.setAttribute('aria-pressed', b.dataset.tv === st.tvar ? 'true' : 'false'));
      tbody.innerHTML = list.map((r) => `<tr>
<td class="c-img">${r.img ? `<img class="thumb" src="${r.img}" alt="" loading="lazy">` : `<div class="thumb-ph">${ICON.box}</div>`}</td>
<td class="c-code mono">${r.code}</td>
<td class="c-name"><div class="nm">${esc(r.label)}</div><div class="ds">${esc(r.desc)}</div></td>
<td class="c-meta">PE ${r.pe} mm${r.thr ? ' · ' + esc(r.thr) : ''} · tvar ${esc(r.tvar)}</td>
<td class="c-tvar"><strong style="color:var(--navy)">${esc(r.tvar)}</strong><div class="sub">${TVNAME[r.tvar]}</div></td>
<td class="c-pe">${r.pe} mm</td>
<td class="c-thr">${r.thr ? esc(r.thr) : '–'}</td>
<td class="c-det" style="text-align:right"><a class="det" href="produkt.html?kod=${r.code}"><span class="lbl">Detail</span><span class="sr"> ${esc(r.label)}</span>${ICON.chev}</a></td>
</tr>`).join('');
      countEl.textContent = list.length;
      $$('.js-count').forEach((e) => (e.textContent = list.length));
      emptyEl.hidden = list.length > 0;
      $('.tbl-wrap table').hidden = list.length === 0;
      const af = [];
      if (st.tvar !== 'all') af.push(['tvar:' + st.tvar, 'Tvar: ' + st.tvar]);
      st.pe.forEach((v) => af.push(['pe:' + v, 'PE ' + v + ' mm']));
      st.thr.forEach((v) => af.push(['thr:' + v, 'Závit ' + v]));
      if (st.q) af.push(['q:', 'Hledání: ' + st.q]);
      afEl.innerHTML = af.map(([k, l]) => `<button type="button" data-rm="${esc(k)}">${esc(l)}${ICON.x}<span class="sr">Zrušit filtr</span></button>`).join('');
      afEl.hidden = af.length === 0;
      const fc = st.pe.size + st.thr.size + (st.tvar !== 'all' ? 1 : 0);
      $('#fcount').textContent = fc ? `(${fc})` : '';
    }
    render();
  }

  /* ---------- product ---------- */
  const prod = $('#product');
  if (prod) {
    const kod = PARAMS().get('kod') || '30000007';
    const r = ROWS.find((x) => x.code === kod) || ROWS[1];
    document.title = r.label + ' – ' + r.desc + ' | PROFI SPOJKY (prototyp)';
    const set = (id, v) => $$('[data-p="' + id + '"]').forEach((e) => (e.textContent = v));
    set('title', `${r.label} – ${r.desc.toLowerCase()}`);
    set('code', r.code); set('pe', r.pe + ' mm'); set('thr', r.thr || '–'); set('tvar', TVLONG[r.tvar]); set('crumb', r.label);
    $$('[data-p-hide-thr]').forEach((e) => (e.hidden = !r.thr));
    const imgs = $$('[data-p="img"]');
    imgs.forEach((i) => { if (r.img) { i.src = r.img; i.hidden = false; } else { i.hidden = true; } });
    $$('[data-p="noimg"]').forEach((e) => (e.hidden = !!r.img));
    $$('[data-p-thumb]').forEach((e) => (e.hidden = !r.img));
    const vars = ROWS.filter((x) => x.tvar === r.tvar);
    $('#var-title').textContent = 'Další rozměry – tvar ' + r.tvar;
    $('#var-rows').innerHTML = vars.map((x) => `<tr class="${x.code === r.code ? 'cur' : ''}"><td class="mono" style="font-size:14px">${x.code}</td><td><a href="produkt.html?kod=${x.code}" style="font-weight:600;text-decoration:none">${esc(x.label)}</a>${x.code === r.code ? ' <span class="chip">zobrazeno</span>' : ''}</td><td>${x.pe} mm</td><td>${x.thr ? esc(x.thr) : '–'}</td></tr>`).join('');
  }

  /* ---------- library ---------- */
  const lib = $('#library');
  if (lib) {
    const DOCS = [["katalog", "Katalogy", "Kompletní katalog PROFI SPOJKY 2026/03", "Všechny divize", "", "PDF · 15,9 MB", "https://www.profispojky.cz/download.php?fid=1503"], ["katalog", "Katalogy", "PROFI SPOJKY – rychlý přehled", "Všechny divize", "", "PDF · 16,6 MB", "https://www.profispojky.cz/download.php?fid=1363"], ["katalog", "Katalogy", "Přehled použití sortimentu", "Všechny divize", "", "PDF · 263 kB", "https://www.profispojky.cz/download.php?fid=1098"], ["katalog", "Katalogy", "Katalog Bugatti Valvopat", "Mosaz", "Bugatti", "PDF · 947 kB", "https://www.profispojky.cz/download.php?fid=1464"], ["letak", "Letáky", "GIRPI HTA® – novinka v sortimentu", "Plast", "GIRPI", "PDF · 338 kB", "https://www.profispojky.cz/download.php?fid=1453"], ["tl", "Technické listy", "Technická dokumentace Bugatti Valvopat – BA", "Mosaz", "Bugatti", "PDF · 1,7 MB", "https://www.profispojky.cz/download.php?fid=1013"], ["cert", "Certifikáty", "Certifikáty výrobků", "Všechny divize", "", "PDF · 658 kB", "https://www.profispojky.cz/download.php?fid=1150"], ["shoda", "Prohlášení o shodě", "Prohlášení o shodě AGA spojky", "Litina", "AGAflex", "PDF", "https://www.profispojky.cz/prohlaseni-o-shode-aga-spojky-687"], ["shoda", "Prohlášení o shodě", "Prohlášení o shodě AGA třmeny", "Litina", "AGAflex", "PDF", "https://www.profispojky.cz/prohlaseni-o-shode-aga-trmeny-688"], ["shoda", "Prohlášení o shodě", "Prohlášení o shodě Viking Johnson UltraGrip", "Litina", "AGAflex", "PDF", "https://www.profispojky.cz/prohlaseni-o-shode-viking-johnson-ultragrip-690"], ["shoda", "Prohlášení o shodě", "Prohlášení o shodě Bugatti Valvopat", "Mosaz", "Bugatti", "PDF · 81 kB", "https://www.profispojky.cz/download.php?fid=1414"], ["shoda", "Prohlášení o shodě", "Prohlášení o shodě Bugatti Oregon", "Mosaz", "Bugatti", "PDF", "https://www.profispojky.cz/prohlaseni-o-shode-bugatti-oregon-694"], ["navod", "Montážní návody", "Montážní návod AGA spojky", "Litina", "AGAflex", "PDF", "https://www.profispojky.cz/montazni-navod-aga-spojky"], ["navod", "Montážní návody", "Montážní návod Bugatti Valvopat a Valvofit", "Mosaz", "Bugatti", "PDF · 221 kB", "https://www.profispojky.cz/download.php?fid=107"], ["navod", "Montážní návody", "Montážní návod Schlösser Frost-Tec", "Mosaz", "Schlösser", "PDF", "https://www.profispojky.cz/montazni-navod-schloesser-frost-tec-674"], ["navod", "Montážní návody", "Montážní návod Plas-Fit 150 a 350", "Plast", "Plas-Fit", "PDF", "https://www.profispojky.cz/montazni-navod-plas-fit-350"], ["navod", "Montážní návody", "Montážní návod SAB", "Plast", "SAB", "PDF", "https://www.profispojky.cz/montazni-navod-sab"], ["navod", "Montážní návody", "Montážní návod nerezové opravné pasy", "Další sortiment", "IVE", "PDF", "https://www.profispojky.cz/montazni-navod-nerezove-opravne-pasy-680"], ["navod", "Montážní návody", "Montážní návod GRAS hydranty", "Další sortiment", "GRAS", "PDF", "https://www.profispojky.cz/montazni-navod-gras-hydranty-681"], ["video", "Videa", "Plas-Fit navrtávky Tavor", "Plast", "Plas-Fit", "Video", "https://www.profispojky.cz/video-navrtavky-tavor"], ["video", "Videa", "Plas-Fit EASY SYSTÉM – řada 350", "Plast", "Plas-Fit", "Video", "https://www.profispojky.cz/plas-fit-100"], ["video", "Videa", "SAB Blueseal", "Plast", "SAB", "Video", "https://www.profispojky.cz/sab-blueseal-445"], ["video", "Videa", "Schlösser ventily", "Mosaz", "Schlösser", "Video", "https://www.profispojky.cz/schloesser-ventily-447"]].map(([t, tl, title, div, brand, fmt, url]) => ({ t, tl, title, div, brand, fmt, url }));
    const st = { t: 'all', q: '', brand: '', div: '' };
    const grid = $('#docs'), cnt = $('#doc-count'), empty = $('#doc-empty');
    $('#doc-types').addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; st.t = b.dataset.t; render(); });
    $('#lib-q').addEventListener('input', (e) => { st.q = e.target.value; render(); });
    $('#lib-brand').addEventListener('change', (e) => { st.brand = e.target.value; render(); });
    $('#lib-div').addEventListener('change', (e) => { st.div = e.target.value; render(); });
    $$('[data-lib-reset]').forEach((b) => b.addEventListener('click', () => { Object.assign(st, { t: 'all', q: '', brand: '', div: '' }); $('#lib-q').value = ''; $('#lib-brand').value = ''; $('#lib-div').value = ''; render(); }));
    function render() {
      const q = st.q.toLowerCase().trim();
      const list = DOCS.filter((d) => (st.t === 'all' || d.t === st.t) && (!st.brand || d.brand === st.brand)
        && (!st.div || d.div === st.div || d.div === 'Všechny divize') && (!q || (d.title + ' ' + d.div + ' ' + d.tl + ' ' + d.brand).toLowerCase().includes(q)));
      $$('#doc-types button').forEach((b) => b.setAttribute('aria-pressed', b.dataset.t === st.t ? 'true' : 'false'));
      grid.innerHTML = list.map((d) => `<article class="card doc"><div class="top">${d.t === 'video' ? ICON.play : ICON.file}<span class="tag">${esc(d.tl)}</span></div>
<div class="body"><h3>${esc(d.title)}</h3><span class="m">${esc(d.div)}${d.brand ? ' · ' + esc(d.brand) : ''}</span><span class="m">${esc(d.fmt)}</span>
<div class="acts"><a href="${d.url}" target="_blank" rel="noopener">${d.t === 'video' ? ICON.play + 'Přehrát' : ICON.file + (d.url.includes('download.php') ? 'Stáhnout' : 'Otevřít')}<span class="sr"> ${esc(d.title)}</span></a></div></div></article>`).join('');
      cnt.textContent = list.length; empty.hidden = list.length > 0;
    }
    render();
  }

  /* ---------- dealers ---------- */
  const dl = $('#dealers');
  if (dl && window.PS_PARTNERS) {
    const R = window.PS_PARTNERS; const st = { q: '', c: '', k: '' };
    const kSel = $('#ps-k'), cSel = $('#ps-c'), qIn = $('#ps-q');
    const total = R.reduce((a, r) => a + r.p.length, 0); $('#ps-total').textContent = total;
    kSel.innerHTML = '<option value="">Všechny kraje</option>' + R.map((r) => `<option value="${r.id}">${esc(r.name)} (${r.c === 'SK' ? 'SK' : 'ČR'})</option>`).join('');
    const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '');
    function render() {
      const q = norm(st.q);
      const regs = R.filter((r) => (!st.c || r.c === st.c) && (!st.k || r.id === st.k));
      const items = []; regs.forEach((r) => r.p.forEach(([n, a]) => { if (!q || norm(n + a).includes(q)) items.push({ n, a, r: r.name }); }));
      $('#ps-list').innerHTML = items.map((p) => `<article class="card dealer"><h3>${esc(p.n)}</h3><span class="addr">${esc(p.a)}</span><span class="m">${esc(p.r)}</span><a href="https://mapy.cz/zakladni?q=${encodeURIComponent(p.n + ', ' + p.a)}" target="_blank" rel="noopener">Navigovat<span class="sr"> – ${esc(p.n)}, ${esc(p.a)}</span></a></article>`).join('');
      $('#ps-count').textContent = items.length; $('#ps-empty').hidden = items.length > 0;
      $('#ps-regions').innerHTML = ['CZ', 'SK'].map((c) => `<h3>${c === 'CZ' ? 'Česká republika' : 'Slovensko'}</h3>` + R.filter((r) => r.c === c).map((r) => `<button type="button" data-k="${r.id}" aria-pressed="${st.k === r.id}"><span>${esc(r.name)}</span><span>${r.p.length}</span></button>`).join('')).join('');
    }
    $('#ps-regions').addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; st.k = st.k === b.dataset.k ? '' : b.dataset.k; kSel.value = st.k; render(); $('#ps-list').scrollIntoView({ behavior: 'smooth', block: 'start' }); });
    kSel.addEventListener('change', () => { st.k = kSel.value; render(); });
    cSel.addEventListener('change', () => { st.c = cSel.value; render(); });
    qIn.addEventListener('input', () => { st.q = qIn.value; render(); });
    $('#ps-form').addEventListener('submit', (e) => { e.preventDefault(); st.q = qIn.value; render(); });
    $('#ps-reset').addEventListener('click', () => { Object.assign(st, { q: '', c: '', k: '' }); qIn.value = ''; cSel.value = ''; kSel.value = ''; render(); });
    render();
  }
})();
