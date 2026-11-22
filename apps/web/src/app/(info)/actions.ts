"use server";
import { censor, normaliseEmail, PROVIDER_SERVICES } from "@huquqi/core";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/session";

export type ContactState = { ok?: boolean; error?: boolean } | undefined;
const KINDS = ["contact", "suggestion", "complaint"];

export async function sendContact(_: ContactState, fd: FormData): Promise<ContactState> {
  if (String(fd.get("website") ?? "")) return { ok: true }; // honeypot: bots fill hidden fields
  const kind = String(fd.get("kind") ?? "contact");
  const name = censor(String(fd.get("name") ?? "").trim().slice(0, 100));
  const email = normaliseEmail(String(fd.get("email") ?? ""));
  const body = censor(String(fd.get("body") ?? "").trim().slice(0, 4000));
  if (!KINDS.includes(kind) || !name || !email || body.length < 3) return { error: true };
  const recent = await db.contactMessage.count({ where: { email, createdAt: { gt: new Date(Date.now() - 3600_000) } } });
  if (recent >= 5) return { error: true };
  await db.contactMessage.create({ data: { kind, name, email, body } });
  return { ok: true };
}

export type ApplyState = { ok?: boolean; error?: boolean } | undefined;

/** A logged-in user asks to join as a lawyer. One pending application per user. */
export async function applyLawyer(_: ApplyState, fd: FormData): Promise<ApplyState> {
  const user = await currentUser();
  if (!user) return { error: true };
  const field = (k: string, n: number) => censor(String(fd.get(k) ?? "").trim().slice(0, n));
  const name = field("name", 100) || user.name || "";
  const phone = String(fd.get("phone") ?? "").replace(/[^\d+ ]/g, "").trim().slice(0, 20);
  const kind = fd.get("kind") === "provider" ? "provider" : "lawyer";
  const serviceRaw = String(fd.get("service") ?? "");
  const service = kind === "provider" && (PROVIDER_SERVICES as readonly string[]).includes(serviceRaw) ? serviceRaw : null;
  const licenseNo = String(fd.get("licenseNo") ?? "").trim().slice(0, 40);
  const yearsRaw = parseInt(String(fd.get("years") ?? ""), 10);
  if (!name || phone.replace(/\D/g, "").length < 8) return { error: true };
  if (kind === "lawyer" ? !licenseNo : !service) return { error: true };
  const open = await db.lawyerApplication.findFirst({ where: { userId: user.id, status: "pending", kind } });
  const data = {
    kind, service, name, phone, licenseNo,
    firm: field("firm", 150) || null,
    city: field("city", 80) || null,
    years: Number.isFinite(yearsRaw) && yearsRaw >= 0 && yearsRaw < 70 ? yearsRaw : null,
    about: field("about", 2000) || null,
  };
  if (open) await db.lawyerApplication.update({ where: { id: open.id }, data });
  else await db.lawyerApplication.create({ data: { ...data, userId: user.id } });
  revalidatePath("/admin/lawyers");
  revalidatePath("/admin");
  return { ok: true };
}
