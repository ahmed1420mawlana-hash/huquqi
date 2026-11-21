import Link from "next/link";
import { formatDate, type CaseType, type Stage } from "@huquqi/core";
import { db } from "@/lib/db";
import { isVerifiedLawyer } from "@/lib/access";
import { getT } from "@/lib/locale";
import { requireUser } from "@/lib/session";
import { saveLawyerProfile } from "./actions";

type Row = { id: string; ref: string; type: string; stage: string; createdAt: Date; worker: { name: string | null; phone: string } };

function CaseList({ rows, t, locale, empty }: { rows: Row[]; t: Awaited<ReturnType<typeof getT>>["t"]; locale: Awaited<ReturnType<typeof getT>>["locale"]; empty: string }) {
  if (!rows.length) return <p className="muted" style={{ margin: 0 }}>{empty}</p>;
  return (
    <ul className="list">
      {rows.map((c) => (
        <li key={c.id}>
          <Link href={`/cases/${c.id}`} className="item">
            <span>
              <b>{t.caseType[c.type as CaseType]}</b>
              <span className="muted num" style={{ fontSize: 14 }}>{c.ref} · {c.worker.name ?? c.worker.phone} · {formatDate(c.createdAt, locale)}</span>
            </span>
            <span className={`pill ${c.stage === "closed" ? "closed" : ""}`}>{t.stage[c.stage as Stage]}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default async function LawyerPanel() {
  const user = await requireUser(["LAWYER", "ADMIN"]);
  const { locale, t } = await getT();
  const verified = isVerifiedLawyer(user);
  const include = { worker: { select: { name: true, phone: true } } };
  const [mine, open] = await Promise.all([
    db.case.findMany({ where: { lawyerId: user.id }, include, orderBy: { updatedAt: "desc" } }),
    verified || user.role === "ADMIN"
      ? db.case.findMany({ where: { lawyerId: null }, include, orderBy: { createdAt: "asc" } })
      : Promise.resolve([]),
  ]);

  return (
    <div className="wrap stack">
      <h1 className="page-title">{t.lawyer.title}</h1>
      {user.role === "LAWYER" && (
        <form action={saveLawyerProfile} className="card stack">
          {!verified && <p className="devcode" style={{ margin: 0 }}>{t.lawyer.notVerified}</p>}
          <div className="row2">
            <label className="f" htmlFor="licenseNo">{t.lawyer.license}<input id="licenseNo" name="licenseNo" type="text" defaultValue={user.lawyerProfile?.licenseNo ?? ""} dir="ltr" /></label>
            <label className="f" htmlFor="firm">{t.lawyer.firm}<input id="firm" name="firm" type="text" defaultValue={user.lawyerProfile?.firm ?? ""} /></label>
          </div>
          <div><button className="btn small ghost">{t.lawyer.saveProfile}</button></div>
        </form>
      )}
      <div className="cols">
        <section className="card stack">
          <h2>{t.lawyer.assigned}</h2>
          <CaseList rows={mine} t={t} locale={locale} empty={t.admin.none} />
        </section>
        <section className="card stack">
          <h2>{t.lawyer.unassigned}</h2>
          <CaseList rows={open} t={t} locale={locale} empty={verified || user.role === "ADMIN" ? t.admin.none : t.lawyer.notVerified} />
        </section>
      </div>
    </div>
  );
}
