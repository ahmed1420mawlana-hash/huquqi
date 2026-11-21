import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { timingSafeEqual } from "node:crypto";
import { DEMO_COOKIE, demoToken, secureCookies } from "@/lib/demo";

async function enter(fd: FormData) {
  "use server";
  const password = process.env.DEMO_PASSWORD;
  if (!password) redirect("/");
  const given = Buffer.from(String(fd.get("password") ?? ""));
  const want = Buffer.from(password);
  if (given.length !== want.length || !timingSafeEqual(given, want)) redirect("/demo?wrong=1");
  (await cookies()).set(DEMO_COOKIE, await demoToken(password), {
    httpOnly: true, secure: secureCookies(), sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30,
  });
  redirect("/");
}

export default async function DemoGate({ searchParams }: { searchParams: Promise<{ wrong?: string }> }) {
  const { wrong } = await searchParams;
  return (
    <div className="wrap stack" style={{ maxWidth: 420 }}>
      <h1 className="page-title">Huquqi · حقوقي · হুকুকি</h1>
      <p className="muted" style={{ margin: 0 }}>
        نسخة تجريبية · Demo version · ডেমো সংস্করণ
      </p>
      <form action={enter} className="card stack">
        <label className="f" htmlFor="password">
          Password · كلمة المرور · পাসওয়ার্ড
          <input id="password" name="password" type="password" autoComplete="current-password" required />
        </label>
        {wrong && <p className="err" role="alert">✕</p>}
        <button className="btn">→</button>
      </form>
    </div>
  );
}
