// Line icons shown before each case option on the home page.
const PATHS: Record<string, string> = {
  general: "M12 3v17M6 20h12M4 7h16M7 7l-3 6a3 3 0 0 0 6 0zM17 7l-3 6a3 3 0 0 0 6 0z",
  court: "M3 21h18M4 10h16M12 3l8 5H4zM6 10v8M10 10v8M14 10v8M18 10v8",
  commercial: "M5 7h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2zM9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M3 13h18",
  invest: "M3 17l6-6 4 4 8-8M14 7h7v7",
  realestate: "M3 11l9-7 9 7M5 10v10h14V10M10 20v-6h4v6",
  poa: "M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9zM14 3v6h6M8 17c1.5-2 3-2 4 0s2.5 1 4-1",
  translation: "M4 5h8M8 3v2M5 9c2 3 5 5 7 6M11 5c-1 4-4 8-7 10M13 21l4-10 4 10M14.5 18h5",
  hajj: "M4 7l8-4 8 4v10l-8 4-8-4zM4 7l8 4 8-4M12 11v10M4 10.5l8 4 8-4",
  labour: "M3 18h18M5 18v-3a7 7 0 0 1 14 0v3M10 9V5h4v4",
  bank: "M3 8h15a3 3 0 0 1 3 3v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM3 8l12-4v4M16 14h2",
};

export function CaseIcon({ type }: { type: string }) {
  const d = PATHS[type] ?? PATHS.general;
  return (
    <span className="case-ico" aria-hidden="true">
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d={d} />
      </svg>
    </span>
  );
}
