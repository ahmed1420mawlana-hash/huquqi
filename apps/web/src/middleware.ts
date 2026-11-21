import { NextResponse, type NextRequest } from "next/server";
import { DEMO_COOKIE, demoToken } from "@/lib/demo";

/** When DEMO_PASSWORD is set, every page asks for it first (demo deployments). */
export async function middleware(req: NextRequest) {
  const password = process.env.DEMO_PASSWORD;
  if (!password) return NextResponse.next();
  if (req.nextUrl.pathname === "/demo") return NextResponse.next();
  if (req.cookies.get(DEMO_COOKIE)?.value === (await demoToken(password))) return NextResponse.next();
  if (req.nextUrl.pathname.startsWith("/api/")) return new NextResponse("Unauthorized", { status: 401 });
  const url = req.nextUrl.clone();
  url.pathname = "/demo";
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
