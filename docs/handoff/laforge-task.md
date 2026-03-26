# La Forge Handoff

## 你现在要做什么
收口后端 P0 风险，重点给出数据库/持久化、LLM 接入/fallback、OCR 支持边界的可裁决建议。

## 为什么现在做这个
当前项目本地主链路已能验证，但距离生产稳定交付还差后端基础设施层面的关键裁决。

## 这次做到哪里
- 明确当前后端 P0 风险
- 给出数据库替代 SQLite 的方案建议
- 明确 LLM 外部 provider 与 fallback 的当前状态
- 明确 OCR 是否应作为当前上线承诺能力
- 给出建议修复顺序

## 这次不要做什么
- 不要直接展开大规模重构
- 不要只列问题，不给方案
- 不要把未来长期架构演进混入当前 P0 收口

## 输入材料
- `PROJECT-EXECUTION-WEEKLY-AGENT-PLAN.md`
- `docs/handoff/HANDOFF-BOARD.md`
- `app/`
- `tests/`
- `README.md`

## 产物要求
主产物：`docs/handoff/laforge-p0-backend-risk.md`

至少包含：
- 风险项
- 影响
- 建议方案
- 建议优先级
- 需要 Picard 裁决点

## 验收标准
- Picard 看完后可以直接裁决数据库/LLM/OCR 方向
- Worf 可基于此继续做发布门禁判断

## 卡住时何时升级
- 发现现状与已有风险文档冲突很大
- 无法在当前信息下形成可裁决方案
- 需要 Picard 先定部署路径

## 做完回给谁
Picard
