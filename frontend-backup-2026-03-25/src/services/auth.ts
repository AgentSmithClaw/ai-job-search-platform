import api from './api';
import type { AuthResponse, User } from '../types';

export async function register(email: string, name: string): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/register', { email, name });
  return data;
}

export async function getMe(): Promise<User> {
  const { data } = await api.get<User>('/auth/me');
  return data;
}

export async function updateProfile(name: string): Promise<User> {
  const { data } = await api.patch<User>('/auth/profile', {
    access_token: getToken(),
    name,
  });
  return data;
}

export function saveToken(token: string) {
  localStorage.setItem('token', token);
}

export function getToken(): string | null {
  return localStorage.getItem('token');
}

export function saveUser(user: User) {
  const { access_token, ...safeUser } = user;
  localStorage.setItem('user', JSON.stringify(safeUser));
}

export function getUser(): User | null {
  const stored = localStorage.getItem('user');
  if (!stored) return null;

  try {
    return JSON.parse(stored) as User;
  } catch {
    return null;
  }
}

export function clearAuth() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}
