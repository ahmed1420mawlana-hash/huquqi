import Link from "next/link";
import { localNum } from "@huquqi/core";
import { getT } from "@/lib/locale";

export default async function How() {
  const { locale, t } = await getT();
  return (
    <div className="wrap stack narrow">
      <h1 className="page-title">{t.info.how}</h1>
      <ol className="steps">
        {t.info.howSteps.map((s, i) => (
          <li key={s.title} className="card">
            <b className="num">{localNum(i + 1, locale)}</b>
            <div><h2>{s.title}</h2><p className="muted" style={{ margin: 0 }}>{s.body}</p></div>
          </li>
        ))}
      </ol>
      <div><Link href="/#start" className="btn">{t.home.cta}</Link></div>
    </div>
  );
}
