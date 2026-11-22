import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDate, localNum, type CaseType } from "@huquqi/core";
import { db } from "@/lib/db";
import { getT } from "@/lib/locale";
import { requireUser } from "@/lib/session";
import { who } from "@/lib/who";
import { AdminNav } from "@/components/AdminNav";

/** Admin only: one client and all of their cases. */
export default async function Client({ params }: { params: Promise<{ id: string }> }) {
  await requireUser(["ADMIN"]);
  const { locale, t } = await getT();
  const { id } = await params;
  const u = await db.user.findUnique({
    where: { id },
    include: {
      cases: {
        include: { lawyer: true, _count: { select: { documents: true } } },
        orderBy: [{ awaitingReply: "desc" }, { lastActivityAt: "desc" }],
      },
    },
  });
  if (!u) notFound();

  return (
    <div className="wrap stack">
      <AdminNav active="clients" t={t} locale={locale} />
      <Link href="/admin/clients" className="muted">← {t.staff.clients}</Link>
      <section className="card stack">
        <h1 className="page-title">{u.name || "—"}</h1>
        <dl className="kv">
          <dt>{t.admin.email}</dt><dd dir="ltr" style={{ textAlign: "start" }}>{u.email ?? "—"}</dd>
          <dt>{t.admin.phone}</dt><dd dir="ltr" style={{ textAlign: "start" }}>{u.phone ?? "—"}</dd>
          <dt>{t.staff.joined}</dt><dd className="num">{formatDate(u.createdAt, locale)}</dd>
          <dt>{t.staff.cases}</dt><dd className="num">{localNum(u.cases.length, locale)}</dd>
        </dl>
      </section>
      <section className="card stack">
        <h2>{t.staff.cases}</h2>
        {u.cases.length === 0 ? <p className="muted" style={{ margin: 0 }}>{t.staff.noCases}</p> : (
          <ul className="list">
            {u.cases.map((c) => (
              <li key={c.id}>
                <Link href={`/cases/${c.id}`} className="item">
                  <span>
                    <b>{t.caseType[c.type as CaseType]}</b>
                    <span className="muted num" style={{ fontSize: 14 }}>
                      {c.ref} · {formatDate(c.createdAt, locale)} · {c.lawyer ? who(c.lawyer) : t.cases.noLawyer}
                    </span>
                  </span>
                  <span className="inline" style={{ gap: 6 }}>
                    {c.awaitingReply && <span className="pill new">{t.inbox.newReply}</span>}
                    <span className={`pill ${c.stage === "closed" ? "closed" : ""}`}>{c.stage === "closed" ? t.status.closed : t.status.open}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
