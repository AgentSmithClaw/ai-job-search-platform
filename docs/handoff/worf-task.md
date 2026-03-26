# Worf Handoff

## 你现在要做什么
基于当前已修复的测试环境与 smoke test，重新整理发布门禁、主链路回归要求与上线阻塞清单。

## 为什么现在做这个
之前 smoke test 失败里混入了错误目标服务问题；现在测试环境与主链路已修正，需要重新校准真正的发布风险。

## 这次做到哪里
- 重新评估当前是否可进入预发/上线准备
- 明确必跑回归项
- 明确真正阻塞上线的项
- 区分“已修复问题”和“仍未解决风险”

## 这次不要做什么
- 不要沿用旧的错误 smoke test 结论
- 不要把测试环境问题继续算成产品缺陷
- 不要在没有门禁的情况下宣称接近上线

## 输入材料
- `PROJECT-EXECUTION-WEEKLY-AGENT-PLAN.md`
- `docs/handoff/HANDOFF-BOARD.md`
- `tests/smoke_test.py`
- 现有 `docs/handoff/worf-release-risk.md`

## 产物要求
主产物：`docs/handoff/worf-release-risk.md`

更新后至少包含：
- 当前结论
- 已验证事实
- 必跑回归项
- 上线阻塞项
- 建议下一步

## 验收标准
- Picard 能基于此做本轮发布判断
- 不再把“测试方式错误”误判为“产品链路坏掉”

## 卡住时何时升级
- 当前环境与原风险文档冲突太大
- 需要 Picard 先裁决唯一发布路径

## 做完回给谁
Picard
