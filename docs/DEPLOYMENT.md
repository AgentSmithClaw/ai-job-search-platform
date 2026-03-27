# Deployment Guide

This project supports two primary deployment modes:

- Vercel for the web app and FastAPI serverless endpoints
- Docker Compose for local or VM-based deployment

## 1. Required Environment Variables

At minimum, configure these variables for production:

```env
APP_URL=https://your-domain.example
CORS_ORIGINS=https://your-domain.example
DATABASE_URL=postgresql://user:password@host:5432/database

STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRICE_GAP_REPORT=price_xxx
STRIPE_PRICE_RESUME_POLISH=price_xxx
STRIPE_PRICE_FULL_PACK=price_xxx
```

Optional:

```env
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini
OPENAI_BASE_URL=https://api.openai.com/v1
APP_DEBUG=false
```

## 2. Vercel Deployment

The repository already includes [vercel.json](/E:/codex/ai-job-search-platform/vercel.json).

Expected Vercel project settings:

- Root Directory: repository root
- Build Command: `npm run build`
- Output Directory: `public`
- Production Branch: `main`

Recommended checks:

1. Confirm the Vercel project is connected to this GitHub repository.
2. Confirm production deploys track the `main` branch.
3. Add all required environment variables in the Vercel dashboard.
4. Trigger a redeploy after changing build settings or environment variables.

Notes:

- FastAPI API routes are served through `app/main.py`
- Static frontend assets are published into `public/`
- SQLite is not recommended for Vercel production use; set `DATABASE_URL` to PostgreSQL

## 3. Docker Compose Deployment

The repository ships with [docker-compose.yml](/E:/codex/ai-job-search-platform/docker-compose.yml).

Start the stack with:

```bash
docker compose up --build
```

Services:

- `postgres`
- `gappilot`

Default Compose database URL:

```text
postgresql://gappilot:gappilot@postgres:5432/gappilot
```

Before using this in production:

- replace default database credentials
- set a production `APP_URL`
- set production Stripe values
- configure backups for PostgreSQL

## 4. Database Guidance

Development defaults to SQLite when `DATABASE_URL` is empty.

Production guidance:

- use PostgreSQL
- keep credentials outside the repository
- back up the database regularly
- validate schema creation on first boot

## 5. Stripe Checklist

Before enabling live payments:

1. Set `STRIPE_SECRET_KEY`
2. Set `STRIPE_WEBHOOK_SECRET`
3. Set all three `STRIPE_PRICE_*` variables
4. Point the Stripe webhook to:

```text
POST /api/payment/webhook
```

5. Verify that `APP_URL` matches the deployed domain used for success and cancel redirects

## 6. Pre-Launch Verification

Run these commands before deployment:

```bash
python tests\smoke_test.py
python -m pytest tests -q
npm run build
```

Then verify in a browser:

1. Register or sign in
2. Upload a resume and create an analysis
3. Open the result page
4. Export DOCX and PDF
5. Create learning tasks from a report
6. Generate interview questions
7. Add and update applications
8. Check billing and orders

## 7. Current Limitations

- PostgreSQL support is implemented, but you should still validate it in the real target environment
- Stripe live mode depends entirely on correct environment configuration
- Browser-level end-to-end automation is not included yet
