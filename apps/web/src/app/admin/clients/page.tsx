import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { formatDate, localNum } from "@huquqi/core";
import { db } from "@/lib/db";
import { getT } from "@/lib/locale";
import { requireUser } from "@/lib/session";
import { AdminNav } from "@/components/AdminNav";

/** Admin only: every client with their case count and latest case. */
export default async function Clients({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await requireUser(["ADMIN"]);
  const { locale, t } = await getT();
  const q = ((await searchParams).q ?? "").trim().slice(0, 100);
  const where: Prisma.UserWhereInput = {
    role: "WORKER",
    ...(q ? { OR: [
      { name: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { phone: { contains: q } },
      { cases: { some: { ref: { contains: q, mode: "insensitive" } } } },
    ] } : {}),
  };
  const clients = await db.user.findMany({
    where,
    include: {
      _count: { select: { cases: true } },
      cases: { orderBy: { createdAt: "desc" }, take: 1, select: { ref: true, createdAt: true, awaitingReply: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 300,
  });

  return (
    <div className="wrap stack">
      <AdminNav active="clients" t={t} locale={locale} />
      <div>
        <h1 className="page-title">{t.staff.clients}</h1>
        <p className="muted" style={{ margin: "4px 0 0" }}>{t.staff.clientsLead}</p>
      </div>
      <form className="card inbox-filters" method="get">
        <input name="q" type="search" defaultValue={q} placeholder={t.staff.search} aria-label={t.staff.search} />
        <button className="btn small">{t.inbox.filter}</button>
      </form>
      <div className="card tablewrap" style={{ padding: 0 }}>
        <table className="inbox-table clients-table">
          <thead><tr><th>{t.auth.name}</th><th>{t.admin.email}</th><th>{t.staff.cases}</th><th>{t.staff.lastCase}</th><th>{t.staff.joined}</th></tr></thead>
          <tbody>
            {clients.length === 0 && <tr><td colSpan={5} className="muted">{t.admin.none}</td></tr>}
            {clients.map((u) => {
              const last = u.cases[0];
              return (
                <tr key={u.id} className={last?.awaitingReply ? "awaiting" : ""}>
                  <td><Link href={`/admin/clients/${u.id}`}><b>{u.name || "—"}</b></Link></td>
                  <td dir="ltr" style={{ textAlign: "start" }}>{u.email ?? u.phone ?? "—"}</td>
                  <td className="num">{localNum(u._count.cases, locale)}</td>
                  <td className="num">{last ? <>{last.ref} · {formatDate(last.createdAt, locale)}</> : "—"}</td>
                  <td className="num">{formatDate(u.createdAt, locale)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
