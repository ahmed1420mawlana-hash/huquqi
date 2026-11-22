import { describe, expect, it } from "vitest";
import { addMonthsUTC, bankStatus, labourDeadline } from "./deadlines";
import { normaliseBdPhone, normalisePhone, normaliseSaPhone } from "./phone";
import { nextStages } from "./cases";
import { localNum, messages } from "./i18n";

const d = (s: string) => new Date(s + "T00:00:00Z");

describe("labourDeadline", () => {
  it("is 12 months after the end of employment", () => {
    const r = labourDeadline(d("2026-07-21"), d("2026-11-21"));
    expect(r.deadline.toISOString().slice(0, 10)).toBe("2027-07-21");
    expect(r.daysLeft).toBe(242);
    expect(r.expired).toBe(false);
  });
  it("expires after the deadline", () => {
    const r = labourDeadline(d("2025-01-10"), d("2026-02-01"));
    expect(r.expired).toBe(true);
    expect(r.used).toBe(1);
  });
  it("clamps month ends", () => {
    expect(addMonthsUTC(d("2024-02-29"), 12).toISOString().slice(0, 10)).toBe("2025-02-28");
  });
});

describe("bankStatus", () => {
  it("follows SAMA 90/180-day rules", () => {
    expect(bankStatus(d("2026-11-01"), d("2026-11-21"))).toBe("active");
    expect(bankStatus(d("2026-07-01"), d("2026-11-21"))).toBe("frozen");
    expect(bankStatus(d("2026-01-01"), d("2026-11-21"))).toBe("holding");
  });
  it("is unclaimed 5 years after the last transaction", () => {
    expect(bankStatus(d("2021-01-01"), d("2026-11-21"), d("2021-06-01"))).toBe("unclaimed");
  });
});

describe("phones", () => {
  it("normalises Bangladeshi numbers", () => {
    expect(normaliseBdPhone("01712-345678")).toBe("+8801712345678");
    expect(normaliseBdPhone("+880 1712 345678")).toBe("+8801712345678");
    expect(normaliseBdPhone("01212345678")).toBeNull();
  });
  it("normalises Saudi numbers", () => {
    expect(normaliseSaPhone("0551234567")).toBe("+966551234567");
    expect(normalisePhone("+966 55 123 4567")).toBe("+966551234567");
  });
});

describe("stages", () => {
  it("moves forward one step or closes", () => {
    expect(nextStages("submitted")).toEqual(["review", "closed"]);
    expect(nextStages("payout")).toEqual(["closed"]);
    expect(nextStages("closed")).toEqual([]);
  });
});

describe("i18n", () => {
  it("has the same keys in every locale", () => {
    const keys = (o: object): string[] =>
      Object.entries(o).flatMap(([k, v]) => (v && typeof v === "object" ? keys(v).map((x) => `${k}.${x}`) : [k])).sort();
    expect(keys(messages.ar)).toEqual(keys(messages.bn));
    expect(keys(messages.en)).toEqual(keys(messages.bn));
  });
  it("uses Bengali digits", () => {
    expect(localNum(242, "bn")).toBe("২৪২");
  });
});

import { normaliseEmail } from "./email";
describe("email", () => {
  it("normalises and validates", () => {
    expect(normaliseEmail("  Karim@Example.COM ")).toBe("karim@example.com");
    expect(normaliseEmail("karim@example")).toBeNull();
    expect(normaliseEmail("not an email")).toBeNull();
  });
});

import { censor, hasProfanity } from "./profanity";
describe("censor", () => {
  it("masks obscene words in Arabic, English and Bengali", () => {
    expect(censor("أنت كلب")).toBe("أنت ***");
    expect(censor("يا حمار!")).toBe("***!");
    expect(censor("المحامي حقيرة جداً")).toBe("المحامي *** جداً");
    expect(censor("this is shit, FUUUCK")).toBe("this is ***, ***");
    expect(censor("তুই একটা কুত্তা")).toBe("তুই একটা ***");
    expect(censor("you are a khanki")).toBe("you are a ***");
  });
  it("ignores diacritics and tatweel", () => {
    expect(censor("كـــلب")).toBe("***");
    expect(censor("حِمَار")).toBe("***");
  });
  it("leaves ordinary words alone", () => {
    const ok = [
      "أريد استرداد راتبي من الكفيل", "كسبت القضية", "مكافأة نهاية الخدمة", "الزبون", "طيزان", "حمارة الصيف",
      "Scunthorpe assessment cocktail", "class passed dickens", "আমার বেতন পাইনি", "শালার", "the shitake mushroom",
    ];
    for (const s of ok) expect(censor(s)).toBe(s);
    expect(hasProfanity("أريد حقي")).toBe(false);
    expect(hasProfanity("kutta")).toBe(true);
  });
});
