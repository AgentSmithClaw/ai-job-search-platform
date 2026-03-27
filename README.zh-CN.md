# GapPilot Platform

[English README](./README.md)

GapPilot 是一个面向真实求职流程的 AI SaaS 平台，把简历分析、投递管理、学习任务、面试准备、导出和额度计费放在同一个产品工作流里。

这个仓库保存的是实际产品代码，不是静态原型站。

## 产品能力

- AI 简历与岗位 JD 匹配分析
- 结构化结果页查看与导出
- 投递追踪
- 学习任务管理
- 面试准备
- 额度计费与订单管理

## 技术栈

- 前端：React、TypeScript、Vite、React Query、Zustand
- 后端：FastAPI、Pydantic
- 数据库：默认 SQLite，通过 `DATABASE_URL` 支持 PostgreSQL
- 导出：DOCX / PDF
- 支付：Mock 购买流 + Stripe Checkout
- 鉴权：推荐 `Authorization: Bearer <token>`，兼容旧 `access_token`

## 仓库结构

```text
app/        FastAPI 后端
frontend/   React 前端
docs/       产品与部署文档
tests/      Smoke test 和后端测试
scripts/    构建发布脚本
public/     FastAPI 托管的前端构建产物
```

主要文档：

- [English README](./README.md)
- [文档首页](./docs/README.md)
- [API 文档](./docs/api.md)
- [部署文档](./docs/DEPLOYMENT.md)
- [生产上线清单](./docs/PRODUCTION-CHECKLIST.md)
- [贡献说明](./CONTRIBUTING.md)

## 快速开始

1. 安装后端依赖：

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

2. 复制 `.env.example` 为 `.env` 并填写配置。

3. 启动后端：

```bash
npm run dev:backend
```

4. 启动前端开发环境：

```bash
npm run dev:frontend
```

5. 构建生产前端产物：

```bash
npm run build
```

## 常用脚本

- `npm run build`：安装前端依赖、构建前端并发布到 `public/`
- `npm run build:local`：不重复执行 `npm ci` 的本地构建
- `npm run dev:backend`：以热重载模式运行 FastAPI
- `npm run dev:frontend`：运行 Vite 开发服务器
- `npm run test`：运行后端 pytest
- `npm run test:smoke`：运行 smoke test
- `npm run test:all`：运行 pytest + smoke test
- `npm run lint:frontend`：运行前端 ESLint

## 当前验证状态

截至当前仓库状态：

- `python tests/smoke_test.py`：`31/31 passed`
- `python -m pytest tests -q`：`51 passed`
- `npm run build`：通过

## 部署说明

- Vercel 构建命令：`npm run build`
- Vercel 输出目录：`public`
- 生产环境建议使用 PostgreSQL，不要继续使用 SQLite
- Stripe 正式环境需要配置密钥、Webhook 和价格 ID

详细说明见：

- [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)
- [docs/PRODUCTION-CHECKLIST.md](./docs/PRODUCTION-CHECKLIST.md)

## License

MIT
