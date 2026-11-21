"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { isLocale } from "@huquqi/core";
import { LOCALE_COOKIE } from "@/lib/locale";
import { currentUser, destroySession } from "@/lib/session";
import { db } from "@/lib/db";

export async function setLocale(formData: FormData) {
  const l = formData.get("locale");
  if (!isLocale(l)) return;
  (await cookies()).set(LOCALE_COOKIE, l, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  const u = await currentUser();
  if (u) await db.user.update({ where: { id: u.id }, data: { locale: l } });
  revalidatePath("/", "layout");
}

export async function logout() {
  await destroySession();
  redirect("/");
}
