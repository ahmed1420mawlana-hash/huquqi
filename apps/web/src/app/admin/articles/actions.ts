"use server";
import { revalidatePath } from "next/cache";
import { censor } from "@huquqi/core";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { STARTER_ARTICLES } from "@/lib/starter-articles";

const done = () => { revalidatePath("/admin/articles"); revalidatePath("/"); };
const field = (fd: FormData, k: string, n: number) => censor(String(fd.get(k) ?? "").trim().slice(0, n));

export async function addArticle(fd: FormData) {
  await requireUser(["ADMIN"]);
  const law = field(fd, "law", 120), number = field(fd, "number", 20), ar = field(fd, "ar", 1500);
  if (!law || !number || !ar) return;
  await db.legalArticle.create({
    data: { law, number, ar, bn: field(fd, "bn", 1500) || null, en: field(fd, "en", 1500) || null, published: fd.get("published") === "on" },
  });
  done();
}

export async function updateArticle(id: string, fd: FormData) {
  await requireUser(["ADMIN"]);
  const law = field(fd, "law", 120), number = field(fd, "number", 20), ar = field(fd, "ar", 1500);
  if (!law || !number || !ar) return;
  await db.legalArticle.update({ where: { id }, data: { law, number, ar, bn: field(fd, "bn", 1500) || null, en: field(fd, "en", 1500) || null } });
  done();
}

export async function setPublished(id: string, published: boolean) {
  await requireUser(["ADMIN"]);
  await db.legalArticle.update({ where: { id }, data: { published } });
  done();
}

export async function removeArticle(id: string) {
  await requireUser(["ADMIN"]);
  await db.legalArticle.delete({ where: { id } });
  done();
}

/** Adds the starter Labour Law set, unpublished. Running it again adds nothing twice. */
export async function addStarterArticles() {
  await requireUser(["ADMIN"]);
  await db.legalArticle.createMany({
    data: STARTER_ARTICLES.map(({ key, ...a }) => ({ ...a, starter: key, published: false })),
    skipDuplicates: true,
  });
  done();
}
