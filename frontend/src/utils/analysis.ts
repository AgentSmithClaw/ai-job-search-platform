import type {
  AnalysisReport,
  AnalysisResponse,
  AnalysisSession,
  ApiGapItem,
  SessionDetailApiResponse,
} from '../types';

export function parseReportJson(raw: string): AnalysisReport {
  const parsed = JSON.parse(raw) as Partial<AnalysisReport>;

  return {
    match_score: parsed.match_score ?? 0,
    summary: parsed.summary ?? '',
    strengths: parsed.strengths ?? [],
    risks: parsed.risks ?? [],
    gaps: (parsed.gaps ?? []).map((gap) => normalizeGap(gap as ApiGapItem)),
    learning_plan: parsed.learning_plan ?? [],
    interview_focus: parsed.interview_focus ?? [],
    resume_suggestions: parsed.resume_suggestions ?? [],
    recommended_model_plan: parsed.recommended_model_plan ?? {
      orchestrator: '',
      extractor: '',
      writer: '',
      reviewer: '',
      rationale: [],
    },
    next_actions: parsed.next_actions ?? [],
    validation: parsed.validation ?? {
      confidence: 0,
      overclaim_warning: false,
      critical_gaps: [],
      high_priority_actions: [],
      caution_notes: [],
    },
  };
}

export function adaptSessionDetail(response: SessionDetailApiResponse): AnalysisSession {
  return {
    id: response.id,
    created_at: response.created_at,
    target_role: response.target_role,
    resume_text: response.resume_text,
    job_description: response.job_description,
    report: parseReportJson(response.report_json),
    resume_draft: response.resume_draft,
    credits_used: response.credits_used,
  };
}

export function deriveSessionFromAnalysis(response: AnalysisResponse, resumeText: string, jobDescription: string): AnalysisSession {
  return {
    id: response.session_id,
    created_at: response.created_at,
    target_role: response.target_role,
    resume_text: resumeText,
    job_description: jobDescription,
    report: response.report,
    resume_draft: response.resume_draft,
    credits_used: 1,
  };
}

export function normalizeGap(gap: ApiGapItem): ApiGapItem {
  return {
    category: gap.category || gap.gap_type || 'Gap',
    severity: gap.severity || 'medium',
    requirement: gap.requirement || '',
    evidence: gap.evidence || '',
    recommendation: gap.recommendation || '',
    gap_type: gap.gap_type || 'unknown',
  };
}

export function scoreTone(score: number): 'strong' | 'moderate' | 'weak' {
  if (score >= 80) return 'strong';
  if (score >= 60) return 'moderate';
  return 'weak';
}
