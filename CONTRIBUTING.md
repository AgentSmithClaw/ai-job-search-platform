# Contributing

Thanks for contributing to GapPilot.

## Scope

This repository should stay focused on the active product only.

Do not commit:

- personal workspace files
- agent-specific notes
- screenshots
- design exports
- local databases
- backup directories

## Setup

Backend:

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

Frontend:

```bash
npm --prefix frontend install
```

## Useful Commands

```bash
npm run dev:backend
npm run dev:frontend
npm run test
npm run test:smoke
npm run test:all
npm run build
```

## Before Opening a PR

Please run:

```bash
npm run test
npm run test:smoke
npm run build
```

## Documentation

If you change the deployment flow, API behavior, or onboarding steps, update the related docs:

- [README.md](/E:/codex/ai-job-search-platform/README.md)
- [README.zh-CN.md](/E:/codex/ai-job-search-platform/README.zh-CN.md)
- [docs/api.md](/E:/codex/ai-job-search-platform/docs/api.md)
- [docs/DEPLOYMENT.md](/E:/codex/ai-job-search-platform/docs/DEPLOYMENT.md)
- [docs/PRODUCTION-CHECKLIST.md](/E:/codex/ai-job-search-platform/docs/PRODUCTION-CHECKLIST.md)
