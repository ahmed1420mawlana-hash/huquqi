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
of updates, S3 storage, Postgres in Saudi Arabia. See "Next steps".

## Layout

```
packages/core   Shared domain logic: case types, stages, deadlines, phone rules, translations (+ tests)
apps/web        Next.js 15 app (pages, server actions, Prisma)
```

## Run locally

```bash
npm install
cp apps/web/.env.example apps/web/.env
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

## Tests

```bash
npm test                                             # unit tests for packages/core
npm run dev                                          # then, in another terminal:
BASE_URL=http://localhost:3000 NODE_PATH=$(npm root -g) node apps/web/e2e/smoke.mjs
```

The smoke test needs Playwright installed globally. It walks through worker login, case creation,
document upload, access control (anonymous and other workers get 401/404), a lawyer taking the case
in Arabic and moving it to the next stage, and the admin page.

## Security notes

- Sessions are signed HTTP-only cookies (`SESSION_SECRET`, 32+ characters).
- One-time codes are hashed, expire after 10 minutes, allow 5 attempts, and at most 5 codes per hour per number.
- A case and its documents are visible only to the worker, the assigned lawyer, admins, and verified
  lawyers while the case is still unassigned. Others get "not found".
- Uploaded files are stored outside the web root and served with `nosniff` and `no-store`.

## Next steps

1. Review the legal model with a Saudi lawyer (see the plan document).
2. SMS gateway for codes, bKash/Nagad payments, Postgres hosted in Saudi Arabia, S3-compatible storage.
3. Expo mobile app (Android first) using `packages/core`.
4. Translation of lawyer updates into the worker's language.
