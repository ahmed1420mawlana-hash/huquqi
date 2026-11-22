/**
 * Decorative skyline behind the home-page heading: Al-Madinah (the Prophet's Mosque),
 * Makkah (the Kaaba and the clock tower) and Riyadh (Kingdom Centre and Al Faisaliah).
 * Original line drawing, one colour, so it works on the dark band in light and dark mode.
 */
export function HeroSkyline() {
  const hole = "var(--band)";
  return (
    <svg className="skyline" viewBox="0 0 600 200" preserveAspectRatio="xMidYMax meet" aria-hidden="true" focusable="false">
      <g fill="currentColor">
        {/* Al-Madinah: mosque hall, green dome, four minarets */}
        <rect x="18" y="168" width="184" height="32" />
        <rect x="70" y="148" width="80" height="22" />
        <path d="M82 150 a28 34 0 0 1 56 0 Z" className="dome" />
        <rect x="108.5" y="104" width="3" height="14" className="dome" />
        <circle cx="110" cy="102" r="3" className="dome" />
        {[38, 60, 160, 182].map((x, i) => (
          <g key={x}>
            <rect x={x - 4} y={i % 3 === 0 ? 92 : 104} width="8" height={i % 3 === 0 ? 108 : 96} />
            <rect x={x - 6} y={i % 3 === 0 ? 120 : 130} width="12" height="3" />
            <rect x={x - 6} y={i % 3 === 0 ? 150 : 156} width="12" height="3" />
            <path d={`M${x - 4} ${i % 3 === 0 ? 92 : 104} L${x} ${i % 3 === 0 ? 74 : 88} L${x + 4} ${i % 3 === 0 ? 92 : 104} Z`} />
          </g>
        ))}

        {/* Makkah: the Kaaba in front of the clock tower */}
        <rect x="230" y="158" width="148" height="42" />
        <rect x="244" y="112" width="30" height="48" />
        <rect x="334" y="122" width="30" height="38" />
        <rect x="282" y="58" width="44" height="102" />
        <rect x="288" y="40" width="32" height="20" />
        <path d="M292 40 L304 14 L316 40 Z" />
        <rect x="302.5" y="2" width="3" height="14" />
        <circle cx="304" cy="84" r="13" fill={hole} />
        <circle cx="304" cy="84" r="9.5" />
        <rect x="303" y="76" width="2" height="9" fill={hole} />
        <rect x="303" y="83" width="7" height="2" fill={hole} />
        <rect x="204" y="176" width="22" height="24" />
        <rect x="204" y="181" width="22" height="2.5" className="gold" />

        {/* Riyadh: Kingdom Centre and Al Faisaliah */}
        <rect x="394" y="176" width="200" height="24" />
        <path d="M428 200 L441 22 Q455 74 469 22 L482 200 Z" />
        <rect x="446" y="50" width="18" height="4" />
        <path d="M522 200 L546 44 L570 200 Z" />
        <circle cx="546" cy="88" r="9" />
        <rect x="545" y="18" width="2" height="28" />
        <rect x="404" y="150" width="16" height="30" />
        <rect x="492" y="140" width="20" height="40" />
        <rect x="576" y="156" width="16" height="24" />
      </g>
    </svg>
  );
}
