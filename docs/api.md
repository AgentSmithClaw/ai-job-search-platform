# API Reference

Base URL: `http://localhost:8080`

---

## 认证 Authentication

所有需要用户身份的 API 通过 `access_token` 查询参数传递 Token。

### 注册 / 登录

```
POST /api/auth/register
```

**Request Body:**

```json
{
  "email": "user@example.com",
  "name": "张三"
}
```

**Response (200):**

```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "张三",
  "credits": 1,
  "access_token": "VF8w30nXTXd8lhMzwrqxcoLg"
}
```

新用户注册自动获赠 1 次分析额度。

---

### 获取当前用户

```
GET /api/auth/me?access_token={token}
```

**Response (200):**

```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "张三",
  "credits": 3
}
```

---

### 更新用户资料

```
PATCH /api/auth/profile
```

**Request Body:**

```json
{
  "access_token": "{token}",
  "name": "新名字"
}
```

---

## 分析 Analysis

### 生成分析报告

```
POST /api/analyze
```

消耗 1 积分。

**Request Body:**

```json
{
  "access_token": "{token}",
  "target_role": "Python 后端工程师",
  "resume_text": "张三\n3年 Python 开发经验\n熟练使用 FastAPI...",
  "job_description": "岗位要求：\n1. 熟练掌握 Python...\n2. 有分布式系统经验..."
}
```

**Response (200):**

```json
{
  "session_id": 42,
  "created_at": "2026-03-20T10:30:00Z",
  "target_role": "Python 后端工程师",
  "routing_mode": "mock",
  "credits_remaining": 2,
  "report": {
    "match_score": 72,
    "summary": "整体匹配度良好...",
    "confidence": 85,
    "overclaim_warning": false,
    "strengths": ["Python 技能扎实", "FastAPI 经验"],
    "risks": ["缺乏大规模分布式经验"],
    "gaps": [
      {
        "category": "技术技能",
        "severity": "high",
        "gap_type": "skill_gap",
        "requirement": "Kubernetes 容器编排",
        "evidence": "简历中未提及相关经验",
        "recommendation": "学习 K8s 基础，完成相关项目"
      }
    ],
    "learning_plan": ["学习 K8s 基础"],
    "interview_focus": ["分布式系统设计", "K8s 经验"],
    "next_actions": ["完成 K8s 认证课程"],
    "resume_suggestions": [
      {
        "original": "负责后端开发",
        "optimized": "使用 FastAPI 构建高并发 RESTful API 服务",
        "reason": "更具体的描述技能深度"
      }
    ],
    "recommended_model_plan": {
      "orchestrator": "gpt-4o-mini",
      "extractor": "gpt-4o-mini",
      "writer": "gpt-4o-mini",
      "reviewer": "gpt-4o-mini",
      "rationale": ["基于成本和速度的平衡"]
    },
    "critical_gaps": [],
    "high_priority_actions": ["学习 K8s"],
    "caution_notes": []
  },
  "resume_draft": "张三\n==========\n\n## 职位定制简历..."
}
```

---

### 分析历史

```
GET /api/sessions?access_token={token}&offset=0&limit=20
```

**Response (200):**

```json
{
  "items": [
    {
      "id": 42,
      "created_at": "2026-03-20T10:30:00Z",
      "target_role": "Python 后端工程师",
      "match_score": 72,
      "summary": "整体匹配度良好...",
      "credits_used": 1
    }
  ],
  "total": 5,
  "offset": 0,
  "limit": 20
}
```

---

### 单个会话详情

```
GET /api/sessions/{session_id}?access_token={token}
```

**Response (200):** 包含完整报告数据（同 `/analyze`）。

---

## 简历 Resume

### 上传并解析

```
POST /api/resume/upload
Content-Type: multipart/form-data
```

| 文件格式 | 后缀 | 说明 |
|---------|------|------|
| 纯文本 | `.txt` | 直接读取 |
| Markdown | `.md` `.markdown` | 直接读取 |
| Word | `.docx` | ZIP/XML 解析 |
| PDF | `.pdf` | 文字提取 → pdfminer → OCR 三层降级 |

**Response (200):**

```json
{
  "file_name": "resume.pdf",
  "extracted_text": "张三\n3年 Python...",
  "char_count": 1250,
  "parser": "pdf-multi"
}
```

**错误 (400):**

```json
{ "detail": "PDF 文件过大（11.0MB），请上传不超过 10MB 的文件。" }
{ "detail": "PDF 文件中未提取到可读文本，可能是扫描件..." }
```

---

## 套餐与支付 Pricing & Payment

### 套餐列表

```
GET /api/pricing
```

**Response (200):**

```json
{
  "packages": [
    {
      "code": "gap-report",
      "name": "差距分析",
      "credits": 1,
      "price_cny": 29,
      "description": "输入简历和 JD，返回岗位差距分析、风险和下一步动作。",
      "includes": ["匹配度评分", "缺口拆解", "学习建议", "面试重点"]
    },
    {
      "code": "resume-polish",
      "name": "简历定制",
      "credits": 2,
      "price_cny": 49,
      "description": "在差距分析基础上生成岗位定制版简历草稿与优化建议。",
      "includes": ["定制简历草稿", "表达优化建议", "关键词覆盖建议"]
    },
    {
      "code": "full-pack",
      "name": "求职冲刺包",
      "credits": 4,
      "price_cny": 79,
      "description": "适合准备投递前的集中优化，包含分析、简历和面试准备建议。",
      "includes": ["差距分析", "定制简历", "学习计划", "面试准备重点"]
    }
  ]
}
```

---

### Mock 支付（立即到账）

```
POST /api/payment/create
```

**Request Body:**

```json
{
  "access_token": "{token}",
  "package_code": "gap-report"
}
```

**Response (200):**

```json
{
  "order_id": "ORD_xaLoAu9yGqXhIsJ3",
  "status": "completed",
  "package_name": "差距分析报告",
  "credits_added": 1,
  "credits_total": 3
}
```

---

### Stripe 支付（真实支付）

```
POST /api/payment/create-stripe
```

创建 Stripe Checkout Session，返回跳转 URL。

**Request Body:**

```json
{
  "access_token": "{token}",
  "package_code": "gap-report"
}
```

**Response (200):**

```json
{
  "order_id": "ORD_abc123",
  "checkout_url": "https://checkout.stripe.com/c/pay/...",
  "status": "pending"
}
```

支付成功后 Stripe 会向 `/api/payment/webhook` 发送回调，积分自动到账。

---

### Stripe Webhook

```
POST /api/payment/webhook
Stripe-Signature: {sig}
```

处理事件：
- `checkout.session.completed` — 标记订单完成，发放积分
- `checkout.session.expired` — 标记订单失败

---

### 订单列表

```
GET /api/payment/orders?access_token={token}
```

---

## 投递管理 Applications

| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/api/applications` | 列表 |
| POST | `/api/applications` | 新增 |
| PATCH | `/api/applications/{id}` | 更新状态 |
| DELETE | `/api/applications/{id}` | 删除 |

**状态枚举**: `interested` · `applied` · `interviewing` · `offer` · `rejected` · `withdrawn`

---

## 学习任务 Learning Tasks

| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/api/learning-tasks` | 列表 |
| POST | `/api/learning-tasks` | 新增 |
| PATCH | `/api/learning-tasks/{id}` | 更新状态 |
| DELETE | `/api/learning-tasks/{id}` | 删除 |

**优先级**: `high` · `medium` · `low`
**状态**: `pending` · `in_progress` · `completed`

---

## 面试准备 Interview Prep

| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/api/interview-prep` | 列表 |
| POST | `/api/interview-prep` | 新增 |
| PATCH | `/api/interview-prep/{id}` | 更新 |

---

## 导出 Export

```
GET /api/export/{session_id}?access_token={token}&format=docx
GET /api/export/{session_id}?access_token={token}&format=pdf
```

返回文件下载。

---

## AI 生成 AI

### 生成面试问题

```
POST /api/generate-questions
```

**Request Body:**

```json
{
  "access_token": "{token}",
  "session_id": 42,
  "target_role": "Python 后端工程师",
  "resume_text": "...",
  "job_description": "...",
  "gaps": [...]
}
```

**Response (200):**

```json
{
  "questions": [
    "请介绍一下你在 FastAPI 中如何处理认证和授权？",
    "描述一个你解决的复杂 Python 性能问题"
  ]
}
```

---

## 用户数据 Dashboard

```
GET /api/dashboard?access_token={token}
```

**Response (200):**

```json
{
  "user": { "id": 1, "email": "...", "name": "...", "credits": 3 },
  "stats": {
    "total_analyses": 5,
    "analyses_this_week": 2,
    "total_applications": 3,
    "total_tasks": 8,
    "total_spent_cny": 258,
    "average_match_score": 68.5
  }
}
```

---

## 模型路由 Providers

```
GET /api/providers
```

展示多模型协同路由策略，供用户参考选择。

---

## HTTP 状态码

| Code | 说明 |
|------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | Token 无效或过期 |
| 404 | 资源不存在 |
| 429 | 请求过于频繁（限流） |
| 500 | 服务器内部错误 |

**429 Response:**

```json
{ "detail": "请求过于频繁，请稍后再试" }
```

**500 Response:**

```json
{ "detail": "服务器内部错误，请稍后重试" }
```

响应头包含 `X-Request-ID` 便于定位日志。

---

## 错误响应格式

所有 API 错误返回统一格式：

```json
{
  "detail": "错误描述信息"
}
```
