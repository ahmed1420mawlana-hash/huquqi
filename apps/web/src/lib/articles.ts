import type { LegalArticle } from "@prisma/client";
import { db } from "@/lib/db";
import { riyadhDay } from "@/lib/visits";

/** Days since 1970 in Riyadh time, so the article changes at midnight Riyadh. */
export function dayIndex(d: Date = new Date()): number {
  return Math.floor(Date.parse(riyadhDay(d) + "T00:00:00Z") / 86400_000);
}

/** Today's article: published articles in the order they were added, one per day, in turn. */
export async function todayArticle(): Promise<LegalArticle | null> {
  const count = await db.legalArticle.count({ where: { published: true } });
  if (!count) return null;
  return db.legalArticle.findFirst({
    where: { published: true },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    skip: dayIndex() % count,
  });
}
