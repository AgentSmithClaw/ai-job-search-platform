# AI Job Search Platform

这是一个独立的求职产品项目，不是个人案例 demo。

## 核心功能

1. 用户注册 / 登录
2. 上传简历或粘贴简历内容
3. 输入目标岗位 JD
4. 购买次数包
5. 生成岗位差距分析报告
6. 输出定制简历草稿
7. 保存用户级分析历史
8. 投递管理（记录求职进度）
9. 学习任务管理
10. 面试准备问答库
11. 导出分析报告（DOCX/PDF）
12. 从分析报告创建学习任务
13. AI 生成面试问题
14. 用户仪表盘统计
15. 邮件通知（可选配置）

## 技术栈

- **后端**: FastAPI + SQLite
- **前端**: 原生 HTML / CSS / JS
- **LLM**: OpenAI API (可选配置，未配置时使用模拟分析)
- **导出**: python-docx, reportlab
- **PDF解析**: pdfplumber
- **邮件**: smtplib (可选配置)

## 已完成功能

- 用户注册与登录态
- 本地 access token 管理
- 按次收费套餐配置与充值
- 简历文本上传解析（txt, md, docx, pdf）
- 岗位差距分析（支持真实 LLM 调用，未配置时使用模拟分析）
- 简历优化建议与定制简历草稿
- 用户维度的分析历史记录
- 多模型路由建议展示
- 支付订单系统（模拟支付流程）
- DOCX/PDF 导出功能
- 投递管理（感兴趣/已投递/面试中/拿到offer/被拒/撤回）
- 学习任务管理（支持优先级和目标日期）
- 面试准备问答库
- 环境变量配置管理
- 邮件通知服务（可选 SMTP 配置）
- 从分析报告的学习计划一键创建任务

## 本地运行

```bash
# 1. 创建虚拟环境
python -m venv .venv

# 2. 激活虚拟环境
# Linux/Mac:
source .venv/bin/activate
# Windows:
.venv\Scripts\Activate.ps1

# 3. 安装依赖
pip install -r requirements.txt

# 4. 配置环境变量
cp .env.example .env
# 编辑 .env 填入你的配置

# 5. 启动服务
uvicorn app.main:app --reload
```

打开 http://127.0.0.1:8000/

## 环境变量配置

```env
# OpenAI API Configuration (可选，未配置时使用模拟分析)
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini
OPENAI_BASE_URL=https://api.openai.com/v1

# Application Settings
APP_DEBUG=false

# Stripe Configuration (future payment integration)
STRIPE_SECRET_KEY=your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret_here

# Email Configuration (可选，SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
FROM_EMAIL=your_email@gmail.com
```

## API 端点

### 认证
- `POST /api/auth/register` - 注册/登录
- `GET /api/auth/me` - 获取当前用户信息

### 分析
- `POST /api/analyze` - 生成分析报告
- `GET /api/sessions` - 获取分析历史
- `GET /api/sessions/{id}` - 获取单个会话详情

### 简历
- `POST /api/resume/upload` - 上传并解析简历（支持 txt, md, docx, pdf）

### 套餐与支付
- `GET /api/pricing` - 获取套餐列表
- `POST /api/purchase` - 购买套餐
- `POST /api/payment/create` - 创建支付订单
- `GET /api/payment/orders` - 获取订单列表

### 投递管理
- `POST /api/applications` - 添加投递记录
- `GET /api/applications` - 获取投递列表
- `PATCH /api/applications/{id}` - 更新投递状态
- `DELETE /api/applications/{id}` - 删除投递记录

### 学习任务
- `POST /api/learning-tasks` - 创建学习任务
- `GET /api/learning-tasks` - 获取任务列表
- `PATCH /api/learning-tasks/{id}` - 更新任务状态
- `DELETE /api/learning-tasks/{id}` - 删除任务

### 面试准备
- `POST /api/interview-prep` - 添加面试题
- `GET /api/interview-prep` - 获取面试题列表
- `PATCH /api/interview-prep/{id}` - 更新面试题

### 导出
- `GET /api/export/{session_id}?access_token=...&format=docx|pdf` - 导出分析报告

### AI 生成
- `POST /api/generate-questions` - 基于分析报告生成面试问题

### 用户仪表盘
- `GET /api/dashboard` - 获取用户统计信息

## 项目结构

```
ai-job-search-platform/
├── app/
│   ├── __init__.py
│   ├── main.py          # FastAPI 主应用
│   ├── db.py            # 数据库初始化
│   ├── schemas.py       # Pydantic 模型
│   ├── config.py        # 环境配置
│   └── services/
│       ├── __init__.py
│       ├── analysis.py  # 分析逻辑（模拟）
│       ├── auth.py      # 认证服务
│       ├── pricing.py   # 套餐配置
│       ├── resume_parser.py  # 简历解析（支持 pdf）
│       ├── routing.py   # 模型路由
│       ├── llm.py       # OpenAI LLM 服务
│       ├── payment.py   # 支付服务
│       ├── export.py    # 导出服务
│       ├── tracking.py  # 投递/任务/面试跟踪
│       └── email.py     # 邮件通知服务
├── frontend/
│   ├── index.html       # 主页面
│   ├── app.js           # 前端逻辑
│   └── styles.css       # 样式
├── data/                # SQLite 数据库目录
├── .env.example         # 环境变量示例
├── requirements.txt     # Python 依赖
└── README.md
```

## 后续路线

- [ ] 接入真实支付渠道（Stripe/支付宝/微信）
- [ ] 支持更多简历模板
- [ ] 多语言支持（英文界面）
- [ ] 用户头像和个人资料
- [ ] 分析报告分享功能
- [ ] 批量导入 JD
- [ ] 求职进度统计图表