import "server-only";
import { headers } from "next/headers";
import { messages, type Locale } from "@huquqi/core";
import { db } from "./db";
import { sendEmail } from "./mail";

const LOCALES: Locale[] = ["bn", "ar", "en"];
const asLocale = (l: string | null | undefined): Locale => (LOCALES.includes(l as Locale) ? (l as Locale) : "ar");

async function origin() {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  return host ? `${h.get("x-forwarded-proto") ?? "https"}://${host}` : "";
}

/**
 * Emails the case's lawyer and the admins when the client writes or uploads.
 * Does nothing until RESEND_API_KEY is set (see lib/mail.ts); never blocks the client's action.
 */
export async function notifyClientActivity(c: { id: string; ref: string; lawyerId: string | null }) {
  if (!process.env.RESEND_API_KEY) return;
  try {
    const adminEmails = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
    const users = await db.user.findMany({
      where: { OR: [{ role: "ADMIN" }, ...(c.lawyerId ? [{ id: c.lawyerId }] : [])], email: { not: null } },
      select: { email: true, locale: true },
    });
    const to = new Map<string, Locale>();
    for (const u of users) if (u.email) to.set(u.email, asLocale(u.locale));
    for (const e of adminEmails) if (!to.has(e)) to.set(e, "ar");
    const url = `${await origin()}/cases/${c.id}`;
    await Promise.all(
      [...to].map(([email, locale]) => {
        const t = messages[locale].inbox;
        return sendEmail(email, t.notifySubject(c.ref), t.notifyBody(c.ref, url));
      }),
    );
  } catch {
    // Notifications are best effort.
  }
}
