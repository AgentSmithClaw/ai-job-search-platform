# Sulu Handoff

## 你现在要做什么
基于当前仓库状态，收口前端唯一主线方案，并把 Dashboard 从展示态推进到真实数据态计划。

## 为什么现在做这个
当前前端存在 `frontend/`、`frontend-backup-2026-03-25/`、`frontend-legacy/` 三套并存问题，不先收口，后续前端推进会继续分裂。

## 这次做到哪里
- 明确唯一主前端
- 明确 backup / legacy 的角色
- 盘点 Dashboard 接真实数据所需的最小改动
- 给出下一步代码收口顺序

## 这次不要做什么
- 不要继续维持三套并行前端
- 不要只停留在视觉点评
- 不要把长期设计系统建设混进本轮

## 输入材料
- `PROJECT-EXECUTION-WEEKLY-AGENT-PLAN.md`
- `docs/handoff/HANDOFF-BOARD.md`
- `frontend/`
- `frontend-backup-2026-03-25/`
- `frontend-legacy/`

## 产物要求
主产物：`docs/handoff/sulu-front-end-consolidation.md`

至少包含：
- 唯一主线建议
- 当前关键缺口
- Dashboard 数据态缺口
- 路由与服务层缺口
- 下一步收口顺序

## 验收标准
- Picard 能直接裁决是否确认 `frontend/` 为唯一主线
- 后续前端工作不再靠聊天口头定义

## 卡住时何时升级
- 主前端候选不止一个且难以裁决
- 当前代码状态与文档状态严重不一致
- 需要 Picard 对范围做取舍

## 做完回给谁
Picard
