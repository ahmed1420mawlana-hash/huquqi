/** Read-only star rating (1..5). */
export function Stars({ value, label }: { value: number; label: string }) {
  const full = Math.round(value);
  return (
    <span className="stars" role="img" aria-label={label}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} aria-hidden="true" className={i <= full ? "on" : ""}>★</span>
      ))}
    </span>
  );
}
