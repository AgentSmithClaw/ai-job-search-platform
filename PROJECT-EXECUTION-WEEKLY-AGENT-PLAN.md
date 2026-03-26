# GapPilot Platform — Handoff Board（本周执行版）

更新时间：2026-03-26
项目目录：`/home/baiyuxi/.openclaw/workspace/ai-job-search-platform`

> 本文件即当前唯一主控排期文件。  
> 从现在开始，**群聊不再承担长任务下发**；群聊只做：通知、异常、完成回报。  
> 具体执行以 `docs/handoff/*.md` 为准。

---

## 一、当前切换决定

由于群聊派单出现以下问题：
- 广播式催办多，稳定执行少
- 口头“收到/处理中”多，可验证产物少
- 信息散在聊天里，不利于 Picard 裁决
- Uhura 需要重复做聊天收口，效率低

因此本周协作方式切换为：

**Picard 主控板 → Agent Handoff 单 → Agent 产物回填 → Uhura 汇总 → Picard 裁决**

---

## 二、当前阶段目标

本周不是平均推进全部功能，而是先把产品从“能展示”推进到“可稳定交付”的前夜状态。

### 当前优先级
1. **P0：生产主链路收口**
   - 唯一发布路径
   - 数据持久化方案
   - LLM 配置与 fallback 健康度
   - OCR 支持边界
   - smoke / 回归门禁

2. **P1：前端主线收口**
   - `frontend/` 成为唯一主前端
   - Dashboard 接真实数据态
   - 补关键路由缺口

3. **P1：产品与验收口径收口**
   - 差距分析主流程
   - 投递管理
   - 最小可交付范围与非范围

---

## 三、统一执行规则

### 1. 任务只认 handoff 文件
各 agent 只按对应 handoff 文件执行，不再以群聊长消息作为正式任务输入。

### 2. 没有产物路径，不算完成
回复里若没有：
- 主产物
- 产物路径
则默认记为**未形成有效进度**。

### 3. 群聊只允许三类消息
1. Picard：通知 handoff 已更新
2. Agent：提交产物路径 / 阻塞
3. Uhura：汇总本轮结果

### 4. 阻塞必须可裁决
阻塞上报必须包含：
- 卡点是什么
- 影响什么
- 需要谁决策
- 建议方案（若有）

### 5. Uhura 不再以聊天口头状态为主
Uhura 只汇总：
- handoff 是否已领取
- 产物是否已交付
- 是否有阻塞
- 是否需要 Picard 裁决

---

## 四、本轮 handoff 文件

### 主控 / 汇总
- `docs/handoff/HANDOFF-BOARD.md`
- `docs/handoff/uhura-task.md`

### 产品 / 规格
- `docs/handoff/spock-task.md`

### 前端
- `docs/handoff/sulu-task.md`

### 后端 / AI / 数据
- `docs/handoff/laforge-task.md`

### 测试 / 发布
- `docs/handoff/worf-task.md`

---

## 五、本轮任务分配总表

| Agent | 本轮目标 | 主产物 | 状态 |
|---|---|---|---|
| Picard | 主控、裁决、收口 | `PROJECT-EXECUTION-WEEKLY-AGENT-PLAN.md` / `docs/handoff/HANDOFF-BOARD.md` | 进行中 |
| Uhura | 回收各 agent 状态并输出汇总板 | `docs/handoff/uhura-rollup.md` | 待执行 |
| Spock | 收口 MVP 范围、主流程、验收口径 | `docs/handoff/spock-p1-spec.md` | 待执行 |
| Sulu | 前端唯一主线收口、Dashboard 真实数据态计划 | `docs/handoff/sulu-front-end-consolidation.md` | 待执行 |
| La Forge | 数据库 / LLM / OCR / 后端 P0 修复方案 | `docs/handoff/laforge-p0-backend-risk.md` | 待执行 |
| Worf | 发布门禁、主链路回归、上线阻塞清单 | `docs/handoff/worf-release-risk.md` | 待执行 |

---

## 六、Picard 本轮裁决预设

### 已确认
- `frontend/` 是当前主前端候选主线
- 测试环境问题已修复
- smoke test 已修正为进程内自包含跑法
- 当前项目已具备“本地可验证主链路”基础

### 仍待裁决
1. 生产唯一发布路径：Vercel 还是 Docker/容器部署
2. 数据持久化方案：SQLite 替代方案
3. OCR 是否属于当前上线承诺能力
4. 外部 LLM provider 的正式接入策略

---

## 七、完成定义（本轮）

本轮不要求全部开发完成。完成定义是：

1. 各 agent 都以 handoff 形式交付至少一份可验证主产物
2. 至少形成 1 版可供 Picard 裁决的：
   - 发布路径建议
   - 数据持久化建议
   - MVP 范围与验收口径
3. Uhura 输出统一汇总，不再依赖聊天翻记录
4. 群聊派单正式退出，handoff 机制开始取代

---

## 八、下一步执行顺序

1. Picard 生成并发出 handoff
2. 各 agent 只认自己的 handoff 单开工
3. Uhura 建立 `uhura-rollup.md` 回收状态
4. 本轮结束后，Picard 基于产物做第一轮裁决

---

## 九、说明

本文件已由“群聊排期表”改写为“handoff 主控板”。  
后续若要继续扩展多 agent 协作，也应优先扩展 handoff 机制，而不是恢复群聊长任务广播。
