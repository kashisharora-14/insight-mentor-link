type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

type JsonEnvelope<T> = {
  message?: string;
  data?: T;
  error?: {
    code?: string;
    message: string;
    details?: JsonValue;
  };
};

interface LoginCodeResponse {
  user_id: string;
  email: string;
  code_expires_in: number;
}

interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: JsonValue;
}

interface RegistrationResponse {
  email: string;
  code_expires_in: number;
}

const toErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  try {
    return JSON.stringify(error);
  } catch {
    return "An unexpected error occurred.";
  }
};

const resolveBaseUrl = (): string => {
  const viteUrl =
    typeof import.meta !== "undefined" &&
    typeof (import.meta as { env?: Record<string, string | undefined> }).env?.VITE_API_URL === "string"
      ? (import.meta as { env?: Record<string, string | undefined> }).env?.VITE_API_URL
      : undefined;

  if (viteUrl && viteUrl.trim().length > 0) {
    return viteUrl;
  }

  const processUrl =
    typeof process !== "undefined" &&
    typeof (process as { env?: Record<string, string | undefined> }).env?.VITE_API_URL === "string"
      ? (process as { env?: Record<string, string | undefined> }).env?.VITE_API_URL
      : undefined;

  if (processUrl && processUrl.trim().length > 0) {
    return processUrl;
  }

  return "/api";
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

class ApiClient {
  private baseURL: string = resolveBaseUrl();
  private token: string | null = null;

  constructor() {
    this.loadTokenFromStorage();
  }

  private loadTokenFromStorage(): void {
    try {
      this.token = localStorage.getItem("authToken");
    } catch (error) {
      console.error("Failed to load token from storage:", error);
      this.token = null;
    }
  }

  private saveTokenToStorage(token: string): void {
    this.token = token;
    localStorage.setItem("authToken", token);
  }

  private removeTokenFromStorage(): void {
    this.token = null;
    localStorage.removeItem("authToken");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("authUser");
  }

  private createHeaders(initHeaders?: HeadersInit): Headers {
    const headers = new Headers(initHeaders);
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    if (!this.token) {
      const stored = typeof localStorage !== "undefined" ? localStorage.getItem("authToken") : null;
      if (stored && stored.split(".").length === 3) {
        this.token = stored;
      }
    }

    if (this.token) {
      headers.set("Authorization", `Bearer ${this.token}`);
    }

    return headers;
  }

  private async makeRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
    const headers = init.body instanceof FormData ? init.headers : this.createHeaders(init.headers);
    const requestConfig: RequestInit = {
      ...init,
      headers,
    };

    const response = await fetch(`${this.baseURL}${path}`, requestConfig);

    if (response.status === 204) {
      return {} as T;
    }

    let payload: unknown = null;
    const contentType = response.headers.get("content-type");

    if (contentType && contentType.includes("application/json")) {
      payload = await response.json();
    } else {
      const text = await response.text();
      payload = text ? ({ message: text } satisfies JsonEnvelope<T>) : null;
    }

    if (!response.ok) {
      if (response.status === 401) {
        this.removeTokenFromStorage();
      }

      const envelope = isRecord(payload) ? (payload as JsonEnvelope<T>) : undefined;
      const message = envelope?.error?.message || envelope?.message || `HTTP error ${response.status}`;
      throw new Error(message);
    }

    if (isRecord(payload) && "data" in payload) {
      return (payload as JsonEnvelope<T>).data as T;
    }

    return payload as T;
  }

  private async request<T>(method: string, path: string, data?: JsonValue): Promise<T> {
    const init: RequestInit = { method };

    if (data !== undefined) {
      init.body = JSON.stringify(data);
    }

    try {
      return await this.makeRequest<T>(path, init);
    } catch (error) {
      const message = toErrorMessage(error);
      console.error(`API request failed (${method} ${path}):`, message);
      throw new Error(message);
    }
  }

  setAuthToken(token: string): void {
    if (!token || token === "null" || token === "undefined") {
      console.error("Attempted to save invalid token");
      return;
    }

    const parts = token.split(".");
    if (parts.length !== 3) {
      console.error("Token is malformed, not saving");
      return;
    }

    this.saveTokenToStorage(token);
  }

  clearAuthToken(): void {
    this.removeTokenFromStorage();
  }

  isAuthenticated(): boolean {
    const token = this.token || localStorage.getItem("authToken");
    if (!token) {
      return false;
    }

    return token.split(".").length === 3;
  }

  async sendLoginCode(identifier: string, role: string = "student"): Promise<LoginCodeResponse> {
    return this.request<LoginCodeResponse>("POST", "/auth/login", { identifier, role });
  }

  async verifyLoginCode(userId: string, code: string): Promise<AuthTokens> {
    const tokens = await this.request<AuthTokens>("POST", "/auth/verify-login-code", {
      user_id: userId,
      code,
    });

    if (isRecord(tokens) && "access_token" in tokens) {
      this.setAuthToken((tokens as AuthTokens).access_token);
    }

    return tokens;
  }

  async sendRegistrationCode(email: string, name: string, studentId?: string, role: string = "student"): Promise<RegistrationResponse> {
    return this.request<RegistrationResponse>("POST", "/auth/register/send-code", {
      email,
      name,
      studentId,
      role,
    });
  }

  async completeRegistration(email: string, code: string, password: string): Promise<AuthTokens> {
    const tokens = await this.request<AuthTokens>("POST", "/auth/register/verify", {
      email,
      code,
      password,
    });

    if (tokens.access_token) {
      this.setAuthToken(tokens.access_token);
    }

    return tokens;
  }

  async getCurrentUser(): Promise<JsonValue> {
    try {
      return await this.request<JsonValue>("GET", "/auth/me");
    } catch (error) {
      const message = toErrorMessage(error);
      if (message.includes("401") || message.includes("Invalid token")) {
        this.clearAuthToken();
      }
      throw new Error(message);
    }
  }

  async getVerificationRequests(): Promise<JsonValue> {
    return this.request<JsonValue>("GET", "/admin/verification-requests");
  }

  async approveVerification(requestId: string): Promise<JsonValue> {
    return this.request<JsonValue>("POST", `/admin/verification-requests/${requestId}/approve`);
  }

  async rejectVerification(requestId: string, notes?: string): Promise<JsonValue> {
    return this.request<JsonValue>("POST", `/admin/verification-requests/${requestId}/reject`, { notes });
  }

  async uploadCSV(file: File): Promise<JsonValue> {
    const formData = new FormData();
    formData.append("file", file);

    try {
      return await this.makeRequest<JsonValue>("/admin/csv-upload", {
        method: "POST",
        headers: this.token ? { Authorization: `Bearer ${this.token}` } : undefined,
        body: formData,
      });
    } catch (error) {
      throw new Error(toErrorMessage(error));
    }
  }

  async logout(): Promise<void> {
    try {
      await this.makeRequest<void>("/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("Logout failed:", toErrorMessage(error));
    } finally {
      this.removeTokenFromStorage();
    }
  }

  async loginLegacy(email: string, password: string): Promise<AuthTokens> {
    const endpoint = email.includes("admin") ? "/auth/admin-login" : "/auth/login-password";
    const response = await this.request<JsonValue>("POST", endpoint, { email, password });

    if (!isRecord(response)) {
      throw new Error("Unexpected response from server");
    }

    const rawToken =
      typeof response.access_token === "string"
        ? response.access_token
        : typeof response.token === "string"
        ? response.token
        : null;

    if (!rawToken || rawToken.split(".").length !== 3) {
      throw new Error("Invalid token returned by server");
    }

    this.saveTokenToStorage(rawToken);

    const userData = isRecord(response.user) ? response.user : null;
    if (userData) {
      localStorage.setItem("authUser", JSON.stringify(userData));
    }

    const tokens: AuthTokens = {
      access_token: rawToken,
      refresh_token: typeof response.refresh_token === "string" ? response.refresh_token : "",
      token_type: typeof response.token_type === "string" ? response.token_type : "bearer",
      expires_in: typeof response.expires_in === "number" ? response.expires_in : 0,
      user: userData,
    };

    return tokens;
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>("GET", endpoint);
  }

  async post<T>(endpoint: string, data: JsonValue): Promise<T> {
    return this.request<T>("POST", endpoint, data);
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  },
}

export const apiClient = new ApiClient();
export default apiClient;