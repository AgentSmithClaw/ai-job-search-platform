# AI Job Search Platform

智能求职差距分析平台 —— 上传简历、粘贴 JD，AI 自动分析差距、生成定制简历、规划学习路径。

**不是 Demo，是一个可上线的产品级项目。**

---

## ✨ 核心功能

| 模块 | 功能 |
|------|------|
| 🔍 **差距分析** | 基于简历和 JD 的智能匹配度分析，输出优势/风险/差距项 |
| 📝 **简历解析** | 支持 PDF/Word/TXT/Markdown，文字型 + OCR 扫描件双重解析 |
| 🤖 **AI 生成** | 调用 LLM 生成分析报告（支持 OpenAI/MiniMax 等兼容 API） |
| 📋 **定制简历** | 根据 JD 自动生成优化后的简历草稿 |
| 💰 **付费体系** | 积分制按次扣费，Mock + Stripe 双模式支付 |
| 📊 **投递管理** | 记录岗位、状态、薪资，跟踪求职进度 |
| ✅ **学习任务** | 从分析报告一键创建任务，支持优先级和截止日期 |
| 🎤 **面试准备** | AI 生成 + 手动管理面试问答 |
| 📤 **导出** | DOCX / PDF 分析报告导出 |
| 🌙 **深色模式** | 支持浅色/深色主题切换 |

---

## 🏗 技术架构

```
┌─────────────────────────────────────────────────┐
│                   Frontend                        │
│           Vanilla HTML / CSS / JS                │
│     (SPA, 响应式, 深色模式, 无框架依赖)           │
└──────────────────────┬──────────────────────────┘
                       │  HTTP REST API
┌──────────────────────▼──────────────────────────┐
│                   Backend                        │
│        FastAPI + SQLite + Pydantic             │
├──────────────────────────────────────────────┤
│  Auth  │ Analysis │ Payment │ Export │ LLM    │
│  User  │ Resume   │ Stripe  │ DOCX  │ GPT/  │
│  Credit│ Parsing  │ Webhook │ PDF   │ MiniMax│
└─────────────────────────────────────────────┘
```

**Tech Stack:**

- **Backend**: FastAPI · SQLite · Pydantic v2 · httpx
- **Frontend**: Vanilla HTML5 · CSS3 (CSS Variables) · ES6+ JavaScript
- **LLM**: OpenAI Compatible API (MiniMax / GPT / Claude 等)
- **Documents**: python-docx · reportlab · pdfplumber · pytesseract · pypdfium2
- **Payment**: Stripe Checkout · Mock 双模式
- **Dev Tools**: pytest · ruff · uvicorn

---

## 📁 项目结构

```
ai-job-search-platform/
├── app/                          # FastAPI 后端
│   ├── main.py                   # 应用入口、中间件、CORS
│   ├── dependencies.py           # FastAPI Depends 认证依赖
│   ├── schemas.py                # Pydantic 请求/响应模型
│   ├── config.py                 # 环境变量配置
│   ├── db.py                     # SQLite 数据库初始化与迁移
│   ├── routes/                   # 路由模块（FastAPI APIRouter）
│   │   ├── auth.py              # 注册、登录、用户信息
│   │   ├── analysis.py          # 分析、简历上传、导出
│   │   ├── payment.py           # 支付、订单、退款
│   │   ├── tracking.py          # 投递/任务/面试
│   │   └── misc.py              # 健康检查、仪表盘、套餐
│   └── services/                 # 业务逻辑层
│       ├── analysis.py           # 分析引擎 + 本地可信度校验
│       ├── auth.py               # 用户注册 / Token 管理
│       ├── llm.py                # LLM API 集成
│       ├── payment.py            # 支付服务（Mock + Stripe）
│       ├── pricing.py            # 套餐配置
│       ├── resume_parser.py      # 简历解析（多层降级 + OCR）
│       ├── export.py             # DOCX / PDF 导出
│       ├── routing.py            # 模型路由策略
│       ├── tracking.py           # 投递/任务/面试跟踪
│       └── email.py              # SMTP 邮件通知
│
├── frontend/                     # 前端静态资源
│   ├── index.html                # 单页应用入口（423 行）
│   ├── app.js                    # 全部前端逻辑（1429 行）
│   └── styles.css                # 样式 + 暗色模式（722 行）
│
├── tests/                        # 测试（pytest + smoke）
│   ├── conftest.py              # 测试夹具（临时数据库）
│   ├── smoke_test.py            # 集成烟雾测试（14 项）
│   ├── test_auth.py             # 认证单元测试（10 项）
│   ├── test_analysis.py         # 分析单元测试（15 项）
│   ├── test_tracking.py         # 追踪单元测试（16 项）
│   └── test_payment.py          # 支付单元测试（9 项）
│
├── docs/
│   └── api.md                    # API 端点参考文档
│
├── .github/
│   └── workflows/
│       └── ci.yml                # GitHub Actions CI（lint + test）
│
├── .gitignore
├── .env.example                  # 环境变量模板
├── requirements.txt              # Python 依赖
└── README.md
```

---

## 🚀 快速开始

### 环境要求

- Python 3.10+
- SQLite3

### 安装步骤

```bash
# 1. 克隆项目
git clone git@github.com:AgentSmithClaw/ai-job-search-platform.git
cd ai-job-search-platform

# 2. 创建虚拟环境
python3 -m venv .venv
source .venv/bin/activate        # Linux / macOS
# .venv\Scripts\activate       # Windows

# 3. 安装依赖
pip install -r requirements.txt

# 4. 配置环境变量
cp .env.example .env
# 编辑 .env 填入你的 API Key

# 5. 启动服务
uvicorn app.main:app --host 0.0.0.0 --port 8080
```

访问 **http://127.0.0.1:8080**

### 配置说明

```env
# LLM 配置（支持 OpenAI 兼容接口）
OPENAI_API_KEY=your_api_key
OPENAI_MODEL=MiniMax-M2.7                    # 或 gpt-4o-mini
OPENAI_BASE_URL=https://api.minimaxi.com/v1  # MiniMax 示例

# Stripe 支付（可选，未配置时自动降级为 Mock）
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRICE_GAP_REPORT=price_gap_report_xxx
STRIPE_PRICE_RESUME_POLISH=price_resume_polish_xxx
STRIPE_PRICE_FULL_PACK=price_full_pack_xxx

# 邮件通知（可选）
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASSWORD=app_password

# CORS（可选，默认允许本地地址）
CORS_ORIGINS=http://127.0.0.1:8080,http://localhost:3000

# 应用地址（Stripe 支付回调用）
APP_URL=https://your-domain.com
```

> 💡 **无需配置 LLM API**：未配置时自动使用内置 Mock 分析引擎，完整功能可用。

---

## 📡 API 概览

| 分类 | 端点 | 说明 |
|------|------|------|
| **认证** | `POST /api/auth/register` | 注册/登录，返回 access_token |
| | `GET /api/auth/me` | 获取当前用户信息 |
| | `PATCH /api/auth/profile` | 更新用户资料 |
| **分析** | `POST /api/analyze` | 生成分析报告（消耗 1 积分） |
| | `GET /api/sessions` | 分析历史（支持分页） |
| | `GET /api/sessions/{id}` | 单个会话详情 |
| **简历** | `POST /api/resume/upload` | 上传并解析简历文件 |
| **套餐** | `GET /api/pricing` | 套餐列表 |
| **支付** | `POST /api/payment/create` | Mock 方式购买（立即到账） |
| | `POST /api/payment/create-stripe` | Stripe Checkout（真实支付） |
| | `POST /api/payment/webhook` | Stripe Webhook 回调 |
| | `GET /api/payment/orders` | 订单历史 |
| **投递** | `GET/POST /api/applications` | 列表 / 新增 |
| | `PATCH/DELETE /api/applications/{id}` | 更新状态 / 删除 |
| **任务** | `GET/POST /api/learning-tasks` | 列表 / 新增 |
| | `PATCH/DELETE /api/learning-tasks/{id}` | 更新状态 / 删除 |
| **面试** | `GET/POST /api/interview-prep` | 列表 / 新增 |
| | `PATCH /api/interview-prep/{id}` | 更新 |
| **导出** | `GET /api/export/{session_id}?format=docx|pdf` | 导出分析报告 |
| **AI** | `POST /api/generate-questions` | 基于分析报告生成面试题 |
| **数据** | `GET /api/dashboard` | 用户统计数据 |
| | `GET /api/providers` | 模型路由策略展示 |

详细文档见 [`docs/api.md`](docs/api.md)。

---

## 🔒 安全特性

- **按用户维度积分管理** — 每次分析消耗，不可超扣
- **Token 鉴权** — 简约 Bearer Token，URL 参数传递
- **API 限流** — 按端点独立限流（/analyze 10次/分，/payment 15次/分，全局 120次/分）
- **Request ID 追踪** — 每个请求分配 UUID，便于日志定位
- **Stripe 签名验证** — Webhook 端点验证消息真实性
- **CORS 收紧** — 生产环境配置具体域名
- **全局异常处理** — 500 错误返回 Request ID

---

## 🌐 前端特性

- **SPA 单页应用** — 无需页面刷新
- **深色模式** — 一键切换，localStorage 持久化
- **骨架屏加载** — 分析提交时 shimmer 动画
- **表单自动保存** — 每 30 秒 + 输入即时保存，刷新不丢失
- **新用户引导** — 首次访问显示快速开始面板
- **相对时间** — 分析记录显示"X分钟前/X天前"
- **历史分页** — 支持加载更多
- **搜索防抖** — 300ms debounce，支持最近搜索
- **键盘快捷键** — `Ctrl+Enter` 提交，`Ctrl+S` 保存草稿
- **全局错误提示** — 5xx 错误顶部红色横幅（含 Request ID）
- **报告分享** — 一键复制分析摘要
- **差距项复制** — 每个差距卡片可一键复制
- **移动端适配** — 响应式设计

---

## 🧪 测试

```bash
# 运行烟雾测试（14 个端点检查）
python3 tests/smoke_test.py

# 运行 pytest 单元测试（49 个测试）
.venv/bin/python -m pytest tests/ -v

# pytest 结果示例
# test_auth.py          10 passed
# test_analysis.py       15 passed
# test_tracking.py       16 passed
# test_payment.py         9 passed
# Results: 49 passed
```

---

## 🚢 部署

### Docker（推荐）

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8080
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]
```

```bash
docker build -t ai-job-search-platform .
docker run -p 8080:8080 \
  -e OPENAI_API_KEY=sk-xxx \
  -e STRIPE_SECRET_KEY=sk_test_xxx \
  -e STRIPE_WEBHOOK_SECRET=whsec_xxx \
  -e APP_URL=https://your-domain.com \
  ai-job-search-platform
```

### Nginx 反向代理

```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_read_timeout 300s;   # LLM 调用可能较慢
    }
}
```

### Stripe Webhook（本地开发）

```bash
stripe listen --forward-to localhost:8080/api/payment/webhook
```

---

## 📌 路线图

- [x] Mock 分析引擎（无需 API Key 即可使用）
- [x] Stripe 真实支付集成
- [x] PDF 扫描件 OCR 解析
- [x] 深色模式
- [x] API 限流
- [x] 前端骨架屏加载
- [x] Pytest 单元测试套件
- [x] 本地可信度校验层
- [x] 退款 API
- [ ] 支付宝 / 微信支付
- [ ] 用户邮箱验证
- [ ] 批量 JD 导入
- [ ] 求职进度统计图表
- [ ] 英文界面国际化

---

## 📄 License

MIT
