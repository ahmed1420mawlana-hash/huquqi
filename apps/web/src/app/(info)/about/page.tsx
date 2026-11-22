import Link from "next/link";
import { getT } from "@/lib/locale";
import { Marks } from "@/components/Marks";

export default async function About() {
  const { t } = await getT();
  return (
    <div className="wrap stack narrow">
      <h1 className="page-title">{t.info.about}</h1>
      <div className="about-marks"><Marks labels={t.marks} /></div>
      {t.info.aboutBody.map((p) => <p key={p} style={{ margin: 0 }}>{p}</p>)}
      <div><Link href="/how" className="btn ghost">{t.info.how}</Link></div>
    </div>
  );
}
