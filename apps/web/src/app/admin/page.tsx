import Link from "next/link";
import { formatDate, localNum } from "@huquqi/core";
import { db } from "@/lib/db";
import { getT } from "@/lib/locale";
import { requireUser } from "@/lib/session";
import { who } from "@/lib/who";
import { Stars } from "@/components/Stars";
import { directUploads } from "@/lib/storage";
import { visitStats } from "@/lib/visits";
import { MediaForm } from "./MediaForm";
import { AdminNav } from "@/components/AdminNav";
import { removeMedia } from "./media-actions";
import { assignLawyer, makeLawyer, setReviewApproved, verifyLawyer } from "./actions";

export default async function Admin() {
  await requireUser(["ADMIN"]);
  const { locale, t } = await getT();
  const [lawyers, caseCount, reviews, inbox, media, waiting, visits] = await Promise.all([
    db.user.findMany({ where: { role: "LAWYER" }, include: { lawyerProfile: true }, orderBy: { createdAt: "desc" } }),
    db.case.count(),
    db.review.findMany({ include: { author: true, lawyer: true }, orderBy: { createdAt: "desc" }, take: 100 }),
    db.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
    db.mediaItem.findMany({ orderBy: { createdAt: "desc" } }),
    db.case.count({ where: { awaitingReply: true } }),
    visitStats(),
  ]);
  const maxDay = Math.max(1, ...visits.daily.map((d) => d.views));
  const verified = lawyers.filter((l) => l.lawyerProfile?.verifiedAt);

  return (
    <div className="wrap stack">
      <AdminNav active="home" t={t} locale={locale} />
      <h1 className="page-title">{t.admin.title}</h1>

      <section className="card stack">
        <h2>{t.admin.lawyers}</h2>
        <form action={makeLawyer} className="inline">
          <input name="email" type="email" placeholder="lawyer@example.com" dir="ltr" aria-label={t.admin.email} style={{ maxWidth: 240 }} required />
          <input name="name" type="text" placeholder={t.auth.name} aria-label={t.auth.name} style={{ maxWidth: 220 }} />
          <button className="btn small">{t.admin.makeLawyer}</button>
        </form>
        <div className="tablewrap">
          <table>
            <thead><tr><th>{t.auth.name}</th><th>{t.admin.email}</th><th>{t.lawyer.license}</th><th>{t.lawyer.firm}</th><th /></tr></thead>
            <tbody>
              {lawyers.length === 0 && <tr><td colSpan={5} className="muted">{t.admin.none}</td></tr>}
              {lawyers.map((l) => (
                <tr key={l.id}>
                  <td>{l.name ?? "—"}</td>
                  <td dir="ltr" style={{ textAlign: "start" }}>{l.email ?? l.phone}</td>
                  <td>{l.lawyerProfile?.licenseNo ?? "—"}</td>
                  <td>{l.lawyerProfile?.firm ?? "—"}</td>
                  <td>
                    {l.lawyerProfile?.verifiedAt ? (
                      <span className="pill">{t.admin.verified}</span>
                    ) : (
                      <form action={verifyLawyer.bind(null, l.id)}>
                        <button className="btn small" disabled={!l.lawyerProfile?.licenseNo}>{t.admin.verify}</button>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card stack visits">
        <h2>{t.visits.title}</h2>
        <div className="stat-row">
          {[
            [t.visits.today, visits.todayVisitors, visits.todayViews],
            [t.visits.week, visits.week, null],
            [t.visits.month, visits.month, null],
            [t.visits.total, visits.total, visits.totalViews],
          ].map(([label, n, views]) => (
            <div key={label as string} className="stat">
              <span className="muted">{label}</span>
              <b className="num">{localNum(n as number, locale)}</b>
              <span className="muted num" style={{ fontSize: 13 }}>
                {t.visits.visitors}{views !== null ? ` · ${localNum(views as number, locale)} ${t.visits.views}` : ""}
              </span>
            </div>
          ))}
        </div>
        <div className="cols">
          <div>
            <h3 style={{ margin: "0 0 8px" }}>{t.visits.daily}</h3>
            <div className="bars" role="img" aria-label={t.visits.daily}>
              {visits.daily.map((d) => (
                <div key={d.day} title={`${d.day}: ${d.views}`} className="bar">
                  <i style={{ height: `${Math.round((d.views / maxDay) * 100)}%` }} />
                  <span className="num">{d.day.slice(8)}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 style={{ margin: "0 0 8px" }}>{t.visits.pages}</h3>
            {visits.pages.length === 0 ? <p className="muted" style={{ margin: 0 }}>{t.admin.none}</p> : (
              <ul className="list">
                {visits.pages.map((p) => (
                  <li key={p.path} className="inline" style={{ justifyContent: "space-between" }}>
                    <span dir="ltr">{p.path}</span><span className="muted num">{localNum(p.views, locale)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      <section className="card inline" style={{ justifyContent: "space-between" }}>
        <div>
          <h2>{t.inbox.title}</h2>
          <p className="muted num" style={{ margin: "4px 0 0" }}>
            {t.inbox.results(localNum(caseCount, locale))} · {t.inbox.waiting(localNum(waiting, locale))}
          </p>
        </div>
        <Link href="/inbox" className="btn">{t.inbox.open}</Link>
      </section>

      <section className="card stack">
        <h2>{t.admin.reviews}</h2>
        <div className="tablewrap">
          <table>
            <thead><tr><th>{t.reviews.rating}</th><th>{t.reviews.comment}</th><th>{t.auth.name}</th><th>{t.cases.lawyer}</th><th /></tr></thead>
            <tbody>
              {reviews.length === 0 && <tr><td colSpan={5} className="muted">{t.admin.none}</td></tr>}
              {reviews.map((r) => (
                <tr key={r.id}>
                  <td><Stars value={r.rating} label={t.reviews.stars(r.rating)} /></td>
                  <td style={{ maxWidth: 320 }}>{r.comment ?? "—"}</td>
                  <td>{who(r.author)}</td>
                  <td>{who(r.lawyer)}</td>
                  <td>
                    <form action={setReviewApproved.bind(null, r.id, !r.approvedAt)}>
                      <button className={`btn small ${r.approvedAt ? "ghost" : ""}`}>{r.approvedAt ? t.reviews.hide : t.reviews.approve}</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card stack">
        <h2>{t.gallery.title}</h2>
        <MediaForm locale={locale} direct={directUploads()} />
        {media.length > 0 && (
          <ul className="gallery-grid admin">
            {media.map((m) => (
              <li key={m.id} className="card">
                {m.kind === "video" ? (
                  <video src={`/api/media/${m.id}`} controls preload="metadata" playsInline />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={`/api/media/${m.id}`} alt={m.caption ?? ""} loading="lazy" />
                )}
                {m.caption && <p>{m.caption}</p>}
                <form action={removeMedia.bind(null, m.id)}><button className="btn small ghost">{t.gallery.remove}</button></form>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card stack">
        <h2>{t.info.inbox}</h2>
        <div className="tablewrap">
          <table>
            <thead><tr><th>{t.info.kind}</th><th>{t.info.name}</th><th>{t.info.email}</th><th>{t.info.message}</th><th /></tr></thead>
            <tbody>
              {inbox.length === 0 && <tr><td colSpan={5} className="muted">{t.admin.none}</td></tr>}
              {inbox.map((m) => (
                <tr key={m.id}>
                  <td><span className={`pill ${m.kind === "complaint" ? "closed" : ""}`}>{m.kind === "complaint" ? t.info.complaint : m.kind === "suggestion" ? t.info.suggestion : t.info.contact}</span></td>
                  <td>{m.name}</td>
                  <td dir="ltr" style={{ textAlign: "start" }}><a href={`mailto:${m.email}`}>{m.email}</a></td>
                  <td style={{ whiteSpace: "pre-wrap", maxWidth: 420 }}>{m.body}</td>
                  <td className="muted num" style={{ fontSize: 13 }}>{formatDate(m.createdAt, locale)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
