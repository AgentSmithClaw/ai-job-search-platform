import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Toast } from '../types';
import { getUser, saveUser, clearAuth, saveToken } from '../services/auth';

// Auth Store
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  logout: () => void;
  init: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      setUser: (user) => {
        saveUser(user);
        set({ user, isAuthenticated: true });
      },
      setToken: (token) => {
        saveToken(token);
      },
      logout: () => {
        clearAuth();
        set({ user: null, isAuthenticated: false });
      },
      init: () => {
        const user = getUser();
        set({ user, isAuthenticated: !!user, isLoading: false });
      },
    }),
    { name: 'auth-storage' }
  )
);

// Theme Store
interface ThemeState {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  init: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      toggleTheme: () => {
        const next = get().theme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', next);
        set({ theme: next });
      },
      init: () => {
        const stored = get().theme;
        document.documentElement.setAttribute('data-theme', stored);
      },
    }),
    { name: 'theme-storage' }
  )
);

// Toast Store
interface ToastState {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastState>()((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = crypto.randomUUID();
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 3500);
  },
  removeToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },
}));

// Analysis Draft Store
interface DraftState {
  targetRole: string;
  company: string;
  resumeText: string;
  jobDescription: string;
  setDraft: (updates: Partial<DraftState>) => void;
  clearDraft: () => void;
}

export const useDraftStore = create<DraftState>()(
  persist(
    (set) => ({
      targetRole: '',
      company: '',
      resumeText: '',
      jobDescription: '',
      setDraft: (updates) => set((state) => ({ ...state, ...updates })),
      clearDraft: () => set({ targetRole: '', company: '', resumeText: '', jobDescription: '' }),
    }),
    { name: 'draft-storage' }
  )
);
