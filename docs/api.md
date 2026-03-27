# API Reference

Base URL:

```text
http://localhost:8080
```

For authenticated endpoints, use:

```text
Authorization: Bearer YOUR_TOKEN
```

Some endpoints still accept legacy `access_token` query or body fields for backward compatibility, but all new integrations should use Bearer tokens.

## 1. Authentication

### Register / Sign in

```http
POST /api/auth/register
Content-Type: application/json
```

Request body:

```json
{
  "email": "user@example.com",
  "name": "Jane Doe"
}
```

Response:

```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "Jane Doe",
  "credits": 1,
  "access_token": "token_value"
}
```

Notes:

- If the email already exists, the existing user and token are returned
- A new user starts with 1 credit

### Get current user

```http
GET /api/auth/me
Authorization: Bearer YOUR_TOKEN
```

### Update profile

```http
PATCH /api/auth/profile
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json
```

Request body:

```json
{
  "name": "Updated Name"
}
```

## 2. Analysis

### Upload resume

```http
POST /api/resume/upload
Content-Type: multipart/form-data
```

Supported file types:

- `.pdf`
- `.docx`
- `.txt`
- `.md`

Response:

```json
{
  "file_name": "resume.pdf",
  "extracted_text": "resume text ...",
  "char_count": 1200,
  "parser": "pdf-multi"
}
```

### Create analysis

```http
POST /api/analyze
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json
```

Request body:

```json
{
  "target_role": "Senior Backend Engineer",
  "resume_text": "resume content",
  "job_description": "job description content"
}
```

Response:

```json
{
  "session_id": 12,
  "created_at": "2026-03-27T08:00:00Z",
  "target_role": "Senior Backend Engineer",
  "routing_mode": "mock",
  "credits_remaining": 2,
  "report": {
    "match_score": 78,
    "summary": "Overall fit is solid, but there are still important skill gaps to close.",
    "strengths": ["FastAPI", "PostgreSQL", "system design experience"],
    "risks": ["Missing Kubernetes delivery evidence"],
    "gaps": [],
    "learning_plan": [],
    "interview_focus": [],
    "resume_suggestions": [],
    "recommended_model_plan": {
      "orchestrator": "gpt-4o-mini",
      "extractor": "gpt-4o-mini",
      "writer": "gpt-4o-mini",
      "reviewer": "gpt-4o-mini",
      "rationale": ["balanced for cost and speed"]
    },
    "next_actions": [],
    "validation": {
      "confidence": 82,
      "overclaim_warning": false,
      "critical_gaps": [],
      "high_priority_actions": [],
      "caution_notes": []
    }
  },
  "resume_draft": "optimized resume draft"
}
```

### Get session history

```http
GET /api/sessions?offset=0&limit=20
Authorization: Bearer YOUR_TOKEN
```

### Get session detail

```http
GET /api/sessions/{session_id}
Authorization: Bearer YOUR_TOKEN
```

### Generate interview questions

```http
POST /api/generate-questions
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json
```

Request body:

```json
{
  "session_id": 12,
  "target_role": "Senior Backend Engineer",
  "resume_text": "resume content",
  "job_description": "job description content",
  "gaps": []
}
```

Response:

```json
{
  "questions": [
    "Describe a time when you improved backend system reliability.",
    "How do you diagnose and resolve performance bottlenecks?"
  ]
}
```

## 3. Export

### Export DOCX

```http
GET /api/export/{session_id}?format=docx
Authorization: Bearer YOUR_TOKEN
```

### Export PDF

```http
GET /api/export/{session_id}?format=pdf
Authorization: Bearer YOUR_TOKEN
```

## 4. Pricing and Payment

### Get pricing catalog

```http
GET /api/pricing
```

### Mock purchase

```http
POST /api/payment/create
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json
```

Request body:

```json
{
  "package_code": "gap-report"
}
```

### Stripe Checkout

```http
POST /api/payment/create-stripe
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json
```

### Order history

```http
GET /api/payment/orders
Authorization: Bearer YOUR_TOKEN
```

### Refund

```http
POST /api/payment/refund/{order_id}
Authorization: Bearer YOUR_TOKEN
```

## 5. Dashboard

### Get dashboard data

```http
GET /api/dashboard
Authorization: Bearer YOUR_TOKEN
```

## 6. Applications

### List

```http
GET /api/applications
Authorization: Bearer YOUR_TOKEN
```

### Create

```http
POST /api/applications
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json
```

### Update

```http
PATCH /api/applications/{id}
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json
```

### Delete

```http
DELETE /api/applications/{id}
Authorization: Bearer YOUR_TOKEN
```

## 7. Learning Tasks

### List

```http
GET /api/learning-tasks
Authorization: Bearer YOUR_TOKEN
```

### Create

```http
POST /api/learning-tasks
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json
```

### Update

```http
PATCH /api/learning-tasks/{id}
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json
```

### Delete

```http
DELETE /api/learning-tasks/{id}
Authorization: Bearer YOUR_TOKEN
```

## 8. Interview Prep

### List

```http
GET /api/interview-prep
Authorization: Bearer YOUR_TOKEN
```

### Create

```http
POST /api/interview-prep
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json
```

### Update

```http
PATCH /api/interview-prep/{id}
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json
```

### Delete

```http
DELETE /api/interview-prep/{id}
Authorization: Bearer YOUR_TOKEN
```

## 9. Providers

### Get provider catalog

```http
GET /api/providers
```

## 10. Health Check

### Health endpoint

```http
GET /health
```

## Status Codes

- `200` success
- `400` bad request
- `401` unauthorized or invalid token
- `402` insufficient credits
- `404` not found
- `429` rate limited
- `500` internal server error

## Operational Notes

- Bearer token auth is active, legacy `access_token` compatibility remains
- Mock payment is suitable for local testing; production should use Stripe with webhook validation
- SQLite is fine for local development; production should use PostgreSQL
