import { CHANNEL, formatDate, isLabourType, labourDeadline, localNum, type CaseType } from "@huquqi/core";
import { canWorkOn, isVerifiedLawyer, loadCaseFor } from "@/lib/access";
import { getT } from "@/lib/locale";
import { requireUser } from "@/lib/session";
import { who } from "@/lib/who";
import { Stars } from "@/components/Stars";
import { directUploads } from "@/lib/storage";
import { takeCase } from "../actions";
import { MessageForm, NoteForm, ReviewForm, UploadForm } from "./CaseForms";

export default async function CasePage({
  params, searchParams,
}: { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string; upload?: string }> }) {
  const { id } = await params;
  const { created, upload } = await searchParams;
  const user = await requireUser();
  const { locale, t } = await getT();
  const c = await loadCaseFor(user, id);
  const type = c.type as CaseType;
  const closed = c.stage === "closed";
  const isOwner = c.workerId === user.id;
  const worker = canWorkOn(user, c);
  const canTake = !c.lawyerId && isVerifiedLawyer(user);
  const deadline = c.exitDate && isLabourType(type) ? labourDeadline(c.exitDate) : null;

  return (
    <div className="wrap stack">
      {created && <p className="okmsg" style={{ margin: 0 }}>{t.cases.created}</p>}
      {upload === "failed" && <p className="err" role="alert" style={{ margin: 0 }}>{t.cases.uploadFailed}</p>}
      <div className="inline" style={{ justifyContent: "space-between" }}>
        <div>
          <h1 className="page-title">{t.caseType[type]}</h1>
          <p className="muted num" style={{ margin: 0 }}>{c.ref} · {formatDate(c.createdAt, locale)}</p>
        </div>
        <span className="inline" style={{ gap: 6 }}>
          {!isOwner && c.awaitingReply && <span className="pill new">{t.inbox.newReply}</span>}
          <span className={`pill ${closed ? "closed" : ""}`}>{closed ? t.status.closed : t.status.open}</span>
        </span>
      </div>

      <div className="cols">
        <div className="stack">
          <section className="card stack">
            <h2>{t.cases.updates}</h2>
            {c.updates.length === 0 && <p className="muted" style={{ margin: 0 }}>{t.cases.noUpdates}</p>}
            {c.updates.map((u) => (
              <div key={u.id} className={`update ${u.authorId !== c.workerId ? "lawyer" : ""}`}>
                <small>
                  {who(u.author)} · {formatDate(u.createdAt, locale)}
                  {u.stage === "closed" && <> · <b>{t.status.closed}</b></>}
                </small>
                {u.body && <p>{u.body}</p>}
              </div>
            ))}
            {(isOwner || worker) && (
              <MessageForm
                caseId={c.id}
                locale={locale}
                canClose={worker && !closed}
                label={worker ? t.lawyer.update : t.cases.message}
                hint={worker ? t.lawyer.updateHint : undefined}
              />
            )}
          </section>

          <section className="card stack">
            <h2>{t.cases.description}</h2>
            <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{c.description}</p>
            {c.requests && (
              <>
                <h2>{t.cases.requests}</h2>
                <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{c.requests}</p>
              </>
            )}
          </section>
        </div>

        <div className="stack">
          {canTake && (
            <form action={takeCase.bind(null, c.id)} className="card">
              <button className="btn" style={{ width: "100%" }}>{t.lawyer.take}</button>
            </form>
          )}

          <section className="card stack">
            <dl className="kv">
              <dt>{t.cases.lawyer}</dt>
              <dd>{c.lawyer ? `${who(c.lawyer)}${c.lawyer.lawyerProfile?.firm ? ` · ${c.lawyer.lawyerProfile.firm}` : ""}` : t.cases.noLawyer}</dd>
              <dt>{t.cases.channel}</dt><dd dir="ltr" style={{ textAlign: "start" }}>{CHANNEL[type]}</dd>
              {c.employer && <><dt>{t.cases.employer}</dt><dd>{c.employer}</dd></>}
              {c.bankName && <><dt>{t.cases.bank}</dt><dd>{c.bankName}</dd></>}
              {c.exitDate && <><dt>{t.cases.exitDate}</dt><dd>{formatDate(c.exitDate, locale)}</dd></>}
              {!isOwner && <><dt>{t.admin.email}</dt><dd dir="ltr" style={{ textAlign: "start" }}>{c.worker.email ?? c.worker.phone}</dd></>}
            </dl>
            {deadline && (
              <details className="more">
                <summary>{t.labour.more}</summary>
                <div className={`res ${deadline.expired ? "warn" : "alert"}`} style={{ marginTop: 10 }}>
                  <h3>
                    {t.cases.deadline}: {formatDate(deadline.deadline, locale)}
                    <span className="tag num">{deadline.expired ? t.check.labourLateTitle : t.check.daysLeft(localNum(deadline.daysLeft, locale))}</span>
                  </h3>
                  <p>{deadline.expired ? t.check.labourLateBody : t.check.labourBody(formatDate(deadline.deadline, locale))}</p>
                </div>
              </details>
            )}
          </section>

          {worker && !isOwner && (
            <section className="card stack notes">
              <div>
                <h2>{t.inbox.notes}</h2>
                <p className="hint" style={{ margin: "2px 0 0" }}>{t.inbox.notesHint}</p>
              </div>
              {c.notes.length === 0 && <p className="muted" style={{ margin: 0 }}>{t.inbox.noNotes}</p>}
              {c.notes.map((n) => (
                <div key={n.id} className="note">
                  <small className="muted">{who(n.author)} · {formatDate(n.createdAt, locale)}</small>
                  <p style={{ margin: "2px 0 0", whiteSpace: "pre-wrap" }}>{n.body}</p>
                </div>
              ))}
              <NoteForm caseId={c.id} locale={locale} />
            </section>
          )}

          {isOwner && c.lawyerId && (
            <section className="card stack">
              <h2>{c.review ? t.reviews.yours : t.reviews.write}</h2>
              {c.review && !c.review.approvedAt && <p className="hint" style={{ margin: 0 }}>{t.reviews.pending}</p>}
              <ReviewForm caseId={c.id} locale={locale} initial={c.review ?? undefined} />
            </section>
          )}
          {!isOwner && c.review && (
            <section className="card stack">
              <h2>{t.reviews.title}</h2>
              <Stars value={c.review.rating} label={t.reviews.stars(c.review.rating)} />
              {c.review.comment && <p style={{ margin: 0 }}>{c.review.comment}</p>}
            </section>
          )}

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
                      <span className="muted num" style={{ fontSize: 13 }}>{d.size >= 1048576 ? `${(d.size / 1048576).toFixed(1)} MB` : `${Math.ceil(d.size / 1024)} KB`}</span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
            {(isOwner || worker) && <UploadForm caseId={c.id} locale={locale} direct={directUploads()} />}
          </section>
        </div>
      </div>
    </div>
  );
}
