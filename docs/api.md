# API Reference

Base URL:

```text
http://localhost:8080
```

除公开接口外，其余接口推荐使用 Bearer Token：

```text
Authorization: Bearer YOUR_TOKEN
```

兼容旧调用的接口仍接受 `access_token` query/body 字段，但新接入统一建议使用 Bearer Token。

## 1. Authentication

### 注册 / 登录

```http
POST /api/auth/register
Content-Type: application/json
```

请求体：

```json
{
  "email": "user@example.com",
  "name": "张三"
}
```

返回：

```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "张三",
  "credits": 1,
  "access_token": "token_value"
}
```

说明：

- 如果邮箱已存在，会返回已有用户与现有 token
- 新用户默认获得 1 个分析额度

### 获取当前用户

```http
GET /api/auth/me
Authorization: Bearer YOUR_TOKEN
```

### 更新资料

```http
PATCH /api/auth/profile
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json
```

请求体：

```json
{
  "name": "新的名字"
}
```

## 2. Analysis

### 上传简历

```http
POST /api/resume/upload
Content-Type: multipart/form-data
```

支持：

- `.pdf`
- `.docx`
- `.txt`
- `.md`

返回：

```json
{
  "file_name": "resume.pdf",
  "extracted_text": "简历文本内容...",
  "char_count": 1200,
  "parser": "pdf-multi"
}
```

### 创建分析

```http
POST /api/analyze
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json
```

请求体：

```json
{
  "target_role": "Senior Backend Engineer",
  "resume_text": "你的简历文本",
  "job_description": "岗位 JD 文本"
}
```

返回：

```json
{
  "session_id": 12,
  "created_at": "2026-03-27T08:00:00Z",
  "target_role": "Senior Backend Engineer",
  "routing_mode": "mock",
  "credits_remaining": 2,
  "report": {
    "match_score": 78,
    "summary": "整体匹配度较高，但仍有关键能力缺口。",
    "strengths": ["FastAPI", "PostgreSQL", "系统拆分经验"],
    "risks": ["缺少 Kubernetes 落地证据"],
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
  "resume_draft": "优化后的简历草稿"
}
```

### 获取历史记录

```http
GET /api/sessions?offset=0&limit=20
Authorization: Bearer YOUR_TOKEN
```

### 获取单个分析详情

```http
GET /api/sessions/{session_id}
Authorization: Bearer YOUR_TOKEN
```

### 生成面试题

```http
POST /api/generate-questions
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json
```

请求体：

```json
{
  "session_id": 12,
  "target_role": "Senior Backend Engineer",
  "resume_text": "简历内容",
  "job_description": "JD 内容",
  "gaps": []
}
```

返回：

```json
{
  "questions": [
    "请介绍一个你优化后端系统稳定性的案例",
    "你如何处理接口性能瓶颈？"
  ]
}
```

## 3. Export

### 导出 DOCX

```http
GET /api/export/{session_id}?format=docx
Authorization: Bearer YOUR_TOKEN
```

### 导出 PDF

```http
GET /api/export/{session_id}?format=pdf
Authorization: Bearer YOUR_TOKEN
```

## 4. Pricing & Payment

### 获取套餐

```http
GET /api/pricing
```

### Mock 购买

```http
POST /api/payment/create
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json
```

请求体：

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

### 订单列表

```http
GET /api/payment/orders
Authorization: Bearer YOUR_TOKEN
```

### 退款

```http
POST /api/payment/refund/{order_id}
Authorization: Bearer YOUR_TOKEN
```

## 5. Dashboard

### 获取工作台数据

```http
GET /api/dashboard
Authorization: Bearer YOUR_TOKEN
```

## 6. Applications

### 列表

```http
GET /api/applications
Authorization: Bearer YOUR_TOKEN
```

### 创建

```http
POST /api/applications
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json
```

### 更新

```http
PATCH /api/applications/{id}
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json
```

### 删除

```http
DELETE /api/applications/{id}
Authorization: Bearer YOUR_TOKEN
```

## 7. Learning Tasks

### 列表

```http
GET /api/learning-tasks
Authorization: Bearer YOUR_TOKEN
```

### 创建

```http
POST /api/learning-tasks
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json
```

### 更新

```http
PATCH /api/learning-tasks/{id}
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json
```

### 删除

```http
DELETE /api/learning-tasks/{id}
Authorization: Bearer YOUR_TOKEN
```

## 8. Interview Prep

### 列表

```http
GET /api/interview-prep
Authorization: Bearer YOUR_TOKEN
```

### 创建

```http
POST /api/interview-prep
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json
```

### 更新

```http
PATCH /api/interview-prep/{id}
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json
```

### 删除

```http
DELETE /api/interview-prep/{id}
Authorization: Bearer YOUR_TOKEN
```

## 9. Providers

### 获取模型提供方说明

```http
GET /api/providers
```

## 10. Health Check

### 健康检查

```http
GET /health
```

## 错误码

- `200` 成功
- `400` 请求参数错误
- `401` 未授权 / token 无效
- `402` 额度不足
- `404` 资源不存在
- `429` 触发限流
- `500` 服务端异常

## 当前约束

- Bearer Token 已接入，旧 `access_token` 仍保留兼容
- Mock 支付适合测试环境，正式上线请启用 Stripe 并配置 webhook
- 数据库默认 SQLite，生产环境建议使用 PostgreSQL
