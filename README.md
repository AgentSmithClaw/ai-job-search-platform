# AI Job Search Platform

这是一个独立的求职产品项目，不是个人案例 demo。

核心目标：

1. 用户注册 / 登录
2. 上传简历或粘贴简历内容
3. 输入目标岗位 JD
4. 购买次数包
5. 生成岗位差距分析报告
6. 输出定制简历草稿
7. 保存用户级分析历史

## 当前技术栈

- FastAPI
- SQLite
- 原生 HTML / CSS / JS

## 当前已实现

- 测试账户注册与登录态
- 本地 access token 管理
- 按次收费套餐配置与充值
- 简历文本上传解析
- 岗位差距分析
- 简历优化建议与定制简历草稿
- 用户维度的分析历史记录
- 多模型路由建议展示

## 本地运行

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload
```

打开：

- `http://127.0.0.1:8000/`

## 后续路线

- 接入真实 LLM provider
- 增加支付和订单系统
- 支持 DOCX / PDF 导出
- 增加投递管理与学习计划模块
