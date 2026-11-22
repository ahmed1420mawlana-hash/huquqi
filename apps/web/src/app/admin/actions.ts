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

/** Approve a lawyer application: the applicant becomes a verified lawyer with the licence they gave. */
export async function decideApplication(id: string, approve: boolean) {
  await requireUser(["ADMIN"]);
  const app = await db.lawyerApplication.findUnique({ where: { id }, include: { user: true } });
  if (!app || app.status !== "pending") return;
  await db.$transaction(async (tx) => {
    await tx.lawyerApplication.update({ where: { id }, data: { status: approve ? "approved" : "rejected", decidedAt: new Date() } });
    if (!approve) return;
    // An admin who applies keeps the admin role, but still gets a verified lawyer profile.
    if (app.user.role !== "ADMIN") await tx.user.update({ where: { id: app.userId }, data: { role: "LAWYER", name: app.user.name ?? app.name } });
    const profile = { licenseNo: app.licenseNo, firm: app.firm, verifiedAt: new Date() };
    await tx.lawyerProfile.upsert({ where: { userId: app.userId }, update: profile, create: { userId: app.userId, ...profile } });
  });
  revalidatePath("/admin/lawyers");
  revalidatePath("/admin");
}

/** Admin marks by hand whether the client has been answered (the green tick in the inbox). */
export async function setReplied(caseId: string, replied: boolean) {
  await requireUser(["ADMIN"]);
  await db.case.update({ where: { id: caseId }, data: { replied, repliedAt: replied ? new Date() : null } });
  revalidatePath("/inbox");
  revalidatePath(`/cases/${caseId}`);
}
