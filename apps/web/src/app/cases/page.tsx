import Link from "next/link";
import { formatDate, type CaseType } from "@huquqi/core";
import { db } from "@/lib/db";
import { getT } from "@/lib/locale";
import { requireUser } from "@/lib/session";

export default async function MyCases() {
  const user = await requireUser(["WORKER", "ADMIN"]);
  const { locale, t } = await getT();
  const cases = await db.case.findMany({ where: { workerId: user.id }, orderBy: { updatedAt: "desc" } });
  return (
    <div className="wrap stack">
      <div className="inline" style={{ justifyContent: "space-between" }}>
        <h1 className="page-title">{t.cases.title}</h1>
        <Link href="/cases/new" className="btn">{t.cases.open}</Link>
      </div>
      {cases.length === 0 ? (
        <div className="card"><p className="muted" style={{ margin: 0 }}>{t.cases.none}</p></div>
      ) : (
        <ul className="list">
          {cases.map((c) => (
            <li key={c.id}>
              <Link href={`/cases/${c.id}`} className="item">
                <span>
                  <b>{t.caseType[c.type as CaseType]}</b>
                  <span className="muted num" style={{ fontSize: 14 }}>{c.ref} · {formatDate(c.createdAt, locale)}</span>
                </span>
                <span className={`pill ${c.stage === "closed" ? "closed" : ""}`}>{c.stage === "closed" ? t.status.closed : t.status.open}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
