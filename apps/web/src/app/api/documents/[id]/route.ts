import { db } from "@/lib/db";
import { isVerifiedLawyer } from "@/lib/access";
import { currentUser } from "@/lib/session";
import { loadFile } from "@/lib/storage";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await currentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });
  const { id } = await params;
  const doc = await db.document.findUnique({ where: { id }, include: { case: true } });
  if (!doc) return new Response("Not found", { status: 404 });
  const c = doc.case;
  const allowed =
    user.role === "ADMIN" || c.workerId === user.id || c.lawyerId === user.id ||
    (c.lawyerId === null && isVerifiedLawyer(user));
  if (!allowed) return new Response("Not found", { status: 404 });

  const body = await loadFile(doc.storageKey);
  if (!body) return new Response("Not found", { status: 404 });
  return new Response(body, {
    headers: {
      "Content-Type": doc.mime,
      "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(doc.filename)}`,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, no-store",
    },
  });
}
