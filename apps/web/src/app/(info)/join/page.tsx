import Link from "next/link";
import { getT } from "@/lib/locale";

export default async function JoinLawyer() {
  const { t } = await getT();
  return (
    <div className="wrap stack narrow">
      <h1 className="page-title">{t.info.joinLawyer}</h1>
      {t.info.joinLawyerBody.map((p) => <p key={p} style={{ margin: 0 }}>{p}</p>)}
      <div><Link href="/contact" className="btn">{t.info.joinLawyerCta}</Link></div>
    </div>
  );
}
