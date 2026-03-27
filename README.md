# GapPilot Platform

[中文文档](./README.zh-CN.md)

GapPilot is a production-oriented AI SaaS platform for job search execution. It combines resume-to-JD analysis, application tracking, learning tasks, interview preparation, exports, and credit-based billing in one product workflow.

This repository contains the real product codebase, not a static prototype.

## What It Does

- AI resume and job description match analysis
- Structured report viewing and export
- Application tracking
- Learning task management
- Interview preparation
- Credit billing and order management

## Stack

- Frontend: React, TypeScript, Vite, React Query, Zustand
- Backend: FastAPI, Pydantic
- Database: SQLite by default, PostgreSQL via `DATABASE_URL`
- Export: DOCX and PDF
- Payments: Mock purchase flow and Stripe Checkout integration
- Auth: `Authorization: Bearer <token>` preferred, legacy `access_token` compatibility preserved

## Repository Layout

```text
app/        FastAPI backend
frontend/   React frontend
docs/       Product and deployment documentation
tests/      Smoke tests and backend tests
scripts/    Build publishing utilities
public/     Built frontend assets served by FastAPI
```

Main docs:

- [Chinese README](./README.zh-CN.md)
- [Docs index](./docs/README.md)
- [API reference](./docs/api.md)
- [Deployment guide](./docs/DEPLOYMENT.md)
- [Production checklist](./docs/PRODUCTION-CHECKLIST.md)
- [Contributing guide](./CONTRIBUTING.md)

## Quick Start

1. Install backend dependencies:

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

2. Copy `.env.example` to `.env` and configure values.

3. Start the backend:

```bash
npm run dev:backend
```

4. Start the frontend in development:

```bash
npm run dev:frontend
```

5. Build production assets:

```bash
npm run build
```

## Useful Scripts

- `npm run build` - install frontend deps, build frontend, publish assets to `public/`
- `npm run build:local` - build and publish without re-running `npm ci`
- `npm run dev:backend` - run FastAPI with reload
- `npm run dev:frontend` - run Vite dev server
- `npm run test` - run backend pytest suite
- `npm run test:smoke` - run smoke test
- `npm run test:all` - run pytest plus smoke test
- `npm run lint:frontend` - run frontend ESLint

## Verified Status

At the current repository state:

- `python tests/smoke_test.py`: `31/31 passed`
- `python -m pytest tests -q`: `51 passed`
- `npm run build`: passed

## Deployment Notes

- Vercel build command: `npm run build`
- Vercel output directory: `public`
- Production should use PostgreSQL, not SQLite
- Stripe live mode requires valid secrets, webhook configuration, and live price IDs

See [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) and [docs/PRODUCTION-CHECKLIST.md](./docs/PRODUCTION-CHECKLIST.md) for the full deployment path.

## License

MIT
