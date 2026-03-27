from typing import List
from enum import Enum
from pydantic import BaseModel, EmailStr, Field


class AnalysisRequest(BaseModel):
    target_role: str = Field(min_length=2, max_length=120)
    resume_text: str = Field(min_length=20)
    job_description: str = Field(min_length=20)
    access_token: str | None = Field(default=None, min_length=8)


class GapItem(BaseModel):
    category: str
    severity: str
    requirement: str
    evidence: str
    recommendation: str
    gap_type: str = "unknown"


class GapClassification(str, Enum):
    EXPRESSION = "expression"
    EVIDENCE_MISSING = "evidence_missing"
    SKILL_GAP = "skill_gap"
    PROJECT_GAP = "project_gap"


class ValidationSummary(BaseModel):
    confidence: int
    overclaim_warning: bool
    critical_gaps: List[str]
    high_priority_actions: List[str]
    caution_notes: List[str]


class ResumeSuggestion(BaseModel):
    original: str
    optimized: str
    reason: str


class RoutedModelPlan(BaseModel):
    orchestrator: str
    extractor: str
    writer: str
    reviewer: str
    rationale: List[str]


class AnalysisReport(BaseModel):
    match_score: int
    summary: str
    strengths: List[str]
    risks: List[str]
    gaps: List[GapItem]
    learning_plan: List[str]
    interview_focus: List[str]
    resume_suggestions: List[ResumeSuggestion]
    recommended_model_plan: RoutedModelPlan
    next_actions: List[str]
    validation: ValidationSummary


class AnalysisResponse(BaseModel):
    session_id: int
    created_at: str
    target_role: str
    report: AnalysisReport
    resume_draft: str
    routing_mode: str
    credits_remaining: int


class SessionSummary(BaseModel):
    id: int
    created_at: str
    target_role: str
    match_score: int
    summary: str
    credits_used: int


class ResumeUploadResponse(BaseModel):
    file_name: str
    extracted_text: str
    char_count: int
    parser: str


class ProviderCard(BaseModel):
    name: str
    role: str
    best_for: List[str]


class ProviderCatalogResponse(BaseModel):
    providers: List[ProviderCard]


class PricingPackage(BaseModel):
    code: str
    name: str
    price_cny: float
    credits: int
    description: str
    includes: List[str]


class PricingCatalogResponse(BaseModel):
    packages: List[PricingPackage]


class RegisterRequest(BaseModel):
    email: EmailStr
    name: str = Field(min_length=2, max_length=80)


class UpdateUserRequest(BaseModel):
    access_token: str | None = Field(default=None, min_length=8)
    name: str = Field(min_length=2, max_length=80)


class UserProfile(BaseModel):
    id: int
    email: EmailStr
    name: str
    access_token: str
    credits: int


class PurchaseRequest(BaseModel):
    access_token: str | None = Field(default=None, min_length=8)
    package_code: str = Field(min_length=2)


class PurchaseResponse(BaseModel):
    package_code: str
    package_name: str
    credits_added: int
    credits_total: int
    price_cny: float


class PaymentOrderResponse(BaseModel):
    order_id: str
    created_at: str
    package_name: str
    credits: int
    price_cny: float
    status: str
    payment_method: str


class PaymentCreateRequest(BaseModel):
    access_token: str | None = Field(default=None, min_length=8)
    package_code: str = Field(min_length=2)


class PaymentCompleteRequest(BaseModel):
    order_id: str = Field(min_length=8)


class StripeCheckoutResponse(BaseModel):
    order_id: str
    checkout_url: str
    status: str = "pending"


class JobApplicationCreate(BaseModel):
    company_name: str = Field(min_length=1, max_length=120)
    target_role: str = Field(min_length=1, max_length=120)
    job_description: str = ""
    status: str = "interested"
    application_url: str = ""
    salary_range: str = ""
    notes: str = ""


class JobApplicationUpdate(BaseModel):
    access_token: str | None = Field(default=None, min_length=8)
    status: str


class JobApplicationResponse(BaseModel):
    id: int
    created_at: str
    updated_at: str | None
    company_name: str
    target_role: str
    job_description: str
    status: str
    application_url: str
    salary_range: str
    notes: str


class LearningTaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str = ""
    session_id: int | None = None
    target_date: str | None = None
    priority: str = "medium"


class LearningTaskUpdate(BaseModel):
    access_token: str | None = Field(default=None, min_length=8)
    status: str


class LearningTaskResponse(BaseModel):
    id: int
    created_at: str
    updated_at: str | None
    title: str
    description: str
    target_date: str | None
    priority: str
    status: str


class InterviewPrepCreate(BaseModel):
    question: str = Field(min_length=1)
    ideal_answer: str = ""
    notes: str = ""
    session_id: int | None = None
    application_id: int | None = None


class InterviewPrepUpdate(BaseModel):
    access_token: str | None = Field(default=None, min_length=8)
    ideal_answer: str = ""
    notes: str = ""
    status: str = "prepared"


class InterviewPrepResponse(BaseModel):
    id: int
    created_at: str
    updated_at: str | None
    question: str
    ideal_answer: str
    notes: str
    status: str


class ExportRequest(BaseModel):
    access_token: str | None = Field(default=None, min_length=8)
    session_id: int
    format: str = Field(pattern="^(docx|pdf)$")


class SessionDetail(BaseModel):
    id: int
    created_at: str
    target_role: str
    resume_text: str
    job_description: str
    report_json: str
    resume_draft: str
    credits_used: int


class GenerateQuestionsRequest(BaseModel):
    access_token: str | None = Field(default=None, min_length=8)
    session_id: int | None = None
    target_role: str = Field(min_length=2, max_length=120)
    resume_text: str = Field(min_length=20)
    job_description: str = Field(min_length=20)
    gaps: list[dict] = Field(default_factory=list)


class GenerateQuestionsResponse(BaseModel):
    questions: List[str]
