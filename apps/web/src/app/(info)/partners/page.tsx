import Link from "next/link";
import { getT } from "@/lib/locale";

export default async function Partners() {
  const { t } = await getT();
  return (
    <div className="wrap stack narrow">
      <h1 className="page-title">{t.info.partners}</h1>
      <p className="muted" style={{ margin: 0 }}>{t.info.partnersLead}</p>
      <ul className="info-list">{t.info.partnersBody.map((p) => <li key={p} className="card">{p}</li>)}</ul>
      <div><Link href="/contact" className="btn ghost">{t.info.becomePartner}</Link></div>
    </div>
  );
}
