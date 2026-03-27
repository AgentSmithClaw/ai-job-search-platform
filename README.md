# GapPilot Platform

GapPilot is a production-oriented AI SaaS platform for job search execution. It combines resume-to-JD analysis, application tracking, learning tasks, interview preparation, exports, and credit-based billing in one product workflow.

This repository is not a static demo. It contains a real FastAPI backend, a React frontend, persistent analysis history, export generation, payment order flows, and operational deployment configuration.

## Product Scope

GapPilot currently covers:

- AI resume and job description gap analysis
- Structured report viewing and export
- Application tracking
- Learning task management
- Interview preparation
- Credit billing and order management

## Current Stack

- Frontend: React, TypeScript, Vite, React Query, Zustand
- Backend: FastAPI, Pydantic
- Database: SQLite by default, PostgreSQL via `DATABASE_URL`
- Export: DOCX and PDF
- Payments: Mock purchase flow plus Stripe Checkout integration
- Auth: `Authorization: Bearer <token>` preferred, legacy `access_token` still supported

## Core Features

### 1. AI Job Match Analysis

- Upload PDF, DOCX, TXT, or Markdown resumes
- Paste a target job description
- Generate match score, strengths, risks, gaps, learning actions, interview focus, and resume rewrite suggestions
- Show results in a structured report screen instead of dumping raw text

### 2. Analysis History and Reuse

- Save completed analysis sessions
- Re-open report details
- Export DOCX and PDF
- Create learning tasks from a report
- Generate interview questions from a report

### 3. Job Search Execution

- Track applications
- Update status: `interested`, `applied`, `interviewing`, `offer`, `rejected`, `withdrawn`
- Manage learning tasks and priorities
- Manage interview questions, ideal answers, and notes

### 4. Billing

- Package catalog
- Mock credit purchases
- Stripe Checkout session creation
- Order history
- Refund endpoint

## Authentication

Preferred authentication:

```text
Authorization: Bearer <token>
```

For backward compatibility, some endpoints still accept `access_token` in query parameters or request bodies. New integrations should use Bearer tokens only.

## Repository Structure

```text
ai-job-search-platform/
├─ app/                    # FastAPI backend
│  ├─ main.py              # App entry, middleware, static hosting
│  ├─ routes/              # API routes
│  ├─ services/            # Business logic
│  ├─ db.py                # SQLite / PostgreSQL connection and schema setup
│  └─ schemas.py           # Pydantic models
├─ frontend/               # React frontend
│  ├─ src/
│  │  ├─ components/
│  │  ├─ pages/
│  │  ├─ services/
│  │  ├─ store/
│  │  ├─ types/
│  │  └─ utils/
│  └─ package.json
├─ public/                 # Built static assets served by FastAPI
├─ docs/api.md             # API reference
├─ tests/                  # pytest and smoke tests
└─ scripts/                # build and publishing scripts
```

The repository is intentionally kept focused on the active product only. Backup snapshots, design exports, agent workspace files, screenshots, and private planning material are excluded from the main project structure.

## Local Development

### 1. Install backend dependencies

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure environment variables

Copy `.env.example` to `.env` and fill in what you need:

```env
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini
OPENAI_BASE_URL=https://api.openai.com/v1

APP_DEBUG=false
APP_URL=http://127.0.0.1:8080
DATABASE_URL=
CORS_ORIGINS=http://127.0.0.1:8080,http://localhost:3000,http://localhost:8080

STRIPE_SECRET_KEY=your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret_here
STRIPE_PRICE_GAP_REPORT=price_gap_report_xxx
STRIPE_PRICE_RESUME_POLISH=price_resume_polish_xxx
STRIPE_PRICE_FULL_PACK=price_full_pack_xxx
```

Notes:

- Leave `DATABASE_URL` empty to use SQLite
- Set `DATABASE_URL=postgresql://...` to use PostgreSQL
- You can still run the main workflow with mock analysis and mock purchases if LLM or Stripe credentials are missing

### 3. Start the backend

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8080
```

### 4. Start the frontend in dev mode

```bash
cd frontend
npm install
npm run dev
```

### 5. Build production assets and publish them to FastAPI

Run this from the repository root:

```bash
npm run build
```

That command will:

1. install frontend dependencies
2. build `frontend/dist`
3. publish the final assets into `public/`

After that, access:

- App: [http://127.0.0.1:8080/](http://127.0.0.1:8080/)
- Health check: [http://127.0.0.1:8080/health](http://127.0.0.1:8080/health)

## Docker Compose

The repository includes PostgreSQL in Docker Compose:

```bash
docker compose up --build
```

Services:

- `postgres`: PostgreSQL 16
- `gappilot`: FastAPI application

Default application database URL:

```text
postgresql://gappilot:gappilot@postgres:5432/gappilot
```

## Vercel Deployment

The repository already contains Vercel configuration:

- `buildCommand`: `npm run build`
- `outputDirectory`: `public`

See [vercel.json](/E:/codex/ai-job-search-platform/vercel.json).

If your Vercel project is correctly connected to this GitHub repository and the `main` branch, pushes to GitHub should trigger automatic deployments.

Recommended production environment variables:

- `APP_URL`
- `CORS_ORIGINS`
- `DATABASE_URL`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_GAP_REPORT`
- `STRIPE_PRICE_RESUME_POLISH`
- `STRIPE_PRICE_FULL_PACK`

## Tests

### Smoke test

```bash
python tests\smoke_test.py
```

Covered flows:

- health check
- register
- auth me
- profile update
- pricing
- providers
- resume upload
- mock purchase
- order history
- dashboard
- analysis creation
- history
- DOCX and PDF export
- applications CRUD
- learning tasks CRUD
- interview prep CRUD
- refund

### Pytest

```bash
python -m pytest tests -q
```

## Verified Status

At the current repository state:

- `python tests\smoke_test.py`: `31/31 passed`
- `python -m pytest tests -q`: `51 passed`
- `npm run build`: passed

## Productionization Work Already Completed

- Bearer token auth flow added, legacy token compatibility preserved
- SQLite / PostgreSQL dual-stack support
- Docker Compose PostgreSQL integration
- Frontend result page, settings, billing, history, and mobile shell polish
- FastAPI static hosting for frontend build artifacts

## Recommended Next Production Steps

- configure real Stripe keys, webhook, and callback domain
- harden account lifecycle and security flows
- add centralized logs, monitoring, and alerts
- add browser-level end-to-end regression tests
- run a real PostgreSQL environment validation before production launch

## License

MIT
