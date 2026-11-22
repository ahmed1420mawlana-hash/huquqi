import Link from "next/link";
import { db } from "@/lib/db";
import { getT } from "@/lib/locale";
import { currentUser } from "@/lib/session";
import { LawyerApplyForm } from "@/components/LawyerApplyForm";

/** Join as a service provider: legal consultant, certified translator, paperwork agent, specialist. */
export default async function JoinProvider() {
  const { locale, t } = await getT();
  const user = await currentUser();
  const last = user ? await db.lawyerApplication.findFirst({ where: { userId: user.id, kind: "provider" }, orderBy: { createdAt: "desc" } }) : null;
  const status = last && (last.status === "pending" ? t.staff.pendingLabel : last.status === "approved" ? t.staff.approved : t.staff.rejected);
  return (
    <div className="wrap stack narrow">
      <h1 className="page-title">{t.info.joinProvider}</h1>
      {t.info.joinProviderBody.map((p) => <p key={p} style={{ margin: 0 }}>{p}</p>)}
      <p style={{ margin: 0 }}><Link href="/join">{t.info.joinLawyer}</Link></p>
      {!user ? (
        <div><Link href="/login?next=/join/provider" className="btn">{t.staff.applyLogin}</Link></div>
      ) : (
        <>
          {last && <p className="okmsg" style={{ margin: 0 }}>{t.staff.applyStatus}: <b>{status}</b></p>}
          {last?.status !== "approved" && <LawyerApplyForm locale={locale} name={user.name ?? ""} kind="provider" />}
        </>
      )}
    </div>
  );
}
