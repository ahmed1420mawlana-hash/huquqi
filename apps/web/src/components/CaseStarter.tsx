"use client";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  CASE_TYPES, bankStatus, formatDate, isLabourType, labourDeadline, localNum, messages, type CaseType, type Locale,
} from "@huquqi/core";
import { ACCEPT } from "@/lib/documents";
import { uploadFiles } from "@/lib/upload-client";
import { createCase } from "@/app/cases/actions";

const DRAFT = "hq_case_draft";
type Draft = { type: CaseType; description: string; requests: string; exitDate: string };

function readDraft(): Draft | null {
  try {
    const d = JSON.parse(sessionStorage.getItem(DRAFT) ?? "null");
    return d && (CASE_TYPES as readonly string[]).includes(d.type) ? d : null;
  } catch {
    return null;
  }
}

/**
 * The list of case types. Clicking one opens three empty boxes right under it:
 * the facts, the requests and the documents. Visitors who are not logged in keep what they
 * typed while they log in, and land back here with it filled in.
 */
export function CaseStarter({
  locale, direct, loggedIn, initialType,
}: { locale: Locale; direct: boolean; loggedIn: boolean; initialType?: CaseType }) {
  const t = messages[locale];
  const router = useRouter();
  const [open, setOpen] = useState<CaseType | null>(initialType ?? null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [exit, setExit] = useState("");

  useEffect(() => {
    if (!loggedIn) return;
    const d = readDraft();
    if (d) {
      setDraft(d);
      setOpen(d.type);
      setExit(d.exitDate ?? "");
    }
  }, [loggedIn]);

  async function onSubmit(e: FormEvent<HTMLFormElement>, type: CaseType) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("type", type);
    if (!loggedIn) {
      try {
        sessionStorage.setItem(DRAFT, JSON.stringify({
          type, description: fd.get("description"), requests: fd.get("requests"), exitDate: fd.get("exitDate") ?? "",
        }));
      } catch {}
      router.push("/login?next=/cases/new");
      return;
    }
    setPending(true);
    setError(null);
    const files = fd.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
    fd.delete("files");
    const r = await createCase(undefined, fd);
    if (!r?.id) {
      setPending(false);
      setError(t.common.required);
      return;
    }
    try { sessionStorage.removeItem(DRAFT); } catch {}
    let failed = 0;
    if (files.length) {
      setProgress({ done: 0, total: files.length });
      failed = await uploadFiles(r.id, files, direct, (done) => setProgress({ done, total: files.length }));
    }
    router.push(`/cases/${r.id}?created=1${failed ? "&upload=failed" : ""}`);
  }

  return (
    <ul className="starter">
      {CASE_TYPES.map((type) => {
        const isOpen = open === type;
        const d = draft?.type === type ? draft : null;
        return (
          <li key={type} className={isOpen ? "open" : ""}>
            <button
              type="button"
              className="starter-head"
              aria-expanded={isOpen}
              aria-controls={`case-${type}`}
              data-type={type}
              onClick={() => { setOpen(isOpen ? null : type); setError(null); setExit(d?.exitDate ?? ""); }}
            >
              <span>{t.caseType[type]}</span>
              <span aria-hidden="true" className="chev">{isOpen ? "−" : "+"}</span>
            </button>
            {isOpen && (
              <form id={`case-${type}`} className="box3" onSubmit={(e) => onSubmit(e, type)}>
                {d && <p className="okmsg" style={{ margin: 0 }}>{t.cases.reattach}</p>}
                <TypeInfo type={type} exit={exit} locale={locale} />
                <label className="f" htmlFor="description">
                  <span className="box-title"><b className="num">{localNum(1, locale)}</b>{t.cases.description}</span>
                  <span className="hint">{t.cases.descriptionHint}</span>
                  <textarea id="description" name="description" required defaultValue={d?.description ?? ""} />
                </label>
                <label className="f" htmlFor="requests">
                  <span className="box-title"><b className="num">{localNum(2, locale)}</b>{t.cases.requests}</span>
                  <span className="hint">{t.cases.requestsHint}</span>
                  <textarea id="requests" name="requests" required defaultValue={d?.requests ?? ""} />
                </label>
                <label className="f" htmlFor="files">
                  <span className="box-title"><b className="num">{localNum(3, locale)}</b>{t.cases.documents}</span>
                  <span className="hint">{t.cases.uploadHint}</span>
                  <input id="files" name="files" type="file" multiple accept={ACCEPT} />
                </label>
                {(isLabourType(type) || type === "bank") && (
                  <label className="f small" htmlFor="exitDate">
                    {t.cases.exitDate}
                    <input id="exitDate" name="exitDate" type="date" value={exit} onChange={(e) => setExit(e.target.value)} />
                  </label>
                )}
                {error && <p className="err" role="alert">{error}</p>}
                {progress && (
                  <p className="hint num" role="status" style={{ margin: 0 }}>
                    {t.cases.uploading(localNum(progress.done, locale), localNum(progress.total, locale))}
                  </p>
                )}
                <div><button className="btn" disabled={pending}>{loggedIn ? t.cases.submit : t.cases.loginToSend}</button></div>
              </form>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/** What applies to this type of case. Labour details stay folded inside the labour options. */
function TypeInfo({ type, exit, locale }: { type: CaseType; exit: string; locale: Locale }) {
  const t = messages[locale];
  const exitDate = /^\d{4}-\d{2}-\d{2}$/.test(exit) ? new Date(exit + "T00:00:00Z") : null;
  if (isLabourType(type)) {
    const r = exitDate ? labourDeadline(exitDate) : null;
    return (
      <details className="more">
        <summary>{t.labour.more}</summary>
        <div className="stack" style={{ gap: 10, marginTop: 10 }}>
          {r ? (
            <div className={`res ${r.expired ? "warn" : "alert"}`}>
              <h3>
                {r.expired ? t.check.labourLateTitle : t.check.labourTitle}
                {!r.expired && <span className="tag num">{t.check.daysLeft(localNum(r.daysLeft, locale))}</span>}
              </h3>
              <p>{r.expired ? t.check.labourLateBody : t.check.labourBody(formatDate(r.deadline, locale))}</p>
              {!r.expired && <div className="meter" aria-hidden="true"><i style={{ width: `${Math.max(0.03, r.used) * 100}%` }} /></div>}
            </div>
          ) : (
            <div className="res"><h3>{t.check.labourTitle}</h3><p>{t.cases.exitDate}</p></div>
          )}
          <div className="res warn"><h3>{t.check.insTitle}</h3><p>{t.check.insBody}</p></div>
        </div>
      </details>
    );
  }
  if (type === "realestate") {
    return (
      <div className="res realestate">
        <h3>{t.check.reTitle}</h3>
        <p>{t.check.reLead}</p>
        <dl className="rules">
          {t.check.reRules.map((r) => (
            <div key={r.h}><dt>{r.h}</dt><dd>{r.p}</dd></div>
          ))}
        </dl>
        <p className="muted" style={{ fontSize: 13 }}>{t.check.reNote}</p>
      </div>
    );
  }
  const info =
    type === "bank" ? { title: t.check.bankTitle, body: t.check.bankBody, tag: t.bankStatus[exitDate ? bankStatus(exitDate) : "frozen"] }
    : type === "translation" ? { title: t.check.transTitle, body: t.check.transBody }
    : type === "hajj" ? { title: t.check.hajjTitle, body: t.check.hajjBody }
    : type === "commercial" ? { title: t.check.comTitle, body: t.check.comBody }
    : type === "poa" ? { title: t.check.poaTitle, body: t.check.poaBody }
    : type === "invest" ? { title: t.check.invTitle, body: t.check.invBody }
    : type === "general" ? { title: t.check.genTitle, body: t.check.genBody }
    : { title: t.check.otherTitle, body: t.check.otherBody };
  return (
    <div className={`res ${type === "bank" ? "ok" : ""}`}>
      <h3>{info.title}{"tag" in info && info.tag && exitDate && <span className="tag">{info.tag}</span>}</h3>
      <p>{info.body}</p>
    </div>
  );
}
