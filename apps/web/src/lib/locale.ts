import "server-only";
import { cookies } from "next/headers";
import { DEFAULT_LOCALE, isLocale, messages, type Locale } from "@huquqi/core";

export const LOCALE_COOKIE = "hq_locale";

export async function getLocale(): Promise<Locale> {
  const v = (await cookies()).get(LOCALE_COOKIE)?.value;
  return isLocale(v) ? v : DEFAULT_LOCALE;
}

export async function getT() {
  const locale = await getLocale();
  return { locale, t: messages[locale] };
}
