import { create } from "zustand";
import { api } from "../lib/api/client";
import { ApiError, UnauthorizedError } from "../lib/api/errors";
import type { Tokens, UserRead } from "../lib/api/types";

export type AuthStatus = "unknown" | "authenticated" | "unauthenticated";

interface AuthState {
  status: AuthStatus;
  user: UserRead | null;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<UserRead>;
  setUnauthenticated: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  status: "unknown",
  user: null,
  error: null,

  login: async (email, password) => {
    set({ error: null });
    try {
      const tokens = await api.post<Tokens>("/api/v1/auth/login", { email, password });
      api.setTokens(tokens.access_token, tokens.refresh_token);
      const user = await get().fetchMe();
      set({ status: "authenticated", user });
    } catch (err) {
      api.clearTokens();
      set({
        status: "unauthenticated",
        user: null,
        error: err instanceof ApiError ? err.detail : "Login gagal",
      });
      throw err;
    }
  },

  logout: async () => {
    try {
      if (api.isAuthenticated) {
        await api.post("/api/v1/auth/logout");
      }
    } catch {
      // abaikan kegagalan logout jarak jauh; sesi lokal tetap dicabut
    } finally {
      api.clearTokens();
      set({ status: "unauthenticated", user: null, error: null });
    }
  },

  fetchMe: async () => {
    const user = await api.get<UserRead>("/api/v1/users/me");
    set({ user, status: "authenticated" });
    return user;
  },

  setUnauthenticated: () => {
    api.clearTokens();
    set({ status: "unauthenticated", user: null });
  },

  clearError: () => set({ error: null }),
}));

api.onUnauthorized(() => {
  const state = useAuthStore.getState();
  if (state.status === "authenticated") {
    state.setUnauthenticated();
  }
});

export function isAuthError(err: unknown): boolean {
  return err instanceof UnauthorizedError || (err instanceof ApiError && err.status === 401);
}
