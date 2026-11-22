import { getT } from "@/lib/locale";

export default async function Faq() {
  const { t } = await getT();
  return (
    <div className="wrap stack narrow">
      <h1 className="page-title">{t.info.faq}</h1>
      {t.info.faqItems.map((f) => (
        <details key={f.q} className="card faq">
          <summary>{f.q}</summary>
          <p style={{ margin: "10px 0 0" }}>{f.a}</p>
        </details>
      ))}
    </div>
  );
}
