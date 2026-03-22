import api from './api';
import type { AnalysisSession, SessionSummary, ResumeUploadResponse, DashboardStats, PricingPlan, ModelProvider } from '../types';

export type { AnalysisSession, SessionSummary, ResumeUploadResponse, DashboardStats, PricingPlan, ModelProvider };

export async function uploadResume(file: File): Promise<ResumeUploadResponse> {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await api.post<ResumeUploadResponse>('/resume/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function analyze(payload: {
  target_role: string;
  company?: string;
  resume_text: string;
  job_description: string;
}): Promise<{ session_id: number }> {
  const { data } = await api.post<{ session_id: number }>('/analyze', payload);
  return data;
}

export async function getSessions(params?: { offset?: number; limit?: number; search?: string }): Promise<{
  sessions: SessionSummary[];
  total: number;
}> {
  const { data } = await api.get<{ sessions: SessionSummary[]; total: number }>('/sessions', { params });
  return data;
}

export async function getSession(id: number): Promise<AnalysisSession> {
  const { data } = await api.get<AnalysisSession>(`/sessions/${id}`);
  return data;
}

export async function deleteSession(id: number): Promise<void> {
  await api.delete(`/sessions/${id}`);
}

export async function getDashboard(): Promise<DashboardStats> {
  const { data } = await api.get<DashboardStats>('/dashboard');
  return data;
}

export async function getPricing(): Promise<PricingPlan[]> {
  const { data } = await api.get<{ plans: PricingPlan[] }>('/pricing');
  return data.plans;
}

export async function getProviders(): Promise<{ providers: ModelProvider[] }> {
  const { data } = await api.get<{ providers: ModelProvider[] }>('/providers');
  return data;
}

export async function generateQuestions(sessionId: number): Promise<{ questions: string[] }> {
  const { data } = await api.post<{ questions: string[] }>('/generate-questions', { session_id: sessionId });
  return data;
}

export async function exportReport(sessionId: number, format: 'docx' | 'pdf'): Promise<Blob> {
  const { data } = await api.get<Blob>(`/export/${sessionId}`, {
    params: { format },
    responseType: 'blob',
  });
  return data;
}

export async function createCheckout(priceId: string): Promise<{ checkout_url: string }> {
  const { data } = await api.post<{ checkout_url: string }>('/payment/create-stripe', { price_id: priceId });
  return data;
}

export async function mockPurchase(planId: string): Promise<{ order_id: number }> {
  const { data } = await api.post<{ order_id: number }>('/payment/create', { plan_id: planId });
  return data;
}
