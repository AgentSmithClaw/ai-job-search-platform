# GapPilot Platform

一个面向真实求职流程的 AI SaaS 平台，覆盖：

- AI 求职分析
- 简历与岗位 JD 匹配评估
- 分析报告导出
- 投递追踪
- 学习任务管理
- 面试准备
- 额度计费与订单管理

这不是静态演示站。当前仓库包含可运行的前后端、真实 API、订单流、历史记录和导出能力。

## 当前架构

- 前端：React + TypeScript + Vite + React Query + Zustand
- 后端：FastAPI + Pydantic
- 数据库：SQLite 默认，支持通过 `DATABASE_URL` 切换到 PostgreSQL
- 导出：DOCX / PDF
- 支付：Mock 支付可直接联调，Stripe Checkout 已接入

## 核心能力

### 1. AI 求职分析

- 上传 PDF / DOCX / TXT / Markdown 简历
- 粘贴目标岗位 JD
- 生成匹配分、优势、风险、差距、学习建议、面试重点和简历优化建议
- 产出结构化报告页，而不是一段难以使用的大段文本

### 2. 分析结果沉淀

- 保存分析历史
- 查看单次分析详情
- 导出 DOCX / PDF
- 从结果页一键创建学习任务
- 从结果页一键生成面试题

### 3. 求职执行管理

- 管理投递记录
- 跟踪状态：`interested / applied / interviewing / offer / rejected / withdrawn`
- 管理学习任务优先级和完成状态
- 管理面试问题、理想回答和备注

### 4. 商业化能力

- 套餐列表
- Mock 购买加额度
- Stripe Checkout 下单
- 订单列表
- 退款接口

## 认证方式

当前推荐使用：

```text
Authorization: Bearer <token>
```

为了兼容旧调用，后端仍保留部分 `access_token` query/body 字段支持，但新接入统一建议使用 Bearer Token。

## 目录结构

```text
ai-job-search-platform/
├─ app/                    # FastAPI 后端
│  ├─ main.py              # 应用入口、中间件、静态资源托管
│  ├─ routes/              # API 路由
│  ├─ services/            # 业务逻辑
│  ├─ db.py                # SQLite / PostgreSQL 连接与建表
│  └─ schemas.py           # Pydantic 模型
├─ frontend/               # React 前端工程
│  ├─ src/
│  │  ├─ pages/
│  │  ├─ services/
│  │  ├─ store/
│  │  ├─ components/
│  │  └─ utils/
│  └─ package.json
├─ public/                 # 构建后的静态资源，由 FastAPI 直接托管
├─ docs/api.md             # API 文档
├─ tests/                  # pytest + smoke test
└─ scripts/                # 构建与发布脚本
```

## 本地启动

### 1. 安装后端依赖

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env`，按需填写：

```env
OPENAI_API_KEY=your_api_key
OPENAI_MODEL=gpt-4o-mini
OPENAI_BASE_URL=https://api.openai.com/v1

STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
APP_URL=http://127.0.0.1:8080
CORS_ORIGINS=http://127.0.0.1:8080,http://localhost:3000,http://localhost:8080
DATABASE_URL=
```

- 不填写 `DATABASE_URL` 时，默认使用 SQLite
- 填写 `postgresql://...` 后，自动切换到 PostgreSQL
- 不配置 LLM 或 Stripe 时，仍可通过 mock 分析和 mock 购买完成主流程联调

### 3. 启动后端

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8080
```

### 4. 前端开发模式

```bash
cd frontend
npm install
npm run dev
```

### 5. 生产构建并发布到 FastAPI 静态目录

在仓库根目录执行：

```bash
npm run build
```

这个命令会：

1. 安装前端依赖
2. 构建 `frontend/dist`
3. 将产物发布到 `public/`

然后可直接通过后端访问：

- 首页：[http://127.0.0.1:8080/](http://127.0.0.1:8080/)
- 健康检查：[http://127.0.0.1:8080/health](http://127.0.0.1:8080/health)

## Docker Compose

仓库已内置 PostgreSQL：

```bash
docker compose up --build
```

默认会启动：

- `postgres`：PostgreSQL 16
- `gappilot`：FastAPI 应用

应用容器默认使用：

```text
postgresql://gappilot:gappilot@postgres:5432/gappilot
```

## 测试

### Smoke Test

```bash
python tests\smoke_test.py
```

当前 smoke test 覆盖：

- 健康检查
- 注册
- 获取用户信息
- 更新资料
- 套餐获取
- Provider 获取
- 简历上传
- Mock 支付
- 订单列表
- Dashboard
- 分析生成
- 历史记录
- DOCX / PDF 导出
- 投递 CRUD
- 学习任务 CRUD
- 面试准备 CRUD
- 退款

### Pytest

```bash
python -m pytest tests -q
```

## 当前验证结果

截至当前仓库状态，已验证：

- `python tests\smoke_test.py`：`31/31 passed`
- `python -m pytest tests -q`：`51 passed`
- `npm run build`：通过

## 生产化说明

已完成：

- Bearer Token 鉴权接入，保留旧 token 兼容
- SQLite / PostgreSQL 双栈支持
- Docker Compose 接入 PostgreSQL
- 前端结果页、设置页、账单页、历史页与移动端壳层继续收口
- FastAPI 直接托管前端构建产物

上线前仍建议补充：

- 正式 Stripe 密钥、Webhook 与回调域名
- 更严格的账户体系
- 统一日志、监控、告警
- 浏览器级 E2E 回归测试

## 许可证

MIT
