from typing import List
from pydantic import BaseModel, EmailStr, Field


class AnalysisRequest(BaseModel):
    target_role: str = Field(min_length=2, max_length=120)
    resume_text: str = Field(min_length=20)
    job_description: str = Field(min_length=20)
    access_token: str = Field(min_length=8)


class GapItem(BaseModel):
    category: str
    severity: str
    requirement: str
    evidence: str
    recommendation: str


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


class AnalysisResponse(BaseModel):
    session_id: int
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
    price_cny: int
    credits: int
    description: str
    includes: List[str]


class PricingCatalogResponse(BaseModel):
    packages: List[PricingPackage]


class RegisterRequest(BaseModel):
    email: EmailStr
    name: str = Field(min_length=2, max_length=80)


class UserProfile(BaseModel):
    id: int
    email: EmailStr
    name: str
    access_token: str
    credits: int


class PurchaseRequest(BaseModel):
    access_token: str = Field(min_length=8)
    package_code: str = Field(min_length=2)


class PurchaseResponse(BaseModel):
    package_code: str
    package_name: str
    credits_added: int
    credits_total: int
    price_cny: int
