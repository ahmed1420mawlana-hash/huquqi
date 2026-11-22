import { redirect } from "next/navigation";
import { getT } from "@/lib/locale";
import { currentUser } from "@/lib/session";
import { LoginForm } from "./LoginForm";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const safeNext = next && /^\/(?!\/)[\w\-/?=&]*$/.test(next) ? next : undefined;
  if (await currentUser()) redirect(safeNext ?? "/");
  const { locale, t } = await getT();
  return (
    <div className="wrap stack" style={{ maxWidth: 480 }}>
      <h1 className="page-title">{t.auth.title}</h1>
      <LoginForm locale={locale} next={safeNext} />
    </div>
  );
}
