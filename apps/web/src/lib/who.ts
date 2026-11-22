/** Display name for a user: their name, else email, else phone. */
export function who(u: { name: string | null; email: string | null; phone: string | null }): string {
  return u.name ?? u.email ?? u.phone ?? "—";
}
