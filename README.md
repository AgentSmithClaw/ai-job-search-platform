# 🚀 GapPilot Platform

<div align="center">

[![Backend](https://img.shields.io/badge/backend-FastAPI-009688.svg)](https://fastapi.tiangolo.com/)
[![Frontend](https://img.shields.io/badge/frontend-React%20%2B%20Vite-61dafb.svg)](https://vitejs.dev/)
[![Type](https://img.shields.io/badge/type-Portfolio%20Product-2ea44f.svg)](#)

**一个面向求职场景的 AI 差距分析与执行平台**

把岗位 JD、个人简历、学习规划、投递跟进和面试准备连接成一条可执行的求职闭环。

</div>

---

## 📖 项目简介

`GapPilot Platform` 是一个聚焦 **求职分析与执行效率** 的 AI 产品项目。

很多人在求职时真正卡住的，并不是“没有岗位”，而是：

- JD 信息拆解不系统
- 简历和目标岗位的差距不够明确
- 定制简历需要反复手工改写
- 分析结果无法继续沉淀为学习任务和投递动作
- 投递进度、面试准备、复盘信息分散在不同工具里

这个项目的目标，就是把 **岗位分析**、**简历优化**、**求职执行** 串成一个统一平台，让 AI 不只生成一份报告，而是直接进入后续行动阶段。

它和 [GapPilot Playbook](https://github.com/AgentSmithClaw/ai-job-search-playbook) 的关系是：

- `GapPilot Playbook` 负责沉淀方法论
- `GapPilot Platform` 负责把方法论产品化

---

## ✨ 功能特性

- 🔍 **JD / 简历差距分析** - 自动识别优势、风险、缺口与匹配建议
- 📝 **多格式简历解析** - 支持 PDF / Word / TXT / Markdown，并兼容 OCR 扫描件
- 🤖 **AI 报告生成** - 基于 OpenAI 兼容接口生成结构化分析结果
- 📄 **定制简历输出** - 围绕目标 JD 生成更贴近岗位的简历草稿
- 📊 **求职执行管理** - 统一管理投递记录、学习任务和面试准备
- 💳 **付费与积分体系** - 支持 Mock / Stripe 两种支付模式
- 📤 **报告导出能力** - 输出 DOCX / PDF 版本的分析报告
- 🔐 **基础产品化能力** - 包含认证、限流、请求追踪、邮件通知等基础设施

---

## 🎯 适用场景

- 社招岗位定向投递
- 转岗 / 转方向求职准备
- 简历与 JD 批量匹配分析
- 作品集型 AI 产品展示
- 需要边分析边执行的求职流程管理

---

## 📁 目录结构

```bash
ai-job-search-platform/
├── app/                        # FastAPI 后端
│   ├── main.py                 # 应用入口、CORS、限流、中间件
│   ├── routes/                 # 认证 / 分析 / 支付 / 追踪路由
│   └── services/               # 简历解析、LLM、导出、支付等服务
├── frontend/                   # React + Vite 前端
│   ├── src/                    # 页面、组件、状态逻辑
│   └── package.json            # 前端依赖与脚本
├── public/                     # 构建后的前端静态产物
├── docs/
│   └── api.md                  # API 文档
├── tests/                      # pytest 测试
├── screenshots/                # 项目截图素材
├── requirements.txt            # Python 依赖
├── package.json                # 前端构建包装脚本
├── docker-compose.yml
└── README.md
```

---

## 🛠️ 技术栈

| 模块 | 技术 |
|------|------|
| 前端 | React 19 + Vite + TypeScript |
| UI | MUI + Tailwind CSS 4 |
| 状态管理 | Zustand + TanStack Query |
| 后端 | FastAPI + Pydantic |
| 数据库 | SQLite |
| 模型接入 | OpenAI Compatible API |
| 文档导出 | python-docx + reportlab |
| 简历解析 | pdfplumber + pytesseract + pypdfium2 |
| 支付 | Stripe / Mock |
| 测试 | pytest |

---

## 🧱 当前已实现内容

### 第一阶段（已完成）
- [x] FastAPI 后端 API 骨架
- [x] React 前端界面升级版
- [x] 用户注册 / 登录 / 个人资料接口
- [x] JD 与简历分析流程
- [x] 多格式简历上传与解析
- [x] 学习任务 / 投递记录 / 面试准备模块
- [x] 分析报告 DOCX / PDF 导出
- [x] Mock / Stripe 双模式支付
- [x] pytest 测试与 GitHub Actions CI

### 当前 MVP 能力
- 输入 JD 与简历后生成结构化差距分析
- 记录分析历史并查看单次会话详情
- 从分析结果延伸到任务、投递、面试准备
- 在本地构建前端并由 FastAPI 统一对外提供页面
- 在未配置真实模型时回退到 Mock 分析流程

---

## 🚀 快速开始

### 1）安装依赖

```bash
git clone git@github.com:AgentSmithClaw/ai-job-search-platform.git
cd ai-job-search-platform

python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

cd frontend
npm install
npm run build
cd ..
```

### 2）配置环境变量

```bash
cp .env.example .env
```

最少可以先配置：

```env
OPENAI_API_KEY=your_api_key
OPENAI_MODEL=gpt-4o-mini
OPENAI_BASE_URL=https://api.openai.com/v1
APP_URL=http://127.0.0.1:8080
```

如果暂时不接真实模型，也可以直接用内置 Mock 流程跑通主链路。

### 3）启动后端

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8080
```

浏览器访问：

```bash
http://127.0.0.1:8080
```

### 4）前端独立开发模式（可选）

```bash
cd frontend
npm run dev
```

---

## 🗺️ 路线图

### 第二阶段（进行中）
- [ ] 提升分析结果的可解释性与可信度
- [ ] 继续完善 React 前端的作品集级展示效果
- [ ] 把学习任务、投递记录、面试准备做成更完整工作台
- [ ] 补齐更多 Demo 数据与演示脚本

### 第三阶段（规划中）
- [ ] 增加更多模型与路由策略
- [ ] 支持更完整的简历定制与版本管理
- [ ] 增加数据统计、转化漏斗与运营侧视图
- [ ] 从作品集产品继续向可部署 SaaS 形态演进

---

## 💡 产品方向

这个项目不是单纯的“帮你改简历”的小工具，而是一个偏 **求职执行系统** 的 AI 产品。

核心想表达的能力包括：

- 把个人方法论沉淀成产品能力
- 把 AI 分析结果转化为后续行动链路
- 把求职过程从单点文档处理升级为系统化管理
- 同时覆盖产品思维、工程实现和商业化基础设施

---

## 📌 当前状态

当前已经具备 **可运行 MVP** 的核心骨架，并且从早期静态原型升级到了 **FastAPI + React** 的产品化版本。  
下一步重点，是继续收口体验细节、提升分析质量，并把它打磨成更完整的公开作品集项目。

---

<div align="center">

Made for portfolio-grade product thinking and execution-driven job search workflows.

</div>
