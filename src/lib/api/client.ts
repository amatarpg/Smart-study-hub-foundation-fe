import { ApiError, UnauthorizedError, parseErrorBody } from "./errors";
import { mockDispatch, mockEnabled } from "./mock";

export interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  schoolId?: string | null;
  idempotencyKey?: string;
  signal?: AbortSignal;
  retryOnUnauthorized?: boolean;
}

type UnauthorizedListener = () => void;

export class ApiClient {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private refreshPromise: Promise<void> | null = null;
  private schoolId: string | null = null;
  private unauthorizedListeners = new Set<UnauthorizedListener>();

  readonly baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = (baseUrl ?? import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");
  }

  get isAuthenticated(): boolean {
    return this.accessToken !== null;
  }

  setTokens(accessToken: string, refreshToken: string): void {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }

  clearTokens(): void {
    this.accessToken = null;
    this.refreshToken = null;
    this.refreshPromise = null;
  }

  setSchoolId(schoolId: string | null): void {
    this.schoolId = schoolId;
  }

  onUnauthorized(listener: UnauthorizedListener): () => void {
    this.unauthorizedListeners.add(listener);
    return () => this.unauthorizedListeners.delete(listener);
  }

  private emitUnauthorized(): void {
    for (const listener of this.unauthorizedListeners) listener();
  }

  private async ensureRefreshed(): Promise<void> {
    if (!this.refreshToken) {
      this.clearTokens();
      this.emitUnauthorized();
      throw new UnauthorizedError();
    }
    if (!this.refreshPromise) {
      this.refreshPromise = this.performRefresh(this.refreshToken).finally(() => {
        this.refreshPromise = null;
      });
    }
    await this.refreshPromise;
  }

  private async performRefresh(refreshToken: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/api/v1/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    if (!res.ok) {
      this.clearTokens();
      this.emitUnauthorized();
      throw new UnauthorizedError("Sesi tidak dapat diperbarui, silakan login kembali");
    }
    const tokens = (await res.json()) as { access_token: string; refresh_token: string };
    this.setTokens(tokens.access_token, tokens.refresh_token);
  }

  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const method = options.method ?? "GET";
    if (mockEnabled()) {
      await new Promise((resolve) => setTimeout(resolve, 150));
      return mockDispatch(method, path, options.body) as T;
    }
    const attempt = async (isRetry: boolean): Promise<T> => {
      const headers: Record<string, string> = { Accept: "application/json" };
      if (options.body !== undefined) headers["Content-Type"] = "application/json";
      if (this.accessToken) headers.Authorization = `Bearer ${this.accessToken}`;
      const schoolId = options.schoolId !== undefined ? options.schoolId : this.schoolId;
      if (schoolId) headers["X-School-ID"] = schoolId;
      if (options.idempotencyKey) headers["Idempotency-Key"] = options.idempotencyKey;

      let res: Response;
      try {
        res = await fetch(`${this.baseUrl}${path}`, {
          method,
          headers,
          body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
          signal: options.signal,
        });
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") throw err;
        throw new ApiError(0, "Tidak dapat terhubung ke server API");
      }

      if (res.status === 401 && options.retryOnUnauthorized !== false && !isRetry) {
        try {
          await this.ensureRefreshed();
        } catch (err) {
          if (err instanceof UnauthorizedError) throw err;
          throw err;
        }
        return attempt(true);
      }

      if (res.status === 204) return undefined as T;

      const text = await res.text();
      const body: unknown = text ? safeJson(text) : null;
      if (!res.ok) {
        throw parseErrorBody(res.status, body);
      }
      return (body ?? undefined) as T;
    };
    return attempt(false);
  }

  get<T>(path: string, options: Omit<RequestOptions, "method" | "body"> = {}): Promise<T> {
    return this.request<T>(path, { ...options, method: "GET" });
  }

  post<T>(path: string, body?: unknown, options: Omit<RequestOptions, "method" | "body"> = {}): Promise<T> {
    return this.request<T>(path, { ...options, method: "POST", body });
  }

  put<T>(path: string, body?: unknown, options: Omit<RequestOptions, "method" | "body"> = {}): Promise<T> {
    return this.request<T>(path, { ...options, method: "PUT", body });
  }

  delete<T>(path: string, options: Omit<RequestOptions, "method" | "body"> = {}): Promise<T> {
    return this.request<T>(path, { ...options, method: "DELETE" });
  }
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export const api = new ApiClient();
