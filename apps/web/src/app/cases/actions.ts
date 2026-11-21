"use server";
import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { isCaseType, isStage, nextStages, type Stage } from "@huquqi/core";
import { db } from "@/lib/db";
import { canWorkOn, isVerifiedLawyer, loadCaseFor } from "@/lib/access";
import { caseRef } from "@/lib/ref";
import { requireUser } from "@/lib/session";
import { saveFile } from "@/lib/storage";

function str(fd: FormData, k: string, max = 2000) {
  return String(fd.get(k) ?? "").trim().slice(0, max);
}

export type FormState = { error?: string } | undefined;

export async function createCase(_: FormState, fd: FormData): Promise<FormState> {
  const user = await requireUser(["WORKER", "ADMIN"]);
  const type = fd.get("type");
  const description = str(fd, "description", 5000);
  if (!isCaseType(type) || description.length < 5) return { error: "required" };
  const exit = str(fd, "exitDate", 10);
  const exitDate = /^\d{4}-\d{2}-\d{2}$/.test(exit) ? new Date(exit + "T00:00:00Z") : null;
  let ref = caseRef();
  while (await db.case.findUnique({ where: { ref } })) ref = caseRef();
  const c = await db.case.create({
    data: {
      ref, type, description, exitDate,
      employer: str(fd, "employer", 200) || null,
      bankName: str(fd, "bankName", 100) || null,
      workerId: user.id,
    },
  });
  redirect(`/cases/${c.id}?created=1`);
}

export async function postMessage(caseId: string, _: FormState, fd: FormData): Promise<FormState> {
  const user = await requireUser();
  const c = await loadCaseFor(user, caseId);
  const body = str(fd, "body", 4000);
  if (!body) return { error: "required" };
  const isOwner = c.workerId === user.id;
  if (!isOwner && !canWorkOn(user, c)) return { error: "forbidden" };

  let stage: Stage | null = null;
  const requested = fd.get("stage");
  if (requested && !isOwner) {
    if (!isStage(requested) || !nextStages(c.stage as Stage).includes(requested)) return { error: "stage" };
    stage = requested;
  }
  await db.$transaction([
    db.caseUpdate.create({ data: { caseId: c.id, authorId: user.id, body, stage } }),
    ...(stage ? [db.case.update({ where: { id: c.id }, data: { stage } })] : []),
  ]);
  revalidatePath(`/cases/${c.id}`);
  return {};
}

const ALLOWED = new Map([
  ["application/pdf", ".pdf"], ["image/jpeg", ".jpg"], ["image/png", ".png"],
  ["image/webp", ".webp"], ["image/heic", ".heic"],
]);
const MAX_BYTES = 10 * 1024 * 1024;

export async function uploadDocument(caseId: string, _: FormState, fd: FormData): Promise<FormState> {
  const user = await requireUser();
  const c = await loadCaseFor(user, caseId);
  if (c.workerId !== user.id && !canWorkOn(user, c)) return { error: "forbidden" };
  const file = fd.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "required" };
  const ext = ALLOWED.get(file.type);
  if (!ext || file.size > MAX_BYTES) return { error: "file" };

  const storageKey = await saveFile(`${c.id}/${randomUUID()}${ext}`, Buffer.from(await file.arrayBuffer()), file.type);
  await db.document.create({
    data: {
      caseId: c.id, uploaderId: user.id, mime: file.type, size: file.size, storageKey,
      filename: file.name.replace(/[^\p{L}\p{N}._ -]/gu, "_").slice(0, 120) || `document${ext}`,
    },
  });
  revalidatePath(`/cases/${c.id}`);
  return {};
}

export async function takeCase(caseId: string) {
  const user = await requireUser(["LAWYER", "ADMIN"]);
  if (!isVerifiedLawyer(user)) redirect("/lawyer");
  // Only claim if still unassigned, so two lawyers can't take the same case.
  const r = await db.case.updateMany({
    where: { id: caseId, lawyerId: null },
    data: { lawyerId: user.id, stage: "review" },
  });
  if (r.count) {
    await db.caseUpdate.create({ data: { caseId, authorId: user.id, stage: "review", body: "" } });
  }
  redirect(`/cases/${caseId}`);
}
