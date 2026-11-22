"use client";
import { useActionState } from "react";
import { messages, type Locale } from "@huquqi/core";
import { loginAction, type LoginState } from "./actions";

export function LoginForm({ locale }: { locale: Locale }) {
  const t = messages[locale];
  const [state, action, pending] = useActionState<LoginState, FormData>(loginAction, { step: "email" });

  if (state.step === "email") {
    return (
      <form action={action} className="card stack" noValidate>
        <label className="f" htmlFor="email">
          {t.auth.email}
          <input id="email" name="email" type="email" inputMode="email" autoComplete="email" dir="ltr" required placeholder="name@example.com" />
          <span className="hint">{t.auth.emailHint}</span>
        </label>
        {state.error === "badEmail" && <p className="err" role="alert">{t.auth.badEmail}</p>}
        {state.error === "rate" && <p className="err" role="alert">{t.auth.rate}</p>}
        {state.error === "send" && <p className="err" role="alert">{t.auth.badEmail}</p>}
        <button className="btn" name="intent" value="send" disabled={pending}>{t.auth.send}</button>
      </form>
    );
  }

  return (
    <form action={action} className="card stack" noValidate>
      <p className="okmsg" style={{ margin: 0 }}>{t.auth.codeSent} <span dir="ltr">{state.email}</span></p>
      {state.devCode && <p className="devcode" style={{ margin: 0 }}>{t.auth.devCode(state.devCode)}</p>}
      <label className="f" htmlFor="code">
        {t.auth.code}
        <input id="code" name="code" type="text" inputMode="numeric" autoComplete="one-time-code" dir="ltr" maxLength={6} required />
      </label>
      <label className="f" htmlFor="name">
        {t.auth.name}
        <input id="name" name="name" type="text" autoComplete="name" />
      </label>
      {state.error === "badCode" && <p className="err" role="alert">{t.auth.badCode}</p>}
      <button className="btn" name="intent" value="verify" disabled={pending}>{t.auth.verify}</button>
    </form>
  );
}
