"use client";
import { useActionState } from "react";
import { messages, PROVIDER_SERVICES, type Locale } from "@huquqi/core";
import { applyLawyer, type ApplyState } from "@/app/(info)/actions";

export function LawyerApplyForm({ locale, name, kind = "lawyer" }: { locale: Locale; name: string; kind?: "lawyer" | "provider" }) {
  const prov = kind === "provider";
  const t = messages[locale];
  const [state, action, pending] = useActionState<ApplyState, FormData>(applyLawyer, undefined);
  if (state?.ok) return <p className="okmsg" role="status">{t.staff.applySent}</p>;
  return (
    <form action={action} className="card stack" id="apply">
      <h2>{prov ? t.staff.provTitle : t.staff.applyTitle}</h2>
      <p className="muted" style={{ margin: 0 }}>{prov ? t.staff.provLead : t.staff.applyLead}</p>
      <input type="hidden" name="kind" value={kind} />
      {prov && (
        <label className="f" htmlFor="a-service">{t.staff.service}
          <select id="a-service" name="service" required defaultValue="">
            <option value="" disabled>—</option>
            {PROVIDER_SERVICES.map((s) => <option key={s} value={s}>{t.staff.services[s]}</option>)}
          </select>
        </label>
      )}
      <div className="row2">
        <label className="f" htmlFor="a-name">{t.auth.name}<input id="a-name" name="name" type="text" defaultValue={name} required /></label>
        <label className="f" htmlFor="a-phone">{t.staff.phone}<input id="a-phone" name="phone" type="tel" dir="ltr" placeholder="+966…" required /></label>
      </div>
      <div className="row2">
        <label className="f" htmlFor="a-license">{prov ? t.staff.licenseOpt : t.lawyer.license}<input id="a-license" name="licenseNo" type="text" dir="ltr" required={!prov} /></label>
        <label className="f" htmlFor="a-firm">{t.lawyer.firm}<input id="a-firm" name="firm" type="text" /></label>
      </div>
      <div className="row2">
        <label className="f" htmlFor="a-city">{t.staff.city}<input id="a-city" name="city" type="text" /></label>
        <label className="f" htmlFor="a-years">{t.staff.years}<input id="a-years" name="years" type="number" min={0} max={69} inputMode="numeric" /></label>
      </div>
      <label className="f" htmlFor="a-about">{t.staff.about}<textarea id="a-about" name="about" /></label>
      {state?.error && <p className="err" role="alert">{prov ? t.staff.provError : t.staff.applyError}</p>}
      <div><button className="btn" disabled={pending}>{t.staff.applySend}</button></div>
    </form>
  );
}
