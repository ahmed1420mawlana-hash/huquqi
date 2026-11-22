import "server-only";
import { notFound } from "next/navigation";
import { db } from "./db";
import type { SessionUser } from "./session";

export function isVerifiedLawyer(u: SessionUser) {
  return u.role === "LAWYER" && !!u.lawyerProfile?.verifiedAt;
}

/**
 * Who may open a case:
 * - the worker who owns it
 * - the lawyer assigned to it
 * - any verified lawyer while it is still unassigned (to decide whether to take it)
 * - admins
 */
export async function loadCaseFor(user: SessionUser, caseId: string) {
  const c = await db.case.findUnique({
    where: { id: caseId },
    include: {
      worker: true,
      lawyer: { include: { lawyerProfile: true } },
      updates: { include: { author: true }, orderBy: { createdAt: "asc" } },
      documents: { orderBy: { createdAt: "desc" } },
      review: true,
      notes: { include: { author: true }, orderBy: { createdAt: "desc" } },
    },
  });
  if (!c) notFound();
  const allowed =
    user.role === "ADMIN" ||
    c.workerId === user.id ||
    c.lawyerId === user.id ||
    (c.lawyerId === null && isVerifiedLawyer(user));
  if (!allowed) notFound(); // do not reveal that the case exists
  return c;
}

export type LoadedCase = Awaited<ReturnType<typeof loadCaseFor>>;

export function canWorkOn(user: SessionUser, c: { lawyerId: string | null }) {
  return user.role === "ADMIN" || (isVerifiedLawyer(user) && c.lawyerId === user.id);
}
