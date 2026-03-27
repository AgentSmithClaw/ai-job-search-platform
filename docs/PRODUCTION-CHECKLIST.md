# Production Checklist

This file tracks what is already ready in the repository and what still must be completed outside the repository before production launch.

## 1. Repository-Level Readiness

- [x] FastAPI backend is wired into the active product
- [x] React frontend is connected to the real backend flows
- [x] Frontend production assets publish into `public/`
- [x] Bearer token support is implemented
- [x] SQLite fallback exists for local development
- [x] PostgreSQL support is implemented via `DATABASE_URL`
- [x] Smoke tests pass
- [x] Backend pytest suite passes
- [x] Frontend production build passes

## 2. Vercel Readiness

Ready in repository:

- [x] `vercel.json` exists
- [x] build command is `npm run build`
- [x] output directory is `public`
- [x] API routes are routed to `app/main.py`

Still must be verified in the Vercel dashboard:

- [ ] Project is connected to the correct GitHub repository
- [ ] Production branch is `main`
- [ ] Root directory is the repository root
- [ ] Environment variables are set in Vercel
- [ ] Latest deployment succeeds after the most recent push

## 3. Stripe Readiness

Ready in repository:

- [x] Stripe checkout creation endpoint exists
- [x] Stripe webhook endpoint exists at `POST /api/payment/webhook`
- [x] Price ID environment variables are supported

Still required before production:

- [ ] `STRIPE_SECRET_KEY` is set
- [ ] `STRIPE_WEBHOOK_SECRET` is set
- [ ] `STRIPE_PRICE_GAP_REPORT` is set
- [ ] `STRIPE_PRICE_RESUME_POLISH` is set
- [ ] `STRIPE_PRICE_FULL_PACK` is set
- [ ] Stripe webhook is configured to call the deployed `/api/payment/webhook`
- [ ] `APP_URL` matches the real deployed domain

Current conclusion:

- Stripe code path is ready
- Stripe production configuration is not complete inside the repository by design and must be finished in the deployment environment

## 4. PostgreSQL Readiness

Ready in repository:

- [x] `DATABASE_URL` is supported
- [x] `app/db.py` supports PostgreSQL
- [x] `requirements.txt` includes `psycopg[binary]`
- [x] `docker-compose.yml` includes PostgreSQL

Still required before production:

- [ ] Production `DATABASE_URL` is provisioned
- [ ] Database credentials are rotated away from defaults
- [ ] Real production PostgreSQL connection is validated
- [ ] Backup strategy is configured

Current conclusion:

- PostgreSQL support is code-complete
- Production database provisioning is still an environment task

## 5. App Configuration Readiness

Recommended production variables:

- `APP_URL`
- `CORS_ORIGINS`
- `DATABASE_URL`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_GAP_REPORT`
- `STRIPE_PRICE_RESUME_POLISH`
- `STRIPE_PRICE_FULL_PACK`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASSWORD`
- `FROM_EMAIL`

Current conclusion:

- The repository supports these values
- The actual production values still need to be set in the deployment platform

## 6. Final Manual Verification

Before launch, verify these flows in a browser:

1. Register or sign in
2. Upload a resume
3. Paste a job description
4. Run an analysis
5. Open the result page
6. Export DOCX and PDF
7. Create learning tasks from a report
8. Generate interview questions from a report
9. Create and update applications
10. Open billing and inspect orders

## 7. Overall Status

Repository status:

- Product code: ready
- Test baseline: ready
- Build pipeline: ready
- Deployment docs: ready

Environment status:

- Vercel dashboard verification: pending
- Stripe live configuration: pending
- Production PostgreSQL provisioning: pending
