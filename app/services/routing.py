from app.schemas import RoutedModelPlan


def choose_model_plan(target_role: str, resume_text: str, job_description: str) -> tuple[str, RoutedModelPlan]:
    combined = f"{target_role}\n{resume_text}\n{job_description}"
    chinese_heavy = sum(1 for ch in combined if '\u4e00' <= ch <= '\u9fff') > len(combined) * 0.08
    long_context = len(combined) > 3500

    if chinese_heavy and long_context:
        mode = 'china-long-context'
        plan = RoutedModelPlan(
            orchestrator='gpt-5.4',
            extractor='kimi-2.5',
            writer='claude-opus-4.6',
            reviewer='gpt-5.4',
            rationale=[
                '中文 JD 和简历更适合先交给 Kimi 做长文本抽取。',
                '综合判断和最终优先级建议交给 GPT-5.4。',
                '简历改写和表达润色交给 Claude Opus。'
            ],
        )
    elif chinese_heavy:
        mode = 'china-default'
        plan = RoutedModelPlan(
            orchestrator='gpt-5.4',
            extractor='kimi-2.5',
            writer='claude-opus-4.6',
            reviewer='claude-opus-4.6',
            rationale=[
                '中文语料为主，先用 Kimi 做抽取和整理。',
                '最终报告由 GPT-5.4 做综合推理。',
                '面向招聘语言的润色由 Claude Opus 负责。'
            ],
        )
    elif long_context:
        mode = 'long-context'
        plan = RoutedModelPlan(
            orchestrator='gpt-5.4',
            extractor='gpt-5.4',
            writer='claude-opus-4.6',
            reviewer='gpt-5.4',
            rationale=[
                '输入较长时优先保证长上下文稳定性。',
                'GPT-5.4 负责整合多段信息和生成最终判断。',
                'Claude Opus 用于输出更自然的简历表达。'
            ],
        )
    else:
        mode = 'cost-balanced'
        plan = RoutedModelPlan(
            orchestrator='gpt-5.4',
            extractor='minimax-m2.5',
            writer='claude-opus-4.6',
            reviewer='gpt-5.4',
            rationale=[
                '先用 MiniMax M2.5 做低成本抽取和初稿。',
                '关键判断和最终交付仍交给 GPT-5.4 与 Claude Opus。',
                '这种组合更适合做按次收费的成本控制。'
            ],
        )

    return mode, plan
