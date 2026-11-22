"use client";
import { useActionState } from "react";
import { messages, type Locale } from "@huquqi/core";
import { sendContact, type ContactState } from "@/app/(info)/actions";

export function ContactForm({ locale, feedback }: { locale: Locale; feedback?: boolean }) {
  const t = messages[locale].info;
  const [state, action, pending] = useActionState<ContactState, FormData>(sendContact, undefined);
  if (state?.ok) return <p className="okmsg" role="status">{t.sent}</p>;
  return (
    <form action={action} className="card stack">
      {feedback ? (
        <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
          <legend style={{ fontWeight: 600, fontSize: 14.5, marginBottom: 8 }}>{t.kind}</legend>
          <div className="chips">
            <label className="chip"><input type="radio" name="kind" value="suggestion" defaultChecked /><span>{t.suggestion}</span></label>
            <label className="chip"><input type="radio" name="kind" value="complaint" /><span>{t.complaint}</span></label>
          </div>
        </fieldset>
      ) : (
        <input type="hidden" name="kind" value="contact" />
      )}
      <div className="row2">
        <label className="f" htmlFor="c-name">{t.name}<input id="c-name" name="name" type="text" autoComplete="name" required /></label>
        <label className="f" htmlFor="c-email">{t.email}<input id="c-email" name="email" type="email" autoComplete="email" dir="ltr" required /></label>
      </div>
      <label className="f" htmlFor="c-body">{t.message}<textarea id="c-body" name="body" required /></label>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="sr-only" />
      {state?.error && <p className="err" role="alert">{t.error}</p>}
      <div><button className="btn" disabled={pending}>{t.send}</button></div>
    </form>
  );
}
