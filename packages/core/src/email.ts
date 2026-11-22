/** Lower-cases and trims an email address; returns null when it does not look like one. */
export function normaliseEmail(input: string): string | null {
  const e = input.trim().toLowerCase();
  if (e.length > 254) return null;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e) ? e : null;
}
