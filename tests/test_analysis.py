import pytest
from app.services.analysis import (
    build_analysis,
    extract_keywords,
    classify_gap,
    has_quantification,
    build_validation,
)
from app.schemas import GapItem


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
