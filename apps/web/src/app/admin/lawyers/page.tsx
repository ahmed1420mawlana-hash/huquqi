import { formatDate, localNum } from "@huquqi/core";
import { db } from "@/lib/db";
import { getT } from "@/lib/locale";
import { requireUser } from "@/lib/session";
import { AdminNav } from "@/components/AdminNav";
import { decideApplication } from "../actions";

/** Admin only: lawyers asking to join, with approve and reject. */
export default async function LawyerApplications() {
  await requireUser(["ADMIN"]);
  const { locale, t } = await getT();
  const apps = await db.lawyerApplication.findMany({ include: { user: true }, orderBy: { createdAt: "desc" }, take: 300 });
  const pending = apps.filter((a) => a.status === "pending");
  const done = apps.filter((a) => a.status !== "pending");

  const Card = ({ a }: { a: (typeof apps)[number] }) => (
    <li className="card stack app-card">
      <div className="inline" style={{ justifyContent: "space-between" }}>
        <b>{a.name}</b>
        <span className={`pill ${a.status === "pending" ? "new" : a.status === "rejected" ? "closed" : ""}`}>
          {a.status === "pending" ? t.staff.pendingLabel : a.status === "approved" ? t.staff.approved : t.staff.rejected}
        </span>
      </div>
      <dl className="kv">
        <dt>{t.lawyer.license}</dt><dd dir="ltr" style={{ textAlign: "start" }}>{a.licenseNo}</dd>
        {a.firm && <><dt>{t.lawyer.firm}</dt><dd>{a.firm}</dd></>}
        {a.city && <><dt>{t.staff.city}</dt><dd>{a.city}</dd></>}
        {a.years != null && <><dt>{t.staff.years}</dt><dd className="num">{localNum(a.years, locale)}</dd></>}
        <dt>{t.staff.phone}</dt><dd dir="ltr" style={{ textAlign: "start" }}>{a.phone}</dd>
        <dt>{t.admin.email}</dt><dd dir="ltr" style={{ textAlign: "start" }}>{a.user.email ?? "—"}</dd>
        <dt>{t.staff.joined}</dt><dd className="num">{formatDate(a.createdAt, locale)}</dd>
      </dl>
      {a.about && <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{a.about}</p>}
      {a.status === "pending" && (
        <div className="inline" style={{ gap: 8 }}>
          <form action={decideApplication.bind(null, a.id, true)}><button className="btn small">{t.staff.approve}</button></form>
          <form action={decideApplication.bind(null, a.id, false)}><button className="btn small ghost">{t.staff.reject}</button></form>
        </div>
      )}
    </li>
  );

  return (
    <div className="wrap stack">
      <AdminNav active="lawyers" t={t} locale={locale} />
      <div>
        <h1 className="page-title">{t.staff.apps}</h1>
        <p className="muted" style={{ margin: "4px 0 0" }}>{t.staff.appsLead}</p>
      </div>
      {pending.length === 0 ? <p className="card muted" style={{ margin: 0 }}>{t.admin.none}</p> : (
        <ul className="apps">{pending.map((a) => <Card key={a.id} a={a} />)}</ul>
      )}
      {done.length > 0 && (
        <>
          <h2>{t.staff.history}</h2>
          <ul className="apps">{done.map((a) => <Card key={a.id} a={a} />)}</ul>
        </>
      )}
    </div>
  );
}
