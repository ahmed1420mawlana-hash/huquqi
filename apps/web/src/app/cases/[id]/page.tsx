import { CHANNEL, STAGES, formatDate, isLabourType, labourDeadline, localNum, nextStages, stageIndex, type CaseType, type Stage } from "@huquqi/core";
import { canWorkOn, isVerifiedLawyer, loadCaseFor } from "@/lib/access";
import { getT } from "@/lib/locale";
import { requireUser } from "@/lib/session";
import { takeCase } from "../actions";
import { MessageForm, UploadForm } from "./CaseForms";

export default async function CasePage({
  params, searchParams,
}: { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string }> }) {
  const { id } = await params;
  const { created } = await searchParams;
  const user = await requireUser();
  const { locale, t } = await getT();
  const c = await loadCaseFor(user, id);
  const type = c.type as CaseType;
  const stage = c.stage as Stage;
  const isOwner = c.workerId === user.id;
  const worker = canWorkOn(user, c);
  const canTake = !c.lawyerId && isVerifiedLawyer(user);
  const deadline = c.exitDate && isLabourType(type) && stageIndex(stage) < stageIndex("filed") ? labourDeadline(c.exitDate) : null;
  const shown = STAGES.filter((s) => s !== "closed");

  return (
    <div className="wrap stack">
      {created && <p className="okmsg" style={{ margin: 0 }}>{t.cases.created}</p>}
      <div>
        <h1 className="page-title">{t.caseType[type]}</h1>
        <p className="muted num" style={{ margin: 0 }}>{c.ref} · {formatDate(c.createdAt, locale)}</p>
      </div>

      {deadline && (
        <div className={`res ${deadline.expired ? "warn" : "alert"}`}>
          <h3>
            {t.cases.deadline}: {formatDate(deadline.deadline, locale)}
            <span className="tag num">{deadline.expired ? t.check.labourLateTitle : t.check.daysLeft(localNum(deadline.daysLeft, locale))}</span>
          </h3>
          {!deadline.expired && <div className="meter" aria-hidden="true"><i style={{ width: `${Math.max(3, deadline.used * 100)}%` }} /></div>}
        </div>
      )}

      <div className="cols">
        <div className="stack">
          <section className="card stack">
            <h2>{t.cases.updates}</h2>
            {c.updates.length === 0 && <p className="muted" style={{ margin: 0 }}>{t.cases.noUpdates}</p>}
            {c.updates.map((u) => (
              <div key={u.id} className={`update ${u.authorId !== c.workerId ? "lawyer" : ""}`}>
                <small>
                  {u.author.name ?? u.author.phone} · {formatDate(u.createdAt, locale)}
                  {u.stage && <> · <b>{t.stage[u.stage as Stage]}</b></>}
                </small>
                {u.body && <p>{u.body}</p>}
              </div>
            ))}
            {(isOwner || worker) && (
              <MessageForm
                caseId={c.id}
                locale={locale}
                stages={worker ? nextStages(stage) : []}
                label={worker ? t.lawyer.update : t.cases.message}
                hint={worker ? t.lawyer.updateHint : undefined}
              />
            )}
          </section>

          <section className="card stack">
            <h2>{t.cases.description}</h2>
            <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{c.description}</p>
          </section>
        </div>

        <div className="stack">
          {canTake && (
            <form action={takeCase.bind(null, c.id)} className="card">
              <button className="btn" style={{ width: "100%" }}>{t.lawyer.take}</button>
            </form>
          )}
          <section className="card stack">
            <h2>{t.cases.timeline}</h2>
            <ol className="track">
              {shown.map((s, i) => {
                const cur = stageIndex(stage);
                const cls = stage === "closed" || i < cur ? "done" : i === cur ? "now" : "";
                return (
                  <li key={s} className={cls}>
                    <span className="dot">{cls === "done" ? "✓" : localNum(i + 1, locale)}</span>
                    <span>{t.stage[s]}</span>
                  </li>
                );
              })}
            </ol>
          </section>

          <section className="card">
            <dl className="kv">
              <dt>{t.cases.lawyer}</dt>
              <dd>{c.lawyer ? `${c.lawyer.name ?? c.lawyer.phone}${c.lawyer.lawyerProfile?.firm ? ` · ${c.lawyer.lawyerProfile.firm}` : ""}` : t.cases.noLawyer}</dd>
              <dt>{t.cases.channel}</dt><dd dir="ltr" style={{ textAlign: "start" }}>{CHANNEL[type]}</dd>
              {c.employer && <><dt>{t.cases.employer}</dt><dd>{c.employer}</dd></>}
              {c.bankName && <><dt>{t.cases.bank}</dt><dd>{c.bankName}</dd></>}
              {c.exitDate && <><dt>{t.cases.exitDate}</dt><dd>{formatDate(c.exitDate, locale)}</dd></>}
              {!isOwner && <><dt>{t.admin.phone}</dt><dd dir="ltr" style={{ textAlign: "start" }}>{c.worker.phone}</dd></>}
            </dl>
          </section>

          <section className="card stack">
            <h2>{t.cases.documents}</h2>
            {c.documents.length === 0 ? (
              <p className="muted" style={{ margin: 0 }}>{t.cases.noDocs}</p>
            ) : (
              <ul className="list">
                {c.documents.map((d) => (
                  <li key={d.id}>
                    <a className="item" href={`/api/documents/${d.id}`} target="_blank" rel="noopener">
                      <span>{d.filename}</span>
                      <span className="muted num" style={{ fontSize: 13 }}>{Math.ceil(d.size / 1024)} KB</span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
            {(isOwner || worker) && <UploadForm caseId={c.id} locale={locale} />}
          </section>
        </div>
      </div>
    </div>
  );
}
