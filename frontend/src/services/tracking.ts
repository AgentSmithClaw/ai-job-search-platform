import api from './api';
import type { Application, LearningTask, InterviewPrep } from '../types';

export async function getApplications(): Promise<Application[]> {
  const { data } = await api.get<Application[]>('/applications');
  return data;
}

export async function createApplication(payload: Omit<Application, 'id' | 'created_at' | 'updated_at'>): Promise<Application> {
  const { data } = await api.post<Application>('/applications', payload);
  return data;
}

export async function updateApplication(id: number, updates: Partial<Application>): Promise<Application> {
  const { data } = await api.patch<Application>(`/applications/${id}`, updates);
  return data;
}

export async function deleteApplication(id: number): Promise<void> {
  await api.delete(`/applications/${id}`);
}

export async function getTasks(): Promise<LearningTask[]> {
  const { data } = await api.get<LearningTask[]>('/learning-tasks');
  return data;
}

export async function createTask(payload: Omit<LearningTask, 'id' | 'created_at' | 'updated_at'>): Promise<LearningTask> {
  const { data } = await api.post<LearningTask>('/learning-tasks', payload);
  return data;
}

export async function updateTask(id: number, updates: Partial<LearningTask>): Promise<LearningTask> {
  const { data } = await api.patch<LearningTask>(`/learning-tasks/${id}`, updates);
  return data;
}

export async function deleteTask(id: number): Promise<void> {
  await api.delete(`/learning-tasks/${id}`);
}

export async function getInterviewPrep(): Promise<InterviewPrep[]> {
  const { data } = await api.get<InterviewPrep[]>('/interview-prep');
  return data;
}

export async function createInterviewPrep(payload: Omit<InterviewPrep, 'id' | 'created_at' | 'updated_at'>): Promise<InterviewPrep> {
  const { data } = await api.post<InterviewPrep>('/interview-prep', payload);
  return data;
}

export async function updateInterviewPrep(id: number, updates: Partial<InterviewPrep>): Promise<InterviewPrep> {
  const { data } = await api.patch<InterviewPrep>(`/interview-prep/${id}`, updates);
  return data;
}

export async function deleteInterviewPrep(id: number): Promise<void> {
  await api.delete(`/interview-prep/${id}`);
}

export async function createTasksFromAnalysis(sessionId: number): Promise<{ tasks: LearningTask[] }> {
  const { data } = await api.post<{ tasks: LearningTask[] }>('/learning-tasks/from-analysis', { session_id: sessionId });
  return data;
}
