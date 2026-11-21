"use client";
import { useActionState } from "react";
import { CASE_TYPES, messages, type Locale } from "@huquqi/core";
import { createCase, type FormState } from "../actions";

export function NewCaseForm({ locale }: { locale: Locale }) {
  const t = messages[locale];
  const [state, action, pending] = useActionState<FormState, FormData>(createCase, undefined);
  return (
    <form action={action} className="card stack">
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
      <label className="f" htmlFor="description">
        {t.cases.description}
        <span className="hint">{t.cases.descriptionHint}</span>
        <textarea id="description" name="description" required />
      </label>
      {state?.error && <p className="err" role="alert">{t.common.required}</p>}
      <div><button className="btn" disabled={pending}>{t.cases.submit}</button></div>
    </form>
  );
}
