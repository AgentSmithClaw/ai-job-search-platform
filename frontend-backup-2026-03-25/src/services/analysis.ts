import api from './api';
import { getToken } from './auth';
import type {
  AnalysisResponse,
  AnalysisSession,
  DashboardResponse,
  PricingPackage,
  ProviderCard,
  ResumeUploadResponse,
  SessionDetailApiResponse,
  SessionSummary,
} from '../types';
import { adaptSessionDetail } from '../utils/analysis';

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
  resume_text: string;
  job_description: string;
}): Promise<AnalysisResponse> {
  const token = getToken();
  const { data } = await api.post<AnalysisResponse>('/analyze', {
    ...payload,
    access_token: token,
  });
  return data;
}

export async function getSessions(params?: { offset?: number; limit?: number }): Promise<{
  sessions: SessionSummary[];
  total: number;
  offset: number;
  limit: number;
}> {
  const { data } = await api.get<{
    items: SessionSummary[];
    total: number;
    offset: number;
    limit: number;
  }>('/sessions', { params });

  return {
    sessions: data.items,
    total: data.total,
    offset: data.offset,
    limit: data.limit,
  };
}

export async function getSession(id: number): Promise<AnalysisSession> {
  const { data } = await api.get<SessionDetailApiResponse>(`/sessions/${id}`);
  return adaptSessionDetail(data);
}

export async function getDashboard(): Promise<DashboardResponse> {
  const { data } = await api.get<DashboardResponse>('/dashboard');
  return data;
}

export async function getPricing(): Promise<PricingPackage[]> {
  const { data } = await api.get<{ packages: PricingPackage[] }>('/pricing');
  return data.packages;
}

export async function getProviders(): Promise<ProviderCard[]> {
  const { data } = await api.get<{ providers: ProviderCard[] }>('/providers');
  return data.providers;
}

export async function generateQuestions(payload: {
  session_id: number;
  target_role: string;
  resume_text: string;
  job_description: string;
  gaps: unknown[];
}): Promise<{ questions: string[] }> {
  const token = getToken();
  const { data } = await api.post<{ questions: string[] }>('/generate-questions', {
    access_token: token,
    ...payload,
  });
  return data;
}

export async function exportReport(sessionId: number, format: 'docx' | 'pdf'): Promise<Blob> {
  const { data } = await api.get<Blob>(`/export/${sessionId}`, {
    params: { format },
    responseType: 'blob',
  });
  return data;
}

export async function createCheckout(packageCode: string): Promise<{ checkout_url: string }> {
  const token = getToken();
  const { data } = await api.post<{ checkout_url: string }>('/payment/create-stripe', {
    access_token: token,
    package_code: packageCode,
  });
  return data;
}

export async function mockPurchase(packageCode: string): Promise<{
  order_id: string;
  status: string;
  package_name: string;
  credits_added: number;
  credits_total: number;
}> {
  const token = getToken();
  const { data } = await api.post('/payment/create', {
    access_token: token,
    package_code: packageCode,
  });
  return data;
}
