from __future__ import annotations

import json
import logging
from typing import List, Optional
import openai
from app.config import settings
from app.schemas import (
    AnalysisReport,
    GapItem,
    ResumeSuggestion,
    RoutedModelPlan,
    ValidationSummary,
)

logger = logging.getLogger(__name__)


class LLMService:
    def __init__(self):
        self.client = openai.OpenAI(
            api_key=settings.OPENAI_API_KEY,
            base_url=settings.OPENAI_BASE_URL,
        )
        self.model = settings.OPENAI_MODEL

    def generate_analysis(
        self,
        target_role: str,
        resume_text: str,
        job_description: str,
    ) -> tuple[AnalysisReport, str, str]:
        prompt = self._build_analysis_prompt(target_role, resume_text, job_description)
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are a professional career advisor and resume analyst. Analyze the resume against the job description and provide structured feedback in JSON format.",
                    },
                    {"role": "user", "content": prompt},
                ],
                temperature=0.7,
                max_tokens=2000,
            )
            content = response.choices[0].message.content
            return self._parse_analysis_response(content, target_role, resume_text, job_description)
        except Exception as e:
            raise RuntimeError(f"LLM API调用失败: {str(e)}")

    def _build_analysis_prompt(
        self, target_role: str, resume_text: str, job_description: str
    ) -> str:
        return f"""请分析以下简历与目标岗位的匹配度，并生成详细的求职建议。

目标岗位：{target_role}

简历内容：
{resume_text}

岗位描述 JD：
{job_description}

请直接返回 JSON 格式的分析结果，不要包含任何思考过程或 markdown 代码块标记：
{{
  "match_score": 0-100 的匹配度分数,
  "summary": "总体评估摘要（50字以内）",
  "strengths": ["优势列表"],
  "risks": ["风险列表"],
  "gaps": [{{"category": "类别", "severity": "high/medium/low", "requirement": "要求", "evidence": "证据", "recommendation": "建议", "gap_type": "expression/evidence_missing/skill_gap"}}],
  "learning_plan": ["学习计划"],
  "interview_focus": ["面试准备重点"],
  "resume_suggestions": [{{"original": "原文", "optimized": "优化", "reason": "原因"}}],
  "recommended_model_plan": {{"orchestrator": "模型", "extractor": "模型", "writer": "模型", "reviewer": "模型", "rationale": ["说明"]}},
  "next_actions": ["下一步动作"],
  "validation": {{"confidence": 0-100, "overclaim_warning": true/false, "critical_gaps": ["关键缺口"], "high_priority_actions": ["高优先级动作"], "caution_notes": ["注意事项"]}}
}}"""

    def _parse_analysis_response(
        self,
        content: str,
        target_role: str,
        resume_text: str,
        job_description: str,
    ) -> tuple[AnalysisReport, str, str]:
        import json
        import re

        logger.info(f"LLM raw response length: {len(content) if content else 0}")

        if not content:
            from app.services.analysis import build_analysis as mock_build
            return mock_build(target_role, resume_text, job_description)

        content_clean = re.sub(r'<think>[\s\S]*?</think>', '', content)

        json_match = re.search(r'```(?:json)?\s*(\{[\s\S]*?\})\s*```', content_clean)
        if json_match:
            json_str = json_match.group(1)
        else:
            brace_count = 0
            start_idx = None
            for i, c in enumerate(content_clean):
                if c == '{':
                    if start_idx is None:
                        start_idx = i
                    brace_count += 1
                elif c == '}':
                    brace_count -= 1
                    if brace_count == 0 and start_idx is not None:
                        json_str = content_clean[start_idx:i+1]
                        break
            else:
                logger.error(f"No complete JSON found after cleaning. content_clean[:300]: {content_clean[:300]}")
                from app.services.analysis import build_analysis as mock_build
                return mock_build(target_role, resume_text, job_description)

        try:
            data = json.loads(json_str)
            logger.info(f"Successfully parsed JSON with {len(data.get('gaps', []))} gaps")
        except json.JSONDecodeError as e:
            logger.error(f"JSON parse failed: {e}, json_str[:200]: {json_str[:200]}")
            from app.services.analysis import build_analysis as mock_build
            return mock_build(target_role, resume_text, job_description)

        gaps = [
            GapItem(
                category=g.get("category", "岗位缺口"),
                severity=g.get("severity", "medium"),
                requirement=g.get("requirement", ""),
                evidence=g.get("evidence", ""),
                recommendation=g.get("recommendation", ""),
                gap_type=g.get("gap_type", "unknown")
            )
            for g in data.get("gaps", [])
        ]

        suggestions = [
            ResumeSuggestion(
                original=s.get("original", ""),
                optimized=s.get("optimized", ""),
                reason=s.get("reason", ""),
            )
            for s in data.get("resume_suggestions", [])
        ]

        plan_data = data.get("recommended_model_plan", {})
        model_plan = RoutedModelPlan(
            orchestrator=plan_data.get("orchestrator", "gpt-4o-mini"),
            extractor=plan_data.get("extractor", "gpt-4o-mini"),
            writer=plan_data.get("writer", "gpt-4o-mini"),
            reviewer=plan_data.get("reviewer", "gpt-4o-mini"),
            rationale=plan_data.get("rationale", ["使用 GPT-4o-mini 进行分析"]),
        )

        validation_data = data.get("validation", {})
        validation = ValidationSummary(
            confidence=validation_data.get("confidence", 50),
            overclaim_warning=validation_data.get("overclaim_warning", False),
            critical_gaps=validation_data.get("critical_gaps", []),
            high_priority_actions=validation_data.get("high_priority_actions", []),
            caution_notes=validation_data.get("caution_notes", [])
        )

        report = AnalysisReport(
            match_score=data.get("match_score", 50),
            summary=data.get("summary", ""),
            strengths=data.get("strengths", []),
            risks=data.get("risks", []),
            gaps=gaps,
            learning_plan=data.get("learning_plan", []),
            interview_focus=data.get("interview_focus", []),
            resume_suggestions=suggestions,
            recommended_model_plan=model_plan,
            next_actions=data.get("next_actions", []),
            validation=validation,
        )

        resume_draft = self._generate_resume_draft(
            target_role, resume_text, job_description, data
        )

        return report, resume_draft, "openai-gpt-4o-mini"

    def _generate_resume_draft(
        self,
        target_role: str,
        resume_text: str,
        job_description: str,
        analysis_data: dict,
    ) -> str:
        prompt = f"""基于以下分析，为目标岗位 "{target_role}" 生成一份定制简历草稿。

分析结果：
{json.dumps(analysis_data, ensure_ascii=False, indent=2)}

原始简历：
{resume_text}

请生成一份针对该岗位定制的简历草稿，包含：
1. 职业概述
2. 核心关键词（已覆盖和建议补强）
3. 经历改写建议

直接返回简历内容，不需要额外解释。"""

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "你是一位专业的简历撰写顾问。"},
                    {"role": "user", "content": prompt},
                ],
                temperature=0.7,
                max_tokens=1500,
            )
            return response.choices[0].message.content
        except Exception:
            return f"目标岗位：{target_role}\n\n【简历草稿生成失败，请稍后重试】"

    def generate_interview_questions(
        self,
        target_role: str,
        resume_text: str,
        job_description: str,
        gaps: list[dict],
    ) -> list[str]:
        prompt = f"""基于以下信息为目标岗位 "{target_role}" 生成 5-8 个面试问题。

目标岗位：{target_role}
简历：
{resume_text}
岗位描述：
{job_description}
差距项：
{json.dumps(gaps, ensure_ascii=False, indent=2)}

请生成面试问题列表，每个问题应该是该岗位面试中常见且重要的技术或行为问题。
只返回问题列表，每行一个问题，不要编号。"""

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "你是一位专业的面试教练，擅长为不同岗位生成有针对性的面试问题。"},
                    {"role": "user", "content": prompt},
                ],
                temperature=0.7,
                max_tokens=1000,
            )
            content = response.choices[0].message.content
            questions = [q.strip() for q in content.split('\n') if q.strip()]
            return questions
        except Exception:
            return [
                f"请描述你在 {target_role} 相关项目中的具体贡献",
                "你如何在压力下保证工作质量？",
                "描述一次你解决复杂技术问题的经历",
                "你对薪资的期望是多少？",
                "你为什么想加入我们公司？",
            ]


llm_service: Optional[LLMService] = None


def get_llm_service() -> LLMService:
    global llm_service
    if llm_service is None:
        if not settings.OPENAI_API_KEY:
            raise RuntimeError("OPENAI_API_KEY 未配置，请检查环境变量。")
        llm_service = LLMService()
    return llm_service