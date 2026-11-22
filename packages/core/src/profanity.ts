/**
 * Masks obscene words in text people write on the platform (messages, reviews, contact forms).
 * Whole-word matching, so ordinary words that merely contain the same letters are left alone.
 * Arabic matching ignores diacritics, tatweel and the usual letter variants (أ/إ/آ, ة/ه, ى/ي).
 */
const AR = [
  "شرموط", "شرموطه", "شراميط", "عاهر", "عاهره", "قحبه", "قحاب", "منيوك", "منيوكه", "نيك", "ينيك", "انيك", "نايك",
  "متناك", "متناكه", "كس", "كسمك", "كسامك", "كسختك", "طيز", "طيزك", "زب", "زبي", "زبر", "لوطي", "خول", "خنيث",
  "كلب", "كلبه", "كلاب", "حمار", "حمير", "خنزير", "خنازير", "حقير", "حقيره", "واطي", "ديوث", "يلعن", "ملعون", "تفو",
];
const EN = [
  "fuck", "fucking", "fucker", "fucked", "motherfucker", "fck", "shit", "shitty", "bullshit", "bitch", "bitches",
  "bastard", "asshole", "dick", "dickhead", "cunt", "whore", "slut", "pussy", "wanker", "prick",
];
/** Bengali and romanised Bengali insults. */
const BN = [
  "চুদি", "চুদা", "চোদা", "চুদির", "চোদ", "চুদ", "চুদানি", "খানকি", "খানকির", "মাগি", "মাগী", "হারামি", "হারামজাদা",
  "হারামখোর", "কুত্তা", "কুত্তার", "শুয়োর", "শুয়োরের", "শালা", "বেশ্যা", "বোকাচোদা",
  "chudi", "choda", "chod", "khanki", "magi", "harami", "haramjada", "kutta", "shuar", "boka choda",
];

const MARKS = "[\\u064B-\\u065F\\u0670\\u0640]*"; // Arabic diacritics and tatweel
const AR_VARIANTS: Record<string, string> = { "ا": "[اأإآ]", "ه": "[هة]", "ي": "[يى]", "و": "[وؤ]" };

function arabicPattern(word: string) {
  return [...word].map((ch) => (AR_VARIANTS[ch] ?? ch) + MARKS).join("");
}
const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
/** Letters stretched for effect ("fuuuck") still match: each letter may repeat. */
const latinPattern = (w: string) => [...w].map((ch) => (ch === " " ? "\\s+" : escape(ch) + "+")).join("");

const arabic = `(?:وال|فال|بال|ال|يا\\s*|و|ف)?(?:${AR.map(arabicPattern).join("|")})`;
const latin = `(?:${EN.concat(BN.filter((w) => /^[a-z ]+$/.test(w))).map(latinPattern).join("|")})`;
const bengali = `(?:${BN.filter((w) => !/^[a-z ]+$/.test(w)).map(escape).join("|")})`;

// A word boundary that also works for Arabic and Bengali letters (and Bengali vowel signs, \p{M}).
const RE = new RegExp(`(?<![\\p{L}\\p{M}\\p{N}])(?:${arabic}|${latin}|${bengali})(?![\\p{L}\\p{M}\\p{N}])`, "giu");

export const MASK = "***";

export function censor(text: string): string {
  return text.replace(RE, MASK);
}

export function hasProfanity(text: string): boolean {
  RE.lastIndex = 0;
  const found = RE.test(text);
  RE.lastIndex = 0;
  return found;
}
