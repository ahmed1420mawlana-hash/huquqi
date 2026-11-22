/** Case types a returnee can open, and the stages each one moves through. */

export const CASE_TYPES = [
  "salary", // unpaid wages
  "eosb", // end-of-service benefit
  "bank", // balance left in a Saudi bank account
  "court", // an existing court case
  "accident", // traffic accident / injury compensation
  "property", // car or property registered in the worker's name
  "translation", // certified translation of documents
  "hajj", // Hajj and Umrah visas
] as const;
export type CaseType = (typeof CASE_TYPES)[number];

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

export function isCaseType(v: unknown): v is CaseType {
  return typeof v === "string" && (CASE_TYPES as readonly string[]).includes(v);
}
export function isStage(v: unknown): v is Stage {
  return typeof v === "string" && (STAGES as readonly string[]).includes(v);
}

/** Labour claims (salary, end of service) go through Qiwa then the labour court. */
export function isLabourType(t: CaseType): boolean {
  return t === "salary" || t === "eosb";
}

/** The official Saudi channel the lawyer uses for each case type. */
export const CHANNEL: Record<CaseType, string> = {
  salary: "Qiwa → Labour Court (Najiz)",
  eosb: "Qiwa → Labour Court (Najiz)",
  bank: "Bank (SAMA rules)",
  court: "Najiz",
  accident: "Najm / Najiz",
  property: "Absher / Najiz",
  translation: "Certified translation office",
  hajj: "Nusuk",
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
