import { readFile } from "node:fs/promises";
import path from "node:path";
import { db } from "@/lib/db";
import { isVerifiedLawyer } from "@/lib/access";
import { currentUser } from "@/lib/session";

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

  const root = path.resolve(process.env.UPLOAD_DIR ?? "./uploads");
  const file = path.resolve(root, doc.storageKey);
  if (!file.startsWith(root + path.sep)) return new Response("Not found", { status: 404 });
  const data = await readFile(file);
  return new Response(new Uint8Array(data), {
    headers: {
      "Content-Type": doc.mime,
      "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(doc.filename)}`,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, no-store",
    },
  });
}
