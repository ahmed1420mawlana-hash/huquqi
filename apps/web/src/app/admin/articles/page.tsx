import type { LegalArticle } from "@prisma/client";
import { db } from "@/lib/db";
import { getT } from "@/lib/locale";
import { requireUser } from "@/lib/session";
import { todayArticle } from "@/lib/articles";
import { AdminNav } from "@/components/AdminNav";
import type { Messages } from "@huquqi/core";
import { addArticle, addStarterArticles, removeArticle, setPublished, updateArticle } from "./actions";

function Fields({ t, a }: { t: Messages; a?: LegalArticle }) {
  const id = a?.id ?? "new";
  return (
    <>
      <div className="row2">
        <label className="f" htmlFor={`law-${id}`}>{t.article.law}<input id={`law-${id}`} name="law" type="text" defaultValue={a?.law ?? "نظام العمل"} required /></label>
        <label className="f" htmlFor={`num-${id}`}>{t.article.number}<input id={`num-${id}`} name="number" type="text" defaultValue={a?.number ?? ""} required /></label>
      </div>
      <label className="f" htmlFor={`ar-${id}`}>{t.article.textAr}<textarea id={`ar-${id}`} name="ar" dir="rtl" defaultValue={a?.ar ?? ""} required /></label>
      <label className="f" htmlFor={`bn-${id}`}>{t.article.textBn}<textarea id={`bn-${id}`} name="bn" dir="ltr" defaultValue={a?.bn ?? ""} /></label>
      <label className="f" htmlFor={`en-${id}`}>{t.article.textEn}<textarea id={`en-${id}`} name="en" dir="ltr" defaultValue={a?.en ?? ""} /></label>
    </>
  );
}

/** Admin only: the articles shown one per day on the home page. */
export default async function Articles() {
  await requireUser(["ADMIN"]);
  const { locale, t } = await getT();
  const [articles, today] = await Promise.all([
    db.legalArticle.findMany({ orderBy: [{ createdAt: "asc" }, { id: "asc" }] }),
    todayArticle(),
  ]);

  return (
    <div className="wrap stack">
      <AdminNav active="articles" t={t} locale={locale} />
      <div>
        <h1 className="page-title">{t.article.manage}</h1>
        <p className="muted" style={{ margin: "4px 0 0" }}>{t.article.manageLead}</p>
      </div>

      <form action={addArticle} className="card stack art-form" id="new-article">
        <h2>{t.article.add}</h2>
        <Fields t={t} />
        <label className="inline" style={{ fontSize: 14.5 }}><input type="checkbox" name="published" /> {t.article.publish}</label>
        <div><button className="btn">{t.article.add}</button></div>
      </form>

      {!articles.some((a) => a.starter) && (
        <form action={addStarterArticles} className="card inline" style={{ justifyContent: "space-between" }}>
          <span>{t.article.starter}</span>
          <button className="btn small ghost" id="add-starter">{t.article.starter}</button>
        </form>
      )}
      {articles.some((a) => a.starter && !a.published) && <p className="devcode" style={{ margin: 0 }}>{t.article.starterDone}</p>}

      <ul className="apps">
        {articles.map((a) => (
          <li key={a.id} className="card stack app-card art-card">
            <div className="inline" style={{ justifyContent: "space-between" }}>
              <b>{a.law} · {t.article.num(a.number)}</b>
              <span className="inline" style={{ gap: 6 }}>
                {today?.id === a.id && <span className="pill new">{t.article.today}</span>}
                <span className={`pill ${a.published ? "" : "closed"}`}>{a.published ? t.article.published : t.article.draft}</span>
              </span>
            </div>
            <details>
              <summary className="muted">{a.ar.slice(0, 90)}{a.ar.length > 90 ? "…" : ""}</summary>
              <form action={updateArticle.bind(null, a.id)} className="stack art-form" style={{ marginTop: 10 }}>
                <Fields t={t} a={a} />
                <div><button className="btn small">{t.common.save}</button></div>
              </form>
            </details>
            <div className="inline" style={{ gap: 8 }}>
              <form action={setPublished.bind(null, a.id, !a.published)}>
                <button className={`btn small pub ${a.published ? "ghost" : ""}`}>{a.published ? t.article.unpublish : t.article.publish}</button>
              </form>
              <form action={removeArticle.bind(null, a.id)}><button className="btn small ghost">{t.article.remove}</button></form>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
