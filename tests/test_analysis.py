import pytest
from app.services.analysis import (
    apply_local_validation,
    build_analysis,
    extract_keywords,
    classify_gap,
    has_quantification,
    build_validation,
)
from app.schemas import AnalysisReport, GapItem, ValidationSummary


class TestExtractKeywords:
    def test_extract_keywords_basic(self):
        text = "Python JavaScript SQL Git Docker Kubernetes AWS"
        keywords = extract_keywords(text, top_n=4)
        assert len(keywords) <= 4
        assert "python" in keywords or "Python" in text

    def test_extract_keywords_chinese(self):
        text = "熟悉 Python 开发，负责项目架构设计，有团队管理经验"
        keywords = extract_keywords(text, top_n=8)
        assert len(keywords) > 0

    def test_extract_keywords_removes_stopwords(self):
        text = "and the with for and the team team work work"
        keywords = extract_keywords(text, top_n=10)
        assert "and" not in [k.lower() for k in keywords]
        assert "the" not in [k.lower() for k in keywords]


class TestClassifyGap:
    def test_classify_gap_in_resume(self):
        result = classify_gap("Python", "I know Python and JavaScript")
        assert result == "expression"

    def test_classify_gap_skill_missing(self):
        result = classify_gap("Kubernetes", "I know Python and Docker")
        assert result == "skill_gap"

    def test_classify_gap_evidence_missing(self):
        result = classify_gap("Leadership", "I worked on a project")
        assert result == "evidence_missing"


class TestHasQuantification:
    def test_has_quantification_true(self):
        assert has_quantification("Improved performance by 30%")
        assert has_quantification("Reduced latency by 25% for production services")

    def test_has_quantification_false(self):
        assert not has_quantification("Responsible for development")
        assert not has_quantification("Worked in a team")


class TestBuildValidation:
    def test_validation_confidence_high_with_quantification(self):
        gaps = [
            GapItem(category="skill", severity="high", requirement="K8s", evidence="none", recommendation="learn", gap_type="skill_gap")
        ]
        validation = build_validation(
            resume_text="Achieved 40% improvement in 2022",
            jd_keywords=["Python", "K8s", "AWS"],
            matched=["Python"],
            missing=["K8s", "AWS"],
            gaps=gaps
        )
        assert validation.confidence >= 50

    def test_validation_overclaim_warning(self):
        gaps = [
            GapItem(category="skill", severity="medium", requirement="AWS", evidence="none", recommendation="learn", gap_type="skill_gap")
        ]
        validation = build_validation(
            resume_text="Good developer with excellent skills",
            jd_keywords=["Python"],
            matched=["Python"],
            missing=[],
            gaps=gaps
        )
        assert validation.overclaim_warning is True


class TestBuildAnalysis:
    def test_build_analysis_returns_report_and_draft(self):
        report, draft, mode = build_analysis(
            target_role="Python Backend Engineer",
            resume_text="Python developer with 3 years experience. Skilled in Django and PostgreSQL.",
            job_description="We need a Python backend engineer familiar with Django, PostgreSQL, and Docker.",
        )
        assert report.match_score >= 0
        assert report.match_score <= 100
        assert len(report.strengths) > 0
        assert len(report.risks) > 0
        assert len(report.gaps) >= 0
        assert len(report.learning_plan) > 0
        assert len(report.interview_focus) > 0
        assert len(draft) > 0
        assert mode in ["direct", "multi-model", "batch", "cost-balanced"]

    def test_build_analysis_score_calculation(self):
        jd = "Python JavaScript SQL Git Docker Kubernetes AWS"
        resume = "Python SQL Git Docker Python Python"
        report, _, _ = build_analysis("Engineer", resume, jd)
        assert 0 <= report.match_score <= 100


class TestApplyLocalValidation:
    def test_confidence_clamped_to_valid_range(self):
        from app.services.analysis import apply_local_validation, ValidationSummary
        from app.schemas import GapItem, RoutedModelPlan

        report = AnalysisReport(
            match_score=50,
            summary="test",
            strengths=[],
            risks=[],
            gaps=[],
            learning_plan=[],
            interview_focus=[],
            resume_suggestions=[],
            recommended_model_plan=RoutedModelPlan(
                orchestrator="gpt-4o-mini", extractor="gpt-4o-mini",
                writer="gpt-4o-mini", reviewer="gpt-4o-mini", rationale=["test"]
            ),
            next_actions=[],
            validation=ValidationSummary(
                confidence=150,
                overclaim_warning=False,
                critical_gaps=[],
                high_priority_actions=[],
                caution_notes=[]
            )
        )
        validation = apply_local_validation(
            resume_text="Python developer with 3 years experience",
            job_description="Python JavaScript SQL Git Docker",
            report=report
        )
        assert 0 <= validation.confidence <= 100

    def test_caution_added_for_missing_quantification(self):
        from app.services.analysis import apply_local_validation
        from app.schemas import GapItem, RoutedModelPlan

        report = AnalysisReport(
            match_score=70,
            summary="",
            strengths=[],
            risks=[],
            gaps=[],
            learning_plan=[],
            interview_focus=[],
            resume_suggestions=[],
            recommended_model_plan=RoutedModelPlan(
                orchestrator="gpt-4o-mini", extractor="gpt-4o-mini",
                writer="gpt-4o-mini", reviewer="gpt-4o-mini", rationale=["test"]
            ),
            next_actions=[],
            validation=ValidationSummary(
                confidence=80,
                overclaim_warning=False,
                critical_gaps=[],
                high_priority_actions=[],
                caution_notes=[]
            )
        )
        validation = apply_local_validation(
            resume_text="I am a good Python developer",
            job_description="Python SQL Docker",
            report=report
        )
        assert any("量化" in c for c in validation.caution_notes)

    def test_gap_type_inferred_for_unknown_gaps(self):
        from app.services.analysis import apply_local_validation
        from app.schemas import GapItem, RoutedModelPlan

        report = AnalysisReport(
            match_score=50,
            summary="",
            strengths=[],
            risks=[],
            gaps=[
                GapItem(
                    category="skill", severity="high",
                    requirement="Kubernetes", evidence="none",
                    recommendation="learn", gap_type="unknown"
                )
            ],
            learning_plan=[],
            interview_focus=[],
            resume_suggestions=[],
            recommended_model_plan=RoutedModelPlan(
                orchestrator="gpt-4o-mini", extractor="gpt-4o-mini",
                writer="gpt-4o-mini", reviewer="gpt-4o-mini", rationale=["test"]
            ),
            next_actions=[],
            validation=ValidationSummary(
                confidence=50, overclaim_warning=False,
                critical_gaps=[], high_priority_actions=[], caution_notes=[]
            )
        )
        validation = apply_local_validation(
            resume_text="I know Python and Docker",
            job_description="Python Kubernetes Docker",
            report=report
        )
        assert report.gaps[0].gap_type == "skill_gap"
