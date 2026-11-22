import "server-only";
import { createReadStream } from "node:fs";
import { mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { Readable } from "node:stream";
import path from "node:path";
import { del, get, head, put } from "@vercel/blob";

/**
 * Document storage. Uses private Vercel Blob storage when BLOB_READ_WRITE_TOKEN is set
 * (deployments, where the disk is read-only), otherwise the local UPLOAD_DIR.
 * Files are only ever served through /api/documents/[id], which checks access first.
 */
const useBlob = () => !!process.env.BLOB_READ_WRITE_TOKEN;
const root = () => path.resolve(process.env.UPLOAD_DIR ?? "./uploads");

export async function saveFile(key: string, data: Buffer, contentType: string, folder = "documents"): Promise<string> {
  if (useBlob()) {
    const r = await put(`${folder}/${key}`, data, { access: "private", contentType, addRandomSuffix: true });
    return `blob:${r.pathname}`;
  }
  const local = folder === "documents" ? key : `${folder}/${key}`;
  const file = path.resolve(root(), local);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, data);
  return local;
}

export const directUploads = useBlob;

/** Size and type of a blob the browser uploaded directly. */
export async function blobInfo(pathname: string): Promise<{ size: number; contentType: string } | null> {
  try {
    const r = await head(pathname);
    return { size: r.size, contentType: r.contentType };
  } catch {
    return null;
  }
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

/**
 * Streams a file with HTTP Range support, so videos can seek and play on iPhones.
 * Used for the public photos and videos on the home page.
 */
export async function streamFile(
  storageKey: string, range: string | null,
): Promise<{ body: ReadableStream; status: number; headers: Record<string, string> } | null> {
  if (storageKey.startsWith("blob:")) {
    const r = await get(storageKey.slice(5), { access: "private", headers: range ? { range } : undefined });
    if (!r || r.statusCode !== 200) return null;
    const contentRange = r.headers.get("content-range");
    const headers: Record<string, string> = { "Accept-Ranges": "bytes" };
    const len = r.headers.get("content-length");
    if (len) headers["Content-Length"] = len;
    if (contentRange) headers["Content-Range"] = contentRange;
    return { body: r.stream, status: contentRange ? 206 : 200, headers };
  }
  const file = path.resolve(root(), storageKey);
  if (!file.startsWith(root() + path.sep)) return null;
  let size: number;
  try {
    size = (await stat(file)).size;
  } catch {
    return null;
  }
  const m = range && /^bytes=(\d*)-(\d*)$/.exec(range);
  if (m && (m[1] || m[2])) {
    const start = m[1] ? Number(m[1]) : Math.max(0, size - Number(m[2]));
    const end = m[1] && m[2] ? Math.min(Number(m[2]), size - 1) : size - 1;
    if (start > end || start >= size) return null;
    const body = Readable.toWeb(createReadStream(file, { start, end })) as ReadableStream;
    return {
      body, status: 206,
      headers: { "Accept-Ranges": "bytes", "Content-Range": `bytes ${start}-${end}/${size}`, "Content-Length": String(end - start + 1) },
    };
  }
  const body = Readable.toWeb(createReadStream(file)) as ReadableStream;
  return { body, status: 200, headers: { "Accept-Ranges": "bytes", "Content-Length": String(size) } };
}

export async function removeFile(storageKey: string): Promise<void> {
  try {
    if (storageKey.startsWith("blob:")) await del(storageKey.slice(5));
    else {
      const file = path.resolve(root(), storageKey);
      if (file.startsWith(root() + path.sep)) await rm(file, { force: true });
    }
  } catch {
    // The record is removed either way; a leftover file is harmless.
  }
}
