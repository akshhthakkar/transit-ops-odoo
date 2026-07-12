import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'FLEET_MANAGER' | 'DRIVER' | 'SAFETY_OFFICER' | 'FINANCIAL_ANALYST';

interface AuthUser {
  id:   string;
  name: string;
  role: UserRole;
}

interface AuthState {
  user:  AuthUser | null;
  token: string | null;
  login:  (token: string, user: AuthUser) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user:  null,
      token: null,
      login:  (token, user) => set({ token, user }),
      logout: ()            => set({ token: null, user: null }),
    }),
    { name: 'transit-ops-auth' }
  )
);
