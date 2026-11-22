"use server";
import { redirect } from "next/navigation";
import { normaliseEmail, normalisePhone } from "@huquqi/core";
import { db } from "@/lib/db";
import { getLocale } from "@/lib/locale";
import { issueOtp, verifyOtp } from "@/lib/otp";
import { createSession } from "@/lib/session";

export type LoginState =
  | { step: "email"; error?: "badEmail" | "rate" | "send" }
  | { step: "phone"; error?: "badPhone" | "rate" | "send" }
  | { step: "code"; via: "email" | "phone"; target: string; devCode?: string; error?: "badCode" };

const list = (v?: string) => (v ?? "").split(",").map((s) => s.trim()).filter(Boolean);
const adminEmails = () => list(process.env.ADMIN_EMAILS).map((e) => e.toLowerCase());
/** Phone login is only for the admins listed in ADMIN_PHONES. */
const adminPhones = () => list(process.env.ADMIN_PHONES).map((p) => normalisePhone(p)).filter(Boolean);

export async function loginAction(prev: LoginState, fd: FormData): Promise<LoginState> {
  const intent = fd.get("intent");
  if (intent === "use-phone") return { step: "phone" };
  if (intent === "use-email") return { step: "email" };

  if (intent === "send" && prev.step === "phone") {
    const phone = normalisePhone(String(fd.get("phone") ?? ""));
    if (!phone || !adminPhones().includes(phone)) return { step: "phone", error: "badPhone" };
    const r = await issueOtp({ phone }, await getLocale());
    if (!r.ok) return { step: "phone", error: r.reason };
    return { step: "code", via: "phone", target: phone, devCode: r.devCode };
  }
  if (intent === "send") {
    const email = normaliseEmail(String(fd.get("email") ?? ""));
    if (!email) return { step: "email", error: "badEmail" };
    const r = await issueOtp({ email }, await getLocale());
    if (!r.ok) return { step: "email", error: r.reason };
    return { step: "code", via: "email", target: email, devCode: r.devCode };
  }

  if (prev.step !== "code") return { step: "email" };
  const target = prev.via === "email" ? { email: prev.target } : { phone: prev.target };
  if (!(await verifyOtp(target, String(fd.get("code") ?? "")))) return { ...prev, error: "badCode" };

  const locale = await getLocale();
  const name = String(fd.get("name") ?? "").trim().slice(0, 80) || null;
  const user =
    prev.via === "phone"
      ? await db.user.upsert({
          where: { phone: prev.target },
          update: { role: "ADMIN", ...(name ? { name } : {}) },
          create: { phone: prev.target, name, locale, role: "ADMIN" },
        })
      : await db.user.upsert({
          where: { email: prev.target },
          update: name ? { name } : {},
          create: { email: prev.target, name, locale, role: adminEmails().includes(prev.target) ? "ADMIN" : "WORKER" },
        });
  await createSession(user.id);
  // Back to where the visitor was going (e.g. a case they started before logging in).
  const next = String(fd.get("next") ?? "");
  if (user.role !== "LAWYER" && /^\/(?!\/)[\w\-/?=&]*$/.test(next)) redirect(next);
  redirect(user.role === "WORKER" ? "/cases" : user.role === "ADMIN" ? "/admin" : "/lawyer");
}
