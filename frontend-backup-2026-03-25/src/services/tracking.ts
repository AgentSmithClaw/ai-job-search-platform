import api from './api';
import { getToken } from './auth';
import type {
  Application,
  ApplicationCreatePayload,
  InterviewPrep,
  InterviewPrepCreatePayload,
  LearningTask,
  LearningTaskCreatePayload,
} from '../types';

export async function getApplications(): Promise<Application[]> {
  const { data } = await api.get<Application[]>('/applications');
  return data;
}

export async function createApplication(payload: ApplicationCreatePayload): Promise<Application> {
  const { data } = await api.post<Application>('/applications', payload);
  return data;
}

export async function updateApplicationStatus(id: number, status: Application['status']): Promise<void> {
  await api.patch(`/applications/${id}`, {
    access_token: getToken(),
    status,
  });
}

export async function deleteApplication(id: number): Promise<void> {
  await api.delete(`/applications/${id}`);
}

export async function getTasks(): Promise<LearningTask[]> {
  const { data } = await api.get<LearningTask[]>('/learning-tasks');
  return data;
}

export async function createTask(payload: LearningTaskCreatePayload): Promise<LearningTask> {
  const { data } = await api.post<LearningTask>('/learning-tasks', payload);
  return data;
}

export async function updateTaskStatus(id: number, status: LearningTask['status']): Promise<void> {
  await api.patch(`/learning-tasks/${id}`, {
    access_token: getToken(),
    status,
  });
}

export async function deleteTask(id: number): Promise<void> {
  await api.delete(`/learning-tasks/${id}`);
}

export async function getInterviewPrep(): Promise<InterviewPrep[]> {
  const { data } = await api.get<InterviewPrep[]>('/interview-prep');
  return data;
}

export async function createInterviewPrep(payload: InterviewPrepCreatePayload): Promise<InterviewPrep> {
  const { data } = await api.post<InterviewPrep>('/interview-prep', payload);
  return data;
}

export async function updateInterviewPrep(id: number, updates: Pick<InterviewPrep, 'ideal_answer' | 'notes' | 'status'>): Promise<void> {
  await api.patch(`/interview-prep/${id}`, {
    access_token: getToken(),
    ...updates,
  });
}
