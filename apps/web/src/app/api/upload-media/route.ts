import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { currentUser } from "@/lib/session";
import { MAX_MEDIA_BYTES, MEDIA_TYPES } from "@/lib/documents";

/** Tokens for admins to upload home page photos and videos straight to Blob storage. */
export async function POST(request: Request) {
  const user = await currentUser();
  if (user?.role !== "ADMIN") return Response.json({ error: "forbidden" }, { status: 403 });
  const body = (await request.json()) as HandleUploadBody;
  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        if (!pathname.startsWith("media/")) throw new Error("bad path");
        return {
          allowedContentTypes: [...MEDIA_TYPES.keys()],
          maximumSizeInBytes: MAX_MEDIA_BYTES,
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
