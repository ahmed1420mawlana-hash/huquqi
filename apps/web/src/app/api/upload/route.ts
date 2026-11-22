import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { db } from "@/lib/db";
import { canWorkOn } from "@/lib/access";
import { currentUser } from "@/lib/session";
import { ALLOWED_TYPES, MAX_BLOB_BYTES } from "@/lib/documents";

/**
 * Issues short-lived tokens so the browser can upload large documents straight to private
 * Vercel Blob storage. The document is recorded afterwards by the registerDocument action.
 */
export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return Response.json({ error: "unauthorized" }, { status: 401 });
  const body = (await request.json()) as HandleUploadBody;
  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, caseId) => {
        const c = caseId ? await db.case.findUnique({ where: { id: caseId }, select: { id: true, workerId: true, lawyerId: true } }) : null;
        if (!c || (c.workerId !== user.id && !canWorkOn(user, c))) throw new Error("forbidden");
        if (!pathname.startsWith(`documents/${c.id}/`)) throw new Error("bad path");
        return {
          allowedContentTypes: [...ALLOWED_TYPES.keys()],
          maximumSizeInBytes: MAX_BLOB_BYTES,
          addRandomSuffix: true,
          validUntil: Date.now() + 3 * 60 * 60 * 1000,
        };
      },
    });
    return Response.json(result);
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 400 });
  }
}
