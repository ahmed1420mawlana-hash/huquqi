"use server";
import { redirect } from "next/navigation";
import { normaliseEmail } from "@huquqi/core";
import { db } from "@/lib/db";
import { getLocale } from "@/lib/locale";
import { issueOtp, verifyOtp } from "@/lib/otp";
import { createSession } from "@/lib/session";

export type LoginState =
  | { step: "email"; error?: "badEmail" | "rate" | "send" }
  | { step: "code"; email: string; devCode?: string; error?: "badCode" };

export async function loginAction(prev: LoginState, fd: FormData): Promise<LoginState> {
  if (fd.get("intent") === "send") {
    const email = normaliseEmail(String(fd.get("email") ?? ""));
    if (!email) return { step: "email", error: "badEmail" };
    const r = await issueOtp(email, await getLocale());
    if (!r.ok) return { step: "email", error: r.reason };
    return { step: "code", email, devCode: r.devCode };
  }

  if (prev.step !== "code") return { step: "email" };
  const email = prev.email;
  const ok = await verifyOtp(email, String(fd.get("code") ?? ""));
  if (!ok) return { ...prev, error: "badCode" };

  const admins = (process.env.ADMIN_EMAILS ?? "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  const locale = await getLocale();
  const name = String(fd.get("name") ?? "").trim().slice(0, 80) || null;
  const user = await db.user.upsert({
    where: { email },
    update: name ? { name } : {},
    create: { email, name, locale, role: admins.includes(email) ? "ADMIN" : "WORKER" },
  });
  await createSession(user.id);
  redirect(user.role === "WORKER" ? "/cases" : user.role === "ADMIN" ? "/admin" : "/lawyer");
}
