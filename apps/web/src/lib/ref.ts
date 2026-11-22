import { db } from "@/lib/db";

/** Year and month in Riyadh time, e.g. "202611". */
export function refPeriod(d: Date = new Date()): string {
  const r = new Date(d.getTime() + 3 * 3600_000);
  return `${r.getUTCFullYear()}${String(r.getUTCMonth() + 1).padStart(2, "0")}`;
}

/** Case number: year, month, 0, then the month's running number, e.g. 2026110 + 1 = "20261101". */
export function formatRef(period: string, n: number): string {
  return `${period}0${n}`;
}

/** Takes the next number for this month. The increment is one atomic statement, so two cases never share a number. */
export async function nextCaseRef(): Promise<string> {
  const period = refPeriod();
  const [row] = await db.$queryRaw<{ last: number }[]>`
    INSERT INTO "RefCounter" ("period", "last") VALUES (${period}, 1)
    ON CONFLICT ("period") DO UPDATE SET "last" = "RefCounter"."last" + 1
    RETURNING "last"`;
  return formatRef(period, Number(row.last));
}
