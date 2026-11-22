import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { CASE_TYPES, formatDate, localNum, type CaseType } from "@huquqi/core";
import { db } from "@/lib/db";
import { isVerifiedLawyer } from "@/lib/access";
import { getT } from "@/lib/locale";
import { requireUser } from "@/lib/session";
import { who } from "@/lib/who";
import { assignLawyer } from "@/app/admin/actions";

type Search = { q?: string; type?: string; status?: string; lawyer?: string; awaiting?: string };

/**
 * Case inbox for admins (all cases) and lawyers (their cases and unassigned ones).
 * Cases the client is waiting on come first, newest activity first.
 */
export default async function Inbox({ searchParams }: { searchParams: Promise<Search> }) {
  const user = await requireUser(["LAWYER", "ADMIN"]);
  const admin = user.role === "ADMIN";
  const sp = await searchParams;
  const { locale, t } = await getT();

  const q = (sp.q ?? "").trim().slice(0, 100);
  const and: Prisma.CaseWhereInput[] = [];
  if (!admin) and.push({ OR: [{ lawyerId: user.id }, ...(isVerifiedLawyer(user) ? [{ lawyerId: null }] : [])] });
  if (sp.type && (CASE_TYPES as readonly string[]).concat(["salary", "eosb", "accident", "property"]).includes(sp.type)) and.push({ type: sp.type });
  if (sp.status === "open") and.push({ stage: { not: "closed" } });
  if (sp.status === "closed") and.push({ stage: "closed" });
  if (sp.lawyer === "assigned") and.push({ lawyerId: { not: null } });
  if (sp.lawyer === "unassigned") and.push({ lawyerId: null });
  if (sp.awaiting === "1") and.push({ awaitingReply: true });
  if (q) {
    and.push({
      OR: [
        { ref: { contains: q, mode: "insensitive" } },
        { worker: { name: { contains: q, mode: "insensitive" } } },
        { worker: { email: { contains: q, mode: "insensitive" } } },
        { worker: { phone: { contains: q } } },
        { description: { contains: q, mode: "insensitive" } },
      ],
    });
  }
  const where: Prisma.CaseWhereInput = and.length ? { AND: and } : {};
  const scope: Prisma.CaseWhereInput = admin ? {} : and[0];

  const [cases, waiting, lawyers] = await Promise.all([
    db.case.findMany({
      where,
      include: { worker: true, lawyer: true, _count: { select: { documents: true } } },
      orderBy: [{ awaitingReply: "desc" }, { lastActivityAt: "desc" }],
      take: 200,
    }),
    db.case.count({ where: { AND: [scope, { awaitingReply: true }] } }),
    admin
      ? db.user.findMany({ where: { role: "LAWYER", lawyerProfile: { verifiedAt: { not: null } } }, orderBy: { name: "asc" } })
      : Promise.resolve([]),
  ]);
  const filtered = !!(q || sp.type || sp.status || sp.lawyer || sp.awaiting);

  return (
    <div className="wrap stack">
      <div className="inline" style={{ justifyContent: "space-between" }}>
        <h1 className="page-title">{t.inbox.title}</h1>
        {waiting > 0 && (
          <Link href="/inbox?awaiting=1" className="pill new num">{t.inbox.waiting(localNum(waiting, locale))}</Link>
        )}
      </div>

      <form className="card inbox-filters" method="get">
        <input name="q" type="search" defaultValue={q} placeholder={t.inbox.search} aria-label={t.inbox.search} />
        <select name="type" defaultValue={sp.type ?? ""} aria-label={t.cases.type}>
          <option value="">{t.inbox.allTypes}</option>
          {CASE_TYPES.map((k) => <option key={k} value={k}>{t.caseType[k]}</option>)}
        </select>
        <select name="status" defaultValue={sp.status ?? ""} aria-label={t.inbox.allStatus}>
          <option value="">{t.inbox.allStatus}</option>
          <option value="open">{t.status.open}</option>
          <option value="closed">{t.status.closed}</option>
        </select>
        {admin && (
          <select name="lawyer" defaultValue={sp.lawyer ?? ""} aria-label={t.inbox.anyLawyer}>
            <option value="">{t.inbox.anyLawyer}</option>
            <option value="assigned">{t.inbox.assigned}</option>
            <option value="unassigned">{t.inbox.unassigned}</option>
          </select>
        )}
        <label className="inline" style={{ fontSize: 14.5 }}>
          <input type="checkbox" name="awaiting" value="1" defaultChecked={sp.awaiting === "1"} />
          {t.inbox.awaiting}
        </label>
        <div className="inline" style={{ gap: 8 }}>
          <button className="btn small">{t.inbox.filter}</button>
          {filtered && <Link href="/inbox" className="btn small ghost">{t.inbox.clear}</Link>}
        </div>
      </form>

      <p className="muted num" style={{ margin: 0 }}>{t.inbox.results(localNum(cases.length, locale))}</p>
      <div className="card tablewrap" style={{ padding: 0 }}>
        <table className="inbox-table">
          <thead>
            <tr>
              <th>#</th><th>{t.cases.type}</th><th>{t.inbox.client}</th><th>{t.cases.lawyer}</th>
              <th>{t.inbox.lastActivity}</th><th>{t.inbox.status}</th>
            </tr>
          </thead>
          <tbody>
            {cases.length === 0 && <tr><td colSpan={6} className="muted">{t.admin.none}</td></tr>}
            {cases.map((c) => (
              <tr key={c.id} className={c.awaitingReply ? "awaiting" : ""}>
                <td className="num">
                  <Link href={`/cases/${c.id}`}>{c.ref}</Link>
                  {c.awaitingReply && <span className="pill new" style={{ marginInlineStart: 6 }}>{t.inbox.newReply}</span>}
                </td>
                <td>{t.caseType[c.type as CaseType]}</td>
                <td>
                  {who(c.worker)}
                  {c.worker.email && <div className="muted" dir="ltr" style={{ fontSize: 12.5, textAlign: "start" }}>{c.worker.email}</div>}
                </td>
                <td>
                  {c.lawyer ? who(c.lawyer) : admin ? (
                    <form action={assignLawyer.bind(null, c.id)} className="inline">
                      <select name="lawyerId" aria-label={t.admin.assign} required defaultValue="">
                        <option value="" disabled>{t.admin.assign}</option>
                        {lawyers.map((l) => <option key={l.id} value={l.id}>{who(l)}</option>)}
                      </select>
                      <button className="btn small" disabled={!lawyers.length}>✓</button>
                    </form>
                  ) : <span className="muted">{t.cases.noLawyer}</span>}
                </td>
                <td className="muted num" style={{ fontSize: 13 }}>{formatDate(c.lastActivityAt, locale)}</td>
                <td><span className={`pill ${c.stage === "closed" ? "closed" : ""}`}>{c.stage === "closed" ? t.status.closed : t.status.open}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
