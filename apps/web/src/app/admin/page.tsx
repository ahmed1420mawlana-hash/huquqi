import Link from "next/link";
import { type CaseType } from "@huquqi/core";
import { db } from "@/lib/db";
import { getT } from "@/lib/locale";
import { requireUser } from "@/lib/session";
import { who } from "@/lib/who";
import { Stars } from "@/components/Stars";
import { assignLawyer, makeLawyer, setReviewApproved, verifyLawyer } from "./actions";

export default async function Admin() {
  await requireUser(["ADMIN"]);
  const { t } = await getT();
  const [lawyers, cases, reviews] = await Promise.all([
    db.user.findMany({ where: { role: "LAWYER" }, include: { lawyerProfile: true }, orderBy: { createdAt: "desc" } }),
    db.case.findMany({ include: { worker: true, lawyer: true }, orderBy: { createdAt: "desc" }, take: 200 }),
    db.review.findMany({ include: { author: true, lawyer: true }, orderBy: { createdAt: "desc" }, take: 100 }),
  ]);
  const verified = lawyers.filter((l) => l.lawyerProfile?.verifiedAt);

  return (
    <div className="wrap stack">
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

      <section className="card stack">
        <h2>{t.admin.cases}</h2>
        <div className="tablewrap">
          <table>
            <thead><tr><th>#</th><th>{t.cases.type}</th><th>{t.auth.name}</th><th>{t.status.open}</th><th>{t.cases.lawyer}</th></tr></thead>
            <tbody>
              {cases.length === 0 && <tr><td colSpan={5} className="muted">{t.admin.none}</td></tr>}
              {cases.map((c) => (
                <tr key={c.id}>
                  <td className="num"><Link href={`/cases/${c.id}`}>{c.ref}</Link></td>
                  <td>{t.caseType[c.type as CaseType]}</td>
                  <td>{who(c.worker)}</td>
                  <td><span className={`pill ${c.stage === "closed" ? "closed" : ""}`}>{c.stage === "closed" ? t.status.closed : t.status.open}</span></td>
                  <td>
                    {c.lawyer ? who(c.lawyer) : (
                      <form action={assignLawyer.bind(null, c.id)} className="inline">
                        <select name="lawyerId" aria-label={t.admin.assign} required defaultValue="">
                          <option value="" disabled>{t.admin.assign}</option>
                          {verified.map((l) => <option key={l.id} value={l.id}>{who(l)}</option>)}
                        </select>
                        <button className="btn small" disabled={!verified.length}>✓</button>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
    </div>
  );
}
