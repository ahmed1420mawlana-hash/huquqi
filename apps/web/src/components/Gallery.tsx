import type { Messages } from "@huquqi/core";
import { db } from "@/lib/db";

/** Photos and videos the admin adds; shown at the bottom of the home page when there are any. */
export async function Gallery({ t }: { t: Messages }) {
  const items = await db.mediaItem.findMany({ orderBy: { createdAt: "desc" }, take: 24 });
  if (!items.length) return null;
  return (
    <section className="wrap stack gallery" aria-labelledby="gallery-title">
      <div>
        <h2 id="gallery-title" className="page-title">{t.gallery.title}</h2>
        <p className="muted" style={{ margin: 0 }}>{t.gallery.lead}</p>
      </div>
      <ul className="gallery-grid">
        {items.map((m) => (
          <li key={m.id} className="card">
            {m.kind === "video" ? (
              <video src={`/api/media/${m.id}`} controls preload="metadata" playsInline />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={`/api/media/${m.id}`} alt={m.caption ?? ""} loading="lazy" />
            )}
            {m.caption && <p>{m.caption}</p>}
          </li>
        ))}
      </ul>
    </section>
  );
}
