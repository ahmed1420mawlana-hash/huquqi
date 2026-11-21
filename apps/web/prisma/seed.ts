// Demo data for local development: one admin, one verified lawyer, one worker with a case.
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  const admin = await db.user.upsert({
    where: { phone: "+8801700000000" }, update: {},
    create: { phone: "+8801700000000", name: "Admin", role: "ADMIN", locale: "ar" },
  });
  const lawyer = await db.user.upsert({
    where: { phone: "+966550000001" }, update: {},
    create: { phone: "+966550000001", name: "Demo Lawyer", role: "LAWYER", locale: "ar" },
  });
  await db.lawyerProfile.upsert({
    where: { userId: lawyer.id }, update: {},
    create: { userId: lawyer.id, licenseNo: "DEMO-0001", firm: "Demo Law Firm", verifiedAt: new Date() },
  });
  const worker = await db.user.upsert({
    where: { phone: "+8801712345678" }, update: {},
    create: { phone: "+8801712345678", name: "Karim Uddin (demo)", role: "WORKER", locale: "bn" },
  });
  const exit = new Date(); exit.setUTCMonth(exit.getUTCMonth() - 4);
  const existing = await db.case.findUnique({ where: { ref: "HQ-DEMO01" } });
  if (!existing) {
    const c = await db.case.create({
      data: {
        ref: "HQ-DEMO01", type: "salary", stage: "filed", workerId: worker.id, lawyerId: lawyer.id,
        employer: "Demo Contracting Co.", exitDate: exit,
        description: "দুই মাসের বেতন ও খিদমা পাইনি। (demo)",
      },
    });
    await db.caseUpdate.createMany({
      data: [
        { caseId: c.id, authorId: lawyer.id, stage: "review", body: "Documents received." },
        { caseId: c.id, authorId: lawyer.id, stage: "poa", body: "Power of attorney verified on Najiz." },
        { caseId: c.id, authorId: lawyer.id, stage: "filed", body: "Amicable settlement request filed on Qiwa." },
      ],
    });
  }
  await db.case.upsert({
    where: { ref: "HQ-DEMO02" }, update: {},
    create: { ref: "HQ-DEMO02", type: "bank", workerId: worker.id, bankName: "Al Rajhi", exitDate: exit, description: "Al Rajhi account balance (demo)." },
  });
  console.log("Seeded:", { admin: admin.phone, lawyer: lawyer.phone, worker: worker.phone });
}

main().finally(() => db.$disconnect());
