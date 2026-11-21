/**
 * Normalise a Bangladeshi mobile number to E.164 (+8801XXXXXXXXX).
 * Accepts 01XXXXXXXXX, 8801..., +8801..., with spaces or dashes. Returns null when invalid.
 * Operator prefixes are 013–019.
 */
export function normaliseBdPhone(input: string): string | null {
  const digits = input.replace(/[\s\-()]/g, "").replace(/^\+/, "");
  const m = /^(?:880|0)?(1[3-9]\d{8})$/.exec(digits);
  return m ? `+880${m[1]}` : null;
}

/** Saudi numbers are accepted for lawyers: 05XXXXXXXX, 9665..., +9665... */
export function normaliseSaPhone(input: string): string | null {
  const digits = input.replace(/[\s\-()]/g, "").replace(/^\+/, "");
  const m = /^(?:966|0)?(5\d{8})$/.exec(digits);
  return m ? `+966${m[1]}` : null;
}

export function normalisePhone(input: string): string | null {
  return normaliseBdPhone(input) ?? normaliseSaPhone(input);
}
