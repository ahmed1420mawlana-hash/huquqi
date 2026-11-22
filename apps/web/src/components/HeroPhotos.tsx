// Real photos of Saudi Arabia behind the home hero, crossfading with a slow zoom.
// All photos are free under the Unsplash License (no attribution required) and are served from Unsplash's CDN.
// Photographers: سيف الظاهر, Helmi Tan, Islamic Inspiration, Ibrahim Abdullah, Juned Khatri.
const PHOTOS = [
  { id: "1663900108404-a05e8bf82cda", pos: "50% 60%", by: "سيف الظاهر", place: "Riyadh" },
  { id: "1729931421786-7bbd6c7d78f6", pos: "50% 70%", by: "Helmi Tan", place: "Madinah" },
  { id: "1707386929234-4a3f2438bc77", pos: "50% 35%", by: "Islamic Inspiration", place: "Makkah" },
  { id: "1694018359679-49465b4c0d61", pos: "50% 40%", by: "Ibrahim Abdullah", place: "Riyadh" },
  { id: "1711261817080-8f064416206c", pos: "50% 55%", by: "Juned Khatri", place: "Madinah" },
];

const src = (id: string, w: number) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=70`;

export function HeroPhotos() {
  return (
    <div className="hero-photos" aria-hidden="true">
      {PHOTOS.map((p, i) => (
        <img
          key={p.id}
          src={src(p.id, 1600)}
          srcSet={`${src(p.id, 800)} 800w, ${src(p.id, 1600)} 1600w, ${src(p.id, 2400)} 2400w`}
          sizes="100vw"
          alt=""
          loading={i === 0 ? "eager" : "lazy"}
          fetchPriority={i === 0 ? "high" : "low"}
          style={{ objectPosition: p.pos, animationDelay: `${i * 7}s` }}
        />
      ))}
    </div>
  );
}
