"use client";
import { useActionState, useEffect, useRef } from "react";
import { messages, type Locale, type Stage } from "@huquqi/core";
import { postMessage, uploadDocument, type FormState } from "../actions";

export function MessageForm({
  caseId, locale, stages, label, hint,
}: { caseId: string; locale: Locale; stages: Stage[]; label: string; hint?: string }) {
  const t = messages[locale];
  const [state, action, pending] = useActionState<FormState, FormData>(postMessage.bind(null, caseId), undefined);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => { if (state && !state.error) ref.current?.reset(); }, [state]);
  return (
    <form ref={ref} action={action} className="stack" style={{ gap: 10 }}>
      <label className="f" htmlFor="msg-body">
        {label}
        {hint && <span className="hint">{hint}</span>}
        <textarea id="msg-body" name="body" required />
      </label>
      {stages.length > 0 && (
        <label className="f" htmlFor="msg-stage">
          {t.lawyer.moveTo}
          <select id="msg-stage" name="stage" defaultValue="">
            <option value="">—</option>
            {stages.map((s) => <option key={s} value={s}>{t.stage[s]}</option>)}
          </select>
        </label>
      )}
      {state?.error && <p className="err" role="alert">{t.common.required}</p>}
      <div><button className="btn small" disabled={pending}>{stages.length ? t.lawyer.post : t.cases.send}</button></div>
    </form>
  );
}

export function UploadForm({ caseId, locale }: { caseId: string; locale: Locale }) {
  const t = messages[locale];
  const [state, action, pending] = useActionState<FormState, FormData>(uploadDocument.bind(null, caseId), undefined);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => { if (state && !state.error) ref.current?.reset(); }, [state]);
  return (
    <form ref={ref} action={action} className="stack" style={{ gap: 8 }}>
      <label className="f" htmlFor="doc-file">
        <span className="hint">{t.cases.uploadHint}</span>
        <input id="doc-file" name="file" type="file" accept="application/pdf,image/jpeg,image/png,image/webp,image/heic" required />
      </label>
      {state?.error && <p className="err" role="alert">{t.cases.uploadHint}</p>}
      <div><button className="btn small ghost" disabled={pending}>{t.cases.upload}</button></div>
    </form>
  );
}
