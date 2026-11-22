import { localNum, type Locale, type Messages } from "@huquqi/core";
import { setReplied } from "@/app/admin/actions";

/** Green tick the admin sets by hand once the client has been answered. Unanswered cases show their age. */
export function RepliedToggle({ c, t, locale, admin }: { c: { id: string; replied: boolean; createdAt: Date }; t: Messages; locale: Locale; admin: boolean }) {
  const days = Math.floor((Date.now() - c.createdAt.getTime()) / 86400_000);
  const age = !c.replied && (
    days > 10 ? <span className="pill late">{t.inbox.overdue}</span>
    : days >= 3 ? <span className="pill warn num">{t.inbox.days(localNum(days, locale))}</span>
    : null
  );
  if (!admin) {
    return <span className="replied-cell">{c.replied ? <span className="tick on" aria-label={t.inbox.replied}>✓</span> : <span className="muted">{t.inbox.notReplied}</span>}{age}</span>;
  }
  return (
    <form action={setReplied.bind(null, c.id, !c.replied)} className="replied-cell">
      <button
        className={`tick ${c.replied ? "on" : ""}`}
        title={c.replied ? t.inbox.unmarkReplied : t.inbox.markReplied}
        aria-label={c.replied ? `${t.inbox.replied} · ${t.inbox.unmarkReplied}` : t.inbox.markReplied}
        aria-pressed={c.replied}
      >✓</button>
      {age}
    </form>
  );
}
