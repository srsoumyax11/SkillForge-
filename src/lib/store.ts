import { create } from 'zustand';

interface LocalUser {
  id: string;
  email: string;
  displayName?: string;
  role: string;
}

interface AuthState {
  user: LocalUser | null;
  profile: any | null;
  loading: boolean;
  setUser: (user: LocalUser | null) => void;
  setProfile: (profile: any | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  loading: true,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ loading }),
}));

interface UIState {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isDarkMode: false,
  toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
}));
