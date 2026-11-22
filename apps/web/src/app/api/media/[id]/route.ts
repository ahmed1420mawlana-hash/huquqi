import { db } from "@/lib/db";
import { streamFile } from "@/lib/storage";

/** Public: photos and videos shown on the home page. */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await db.mediaItem.findUnique({ where: { id } });
  if (!item) return new Response("Not found", { status: 404 });
  const r = await streamFile(item.storageKey, req.headers.get("range"));
  if (!r) return new Response("Not found", { status: 404 });
  return new Response(r.body, {
    status: r.status,
    headers: {
      ...r.headers,
      "Content-Type": item.mime,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
