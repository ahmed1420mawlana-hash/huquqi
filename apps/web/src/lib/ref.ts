import { randomInt } from "node:crypto";

// No 0/O/1/I so references are easy to read out over the phone.
const ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

export function caseRef(): string {
  let s = "HQ-";
  for (let i = 0; i < 6; i++) s += ALPHABET[randomInt(ALPHABET.length)];
  return s;
}
