# Uhura Handoff

## 你现在要做什么
建立本轮统一回收板，并负责回收各 agent 的 handoff 执行状态。

## 为什么现在做这个
群聊广播协作已经证明不稳定，必须把状态回收从聊天切到文档。

## 这次做到哪里
- 建立 `docs/handoff/uhura-rollup.md`
- 按 agent 汇总：是否已领取 / 是否已交付 / 主产物 / 阻塞 / 是否需要 Picard 决策
- 本轮结束后提交 1 版汇总

## 这次不要做什么
- 不要自己替各 agent 解释任务
- 不要只汇总“已收到/处理中”
- 不要把聊天原文大段搬运成成果

## 输入材料
- `PROJECT-EXECUTION-WEEKLY-AGENT-PLAN.md`
- `docs/handoff/HANDOFF-BOARD.md`
- 各 agent 对应 handoff 文件

## 产物要求
主产物：`docs/handoff/uhura-rollup.md`

至少包含：
- Agent
- Handoff 是否已领取
- 当前状态
- 主产物路径
- 阻塞
- 是否需要 Picard 决策

## 验收标准
- 能让 Picard 一眼看出谁有产物、谁没推进、谁卡住
- 不依赖翻群聊记录才能理解状态

## 卡住时何时升级
- 某 agent 未响应
- 某 agent 只有口头状态没有产物
- 多个 agent 状态冲突

## 做完回给谁
Picard
