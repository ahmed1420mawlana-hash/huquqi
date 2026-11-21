import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "./db";

const COOKIE = "hq_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function key() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) throw new Error("SESSION_SECRET must be at least 32 characters");
  return new TextEncoder().encode(s);
}

export async function createSession(userId: string) {
  const token = await new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(key());
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroySession() {
  (await cookies()).delete(COOKIE);
}

export async function currentUser() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key());
    if (!payload.sub) return null;
    return await db.user.findUnique({ where: { id: payload.sub }, include: { lawyerProfile: true } });
  } catch {
    return null;
  }
}

export type SessionUser = NonNullable<Awaited<ReturnType<typeof currentUser>>>;
export type Role = "WORKER" | "LAWYER" | "ADMIN";

export async function requireUser(roles?: Role[]): Promise<SessionUser> {
  const u = await currentUser();
  if (!u) redirect("/login");
  if (roles && !roles.includes(u.role as Role)) redirect("/forbidden");
  return u;
}
