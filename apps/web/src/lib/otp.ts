import "server-only";
import { createHash, randomInt, timingSafeEqual } from "node:crypto";
import { db } from "./db";

const TTL_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const MAX_PER_HOUR = 5;

function hash(phone: string, code: string) {
  return createHash("sha256").update(`${phone}:${code}:${process.env.SESSION_SECRET}`).digest("hex");
}

export type IssueResult = { ok: true; devCode?: string } | { ok: false; reason: "rate" };

/** Create a one-time code. SMS delivery is a TODO: plug in a Bangladesh SMS gateway here. */
export async function issueOtp(phone: string): Promise<IssueResult> {
  const recent = await db.otpCode.count({
    where: { phone, createdAt: { gt: new Date(Date.now() - 60 * 60 * 1000) } },
  });
  if (recent >= MAX_PER_HOUR) return { ok: false, reason: "rate" };
  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  await db.otpCode.create({
    data: { phone, codeHash: hash(phone, code), expiresAt: new Date(Date.now() + TTL_MS) },
  });
  // Codes are shown on screen only in development, or on a password-protected demo deployment.
  const safeToShow = process.env.NODE_ENV !== "production" || !!process.env.DEMO_PASSWORD;
  if (process.env.DEV_SHOW_OTP === "1" && safeToShow) {
    return { ok: true, devCode: code };
  }
  // TODO: send `code` by SMS (e.g. SSL Wireless / Alpha SMS for +880, Unifonic for +966).
  return { ok: true };
}

export async function verifyOtp(phone: string, code: string): Promise<boolean> {
  const otp = await db.otpCode.findFirst({
    where: { phone, usedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });
  if (!otp || otp.attempts >= MAX_ATTEMPTS) return false;
  const a = Buffer.from(otp.codeHash);
  const b = Buffer.from(hash(phone, code.trim()));
  const match = a.length === b.length && timingSafeEqual(a, b);
  await db.otpCode.update({
    where: { id: otp.id },
    data: match ? { usedAt: new Date() } : { attempts: { increment: 1 } },
  });
  return match;
}
