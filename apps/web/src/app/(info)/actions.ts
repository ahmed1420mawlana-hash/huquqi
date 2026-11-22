"use server";
import { censor, normaliseEmail } from "@huquqi/core";
import { db } from "@/lib/db";

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
