import { redirect } from "next/navigation";
import { getT } from "@/lib/locale";
import { currentUser } from "@/lib/session";
import { LoginForm } from "./LoginForm";

export default async function LoginPage() {
  if (await currentUser()) redirect("/");
  const { locale, t } = await getT();
  return (
    <div className="wrap stack" style={{ maxWidth: 480 }}>
      <h1 className="page-title">{t.auth.title}</h1>
      <LoginForm locale={locale} />
    </div>
  );
}
