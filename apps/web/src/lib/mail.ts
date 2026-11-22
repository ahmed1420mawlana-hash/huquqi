import "server-only";

/**
 * Sends an email through Resend (https://resend.com) when RESEND_API_KEY is set.
 * EMAIL_FROM must be an address on a domain verified in Resend, e.g. "Huquqi <login@yourdomain.com>".
 */
export async function sendEmail(to: string, subject: string, text: string): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return false;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: process.env.EMAIL_FROM ?? "Huquqi <onboarding@resend.dev>", to: [to], subject, text }),
  });
  if (!res.ok) console.error("Email send failed", res.status, await res.text().catch(() => ""));
  return res.ok;
}
