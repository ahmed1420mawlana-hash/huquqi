import { db } from "./db";

/** YYYY-MM-DD in Riyadh time (UTC+3, no daylight saving). */
export function riyadhDay(d: Date = new Date()): string {
  return new Date(d.getTime() + 3 * 3600_000).toISOString().slice(0, 10);
}

const daysAgo = (n: number) => riyadhDay(new Date(Date.now() - n * 86400_000));

async function uniqueSince(day: string | null) {
  const rows = await db.pageView.groupBy({ by: ["visitor"], where: day ? { day: { gte: day } } : {} });
  return rows.length;
}

export async function visitStats() {
  const today = riyadhDay();
  const [todayViews, todayVisitors, week, month, total, totalViews, daily, pages] = await Promise.all([
    db.pageView.count({ where: { day: today } }),
    uniqueSince(today),
    uniqueSince(daysAgo(6)),
    uniqueSince(daysAgo(29)),
    uniqueSince(null),
    db.pageView.count(),
    db.pageView.groupBy({ by: ["day"], where: { day: { gte: daysAgo(13) } }, _count: { _all: true } }),
    db.pageView.groupBy({
      by: ["path"], where: { day: { gte: daysAgo(29) } }, _count: { _all: true },
      orderBy: { _count: { path: "desc" } }, take: 8,
    }),
  ]);
  const days = Array.from({ length: 14 }, (_, i) => daysAgo(13 - i));
  const byDay = new Map(daily.map((d) => [d.day, d._count._all]));
  return {
    todayViews, todayVisitors, week, month, total, totalViews,
    daily: days.map((day) => ({ day, views: byDay.get(day) ?? 0 })),
    pages: pages.map((p) => ({ path: p.path, views: p._count._all })),
  };
}
