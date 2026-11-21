# Huquqi · حقوقي · হুকুকি

A platform for workers who have returned from Saudi Arabia (starting with Bangladesh) to follow their
Saudi matters from home: unpaid salary, end-of-service benefit, money left in Saudi banks, court cases,
accident compensation and property. Licensed Saudi lawyers do the legal work through the official
channels (Qiwa, Najiz, the bank); the platform organises the case, the documents and the updates in
Bengali, Arabic and English.

منصة تقنية تربط العامل العائد بمحامٍ سعودي مرخّص. المنصة لا تترافع ولا تقدّم رأياً قانونياً بنفسها.

## What is in this first version

| Area | What works |
| --- | --- |
| Home | Free case check: 12-month labour-claim countdown, likely bank account state (SAMA 90/180-day rules), wage-insurance hint |
| Login | Mobile number + one-time code (Bangladesh `+880` for workers, Saudi `+966` for lawyers) |
| Worker | Open a case, upload documents (PDF/images up to 10 MB), message the lawyer, follow the stage timeline |
| Lawyer | Profile with licence number, take unassigned cases (after admin verification), post updates and move the stage |
| Admin | Add lawyers by phone, verify licences, assign cases |
| Languages | Bengali (default), Arabic (right-to-left), English, switchable on every page |

Not yet built: SMS delivery of codes, payments (bKash/Nagad), the Expo mobile app, machine translation
of updates, a database hosted in Saudi Arabia. See "Next steps".

## Layout

```
packages/core   Shared domain logic: case types, stages, deadlines, phone rules, translations (+ tests)
apps/web        Next.js 15 app (pages, server actions, Prisma)
```

## Run locally

Needs PostgreSQL (a local server, Docker, or a free Neon database).

```bash
npm install
cp apps/web/.env.example apps/web/.env    # then set DATABASE_URL
npm run db:push -w @huquqi/web
npm run db:seed -w @huquqi/web    # demo admin, lawyer, worker and cases
npm run dev                        # http://localhost:3000
```

With `DEV_SHOW_OTP=1` the login code is shown on screen in development (never in production).

Demo accounts after seeding:

| Role | Phone |
| --- | --- |
| Admin | 01700-000000 |
| Lawyer (verified) | +966 55 000 0001 |
| Worker | 01712-345678 |

## Deploy a demo on Vercel + Neon

1. **Neon**: create a project and copy the connection string (the direct one, not "pooled").
2. **Vercel**: Add New → Project → import this repository. Set **Root Directory** to `apps/web`.
3. In **Environment Variables** add:

   | Name | Value |
   | --- | --- |
   | `DATABASE_URL` | the Neon connection string |
   | `SESSION_SECRET` | 32+ random characters |
   | `DEMO_PASSWORD` | a password to share with testers |
   | `DEV_SHOW_OTP` | `1` (codes on screen; only works while `DEMO_PASSWORD` is set) |
   | `ADMIN_PHONES` | your number in `+880…` or `+966…` form |

4. Deploy. The `vercel-build` script creates the tables in Neon before building.
5. **Storage**: in the Vercel project, Storage → Create → Blob, and connect it to the project. This adds
   `BLOB_READ_WRITE_TOKEN`; uploaded documents are then stored as private blobs. Redeploy after connecting.

Without `DEMO_PASSWORD`, a production deployment never shows login codes, so it needs an SMS gateway.

## Tests

```bash
npm test                                             # unit tests for packages/core
npm run dev                                          # then, in another terminal:
BASE_URL=http://localhost:3000 NODE_PATH=$(npm root -g) node apps/web/e2e/smoke.mjs
# against a password-protected demo, add DEMO_PASSWORD=...
# (a local production build over http also needs INSECURE_COOKIES=1 on the server)
```

The smoke test needs Playwright installed globally. It walks through worker login, case creation,
document upload, access control (anonymous and other workers get 401/404), a lawyer taking the case
in Arabic and moving it to the next stage, and the admin page.

## Security notes

- Sessions are signed HTTP-only cookies (`SESSION_SECRET`, 32+ characters).
- One-time codes are hashed, expire after 10 minutes, allow 5 attempts, and at most 5 codes per hour per number.
- A case and its documents are visible only to the worker, the assigned lawyer, admins, and verified
  lawyers while the case is still unassigned. Others get "not found".
- Uploaded files are stored privately (Vercel Blob or local disk) and only served through an
  access-checked route, with `nosniff` and `no-store`.
- Demo deployments are behind a shared password (`DEMO_PASSWORD`); login codes are shown on screen
  only in that case or in development.

## Next steps

1. Review the legal model with a Saudi lawyer (see the plan document).
2. SMS gateway for codes, bKash/Nagad payments, database and storage hosted in Saudi Arabia.
3. Expo mobile app (Android first) using `packages/core`.
4. Translation of lawyer updates into the worker's language.
