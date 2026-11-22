import "server-only";
import { createHash, randomInt, timingSafeEqual } from "node:crypto";
import { messages, type Locale } from "@huquqi/core";
import { db } from "./db";
import { sendEmail } from "./mail";

const TTL_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const MAX_PER_HOUR = 5;

/** Customers log in by email; admins listed in ADMIN_PHONES can also log in by phone. */
export type OtpTarget = { email: string } | { phone: string };
const key = (t: OtpTarget) => ("email" in t ? { email: t.email } : { phone: t.phone });
const id = (t: OtpTarget) => ("email" in t ? t.email : t.phone);

function hash(target: string, code: string) {
  return createHash("sha256").update(`${target}:${code}:${process.env.SESSION_SECRET}`).digest("hex");
}

export type IssueResult = { ok: true; devCode?: string } | { ok: false; reason: "rate" | "send" };

/** Create a one-time code and email it (phone codes have no SMS gateway yet). */
export async function issueOtp(target: OtpTarget, locale: Locale): Promise<IssueResult> {
  const recent = await db.otpCode.count({
    where: { ...key(target), createdAt: { gt: new Date(Date.now() - 60 * 60 * 1000) } },
  });
  if (recent >= MAX_PER_HOUR) return { ok: false, reason: "rate" };
  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  await db.otpCode.create({
    data: { ...key(target), codeHash: hash(id(target), code), expiresAt: new Date(Date.now() + TTL_MS) },
  });

  // Codes are shown on screen only in development, or on a password-protected demo deployment.
  const safeToShow = process.env.NODE_ENV !== "production" || !!process.env.DEMO_PASSWORD;
  const show = process.env.DEV_SHOW_OTP === "1" && safeToShow;

  const t = messages[locale].auth;
  const sent = "email" in target ? await sendEmail(target.email, t.emailSubject, t.emailBody(code)) : false;
  if (show) return { ok: true, devCode: code };
  return sent ? { ok: true } : { ok: false, reason: "send" };
}

export async function verifyOtp(target: OtpTarget, code: string): Promise<boolean> {
  const otp = await db.otpCode.findFirst({
    where: { ...key(target), usedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });
  if (!otp || otp.attempts >= MAX_ATTEMPTS) return false;
  const a = Buffer.from(otp.codeHash);
  const b = Buffer.from(hash(id(target), code.trim()));
  const match = a.length === b.length && timingSafeEqual(a, b);
  await db.otpCode.update({
    where: { id: otp.id },
    data: match ? { usedAt: new Date() } : { attempts: { increment: 1 } },
  });
  return match;
}
