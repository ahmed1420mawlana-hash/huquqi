import type { Locale, Messages } from "@huquqi/core";
import { db } from "@/lib/db";
import { directUploads } from "@/lib/storage";
import { MediaForm } from "@/app/admin/MediaForm";
import { removeMedia } from "@/app/admin/media-actions";

/**
 * Photos and videos at the bottom of the home page. Always shown; admins see the upload
 * form and a remove button right here.
 */
export async function Gallery({ t, locale, admin }: { t: Messages; locale: Locale; admin: boolean }) {
  const items = await db.mediaItem.findMany({ orderBy: { createdAt: "desc" }, take: 24 });
  return (
    <section className="wrap stack gallery" aria-labelledby="gallery-title">
      <div>
        <h2 id="gallery-title" className="page-title">{t.gallery.title}</h2>
        <p className="muted" style={{ margin: 0 }}>{t.gallery.lead}</p>
      </div>
      {admin && (
        <div className="card stack">
          <h3 style={{ margin: 0 }}>{t.gallery.add}</h3>
          <MediaForm locale={locale} direct={directUploads()} />
        </div>
      )}
      {items.length === 0 ? (
        <div className="card muted gallery-empty">{t.gallery.empty}</div>
      ) : (
        <ul className={`gallery-grid ${admin ? "admin" : ""}`}>
          {items.map((m) => (
            <li key={m.id} className="card">
              {m.kind === "video" ? (
                <video src={`/api/media/${m.id}`} controls preload="metadata" playsInline />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={`/api/media/${m.id}`} alt={m.caption ?? ""} loading="lazy" />
              )}
              {m.caption && <p>{m.caption}</p>}
              {admin && (
                <form action={removeMedia.bind(null, m.id)}><button className="btn small ghost">{t.gallery.remove}</button></form>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
