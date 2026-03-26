# Sulu — Front-end Consolidation + Dashboard Gap List

更新时间：2026-03-26 00:36 CST
项目路径：`/home/baiyuxi/.openclaw/workspace/ai-job-search-platform`

## 1. 本轮盘点范围
- `frontend/`：当前主前端，Vite + React + TypeScript
- `frontend-legacy/`：早期单页静态版本，原生 HTML/CSS/JS
- `frontend-backup-2026-03-25/`：较完整的 React 备份版本，页面与服务层更全

## 2. 当前结论（先给结论）
- **建议将 `frontend/` 作为唯一主线前端保留。**
- **`frontend-backup-2026-03-25/` 作为功能回收来源，不作为并行运行前端。**
- **`frontend-legacy/` 仅保留作早期交互/文案参考，不再作为工程主线。**
- 当前最大的前端问题不是样式，而是**页面能力缺口、路由断层、服务层缺失、设计体系未统一回收**。

## 3. 三套前端现状差异

### A. `frontend/`（当前主前端）
已有：
- React Router 路由骨架
- 页面：`HomePage` / `Dashboard` / `AnalysisCreatePage` / `AnalysisReportPage` / `ApplicationsPage` / `BillingPage`
- 技术栈：React 19 + Vite + TypeScript + Tailwind + React Query + Zustand

缺失 / 问题：
- 路由数量明显少于备份版，缺少 `Auth / History / Interview / Settings / Tasks`
- 组件体系较薄，仅看到 `components/ui.tsx` 单点组件出口
- Dashboard 当前是**静态展示型页面**，未接真实数据态/空态/错误态
- `/analysis/:id` 与 Dashboard 内部跳转样例存在假数据链接风险
- 与 backup 版相比，服务层、store、types、utils 不完整

### B. `frontend-backup-2026-03-25/`（功能更全的 React 备份）
已有：
- 更完整的页面集合：`Dashboard / Analyze / AnalysisResult / Applications / Auth / History / Interview / Settings / Tasks / Home`
- 更清晰的目录分层：`components/layout`、`components/ui`、`services`、`store`、`types`、`utils`
- Dashboard 已接入 `react-query` 风格的数据获取，具备 live data / empty state / pricing / workspace health 等结构

问题：
- 备份版路由命名和当前主前端页面命名不完全一致（例如 `AnalyzePage` vs `AnalysisCreatePage`）
- 视觉风格与当前主前端存在分叉，不能整包直接覆盖
- 若直接双轨维护，会继续加剧工程分裂

### C. `frontend-legacy/`（原生静态版本）
已有：
- 原生 JS 流程完整度高，覆盖登录、上传、分析、历史、任务、投递、面试、支付等旧交互
- 保留了较多真实业务流程线索和边界校验逻辑

问题：
- 技术栈已过时，不适合作为继续演进主线
- 大量 DOM 拼接 + imperative 逻辑，不适合与当前 React 主线混合维护
- 更适合做“业务规则与交互清单参考源”

## 4. Dashboard 缺口清单（P1）

### 当前 `frontend/src/pages/Dashboard.tsx` 已有
- 视觉层完整
- 统计卡、最近分析、快捷操作、投递流程、AI 见解模块
- 可作为展示型 dashboard 初稿

### 关键缺口
1. **无真实数据接入**
   - 当前 `statCards` / `analysisItems` / `pipeline` 全是本地 mock
   - 未接 dashboard API、session list、pricing、user credits

2. **无状态分层**
   - 缺少 loading / empty / error 三态
   - 页面现在只适合静态展示，不适合生产运行

3. **跳转链路不完整**
   - 最近分析链接指向的详情 id 是 mock slug
   - 与当前实际 `/analysis/:id` 会话详情链路尚未校准

4. **快捷操作与真实信息架构未统一**
   - backup 版强调 Analyze / History / Tasks / Interview
   - 当前版快捷操作偏展示导向，缺少工作流导向

5. **缺少 workspace health / account capacity 模块回收**
   - backup 版已有应用统计、任务统计、花费、额度、套餐等信息架构
   - 当前版这部分信息没有接回主 Dashboard

6. **组件体系未完成沉淀**
   - 当前版和 backup 版各有一套 UI / layout 组织方式
   - 尚未形成单一 design system 入口

## 5. 前端收口方案（建议执行）

### Phase 1：工程收口（先统一主线）
- 以 `frontend/` 作为唯一运行前端
- 从 `frontend-backup-2026-03-25/` 回收以下能力到 `frontend/`：
  - `components/layout/*`
  - 可复用 `components/ui/*`
  - `services/*` 的 API 调用层
  - `types/*` / `utils/*` 基础层
- `frontend-legacy/` 不再扩展，仅提炼业务规则清单

### Phase 2：Dashboard 收口（优先）
- 把 backup 版 Dashboard 的**数据态结构**迁移到当前主 Dashboard
- 保留当前版更成熟的视觉表现，补以下能力：
  - dashboard stats
  - recent sessions
  - pricing / credits
  - 空态 / 错误态 / loading
  - 正确的详情页跳转

### Phase 3：路由补齐
按优先级补回：
1. `History`
2. `Tasks`
3. `Interview`
4. `Auth`
5. `Settings`

### Phase 4：清理历史包袱
- 在完成能力迁移后，将 `frontend-backup-2026-03-25/` 标记为归档来源
- 将 `frontend-legacy/` 标记为只读参考
- 避免继续三套前端并行演进

## 6. 建议修复优先级

### P0
- 确认唯一主前端：`frontend/`
- 停止新增功能到 `frontend-legacy/` 与 `frontend-backup-2026-03-25/`
- 明确 Dashboard 真实数据源和详情页跳转口径

### P1
- 回收 backup 版 `services / layout / ui / types / utils`
- 补 Dashboard 数据态 / 空态 / 错误态
- 补齐 `History / Tasks / Interview`

### P2
- 统一视觉 token、按钮、卡片、空态组件
- 清理 legacy 文案和旧交互残留

## 7. 本轮可验证证据
- 已完成三套前端目录盘点
- 已完成当前主前端与 backup 版 Dashboard 结构对比
- 已形成收口建议与缺口清单文档

## 8. 下一步
- 进入代码级回收：先补 `frontend` 的服务层与 Dashboard 数据态
- 然后补 `History / Tasks / Interview` 路由与页面回接

## 9. 需要 Picard 决策
- **是**
- 需要明确：是否批准 `frontend/` 为唯一主线，`frontend-backup-2026-03-25/` 只作为迁移来源、`frontend-legacy/` 只作为参考归档。
