"use server";
import { revalidatePath } from "next/cache";
import { normaliseEmail } from "@huquqi/core";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";

export async function makeLawyer(fd: FormData) {
  await requireUser(["ADMIN"]);
  const email = normaliseEmail(String(fd.get("email") ?? ""));
  if (!email) return;
  const name = String(fd.get("name") ?? "").trim().slice(0, 80) || null;
  const u = await db.user.upsert({
    where: { email },
    update: { role: "LAWYER", ...(name ? { name } : {}) },
    create: { email, name, role: "LAWYER", locale: "ar" },
  });
  await db.lawyerProfile.upsert({ where: { userId: u.id }, update: {}, create: { userId: u.id } });
  revalidatePath("/admin");
}

export async function verifyLawyer(userId: string) {
  await requireUser(["ADMIN"]);
  await db.lawyerProfile.update({ where: { userId }, data: { verifiedAt: new Date() } });
  revalidatePath("/admin");
}

export async function assignLawyer(caseId: string, fd: FormData) {
  await requireUser(["ADMIN"]);
  const lawyerId = String(fd.get("lawyerId") ?? "");
  const lawyer = await db.user.findFirst({
    where: { id: lawyerId, role: "LAWYER", lawyerProfile: { verifiedAt: { not: null } } },
  });
  if (!lawyer) return;
  await db.case.update({ where: { id: caseId }, data: { lawyerId: lawyer.id } });
  revalidatePath("/admin");
  revalidatePath("/inbox");
}

export async function setReviewApproved(reviewId: string, approved: boolean) {
  await requireUser(["ADMIN"]);
  await db.review.update({ where: { id: reviewId }, data: { approvedAt: approved ? new Date() : null } });
  revalidatePath("/admin");
  revalidatePath("/");
}
