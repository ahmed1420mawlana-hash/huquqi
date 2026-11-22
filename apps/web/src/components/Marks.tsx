/** Emblems for the home page: scales of justice, a judge's gavel, and the flag of Bangladesh. */

export function ScalesIcon({ size = 44 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M24 7v33" />
      <path d="M15 41h18" />
      <circle cx="24" cy="7" r="2" fill="currentColor" />
      <path d="M9 12h30" />
      <path d="M12 12 6 26h12z" />
      <path d="M36 12l-6 14h12z" />
      <path d="M6 26a6 3.2 0 0 0 12 0" />
      <path d="M30 26a6 3.2 0 0 0 12 0" />
    </svg>
  );
}

export function GavelIcon({ size = 44 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <g transform="rotate(-40 22 18)">
        <rect x="12" y="11" width="20" height="10" rx="2.5" />
        <path d="M15 11v10M29 11v10" />
        <path d="M22 21v20" strokeWidth="3" />
      </g>
      <path d="M26 42h16" />
      <rect x="28" y="37" width="12" height="5" rx="1.5" />
    </svg>
  );
}

/** Flag of Bangladesh: 10:6, red disc of radius 1/5 width centred at 9/20 of the width. */
export function BangladeshFlag({ width = 56 }: { width?: number }) {
  return (
    <svg width={width} height={(width * 3) / 5} viewBox="0 0 100 60" aria-hidden="true" style={{ borderRadius: 4, display: "block" }}>
      <rect width="100" height="60" fill="#006A4E" />
      <circle cx="45" cy="30" r="20" fill="#F42A41" />
    </svg>
  );
}

export function Marks({ labels }: { labels: { scales: string; gavel: string; flag: string } }) {
  return (
    <ul className="marks" aria-label={`${labels.scales}, ${labels.gavel}, ${labels.flag}`}>
      <li title={labels.scales}><ScalesIcon /><span>{labels.scales}</span></li>
      <li title={labels.gavel}><GavelIcon /><span>{labels.gavel}</span></li>
      <li title={labels.flag}><BangladeshFlag /><span>{labels.flag}</span></li>
    </ul>
  );
}
