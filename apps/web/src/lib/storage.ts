import "server-only";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { get, put } from "@vercel/blob";

/**
 * Document storage. Uses private Vercel Blob storage when BLOB_READ_WRITE_TOKEN is set
 * (deployments, where the disk is read-only), otherwise the local UPLOAD_DIR.
 * Files are only ever served through /api/documents/[id], which checks access first.
 */
const useBlob = () => !!process.env.BLOB_READ_WRITE_TOKEN;
const root = () => path.resolve(process.env.UPLOAD_DIR ?? "./uploads");

export async function saveFile(key: string, data: Buffer, contentType: string): Promise<string> {
  if (useBlob()) {
    const r = await put(`documents/${key}`, data, { access: "private", contentType, addRandomSuffix: true });
    return `blob:${r.pathname}`;
  }
  const file = path.resolve(root(), key);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, data);
  return key;
}

export async function loadFile(storageKey: string): Promise<BodyInit | null> {
  if (storageKey.startsWith("blob:")) {
    const r = await get(storageKey.slice(5), { access: "private" });
    return r?.statusCode === 200 ? r.stream : null;
  }
  const file = path.resolve(root(), storageKey);
  if (!file.startsWith(root() + path.sep)) return null;
  try {
    return new Uint8Array(await readFile(file));
  } catch {
    return null;
  }
}
