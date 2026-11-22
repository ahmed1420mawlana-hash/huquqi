import Link from "next/link";
import { getT } from "@/lib/locale";
import { currentUser } from "@/lib/session";
import { Marks } from "@/components/Marks";
import { Reviews } from "@/components/Reviews";
import { Gallery } from "@/components/Gallery";
import { CaseStarter } from "@/components/CaseStarter";
import { directUploads } from "@/lib/storage";

export default async function Home() {
  const { locale, t } = await getT();
  const user = await currentUser();
  const start = user?.role === "LAWYER" ? "/lawyer" : user?.role === "ADMIN" ? "/admin" : "#start";
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
          {user?.role === "LAWYER" ? <div /> : (
            <div className="card stack" id="start">
              <div>
                <h2>{t.home.pick}</h2>
                <p className="muted" style={{ margin: "4px 0 0", fontSize: 14 }}>{t.home.pickLead}</p>
              </div>
              <CaseStarter locale={locale} direct={directUploads()} loggedIn={!!user} />
            </div>
          )}
        </div>
      </div>
      <Reviews t={t} locale={locale} />
      <Gallery t={t} locale={locale} admin={user?.role === "ADMIN"} />
    </>
  );
}
