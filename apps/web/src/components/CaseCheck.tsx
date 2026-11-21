"use client";
import { useMemo, useState } from "react";
import {
  CASE_TYPES, bankStatus, formatDate, isLabourType, labourDeadline, localNum, messages,
  type CaseType, type Locale,
} from "@huquqi/core";

function monthsAgo(n: number) {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  return d.toISOString().slice(0, 10);
}

/** Free eligibility check. Runs entirely in the browser; nothing is sent. */
export function CaseCheck({ locale }: { locale: Locale }) {
  const t = messages[locale];
  const [issues, setIssues] = useState<Set<CaseType>>(new Set(["salary", "eosb", "bank"]));
  const [exit, setExit] = useState(monthsAgo(4));
  const [stopped, setStopped] = useState(false);

  const results = useMemo(() => {
    const out: { tone: string; title: string; tag?: string; body: string; meter?: number }[] = [];
    const exitDate = exit ? new Date(exit + "T00:00:00Z") : null;
    if (exitDate && [...issues].some(isLabourType)) {
      const r = labourDeadline(exitDate);
      out.push(
        r.expired
          ? { tone: "warn", title: t.check.labourLateTitle, body: t.check.labourLateBody }
          : {
              tone: "alert",
              title: t.check.labourTitle,
              tag: t.check.daysLeft(localNum(r.daysLeft, locale)),
              body: t.check.labourBody(formatDate(r.deadline, locale)),
              meter: Math.max(0.03, r.used),
            },
      );
    }
    if (issues.has("bank")) {
      const s = exitDate ? bankStatus(exitDate) : "frozen";
      out.push({ tone: "ok", title: t.check.bankTitle, tag: t.bankStatus[s], body: t.check.bankBody });
    }
    if (stopped && [...issues].some(isLabourType)) {
      out.push({ tone: "warn", title: t.check.insTitle, body: t.check.insBody });
    }
    if (issues.has("court") || issues.has("accident") || issues.has("property")) {
      out.push({ tone: "", title: t.check.otherTitle, body: t.check.otherBody });
    }
    return out;
  }, [issues, exit, stopped, locale, t]);

  function toggle(k: CaseType) {
    setIssues((prev) => {
      const n = new Set(prev);
      if (n.has(k)) n.delete(k);
      else n.add(k);
      return n;
    });
  }

  return (
    <div className="card stack">
      <div>
        <h2>{t.home.checkTitle}</h2>
        <p className="muted" style={{ margin: "4px 0 0", fontSize: 14 }}>{t.home.checkLead}</p>
      </div>
      <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
        <legend style={{ fontWeight: 600, fontSize: 14.5, marginBottom: 8 }}>{t.check.issues}</legend>
        <div className="chips">
          {CASE_TYPES.map((k) => (
            <label className="chip" key={k}>
              <input type="checkbox" checked={issues.has(k)} onChange={() => toggle(k)} />
              <span>{t.caseType[k]}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <label className="f" htmlFor="check-exit">
        {t.check.exitDate}
        <input id="check-exit" type="date" value={exit} onChange={(e) => setExit(e.target.value)} />
      </label>
      <label className="inline" htmlFor="check-stopped" style={{ fontSize: 14.5 }}>
        <input id="check-stopped" type="checkbox" checked={stopped} onChange={(e) => setStopped(e.target.checked)} />
        {t.check.stopped}
      </label>
      <div className="stack" style={{ gap: 10 }} aria-live="polite">
        {issues.size === 0 && <div className="res"><p>{t.check.empty}</p></div>}
        {results.map((r, i) => (
          <div key={i} className={`res ${r.tone}`}>
            <h3>
              {r.title}
              {r.tag && <span className="tag num">{r.tag}</span>}
            </h3>
            <p>{r.body}</p>
            {r.meter !== undefined && (
              <div className="meter" aria-hidden="true"><i style={{ width: `${r.meter * 100}%` }} /></div>
            )}
          </div>
        ))}
      </div>
      <p className="hint" style={{ margin: 0 }}>{t.check.disclaimer}</p>
    </div>
  );
}
