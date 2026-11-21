"use server";
import { redirect } from "next/navigation";
import { normalisePhone } from "@huquqi/core";
import { db } from "@/lib/db";
import { getLocale } from "@/lib/locale";
import { issueOtp, verifyOtp } from "@/lib/otp";
import { createSession } from "@/lib/session";

export type LoginState =
  | { step: "phone"; error?: "badPhone" | "rate" }
  | { step: "code"; phone: string; devCode?: string; error?: "badCode" };

export async function loginAction(prev: LoginState, fd: FormData): Promise<LoginState> {
  if (fd.get("intent") === "send") {
    const phone = normalisePhone(String(fd.get("phone") ?? ""));
    if (!phone) return { step: "phone", error: "badPhone" };
    const r = await issueOtp(phone);
    if (!r.ok) return { step: "phone", error: "rate" };
    return { step: "code", phone, devCode: r.devCode };
  }

  if (prev.step !== "code") return { step: "phone" };
  const phone = prev.phone;
  const ok = await verifyOtp(phone, String(fd.get("code") ?? ""));
  if (!ok) return { ...prev, error: "badCode" };

  const admins = (process.env.ADMIN_PHONES ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  const locale = await getLocale();
  const name = String(fd.get("name") ?? "").trim().slice(0, 80) || null;
  const user = await db.user.upsert({
    where: { phone },
    update: name ? { name } : {},
    create: { phone, name, locale, role: admins.includes(phone) ? "ADMIN" : "WORKER" },
  });
  await createSession(user.id);
  redirect(user.role === "WORKER" ? "/cases" : user.role === "ADMIN" ? "/admin" : "/lawyer");
}
