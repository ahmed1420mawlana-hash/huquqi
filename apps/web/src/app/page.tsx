import Link from "next/link";
import { getT } from "@/lib/locale";
import { currentUser } from "@/lib/session";
import { CaseCheck } from "@/components/CaseCheck";
import { Marks } from "@/components/Marks";
import { Reviews } from "@/components/Reviews";

export default async function Home() {
  const { locale, t } = await getT();
  const user = await currentUser();
  const start = user ? (user.role === "WORKER" ? "/cases/new" : user.role === "ADMIN" ? "/admin" : "/lawyer") : "/login";
  return (
    <>
      <div className="hero">
        <div className="wrap hero-grid">
          <div className="stack">
            <Marks labels={t.marks} />
            <div className="eyebrow">{t.home.eyebrow}</div>
            <h1>{t.home.title}</h1>
            <p className="lead">{t.home.lead}</p>
            <div><Link href={start} className="btn">{t.home.cta}</Link></div>
          </div>
          <CaseCheck locale={locale} />
        </div>
      </div>
      <Reviews t={t} locale={locale} />
    </>
  );
}
