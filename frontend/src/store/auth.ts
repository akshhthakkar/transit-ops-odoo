import { create } from "zustand";
import { apiClient } from "@/lib/api-client";

interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  driverId: string | null;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,

  hydrate: () => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("transit_token");
    const userStr = localStorage.getItem("transit_user");
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr) as AuthUser;
        set({ token, user });
      } catch {
        localStorage.removeItem("transit_token");
        localStorage.removeItem("transit_user");
      }
    }
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post<{ token: string; user: AuthUser }>(
        "/auth/login",
        { email, password }
      );
      const { token, user } = response.data;
      localStorage.setItem("transit_token", token);
      localStorage.setItem("transit_user", JSON.stringify(user));
      set({ token, user, isLoading: false, error: null });
    } catch (err: unknown) {
      const message =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (err as any)?.response?.data?.message ?? "Invalid email or password";
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("transit_token");
      localStorage.removeItem("transit_user");
    }
    set({ user: null, token: null, error: null });
  },
}));
