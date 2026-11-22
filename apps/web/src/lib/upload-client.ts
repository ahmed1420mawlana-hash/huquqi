"use client";
import { upload } from "@vercel/blob/client";
import { registerDocument, uploadDocument } from "@/app/cases/actions";
import { fileType } from "@/lib/documents";

/**
 * Uploads files to a case one by one. With `direct` (Vercel Blob configured) files go straight
 * from the browser to storage in parts, so very large PDFs work; otherwise through the server.
 * Returns how many files failed.
 */
export async function uploadFiles(
  caseId: string, files: File[], direct: boolean, onFile?: (done: number) => void,
): Promise<number> {
  let failed = 0;
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    try {
      if (direct) {
        const safe = file.name.replace(/[^A-Za-z0-9._-]/g, "_").slice(-80) || "document";
        const blob = await upload(`documents/${caseId}/${safe}`, file, {
          access: "private",
          handleUploadUrl: "/api/upload",
          clientPayload: caseId,
          contentType: fileType(file.name, file.type) || undefined,
          multipart: file.size > 8 * 1024 * 1024,
        });
        const r = await registerDocument(caseId, blob.pathname, file.name);
        if (r?.error) failed++;
      } else {
        const fd = new FormData();
        fd.set("file", file);
        const r = await uploadDocument(caseId, undefined, fd);
        if (r?.error) failed++;
      }
    } catch {
      failed++;
    }
    onFile?.(i + 1);
  }
  return failed;
}
