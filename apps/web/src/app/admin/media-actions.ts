"use server";
import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { blobInfo, removeFile, saveFile } from "@/lib/storage";
import { MAX_LOCAL_BYTES, MAX_MEDIA_BYTES, MEDIA_TYPES, fileType } from "@/lib/documents";

export type MediaState = { error?: string } | undefined;
const kindOf = (mime: string) => (mime.startsWith("video/") ? "video" : "image");
const caption = (v: FormDataEntryValue | null | string) => String(v ?? "").trim().slice(0, 200) || null;

/** Local-disk upload through the server (development, or deployments without Blob). */
export async function uploadMedia(_: MediaState, fd: FormData): Promise<MediaState> {
  await requireUser(["ADMIN"]);
  const file = fd.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "required" };
  const mime = fileType(file.name, file.type);
  const ext = MEDIA_TYPES.get(mime);
  if (!ext || file.size > MAX_LOCAL_BYTES) return { error: "file" };
  const storageKey = await saveFile(`${randomUUID()}${ext}`, Buffer.from(await file.arrayBuffer()), mime, "media");
  await db.mediaItem.create({ data: { kind: kindOf(mime), mime, size: file.size, storageKey, caption: caption(fd.get("caption")) } });
  revalidatePath("/");
  revalidatePath("/admin");
  return {};
}

/** Records a photo or video the browser uploaded straight to Vercel Blob. */
export async function registerMedia(pathname: string, text: string): Promise<MediaState> {
  await requireUser(["ADMIN"]);
  if (!pathname.startsWith("media/") || pathname.includes("..")) return { error: "file" };
  const info = await blobInfo(pathname);
  if (!info || !MEDIA_TYPES.has(info.contentType) || info.size > MAX_MEDIA_BYTES) return { error: "file" };
  await db.mediaItem.create({
    data: { kind: kindOf(info.contentType), mime: info.contentType, size: info.size, storageKey: `blob:${pathname}`, caption: caption(text) },
  });
  revalidatePath("/");
  revalidatePath("/admin");
  return {};
}

export async function removeMedia(id: string) {
  await requireUser(["ADMIN"]);
  const item = await db.mediaItem.findUnique({ where: { id } });
  if (!item) return;
  await db.mediaItem.delete({ where: { id } });
  await removeFile(item.storageKey);
  revalidatePath("/");
  revalidatePath("/admin");
}
