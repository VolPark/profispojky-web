import React from 'react'

/**
 * Animované ilustrace úvodní stránky (čisté SVG + CSS/SMIL, bez knihoven a bez fotek).
 * Animace běží jen s `.motion` (viz HomeMotion) a bez `prefers-reduced-motion`.
 */

/* ---------- síť: výrobci → centrální sklad → prodejní místa ---------- */

const MAKERS = 12
const DEALERS = 36

type NetworkProps = { makers: string; hub: string; dealers: string }

/** Tok zboží: zahraniční výrobci vlevo, sklad uprostřed, prodejní místa vpravo; částice proudí zleva doprava. */
export function NetworkArt({ makers, hub, dealers }: NetworkProps) {
  const W = 640
  const H = 520
  const hx = W / 2
  const hy = H / 2
  const left = Array.from({ length: MAKERS }, (_, i) => {
    const a = (-60 + (120 / (MAKERS - 1)) * i) * (Math.PI / 180)
    return { x: hx - 250 * Math.cos(a) * 0.9 - 20, y: hy + 200 * Math.sin(a) }
  })
  // prodejní místa: rozptýlený „roj“ vpravo (deterministicky, ať se SSR a klient shodnou)
  const right = Array.from({ length: DEALERS }, (_, i) => {
    const t = i / DEALERS
    const a = (-70 + 140 * ((i * 7) % DEALERS) / DEALERS) * (Math.PI / 180)
    const r = 150 + ((i * 37) % 90)
    return { x: hx + r * Math.cos(a) + 20 * t, y: hy + r * Math.sin(a) * 1.05 }
  })
  const curve = (x1: number, y1: number, x2: number, y2: number) => {
    const mx = (x1 + x2) / 2
    return `M${x1.toFixed(1)} ${y1.toFixed(1)} C ${mx.toFixed(1)} ${y1.toFixed(1)}, ${mx.toFixed(1)} ${y2.toFixed(1)}, ${x2.toFixed(1)} ${y2.toFixed(1)}`
  }
  return (
    <svg className="art-network" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${makers} → ${hub} → ${dealers}`}>
      <defs>
        <radialGradient id="hubGlow">
          <stop offset="0" stopColor="#45C0EB" stopOpacity=".45" />
          <stop offset="1" stopColor="#45C0EB" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g className="links in">
        {left.map((p, i) => (
          <path key={i} id={`nin${i}`} d={curve(p.x, p.y, hx, hy)} />
        ))}
      </g>
      <g className="links out">
        {right.map((p, i) => (
          <path key={i} id={`nout${i}`} d={curve(hx, hy, p.x, p.y)} />
        ))}
      </g>
      <g className="flow">
        {left.map((_, i) => (
          <circle key={`a${i}`} r="3">
            <animateMotion dur={`${3.2 + (i % 4) * 0.4}s`} begin={`-${((i * 0.37) % 3).toFixed(2)}s`} repeatCount="indefinite">
              <mpath href={`#nin${i}`} />
            </animateMotion>
          </circle>
        ))}
        {right
          .filter((_, i) => i % 2 === 0)
          .map((_, k) => (
            <circle key={`b${k}`} r="2.4" className="o">
              <animateMotion dur={`${2.6 + (k % 5) * 0.3}s`} begin={`-${((k * 0.29) % 2.6).toFixed(2)}s`} repeatCount="indefinite">
                <mpath href={`#nout${k * 2}`} />
              </animateMotion>
            </circle>
          ))}
      </g>
      <g className="nodes">
        {left.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="7" className="maker" />
        ))}
        {right.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={i % 3 ? 3.2 : 4.5} className="dealer" />
        ))}
      </g>
      <circle cx={hx} cy={hy} r="92" fill="url(#hubGlow)" className="glow" />
      <circle cx={hx} cy={hy} r="38" className="hub" />
      <circle cx={hx} cy={hy} r="38" className="ring" />
      <g className="labels">
        <text x={left[0].x - 6} y={34} textAnchor="middle">
          {makers}
        </text>
        {/* štítek pod popiskem skladu – čitelný přes linky, bez obrysu písmen (ten slepoval znaky) */}
        <rect x={hx - 96} y={hy + 52} width="192" height="28" rx="14" className="tag" />
        <text x={hx} y={hy + 71} textAnchor="middle">
          {hub}
        </text>
        <text x={W - 6} y={34} textAnchor="end">
          {dealers}
        </text>
      </g>
    </svg>
  )
}

/* ---------- voda · plyn · teplo ---------- */

/** Malá animovaná ikona k živlu (podle pořadí: voda, plyn, teplo). */
export function ElementIcon({ index }: { index: number }) {
  if (index === 0)
    return (
      <svg className="el el-water" viewBox="0 0 48 48" aria-hidden="true">
        <path d="M24 6 C 24 6 11 21 11 30 a13 13 0 0 0 26 0 C 37 21 24 6 24 6 Z" />
        <path className="shine" d="M18 31 a6 6 0 0 0 5 6" />
      </svg>
    )
  if (index === 1)
    return (
      <svg className="el el-gas" viewBox="0 0 48 48" aria-hidden="true">
        <path d="M24 5 C 30 14 36 19 36 29 a12 12 0 0 1 -24 0 c 0 -6 3 -10 6 -13 c 0 5 2 8 5 9 c -2 -7 0 -14 1 -20 Z" />
        <path className="core" d="M24 26 c 3 3 5 5 5 8 a5 5 0 0 1 -10 0 c 0 -3 2 -5 5 -8 Z" />
      </svg>
    )
  return (
    <svg className="el el-heat" viewBox="0 0 48 48" aria-hidden="true">
      <path d="M12 38 c 0 -6 6 -6 6 -12 s -6 -6 -6 -12" />
      <path d="M24 38 c 0 -6 6 -6 6 -12 s -6 -6 -6 -12" />
      <path d="M36 38 c 0 -6 6 -6 6 -12 s -6 -6 -6 -12" />
    </svg>
  )
}

/* ---------- materiály (divize) ---------- */

/** Čárová ilustrace divize podle slugu; neznámý slug → obecná spojka. Linka „protéká“ trubkou. */
export function MaterialArt({ slug }: { slug: string }) {
  const kind = slug.startsWith('plast')
    ? 'plast'
    : slug.startsWith('mosaz')
      ? 'mosaz'
      : slug.startsWith('litina')
        ? 'litina'
        : slug.startsWith('dalsi')
          ? 'dalsi'
          : 'new'
  return (
    <svg className={`art-mat art-${kind}`} viewBox="0 0 280 150" aria-hidden="true">
      {/* trubka a proudění uvnitř */}
      <path className="pipe" d="M0 75 H280" />
      <path className="flowline" d="M0 75 H280" />
      {kind === 'plast' && (
        <g className="draw">
          {/* svěrná spojka: dvě převlečné matice a tělo */}
          <rect x="62" y="44" width="54" height="62" rx="14" />
          <rect x="164" y="44" width="54" height="62" rx="14" />
          <rect x="112" y="52" width="56" height="46" rx="8" />
          {[74, 86, 98, 176, 188, 200].map((x) => (
            <path key={x} d={`M${x} 48 V102`} className="rib" />
          ))}
        </g>
      )}
      {kind === 'mosaz' && (
        <g className="draw">
          {/* kulový kohout: tělo, šestihrany, páka */}
          <path d="M84 56 H108 L116 50 H164 L172 56 H196 V94 H172 L164 100 H116 L108 94 H84 Z" />
          <circle cx="140" cy="75" r="14" />
          <path d="M136 50 V34 H144 V50" />
          <path className="lever" d="M128 28 H226 a6 6 0 0 1 0 12 H128 a6 6 0 0 1 0 -12 Z" />
          {[92, 100, 180, 188].map((x) => (
            <path key={x} d={`M${x} 58 V92`} className="rib" />
          ))}
        </g>
      )}
      {kind === 'litina' && (
        <g className="draw">
          {/* opravný třmen: objímka se šrouby */}
          <rect x="78" y="40" width="124" height="70" rx="16" />
          <path d="M78 75 H202" className="rib" />
          {[98, 140, 182].map((x) => (
            <g key={x}>
              <rect x={x - 8} y="26" width="16" height="14" rx="3" />
              <rect x={x - 8} y="110" width="16" height="14" rx="3" />
              <path d={`M${x} 26 V124`} className="rib" />
            </g>
          ))}
        </g>
      )}
      {kind === 'dalsi' && (
        <g className="draw">
          {/* hydrant / sloupek na trase */}
          <path d="M120 75 V30 a20 20 0 0 1 40 0 V75" />
          <rect x="112" y="40" width="56" height="10" rx="3" />
          <circle cx="140" cy="20" r="6" />
          <rect x="104" y="64" width="72" height="22" rx="6" />
          <path d="M168 54 H190 V64" className="rib" />
        </g>
      )}
      {kind === 'new' && (
        <g className="draw">
          <circle cx="140" cy="75" r="30" strokeDasharray="6 8" />
          <path d="M140 61 V89 M126 75 H154" />
        </g>
      )}
    </svg>
  )
}

/* ---------- prodejní síť: špendlík s pulzujícími kruhy ---------- */

/** Dekorace k výzvě „Kde koupit“ – mapa naznačená tečkami, uprostřed špendlík, kolem pulzují kruhy. */
export function PinArt() {
  const dots = Array.from({ length: 22 }, (_, i) => ({
    x: 30 + ((i * 53) % 280),
    y: 30 + ((i * 89) % 220),
    r: i % 4 ? 3 : 4.5,
  }))
  return (
    <svg className="art-pin" viewBox="0 0 340 280" aria-hidden="true">
      {dots.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r={d.r} className="dot" style={{ animationDelay: `${(i % 7) * 0.4}s` }} />
      ))}
      <circle cx="170" cy="150" r="24" className="pulse" />
      <circle cx="170" cy="150" r="24" className="pulse p2" />
      <path className="pin" d="M170 52 c-30 0 -50 22 -50 50 c0 36 50 86 50 86 s50 -50 50 -86 c0 -28 -20 -50 -50 -50 Z" />
      <circle cx="170" cy="102" r="17" className="hole" />
    </svg>
  )
}
