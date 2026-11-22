import "server-only";
import { createHash, randomInt, timingSafeEqual } from "node:crypto";
import { messages, type Locale } from "@huquqi/core";
import { db } from "./db";
import { sendEmail } from "./mail";

const TTL_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const MAX_PER_HOUR = 5;

function hash(email: string, code: string) {
  return createHash("sha256").update(`${email}:${code}:${process.env.SESSION_SECRET}`).digest("hex");
}

export type IssueResult = { ok: true; devCode?: string } | { ok: false; reason: "rate" | "send" };

/** Create a one-time code and email it. */
export async function issueOtp(email: string, locale: Locale): Promise<IssueResult> {
  const recent = await db.otpCode.count({
    where: { email, createdAt: { gt: new Date(Date.now() - 60 * 60 * 1000) } },
  });
  if (recent >= MAX_PER_HOUR) return { ok: false, reason: "rate" };
  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  await db.otpCode.create({
    data: { email, codeHash: hash(email, code), expiresAt: new Date(Date.now() + TTL_MS) },
  });

  // Codes are shown on screen only in development, or on a password-protected demo deployment.
  const safeToShow = process.env.NODE_ENV !== "production" || !!process.env.DEMO_PASSWORD;
  const show = process.env.DEV_SHOW_OTP === "1" && safeToShow;

  const t = messages[locale].auth;
  const sent = await sendEmail(email, t.emailSubject, t.emailBody(code));
  if (show) return { ok: true, devCode: code };
  return sent ? { ok: true } : { ok: false, reason: "send" };
}

export async function verifyOtp(email: string, code: string): Promise<boolean> {
  const otp = await db.otpCode.findFirst({
    where: { email, usedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });
  if (!otp || otp.attempts >= MAX_ATTEMPTS) return false;
  const a = Buffer.from(otp.codeHash);
  const b = Buffer.from(hash(email, code.trim()));
  const match = a.length === b.length && timingSafeEqual(a, b);
  await db.otpCode.update({
    where: { id: otp.id },
    data: match ? { usedAt: new Date() } : { attempts: { increment: 1 } },
  });
  return match;
}
