import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { secureCookies } from "@/lib/demo";
import { riyadhDay } from "@/lib/visits";
import { currentUser } from "@/lib/session";

const BOT = /bot|crawl|spider|slurp|preview|headless|lighthouse|monitor|curl|wget|python|node-fetch/i;

/** Counts a page view. Visitors get an anonymous random id in a cookie; nothing personal is stored. */
export async function POST(req: Request) {
  if (BOT.test(req.headers.get("user-agent") ?? "")) return new Response(null, { status: 204 });
  let path = "/";
  try {
    const body = (await req.json()) as { path?: unknown };
    if (typeof body.path === "string" && body.path.startsWith("/")) path = body.path.split("?")[0].slice(0, 200);
  } catch {}
  if (path.startsWith("/api")) return new Response(null, { status: 204 });
  // The team's own browsing is not counted.
  const user = await currentUser();
  if (user && user.role !== "WORKER") return new Response(null, { status: 204 });
  const jar = await cookies();
  let visitor = jar.get("hq_vid")?.value;
  if (!visitor || !/^[0-9a-f-]{36}$/.test(visitor)) {
    visitor = randomUUID();
    jar.set("hq_vid", visitor, { httpOnly: true, sameSite: "lax", secure: secureCookies(), maxAge: 365 * 86400, path: "/" });
  }
  await db.pageView.create({ data: { day: riyadhDay(), visitor, path } });
  return new Response(null, { status: 204 });
}
