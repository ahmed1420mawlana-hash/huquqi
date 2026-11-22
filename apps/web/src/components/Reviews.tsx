import { localNum, type Locale, type Messages } from "@huquqi/core";
import { db } from "@/lib/db";
import { Stars } from "./Stars";

/** Public reviews box: only reviews an admin has approved. Shows an empty state when there are none. */
export async function Reviews({ t, locale }: { t: Messages; locale: Locale }) {
  const [agg, latest] = await Promise.all([
    db.review.aggregate({ where: { approvedAt: { not: null } }, _avg: { rating: true }, _count: true }),
    db.review.findMany({
      where: { approvedAt: { not: null } },
      include: { author: { select: { name: true } } },
      orderBy: { approvedAt: "desc" },
      take: 6,
    }),
  ]);
  const avg = agg._avg.rating ?? 0;
  return (
    <section className="wrap stack reviews" aria-labelledby="reviews-title">
      <div className="inline" style={{ justifyContent: "space-between", alignItems: "baseline" }}>
        <div>
          <h2 id="reviews-title" className="page-title">{t.reviews.title}</h2>
          <p className="muted" style={{ margin: 0 }}>{t.reviews.lead}</p>
        </div>
        {agg._count > 0 && (
          <div className="inline">
            <Stars value={avg} label={t.reviews.stars(Math.round(avg))} />
            <span className="muted num">{t.reviews.average(localNum(Number(avg.toFixed(1)), locale), localNum(agg._count, locale))}</span>
          </div>
        )}
      </div>
      {latest.length === 0 ? (
        <div className="card"><p className="muted" style={{ margin: 0 }}>{t.reviews.empty}</p></div>
      ) : (
        <ul className="review-grid">
          {latest.map((r) => (
            <li key={r.id} className="card stack" style={{ gap: 8 }}>
              <Stars value={r.rating} label={t.reviews.stars(r.rating)} />
              {r.comment && <p style={{ margin: 0 }}>{r.comment}</p>}
              <small className="muted">{r.author.name ?? "—"}</small>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
