from __future__ import annotations

import re
from collections import Counter
from typing import List

from app.schemas import AnalysisReport, GapItem, ResumeSuggestion
from app.services.routing import choose_model_plan


COMMON_STOPWORDS = {
    'and', 'the', 'with', 'for', 'you', 'your', 'will', 'are', 'our', 'that', 'from',
    'have', 'has', 'able', 'work', 'team', 'years', 'plus', 'using', 'build', 'develop',
    '经验', '负责', '熟悉', '能力', '以及', '相关', '岗位', '优先', '进行', '工作', '简历', '项目'
}


def extract_keywords(text: str, top_n: int = 16) -> List[str]:
    words = re.findall(r"[A-Za-z0-9+#\.]{2,}|[\u4e00-\u9fff]{2,}", text.lower())
    filtered = [word for word in words if word not in COMMON_STOPWORDS]
    ranked = Counter(filtered).most_common(top_n)
    return [word for word, _ in ranked]


def build_analysis(target_role: str, resume_text: str, job_description: str) -> tuple[AnalysisReport, str, str]:
    routing_mode, model_plan = choose_model_plan(target_role, resume_text, job_description)

    resume_keywords = set(extract_keywords(resume_text, top_n=20))
    jd_keywords = extract_keywords(job_description, top_n=20)
    matched = [keyword for keyword in jd_keywords if keyword in resume_keywords]
    missing = [keyword for keyword in jd_keywords if keyword not in resume_keywords]

    if jd_keywords:
        score = max(25, min(95, int(len(matched) / len(jd_keywords) * 100)))
    else:
        score = 40

    strengths = [
        f'与 {target_role} 相关的现有关键词：{", ".join(matched[:6]) or "基础经验"}',
        '现有经历已经具备重写为岗位定制版简历的基础',
        '可以基于当前材料继续生成学习计划与面试准备清单'
    ]

    risks = [
        f'当前 JD 中未明显覆盖的关键词：{", ".join(missing[:6]) or "暂无"}',
        '量化结果较少时，竞争力会受影响',
        '如果没有补充证据，部分要求只能停留在表达优化层面'
    ]

    gaps = []
    for index, keyword in enumerate(missing[:4]):
        gaps.append(
            GapItem(
                category='岗位缺口',
                severity='high' if index < 2 else 'medium',
                requirement=f'岗位要求提到 {keyword}',
                evidence='当前简历中没有检索到明确支撑，或支撑较弱',
                recommendation=f'补充与 {keyword} 相关的项目证据、结果指标或职责描述'
            )
        )

    if not gaps:
        gaps.append(
            GapItem(
                category='表达优化',
                severity='medium',
                requirement='用招聘语言提升可读性和关键词覆盖',
                evidence='已有基础匹配，但经历表述仍偏泛化',
                recommendation='使用 STAR 结构和量化指标重写核心经历'
            )
        )

    suggestions = [
        ResumeSuggestion(
            original='负责项目开发和维护。',
            optimized='负责核心功能迭代与线上稳定性优化，围绕业务目标推进需求落地并持续提升交付质量。',
            reason='把笼统职责改成更贴近招聘语言的表达'
        ),
        ResumeSuggestion(
            original='参与团队合作完成任务。',
            optimized='跨团队协作推进多个关键任务交付，协调产品、设计与开发节奏保证版本按期上线。',
            reason='增加协作场景与结果信息，让经历更可信'
        )
    ]

    learning_plan = [
        f'第 1 周：拆解 {target_role} 的 must-have 能力与关键词',
        f'第 2 周：围绕 {", ".join(missing[:3]) or "关键能力"} 补充项目证据和素材',
        '第 3 周：完善简历中的指标、动作和结果描述',
        '第 4 周：模拟面试并打磨自我介绍与 STAR 案例'
    ]

    interview_focus = [
        f'准备一段 90 秒版本的 {target_role} 定制自我介绍',
        '为两段最强经历各准备一套 STAR 故事',
        '围绕 JD 中最核心的 3 个要求准备深挖回答'
    ]

    next_actions = [
        '先确认缺口里哪些属于表达优化，哪些属于真实能力缺失。',
        '把 JD 的前 5 个 must-have 逐条映射到简历证据。',
        '生成岗位定制版简历后，继续进入面试题与学习计划模块。'
    ]

    summary = (
        f'当前简历与目标岗位 {target_role} 的基础匹配度约为 {score} 分。'
        '优先动作应聚焦在关键词补齐、经历量化以及项目证据映射。'
    )

    resume_draft = f'''目标岗位：{target_role}

【职业概述】
候选人具备与 {target_role} 相关的基础经历，能够围绕业务目标推进项目交付，并持续优化执行质量与结果表现。

【核心关键词】
- 已覆盖：{', '.join(matched[:6]) or '项目推进、跨团队协作、执行落地'}
- 建议补强：{', '.join(missing[:6]) or '量化结果、岗位关键词覆盖'}

【经历改写建议】
- 在每段经历中增加具体动作、负责范围与结果指标。
- 把与目标岗位最相关的项目提前展示，并突出业务影响。
- 对应 JD 的关键词，逐条补齐证据或替换为更准确的招聘语言。
'''

    report = AnalysisReport(
        match_score=score,
        summary=summary,
        strengths=strengths,
        risks=risks,
        gaps=gaps,
        learning_plan=learning_plan,
        interview_focus=interview_focus,
        resume_suggestions=suggestions,
        recommended_model_plan=model_plan,
        next_actions=next_actions,
    )
    return report, resume_draft, routing_mode
