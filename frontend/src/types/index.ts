export interface User {
  id: number;
  email: string;
  name: string;
  credits: number;
  created_at?: string;
  access_token?: string;
}

export interface AuthResponse {
  id: number;
  email: string;
  name: string;
  access_token: string;
  credits: number;
}

export interface ApiGapItem {
  category: string;
  severity: 'high' | 'medium' | 'low' | string;
  requirement: string;
  evidence: string;
  recommendation: string;
  gap_type?: 'expression' | 'evidence_missing' | 'skill_gap' | 'project_gap' | 'unknown' | string;
}

export interface ResumeSuggestion {
  original: string;
  optimized: string;
  reason: string;
}

export interface ValidationSummary {
  confidence: number;
  overclaim_warning: boolean;
  critical_gaps: string[];
  high_priority_actions: string[];
  caution_notes: string[];
}

export interface RecommendedModelPlan {
  orchestrator: string;
  extractor: string;
  writer: string;
  reviewer: string;
  rationale: string[];
}

export interface AnalysisReport {
  match_score: number;
  summary: string;
  strengths: string[];
  risks: string[];
  gaps: ApiGapItem[];
  learning_plan: string[];
  interview_focus: string[];
  resume_suggestions: ResumeSuggestion[];
  recommended_model_plan: RecommendedModelPlan;
  next_actions: string[];
  validation: ValidationSummary;
}

export interface AnalysisResponse {
  session_id: number;
  created_at: string;
  target_role: string;
  report: AnalysisReport;
  resume_draft: string;
  routing_mode: string;
  credits_remaining: number;
}

export interface SessionSummary {
  id: number;
  created_at: string;
  target_role: string;
  match_score: number;
  summary: string;
  credits_used: number;
}

export interface SessionDetailApiResponse {
  id: number;
  created_at: string;
  target_role: string;
  resume_text: string;
  job_description: string;
  report_json: string;
  resume_draft: string;
  credits_used: number;
}

export interface AnalysisSession {
  id: number;
  created_at: string;
  target_role: string;
  resume_text: string;
  job_description: string;
  report: AnalysisReport;
  resume_draft: string;
  credits_used: number;
}

export interface ResumeUploadResponse {
  extracted_text: string;
  file_name: string;
  char_count: number;
  parser: string;
}

export interface DashboardStats {
  total_analyses: number;
  analyses_this_week: number;
  total_applications: number;
  application_by_status: Record<string, number>;
  total_tasks: number;
  task_by_status: Record<string, number>;
  total_spent_cny: number;
  average_match_score: number;
}

export interface DashboardResponse {
  user: User;
  stats: DashboardStats;
}

export interface PricingPackage {
  code: string;
  name: string;
  credits: number;
  price_cny: number;
  description: string;
  includes: string[];
}

export interface ProviderCard {
  name: string;
  role: string;
  best_for: string[];
}

export interface PaymentOrder {
  order_id: string;
  created_at: string;
  package_name: string;
  credits: number;
  price_cny: number;
  status: string;
  payment_method: string;
}

export interface Application {
  id: number;
  company_name: string;
  target_role: string;
  job_description: string;
  status: 'interested' | 'applied' | 'interviewing' | 'offer' | 'rejected' | 'withdrawn';
  application_url: string;
  salary_range: string;
  notes: string;
  created_at: string;
  updated_at: string | null;
}

export interface ApplicationCreatePayload {
  company_name: string;
  target_role: string;
  job_description?: string;
  application_url?: string;
  salary_range?: string;
  notes?: string;
  status: Application['status'];
}

export interface LearningTask {
  id: number;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed';
  target_date: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface LearningTaskCreatePayload {
  title: string;
  description?: string;
  session_id?: number | null;
  target_date?: string | null;
  priority: LearningTask['priority'];
}

export interface InterviewPrep {
  id: number;
  question: string;
  ideal_answer: string;
  notes: string;
  status: 'pending' | 'prepared';
  created_at: string;
  updated_at: string | null;
}

export interface InterviewPrepCreatePayload {
  question: string;
  ideal_answer?: string;
  notes?: string;
  session_id?: number | null;
  application_id?: number | null;
}

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

export interface AnalysisFormData {
  targetRole: string;
  resumeText: string;
  jobDescription: string;
  resumeFile?: File;
}
