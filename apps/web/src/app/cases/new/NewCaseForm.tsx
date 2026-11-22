"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { CASE_TYPES, localNum, messages, type Locale } from "@huquqi/core";
import { ACCEPT } from "@/lib/documents";
import { uploadFiles } from "@/lib/upload-client";
import { createCase } from "../actions";

export function NewCaseForm({ locale, direct }: { locale: Locale; direct: boolean }) {
  const t = messages[locale];
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const files = fd.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
    fd.delete("files");
    const r = await createCase(undefined, fd);
    if (!r?.id) {
      setPending(false);
      setError(t.common.required);
      return;
    }
    let failed = 0;
    if (files.length) {
      setProgress({ done: 0, total: files.length });
      failed = await uploadFiles(r.id, files, direct, (done) => setProgress({ done, total: files.length }));
    }
    router.push(`/cases/${r.id}?created=1${failed ? "&upload=failed" : ""}`);
  }

  return (
    <form onSubmit={onSubmit} className="card stack">
      <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
        <legend style={{ fontWeight: 600, fontSize: 14.5, marginBottom: 8 }}>{t.cases.type}</legend>
        <div className="chips">
          {CASE_TYPES.map((k, i) => (
            <label className="chip" key={k}>
              <input type="radio" name="type" value={k} defaultChecked={i === 0} />
              <span>{t.caseType[k]}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="row2">
        <label className="f" htmlFor="employer">{t.cases.employer}<input id="employer" name="employer" type="text" /></label>
        <label className="f" htmlFor="exitDate">{t.cases.exitDate}<input id="exitDate" name="exitDate" type="date" /></label>
      </div>
      <label className="f" htmlFor="bankName">{t.cases.bank}<input id="bankName" name="bankName" type="text" placeholder="Al Rajhi, SNB, Riyad Bank…" /></label>

      <div className="box3">
        <label className="f" htmlFor="description">
          <span className="box-title"><b className="num">{localNum(1, locale)}</b>{t.cases.description}</span>
          <span className="hint">{t.cases.descriptionHint}</span>
          <textarea id="description" name="description" required />
        </label>
        <label className="f" htmlFor="requests">
          <span className="box-title"><b className="num">{localNum(2, locale)}</b>{t.cases.requests}</span>
          <span className="hint">{t.cases.requestsHint}</span>
          <textarea id="requests" name="requests" required />
        </label>
        <label className="f" htmlFor="files">
          <span className="box-title"><b className="num">{localNum(3, locale)}</b>{t.cases.documents}</span>
          <span className="hint">{t.cases.uploadHint}</span>
          <input id="files" name="files" type="file" multiple accept={ACCEPT} />
        </label>
      </div>

      {error && <p className="err" role="alert">{error}</p>}
      {progress && (
        <p className="hint num" role="status" style={{ margin: 0 }}>
          {t.cases.uploading(localNum(progress.done, locale), localNum(progress.total, locale))}
        </p>
      )}
      <div><button className="btn" disabled={pending}>{t.cases.submit}</button></div>
    </form>
  );
}
