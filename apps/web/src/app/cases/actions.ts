"use server";
import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { censor, isCaseType } from "@huquqi/core";
import { db } from "@/lib/db";
import { canWorkOn, isVerifiedLawyer, loadCaseFor } from "@/lib/access";
import { nextCaseRef } from "@/lib/ref";
import { requireUser } from "@/lib/session";
import { notifyClientActivity } from "@/lib/notify";
import { blobInfo, saveFile } from "@/lib/storage";
import { ALLOWED_TYPES, MAX_BLOB_BYTES, MAX_LOCAL_BYTES, cleanFilename, fileType } from "@/lib/documents";

function str(fd: FormData, k: string, max = 2000) {
  return String(fd.get(k) ?? "").trim().slice(0, max);
}
/** Free text people write: obscene words are masked before saving. */
const text = (fd: FormData, k: string, max = 2000) => censor(str(fd, k, max));

export type FormState = { error?: string; id?: string } | undefined;

export async function createCase(_: FormState, fd: FormData): Promise<FormState> {
  const user = await requireUser(["WORKER", "ADMIN"]);
  const type = fd.get("type");
  const description = text(fd, "description", 5000);
  if (!isCaseType(type) || description.length < 5) return { error: "required" };
  const exit = str(fd, "exitDate", 10);
  const exitDate = /^\d{4}-\d{2}-\d{2}$/.test(exit) ? new Date(exit + "T00:00:00Z") : null;
  let ref = await nextCaseRef();
  // Guards against a clash with an older case, e.g. if the counter was ever reset.
  while (await db.case.findUnique({ where: { ref } })) ref = await nextCaseRef();
  const c = await db.case.create({
    data: {
      ref, type, description, exitDate,
      requests: text(fd, "requests", 3000) || null,
      employer: text(fd, "employer", 200) || null,
      bankName: str(fd, "bankName", 100) || null,
      workerId: user.id,
      awaitingReply: true,
    },
  });
  await notifyClientActivity(c);
  // The form uploads the documents next, then opens the case.
  return { id: c.id };
}

export async function postMessage(caseId: string, _: FormState, fd: FormData): Promise<FormState> {
  const user = await requireUser();
  const c = await loadCaseFor(user, caseId);
  const body = text(fd, "body", 4000);
  if (!body) return { error: "required" };
  const isOwner = c.workerId === user.id;
  if (!isOwner && !canWorkOn(user, c)) return { error: "forbidden" };

  // Lawyers can close the case with their update; there is no stage tracking otherwise.
  const close = !isOwner && fd.get("close") === "1" && c.stage !== "closed";
  await db.$transaction([
    db.caseUpdate.create({ data: { caseId: c.id, authorId: user.id, body, stage: close ? "closed" : null } }),
    // A client message puts the case in the inbox as awaiting a reply; a lawyer or admin answer clears it.
    db.case.update({
      where: { id: c.id },
      data: { awaitingReply: isOwner, lastActivityAt: new Date(), ...(close ? { stage: "closed" } : {}) },
    }),
  ]);
  if (isOwner) await notifyClientActivity(c);
  revalidatePath(`/cases/${c.id}`);
  return {};
}

async function afterUpload(c: { id: string; ref: string; lawyerId: string | null }, byClient: boolean) {
  await db.case.update({ where: { id: c.id }, data: { lastActivityAt: new Date(), ...(byClient ? { awaitingReply: true } : {}) } });
  if (byClient) await notifyClientActivity(c);
}

/** Local-disk upload through the server action (development, or deployments without Blob). */
export async function uploadDocument(caseId: string, _: FormState, fd: FormData): Promise<FormState> {
  const user = await requireUser();
  const c = await loadCaseFor(user, caseId);
  if (c.workerId !== user.id && !canWorkOn(user, c)) return { error: "forbidden" };
  const file = fd.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "required" };
  const mime = fileType(file.name, file.type);
  const ext = ALLOWED_TYPES.get(mime);
  if (!ext || file.size > MAX_LOCAL_BYTES) return { error: "file" };

  const storageKey = await saveFile(`${c.id}/${randomUUID()}${ext}`, Buffer.from(await file.arrayBuffer()), mime);
  await db.document.create({
    data: { caseId: c.id, uploaderId: user.id, mime, size: file.size, storageKey, filename: cleanFilename(file.name, ext) },
  });
  await afterUpload(c, c.workerId === user.id);
  revalidatePath(`/cases/${c.id}`);
  return {};
}

/** Records a document the browser uploaded straight to Vercel Blob (see /api/upload). */
export async function registerDocument(caseId: string, pathname: string, name: string): Promise<FormState> {
  const user = await requireUser();
  const c = await loadCaseFor(user, caseId);
  if (c.workerId !== user.id && !canWorkOn(user, c)) return { error: "forbidden" };
  if (!pathname.startsWith(`documents/${c.id}/`) || pathname.includes("..")) return { error: "file" };
  const storageKey = `blob:${pathname}`;
  if (await db.document.findFirst({ where: { storageKey } })) return {};
  const info = await blobInfo(pathname);
  if (!info) return { error: "file" };
  const ext = ALLOWED_TYPES.get(info.contentType);
  if (!ext || info.size > MAX_BLOB_BYTES) return { error: "file" };
  await db.document.create({
    data: { caseId: c.id, uploaderId: user.id, mime: info.contentType, size: info.size, storageKey, filename: cleanFilename(name, ext) },
  });
  await afterUpload(c, c.workerId === user.id);
  revalidatePath(`/cases/${c.id}`);
  return {};
}

export async function takeCase(caseId: string) {
  const user = await requireUser(["LAWYER", "ADMIN"]);
  if (!isVerifiedLawyer(user)) redirect("/lawyer");
  // Only claim if still unassigned, so two lawyers can't take the same case.
  await db.case.updateMany({
    where: { id: caseId, lawyerId: null },
    data: { lawyerId: user.id },
  });
  redirect(`/cases/${caseId}`);
}

export async function submitReview(caseId: string, _: FormState, fd: FormData): Promise<FormState> {
  const user = await requireUser(["WORKER", "ADMIN"]);
  const c = await loadCaseFor(user, caseId);
  if (c.workerId !== user.id || !c.lawyerId) return { error: "forbidden" };
  const rating = Number(fd.get("rating"));
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return { error: "required" };
  const comment = text(fd, "comment", 1000) || null;
  await db.review.upsert({
    where: { caseId: c.id },
    // Editing a review sends it back for approval.
    update: { rating, comment, approvedAt: null },
    create: { caseId: c.id, authorId: user.id, lawyerId: c.lawyerId, rating, comment },
  });
  revalidatePath(`/cases/${c.id}`);
  return {};
}

/** Internal note on a case: lawyers working on it and admins only. */
export async function addNote(caseId: string, _: FormState, fd: FormData): Promise<FormState> {
  const user = await requireUser(["LAWYER", "ADMIN"]);
  const c = await loadCaseFor(user, caseId);
  if (!canWorkOn(user, c)) return { error: "forbidden" };
  const body = text(fd, "body", 4000);
  if (!body) return { error: "required" };
  await db.caseNote.create({ data: { caseId: c.id, authorId: user.id, body } });
  revalidatePath(`/cases/${c.id}`);
  return {};
}
