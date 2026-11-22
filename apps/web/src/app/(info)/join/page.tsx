import Link from "next/link";
import { db } from "@/lib/db";
import { getT } from "@/lib/locale";
import { currentUser } from "@/lib/session";
import { LawyerApplyForm } from "@/components/LawyerApplyForm";

export default async function JoinLawyer() {
  const { locale, t } = await getT();
  const user = await currentUser();
  const last = user ? await db.lawyerApplication.findFirst({ where: { userId: user.id, kind: "lawyer" }, orderBy: { createdAt: "desc" } }) : null;
  const status = last && (last.status === "pending" ? t.staff.pendingLabel : last.status === "approved" ? t.staff.approved : t.staff.rejected);
  return (
    <div className="wrap stack narrow">
      <h1 className="page-title">{t.info.joinLawyer}</h1>
      {t.info.joinLawyerBody.map((p) => <p key={p} style={{ margin: 0 }}>{p}</p>)}
      <p style={{ margin: 0 }}><Link href="/join/provider">{t.info.joinProvider}</Link></p>
      {!user ? (
        <div><Link href="/login?next=/join" className="btn">{t.staff.applyLogin}</Link></div>
      ) : user.role === "LAWYER" ? (
        <p className="okmsg" style={{ margin: 0 }}>{t.staff.alreadyLawyer}</p>
      ) : (
        <>
          {last && <p className="okmsg" style={{ margin: 0 }}>{t.staff.applyStatus}: <b>{status}</b></p>}
          {last?.status !== "approved" && <LawyerApplyForm locale={locale} name={user.name ?? ""} />}
        </>
      )}
    </div>
  );
}
