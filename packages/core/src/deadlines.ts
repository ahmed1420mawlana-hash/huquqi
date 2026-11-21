/**
 * Time rules from the research plan:
 * - Labour claims must be filed within 12 months of the end of employment (Clyde & Co, 2024).
 * - SAMA: expatriate accounts are frozen 90 days after the iqama expires, the balance moves to a
 *   holding account after 180 days, and becomes "unclaimed" 5 years after the last transaction.
 *   The money stays a liability of the bank and is never lost.
 * These are planning aids, not legal advice.
 */

const DAY = 86_400_000;

function startOfDayUTC(d: Date): number {
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

export function addMonthsUTC(d: Date, months: number): Date {
  const r = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + months, 1));
  const lastDay = new Date(Date.UTC(r.getUTCFullYear(), r.getUTCMonth() + 1, 0)).getUTCDate();
  r.setUTCDate(Math.min(d.getUTCDate(), lastDay));
  return r;
}

export function daysBetween(from: Date, to: Date): number {
  return Math.round((startOfDayUTC(to) - startOfDayUTC(from)) / DAY);
}

export interface LabourDeadline {
  deadline: Date;
  daysLeft: number; // negative when passed
  expired: boolean;
  /** 0..1, how much of the 12-month window has been used */
  used: number;
}

export function labourDeadline(employmentEnd: Date, today: Date = new Date()): LabourDeadline {
  const deadline = addMonthsUTC(employmentEnd, 12);
  const daysLeft = daysBetween(today, deadline);
  const total = daysBetween(employmentEnd, deadline);
  const used = Math.min(1, Math.max(0, 1 - daysLeft / total));
  return { deadline, daysLeft, expired: daysLeft < 0, used };
}

export type BankStatus = "active" | "frozen" | "holding" | "unclaimed";

/**
 * Likely state of an expatriate's account. Pass the iqama expiry (or the exit date when unknown)
 * and, if known, the date of the last transaction.
 */
export function bankStatus(
  iqamaExpiry: Date,
  today: Date = new Date(),
  lastTransaction?: Date,
): BankStatus {
  if (lastTransaction && daysBetween(addMonthsUTC(lastTransaction, 60), today) >= 0) return "unclaimed";
  const since = daysBetween(iqamaExpiry, today);
  if (since > 180) return "holding";
  if (since > 90) return "frozen";
  return "active";
}
