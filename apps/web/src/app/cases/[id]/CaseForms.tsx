"use client";
import { useActionState, useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { localNum, messages, type Locale } from "@huquqi/core";
import { ACCEPT } from "@/lib/documents";
import { uploadFiles } from "@/lib/upload-client";
import { postMessage, submitReview, type FormState } from "../actions";

export function MessageForm({
  caseId, locale, canClose, label, hint,
}: { caseId: string; locale: Locale; canClose: boolean; label: string; hint?: string }) {
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
      {canClose && (
        <label className="inline" htmlFor="msg-close" style={{ fontSize: 14.5 }}>
          <input id="msg-close" name="close" type="checkbox" value="1" />
          {t.status.close}
        </label>
      )}
      {state?.error && <p className="err" role="alert">{t.common.required}</p>}
      <div><button className="btn small" disabled={pending}>{canClose ? t.lawyer.post : t.cases.send}</button></div>
    </form>
  );
}

export function UploadForm({ caseId, locale, direct }: { caseId: string; locale: Locale; direct: boolean }) {
  const t = messages[locale];
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const files = [...((form.elements.namedItem("files") as HTMLInputElement).files ?? [])];
    if (!files.length) return;
    setPending(true);
    setMsg({ ok: true, text: t.cases.uploading(localNum(0, locale), localNum(files.length, locale)) });
    const failed = await uploadFiles(caseId, files, direct, (done) =>
      setMsg({ ok: true, text: t.cases.uploading(localNum(done, locale), localNum(files.length, locale)) }),
    );
    setPending(false);
    setMsg(failed ? { ok: false, text: t.cases.uploadFailed } : { ok: true, text: t.cases.uploadDone });
    form.reset();
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="stack" style={{ gap: 8 }}>
      <label className="f" htmlFor="doc-file">
        <span className="hint">{t.cases.uploadHint}</span>
        <input id="doc-file" name="files" type="file" multiple accept={ACCEPT} required />
      </label>
      {msg && <p className={msg.ok ? "hint num" : "err"} role={msg.ok ? "status" : "alert"} style={{ margin: 0 }}>{msg.text}</p>}
      <div><button className="btn small ghost" disabled={pending}>{t.cases.upload}</button></div>
    </form>
  );
}

export function ReviewForm({
  caseId, locale, initial,
}: { caseId: string; locale: Locale; initial?: { rating: number; comment: string | null } }) {
  const t = messages[locale];
  const [state, action, pending] = useActionState<FormState, FormData>(submitReview.bind(null, caseId), undefined);
  const [rating, setRating] = useState(initial?.rating ?? 0);
  return (
    <form action={action} className="stack" style={{ gap: 10 }}>
      <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
        <legend style={{ fontWeight: 600, fontSize: 14.5, marginBottom: 6 }}>{t.reviews.rating}</legend>
        <div className="star-input">
          {[1, 2, 3, 4, 5].map((n) => (
            <label key={n} title={t.reviews.stars(n)}>
              <input type="radio" name="rating" value={n} checked={rating === n} onChange={() => setRating(n)} required />
              <span aria-hidden="true" className={n <= rating ? "on" : ""}>★</span>
              <span className="sr-only">{t.reviews.stars(n)}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <label className="f" htmlFor="review-comment">
        {t.reviews.comment}
        <textarea id="review-comment" name="comment" defaultValue={initial?.comment ?? ""} style={{ minHeight: 80 }} />
      </label>
      {state?.error && <p className="err" role="alert">{t.common.required}</p>}
      {state && !state.error && <p className="okmsg" style={{ margin: 0 }}>{t.reviews.thanks}</p>}
      <div><button className="btn small" disabled={pending || rating === 0}>{t.reviews.submit}</button></div>
    </form>
  );
}
