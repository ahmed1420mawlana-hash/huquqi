/** Case types a returnee can open, and the stages each one moves through. */

/** Case types a returnee can open, in the order they are offered. */
export const CASE_TYPES = [
  // Most general first, most specific last.
  "general", // general cases
  "court", // an existing court case
  "commercial", // commercial disputes: debts, contracts, a business or partnership
  "invest", // investing in Saudi Arabia and Premium Residency
  "realestate", // owning property and a home in Saudi Arabia
  "poa", // issuing a power of attorney
  "translation", // certified translation and attestation of documents
  "hajj", // Hajj and Umrah visas
  "labour", // unpaid salary and end-of-service benefit, one labour claim
  "bank", // balance left in a Saudi bank account
] as const;
/** Types from earlier versions, still shown on old cases but no longer offered. */
export const LEGACY_CASE_TYPES = ["salary", "eosb", "accident", "property"] as const;
export type CaseType = (typeof CASE_TYPES)[number] | (typeof LEGACY_CASE_TYPES)[number];

export const STAGES = [
  "submitted", // worker opened the case
  "review", // lawyer reviewing documents
  "poa", // power of attorney being prepared / attested
  "filed", // filed with the official channel (Qiwa, bank, Najiz...)
  "hearing", // settlement sessions or court hearings
  "judgment", // decision / bank answer received
  "payout", // money transferred to the worker
  "closed",
] as const;
export type Stage = (typeof STAGES)[number];

/** True for the types a new case can be opened with. */
export function isCaseType(v: unknown): v is (typeof CASE_TYPES)[number] {
  return typeof v === "string" && (CASE_TYPES as readonly string[]).includes(v);
}
export function isStage(v: unknown): v is Stage {
  return typeof v === "string" && (STAGES as readonly string[]).includes(v);
}

/** Labour claims (salary, end of service) go through Qiwa then the labour court. */
export function isLabourType(t: CaseType): boolean {
  return t === "labour" || t === "salary" || t === "eosb";
}

/** The official Saudi channel the lawyer uses for each case type. */
export const CHANNEL: Record<CaseType, string> = {
  labour: "Qiwa → Labour Court (Najiz)",
  salary: "Qiwa → Labour Court (Najiz)",
  eosb: "Qiwa → Labour Court (Najiz)",
  bank: "Bank (SAMA rules)",
  court: "Najiz",
  accident: "Najm / Najiz",
  property: "Absher / Najiz",
  translation: "Certified translation office",
  hajj: "Nusuk",
  commercial: "Commercial Court (Najiz)",
  poa: "Saudi Embassy (Dhaka) / Najiz",
  invest: "MISA / Premium Residency Center",
  realestate: "Real Estate General Authority / Real Estate Registry",
  general: "Najiz",
};

export function stageIndex(s: Stage): number {
  return STAGES.indexOf(s);
}

/** Stages a lawyer may move to from the current one: forward one step, or straight to closed. */
export function nextStages(current: Stage): Stage[] {
  if (current === "closed") return [];
  const i = stageIndex(current);
  const out: Stage[] = [];
  const next = STAGES[i + 1];
  if (next && next !== "closed") out.push(next);
  out.push("closed");
  return out;
}
