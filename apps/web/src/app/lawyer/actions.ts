"use server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";

export async function saveLawyerProfile(fd: FormData) {
  const user = await requireUser(["LAWYER"]);
  const licenseNo = String(fd.get("licenseNo") ?? "").trim().slice(0, 50) || null;
  const firm = String(fd.get("firm") ?? "").trim().slice(0, 120) || null;
  const prev = user.lawyerProfile;
  // Changing the licence number needs a fresh admin verification.
  const verifiedAt = prev?.licenseNo === licenseNo ? prev?.verifiedAt ?? null : null;
  await db.lawyerProfile.upsert({
    where: { userId: user.id },
    update: { licenseNo, firm, verifiedAt },
    create: { userId: user.id, licenseNo, firm },
  });
  revalidatePath("/lawyer");
}
