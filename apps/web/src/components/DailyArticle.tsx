import type { Locale, Messages } from "@huquqi/core";
import { todayArticle } from "@/lib/articles";

/** "Article of the day" box on the home page. Hidden when nothing is published. */
export async function DailyArticle({ t, locale }: { t: Messages; locale: Locale }) {
  const a = await todayArticle();
  if (!a) return null;
  const text = (locale === "bn" ? a.bn : locale === "en" ? a.en : null) || a.ar;
  return (
    <section className="wrap daily-article" aria-labelledby="daily-title">
      <div className="card stack">
        <div className="inline" style={{ justifyContent: "space-between" }}>
          <h2 id="daily-title">{t.article.title}</h2>
          <span className="pill num">{a.law} · {t.article.num(a.number)}</span>
        </div>
        <p style={{ margin: 0, fontSize: 16.5, lineHeight: 1.7 }}>{text}</p>
        <p className="muted" style={{ margin: 0, fontSize: 13 }}>{t.article.note}</p>
      </div>
    </section>
  );
}
