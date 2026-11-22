/**
 * Panorama behind the home-page heading, in colour: Al-Madinah (the Prophet's Mosque with its
 * green dome), Makkah (the Kaaba and the clock tower) and Riyadh (Kingdom Centre and Al Faisaliah)
 * under a gold evening sky. Original drawing, inline SVG so it stays sharp and light.
 */
export function HeroSkyline() {
  const minaret = (x: number, top: number, key: string) => (
    <g key={key}>
      <rect x={x - 5} y={top + 22} width="10" height={228 - top - 22} fill="url(#sk-stone)" />
      <rect x={x - 7} y={top + 52} width="14" height="4" rx="1" fill="url(#sk-gold)" />
      <rect x={x - 7} y={top + 92} width="14" height="4" rx="1" fill="url(#sk-gold)" />
      <rect x={x - 3.5} y={top + 10} width="7" height="14" fill="url(#sk-stone)" />
      <path d={`M${x - 4} ${top + 11} Q${x} ${top - 6} ${x + 4} ${top + 11} Z`} fill="url(#sk-dome)" />
      <rect x={x - 0.6} y={top - 12} width="1.2" height="8" fill="#f3d27a" />
      <circle cx={x} cy={top - 13} r="1.6" fill="#f3d27a" />
    </g>
  );
  return (
    <svg className="skyline" viewBox="0 0 600 240" preserveAspectRatio="xMidYMax meet" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="sk-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0d3b2e" stopOpacity="0" />
          <stop offset=".45" stopColor="#1d5a45" stopOpacity=".55" />
          <stop offset=".78" stopColor="#b9853c" stopOpacity=".75" />
          <stop offset="1" stopColor="#f2c66d" />
        </linearGradient>
        <radialGradient id="sk-sun" cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="#fff1c2" />
          <stop offset=".45" stopColor="#f6cf6e" stopOpacity=".85" />
          <stop offset="1" stopColor="#f6cf6e" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="sk-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fbe7a6" />
          <stop offset=".5" stopColor="#e2b553" />
          <stop offset="1" stopColor="#a87a2a" />
        </linearGradient>
        <linearGradient id="sk-stone" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fbf3df" />
          <stop offset=".6" stopColor="#eadbb8" />
          <stop offset="1" stopColor="#cdb586" />
        </linearGradient>
        <linearGradient id="sk-tower" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#f4e2b4" />
          <stop offset=".55" stopColor="#d9b46a" />
          <stop offset="1" stopColor="#9c7434" />
        </linearGradient>
        <radialGradient id="sk-dome" cx=".35" cy=".3" r=".8">
          <stop offset="0" stopColor="#5fd39a" />
          <stop offset=".55" stopColor="#1f9461" />
          <stop offset="1" stopColor="#0b5a37" />
        </radialGradient>
        <linearGradient id="sk-glass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#cfeefa" />
          <stop offset=".5" stopColor="#5fa9c9" />
          <stop offset="1" stopColor="#1f5873" />
        </linearGradient>
        <radialGradient id="sk-orb" cx=".35" cy=".35" r=".7">
          <stop offset="0" stopColor="#fff6cf" />
          <stop offset=".6" stopColor="#f0c15a" />
          <stop offset="1" stopColor="#a87a2a" />
        </radialGradient>
        <linearGradient id="sk-dune" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d6ad5f" />
          <stop offset="1" stopColor="#8f6a2c" />
        </linearGradient>
        <linearGradient id="sk-far" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7d8f6a" stopOpacity=".55" />
          <stop offset="1" stopColor="#5d6e4b" stopOpacity=".7" />
        </linearGradient>
      </defs>

      {/* Evening sky, sun behind Makkah, a few stars and the crescent */}
      <rect x="0" y="0" width="600" height="240" fill="url(#sk-sky)" />
      <circle cx="304" cy="150" r="95" fill="url(#sk-sun)" />
      {[[40, 30], [96, 18], [160, 44], [214, 22], [388, 28], [452, 14], [520, 40], [574, 20]].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="1.3" fill="#fff6d8" opacity=".85" />
      ))}
      <path d="M400 18 a12 12 0 1 0 10 18 a9.5 9.5 0 1 1 -10 -18 Z" fill="#f8dc8c" />

      {/* Distant city */}
      <path d="M0 228 V196 h18 v-10 h14 v14 h20 v-22 h12 v22 h30 v-8 h22 v8 h40 v-16 h16 v16 h60 v-12 h30 v12 h70 v-20 h14 v20 h50 v-14 h26 v14 h40 v-24 h12 v24 h46 v-10 h24 v10 H600 V228 Z" fill="url(#sk-far)" />

      {/* Al-Madinah: the Prophet's Mosque */}
      <g>
        <rect x="16" y="186" width="190" height="42" fill="url(#sk-stone)" />
        {Array.from({ length: 11 }, (_, i) => (
          <path key={i} d={`M${24 + i * 16.5} 228 v-18 a5 6 0 0 1 10 0 v18 Z`} fill="#8c6b3b" opacity=".55" />
        ))}
        <rect x="16" y="183" width="190" height="4" fill="url(#sk-gold)" />
        <rect x="74" y="160" width="76" height="26" fill="url(#sk-stone)" />
        <path d="M82 162 a30 34 0 0 1 60 0 Z" fill="url(#sk-dome)" />
        <rect x="80" y="160" width="64" height="3" fill="url(#sk-gold)" />
        <rect x="111.3" y="112" width="1.6" height="16" fill="#f3d27a" />
        <path d="M108 112 a4 4 0 1 0 8 0 a3 3 0 1 1 -8 0 Z" fill="#f3d27a" />
        {minaret(34, 84, "m1")}
        {minaret(58, 100, "m2")}
        {minaret(166, 100, "m3")}
        {minaret(190, 84, "m4")}
      </g>

      {/* Makkah: the clock tower behind the Haram, the Kaaba in front */}
      <g>
        <rect x="236" y="150" width="34" height="78" fill="url(#sk-tower)" />
        <rect x="338" y="160" width="34" height="68" fill="url(#sk-tower)" />
        <rect x="282" y="64" width="44" height="164" fill="url(#sk-tower)" />
        <rect x="288" y="44" width="32" height="22" fill="url(#sk-tower)" />
        <path d="M290 44 L304 14 L318 44 Z" fill="url(#sk-gold)" />
        <rect x="303" y="2" width="2" height="14" fill="#f3d27a" />
        <path d="M299 4 a5 5 0 1 0 10 0 a4 4 0 1 1 -10 0 Z" fill="#f3d27a" />
        <circle cx="304" cy="88" r="15" fill="#0f5c3e" />
        <circle cx="304" cy="88" r="12" fill="#fdf8e8" />
        <circle cx="304" cy="88" r="12" fill="none" stroke="url(#sk-gold)" strokeWidth="2" />
        <rect x="303.2" y="79" width="1.6" height="10" fill="#0f5c3e" />
        <rect x="303.2" y="87.2" width="7.5" height="1.6" fill="#0f5c3e" />
        {[112, 126, 140].map((y) => <rect key={y} x="286" y={y} width="36" height="1.4" fill="#7fe0a9" opacity=".9" />)}
        {/* the Haram colonnade */}
        <rect x="222" y="196" width="170" height="32" fill="url(#sk-stone)" />
        {Array.from({ length: 14 }, (_, i) => (
          <path key={i} d={`M${228 + i * 11.8} 228 v-14 a4 5 0 0 1 8 0 v14 Z`} fill="#8c6b3b" opacity=".5" />
        ))}
        <rect x="222" y="193" width="170" height="4" fill="url(#sk-gold)" />
        {minaret(230, 120, "h1")}
        {minaret(384, 120, "h2")}
        {/* the Kaaba */}
        <rect x="292" y="204" width="24" height="24" fill="#141414" />
        <rect x="292" y="209" width="24" height="3" fill="url(#sk-gold)" />
        <rect x="296" y="216" width="5" height="12" fill="url(#sk-gold)" opacity=".85" />
      </g>

      {/* Riyadh: Kingdom Centre and Al Faisaliah */}
      <g>
        <path d="M432 228 L444 34 Q458 88 472 34 L484 228 Z" fill="url(#sk-glass)" />
        <path d="M444 34 Q458 88 472 34" fill="none" stroke="#e8f7ff" strokeWidth="1.4" opacity=".8" />
        <rect x="449" y="66" width="18" height="4" rx="1" fill="#f6d27a" />
        <path d="M520 228 L546 56 L572 228 Z" fill="url(#sk-glass)" />
        <path d="M546 56 L546 228" stroke="#e8f7ff" strokeWidth=".8" opacity=".5" />
        <circle cx="546" cy="104" r="10" fill="url(#sk-orb)" />
        <circle cx="546" cy="104" r="15" fill="#f6cf6e" opacity=".18" />
        <rect x="545.3" y="30" width="1.4" height="28" fill="#f3d27a" />
        <rect x="406" y="186" width="18" height="42" fill="url(#sk-glass)" opacity=".85" />
        <rect x="494" y="170" width="20" height="58" fill="url(#sk-glass)" opacity=".85" />
        <rect x="578" y="190" width="18" height="38" fill="url(#sk-glass)" opacity=".85" />
      </g>

      {/* Palms and desert ground */}
      {[214, 400, 590].map((x) => (
        <g key={x} fill="#5b4a22">
          <path d={`M${x} 228 q-2 -18 1 -30 l2 0 q-1 14 1 30 Z`} />
          <path d={`M${x + 1} 198 q-10 -2 -16 6 q8 -8 16 -4 q-6 -9 -16 -8 q10 -2 16 6 q4 -10 14 -10 q-8 4 -14 10 q10 -4 16 4 q-8 -4 -16 -4 Z`} />
        </g>
      ))}
      <path d="M0 240 V228 Q150 218 300 226 T600 224 V240 Z" fill="url(#sk-dune)" />
    </svg>
  );
}
