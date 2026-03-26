# La Forge P0 Backend Risk（收口版）

更新时间：2026-03-26 16:50 CST  
负责人：La Forge（后端/基础设施）  
主产物：`docs/handoff/laforge-p0-backend-risk.md`

## 1. 当前结论
**当前后端已具备本地主链路验证基础，但仍未满足生产稳定交付要求。**

最关键的不是“功能完全不可用”，而是以下 P0 问题尚未裁决或收口：
1. 生产持久化仍停留在 SQLite
2. 发布路径仍未唯一化（Vercel / Docker 双轨）
3. LLM 正式 provider 存在，但 fallback 口径仍需明确
4. OCR 有代码路径，但生产支持边界不应默认承诺

因此，当前建议是：
**后端主链路可继续推进，但上线前必须先完成部署路径 + 持久化 + OCR 边界三项裁决。**

---

## 2. 风险项总览

| 风险项 | 当前状态 | 影响 | 建议优先级 |
|---|---|---|---|
| 生产持久化仍为 SQLite | 未收口 | 数据可靠性不足 | P0 |
| 发布路径未唯一裁决 | 未收口 | 无法形成统一上线门禁 | P0 |
| LLM provider/fallback 口径需明确 | 部分具备 | 影响分析稳定性与产品承诺 | P0 |
| OCR 代码存在但环境依赖未验证 | 未收口 | 影响扫描件 PDF 可用性 | P0 |
| 回归证据未留档 | 未收口 | 无法做正式 go 判断 | P0 |

---

## 3. 风险项详解

### 风险 1：生产持久化仍依赖 SQLite
从 `app/db.py` 可见：
- `TESTING` → `/tmp/test_ai_job_search.db`
- `VERCEL` → `/tmp/data/ai_job_search.db`
- 默认 → `data/ai_job_search.db`

### 影响
- 若走 Vercel，数据落在 `/tmp`，不适合作为可靠生产存储
- 用户、支付、分析历史、投递记录都依赖数据库
- 多实例 / 冷启动 / 重部署下的数据稳定性与一致性都有风险

### 建议方案
**短期首选方案：迁移到托管 PostgreSQL。**
原因：
- 能覆盖用户、支付、历史、投递等结构化数据需求
- 与 FastAPI / SQLAlchemy 或 sqlite 迁移路径兼容度高
- 可直接支持容器或云部署

### 不建议
- 不建议把 SQLite 继续作为正式线上数据库
- 不建议在 Vercel `/tmp` 上继续包装成“可上线方案”

### 建议优先级
**P0，必须在上线前裁决。**

---

### 风险 2：发布路径未唯一裁决
仓库同时存在：
- `vercel.json`
- `Dockerfile`
- `docker-compose.yml`

### 影响
- 测试结果无法稳定映射到生产环境
- 同一套代码在 serverless 与容器环境表现不同
- OCR、文件处理、数据库写入等能力的边界会随部署路径变化

### 建议方案
**优先建议：Docker / 容器部署作为首发路径。**
原因：
1. 当前项目是 FastAPI + 文件解析 + 导出能力，不是纯静态/纯 serverless 友好型
2. OCR、导出、依赖安装、运行时控制在容器里更稳定
3. 数据持久化、环境配置和回归验证更容易统一

### 若仍选 Vercel
则必须接受并额外解决：
- 数据库外置
- 文件处理限制
- `/tmp` 临时存储限制
- OCR 边界进一步收缩

### 建议优先级
**P0，需 Picard 立即裁决。**

---

### 风险 3：LLM 正式 provider 已接入，但 fallback 口径需收口
从 `app/services/llm.py` 与 README 可见：
- 当前走 OpenAI-compatible API
- 通过 `OPENAI_API_KEY`、`OPENAI_BASE_URL`、`OPENAI_MODEL` 配置
- 若 LLM 返回异常，分析逻辑会回退到本地 mock/build 路径的一部分
- `get_llm_service()` 在无 key 时会直接报错，但 README 表示产品可在未配置时使用 mock 分析引擎

### 影响
- 当前“无 key 能否稳定使用”需要与实际分析调用路径对齐
- 若产品口径写“无需配置 LLM API 也可用”，就必须保证服务端路径确实能稳定 fallback
- 若 fallback 只在部分异常场景有效，而无 key 场景并不一致，会造成产品承诺偏差

### 建议方案
1. **明确两种运行模式**：
   - 模式 A：正式 LLM provider 模式
   - 模式 B：Mock / fallback 演示模式
2. 对外口径明确：
   - 演示环境可走 mock
   - 正式分析质量依赖外部 provider
3. 在后端层增加更显式的 fallback 标识，避免用户误以为拿到的是正式 LLM 结果

### 建议优先级
**P0。不是一定要本轮重构，但必须完成口径收口。**

---

### 风险 4：OCR 代码存在，但不应默认承诺为首发能力
从 `app/services/resume_parser.py` 可见：
- PDF 先尝试 `pdfplumber`
- 再尝试 `pdfminer`
- 再尝试 OCR 路径
- OCR 依赖 `pytesseract`、`pypdfium2`，以及潜在系统层 `tesseract`

### 影响
- 代码层面有 OCR，不等于生产环境已具备稳定 OCR 能力
- Dockerfile 中未见系统级 tesseract 安装说明
- 若用户上传扫描版 PDF，可能出现“支持上传但无法稳定解析”的体验落差

### 建议方案
**建议本轮将 OCR 视为“非首发承诺能力”，默认降级处理。**
即：
- 首发保证 txt / docx / 文字型 pdf
- 扫描件 / 图片型 PDF 仅作为“尽力支持”，不纳入上线必过门禁
- 产品文案与错误提示明确写出边界

### 若 Picard 坚持纳入首发
则必须新增：
1. 容器系统依赖安装
2. OCR 样本回归
3. 错误提示与降级逻辑验证

### 建议优先级
**P0 裁决项。**

---

### 风险 5：回归通过证据未留档
虽然 `tests/smoke_test.py` 已采用进程内 TestClient 跑法，方向正确，但当前缺的是：
- 固定执行环境
- PASS/FAIL 留档
- 与发布路径绑定的回归结果

### 影响
- 代码“看起来可以”不等于发布门禁成立
- Worf 无法给出 go / conditional-go

### 建议方案
- 选定部署路径后，补一轮可复核 smoke + 最小回归
- 结果写回 handoff 文档

### 建议优先级
**P0。**

---

## 4. 建议修复顺序

### 第一阶段（立即）
1. Picard 裁决唯一发布路径
2. Picard 裁决 OCR 是否纳入首发
3. Picard 确认正式持久化必须替代 SQLite

### 第二阶段（本轮后端收口）
1. 定数据库目标（建议 PostgreSQL）
2. 明确环境变量与连接方式
3. 梳理 LLM 正式模式 / mock 模式口径
4. 给前端/产品同步 OCR 边界

### 第三阶段（门禁验证）
1. 在选定部署路径上跑 smoke
2. 验证支付、分析、历史、导出、投递
3. 输出通过/失败留档给 Worf

---

## 5. 推荐方案（给 Picard 的可裁决版本）

### 方案 A（推荐）
- **部署路径**：Docker / 容器
- **数据库**：PostgreSQL
- **LLM**：OpenAI-compatible provider + mock fallback 演示模式
- **OCR**：不纳入首发承诺，只做降级支持

### 为什么推荐 A
- 与当前 FastAPI 架构更匹配
- 更容易统一环境、测试和发布门禁
- 更容易解释产品边界，降低首发风险

### 方案 B（谨慎）
- **部署路径**：Vercel
- **数据库**：外置 PostgreSQL
- **OCR**：直接降级为非承诺能力

### 方案 B 的问题
- 文件处理、导出、运行时边界更容易出现额外限制
- 与当前项目形态相比，工程约束更紧

---

## 6. 需要 Picard 裁决点
1. **唯一发布路径**：是否确认首发走 Docker / 容器
2. **持久化方案**：是否确认本轮必须从 SQLite 迁移到 PostgreSQL
3. **OCR 边界**：是否确认 OCR 不纳入首发承诺能力
4. **LLM 口径**：是否接受“正式 provider + mock 演示 fallback”双模式说明

---

## 7. 对 Worf 的直接帮助
若以上裁决完成，Worf 可立即基于同一口径重建发布门禁：
- 容器环境 smoke
- PostgreSQL 持久化验证
- 分析/支付/导出主链路回归
- OCR 从必过项降级为边界说明项

---

## 8. 一句话结论
**后端当前不是“功能做不出来”，而是“上线基础设施口径还没收口”。**
只要 Picard 本轮裁决部署路径、数据库与 OCR 边界，后续发布判断会立刻清晰很多。

---

## 产物路径
- `docs/handoff/laforge-p0-backend-risk.md`
