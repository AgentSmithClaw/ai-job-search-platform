// User & Auth
export interface User {
  id: number;
  email: string;
  name: string;
  credits: number;
  created_at: string;
  access_token?: string; // only present in API responses, not stored in localStorage
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

// Analysis
export interface GapItem {
  id: string;
  type: 'expression' | 'evidence_missing' | 'skill_gap' | 'project_gap' | 'unknown';
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  suggestion: string;
  priority: 'P0' | 'P1' | 'P2';
  related_evidence?: string[];
}

export interface AnalysisSession {
  id: number;
  target_role: string;
  company?: string;
  match_score: number;
  summary: string;
  confidence?: number;
  strengths: string[];
  risks: string[];
  gaps: GapItem[];
  learning_plan: string[];
  interview_focus: string[];
  next_actions: string[];
  resume_suggestions: string;
  resume_draft: string;
  created_at: string;
  routing_mode?: string;
}

export interface SessionSummary {
  id: number;
  target_role: string;
  company?: string;
  match_score: number;
  summary: string;
  created_at: string;
}

export interface ResumeUploadResponse {
  extracted_text: string;
  filename: string;
}

// Application Tracking
export interface Application {
  id: number;
  company: string;
  role: string;
  description?: string;
  url?: string;
  salary?: string;
  notes?: string;
  status: 'interested' | 'applied' | 'interviewing' | 'offer' | 'rejected' | 'pending';
  match_score?: number;
  created_at: string;
  updated_at: string;
}

// Learning Tasks
export interface LearningTask {
  id: number;
  title: string;
  description?: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed';
  due_date?: string;
  source_analysis_id?: number;
  created_at: string;
  updated_at: string;
}

// Interview Prep
export interface InterviewPrep {
  id: number;
  question: string;
  answer?: string;
  notes?: string;
  status: 'pending' | 'prepared';
  source_analysis_id?: number;
  created_at: string;
  updated_at: string;
}

// Dashboard Stats
export interface DashboardStats {
  analyses_total: number;
  analyses_week: number;
  applications: number;
  tasks: number;
  spent: number;
  avg_match: number;
}

// Pricing
export interface PricingPlan {
  id: string;
  name: string;
  credits: number;
  price: number;
  price_display: string;
  features: string[];
  popular?: boolean;
}

// Model Routing
export interface ModelProvider {
  name: string;
  model: string;
  task: string;
  description: string;
}

// Toast
export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

// Analysis Form
export interface AnalysisFormData {
  targetRole: string;
  company?: string;
  resumeText: string;
  jobDescription: string;
  resumeFile?: File;
}
