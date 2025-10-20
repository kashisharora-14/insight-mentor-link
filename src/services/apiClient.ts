/**
 * API Client service to replace Supabase client
 * Handles communication with Flask backend
 */

interface ApiResponse<T = any> {
  message?: string;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

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
  user: any;
}

interface RegistrationResponse {
  email: string;
  code_expires_in: number;
}

interface UserData {
  user: any;
  verification_status: any;
  profile: any;
  can_access_platform: boolean;
  permissions: any;
}

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    try {
      // Always use relative URL for Vite proxy - ignore env var
      this.baseURL = '/api';
      console.log('API Client initialized with base URL:', this.baseURL);
      this.loadTokenFromStorage();
    } catch (error) {
      console.error('ApiClient initialization failed:', error);
      this.baseURL = '/api';
    }
  }

  private loadTokenFromStorage(): void {
    try {
      this.token = localStorage.getItem('access_token');
    } catch (error) {
      console.error('Failed to load token from storage:', error);
      this.token = null;
    }
  }

  private saveTokenToStorage(token: string): void {
    this.token = token;
    localStorage.setItem('access_token', token);
  }

  private removeTokenFromStorage(): void {
    this.token = null;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('authUser');
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    console.log('Making API request to:', url);

    const headers = new Headers(options.headers);
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    if (this.token) {
      headers.set('Authorization', `Bearer ${this.token}`);
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);

      if (response.status === 204 || response.headers.get('content-length') === '0') {
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }
        // Handle cases where there is no content
        return {} as T;
      }

      const data: ApiResponse<T> = await response.json();

      if (!response.ok) {
        // Handle token expiration
        if (response.status === 401 && this.token) {
          await this.tryRefreshToken();
          // Retry the request with new token
          if (this.token) {
            headers.set('Authorization', `Bearer ${this.token}`);
            const retryResponse = await fetch(url, { ...config, headers });

            if (retryResponse.status === 204 || retryResponse.headers.get('content-length') === '0') {
              if (!retryResponse.ok) {
                throw new Error(`Request failed with status ${retryResponse.status}`);
              }
              return {} as T;
            }

            const retryData: ApiResponse<T> = await retryResponse.json();

            if (!retryResponse.ok) {
              throw new Error(retryData.error?.message || 'Request failed after refresh');
            }

            return retryData.data as T;
          }
        }

        throw new Error(data.error?.message || 'Request failed');
      }

      return data.data as T;
    } catch (error) {
      console.error('API Request failed for URL:', url);
      console.error('Error details:', error);
      console.error('Error type:', error?.constructor?.name);
      console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');

      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error(`Cannot connect to API server. Make sure the server is running on port 3001.`);
      }
      if (error instanceof SyntaxError) {
        // This happens on empty or non-JSON responses
        throw new Error("Received an invalid response from the server. This might be a server error.");
      }
      throw error;
    }
  }

  private async tryRefreshToken(): Promise<void> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      this.removeTokenFromStorage();
      return;
    }

    try {
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${refreshToken}`,
        },
      });

      if (response.ok) {
        const data: ApiResponse<{ access_token: string }> = await response.json();
        if (data.data?.access_token) {
          this.saveTokenToStorage(data.data.access_token);
        }
      } else {
        this.removeTokenFromStorage();
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.removeTokenFromStorage();
    }
  }

  // Authentication methods
  async sendLoginCode(identifier: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}/auth/login/send-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identifier }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Failed to send login code'
        };
      }

      return {
        success: true,
        userId: data.user_id,
        email: data.email,
        expiresIn: data.code_expires_in
      };
    } catch (error) {
      console.error('sendLoginCode error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send login code'
      };
    }
  }

  async verifyLoginCode(userId: string, code: string): Promise<AuthTokens> {
    try {
      const response = await fetch(`${this.baseURL}/auth/login/verify-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId, code }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify code');
      }

      // Save tokens
      this.saveTokenToStorage(data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      localStorage.setItem('authUser', JSON.stringify(data.user));

      return data;
    } catch (error) {
      console.error('verifyLoginCode error:', error);
      throw error;
    }
  }

  async sendRegistrationCode(
    email: string,
    name: string,
    studentId?: string,
    role: string = 'student'
  ): Promise<RegistrationResponse> {
    return this.makeRequest<RegistrationResponse>('/auth/register/send-code', {
      method: 'POST',
      body: JSON.stringify({
        email,
        name,
        student_id: studentId,
        role,
      }),
    });
  }

  async completeRegistration(
    email: string,
    code: string,
    password: string
  ): Promise<AuthTokens> {
    const tokens = await this.makeRequest<AuthTokens>('/auth/register/verify', {
      method: 'POST',
      body: JSON.stringify({ email, code, password }),
    });

    // Save tokens
    this.saveTokenToStorage(tokens.access_token);
    localStorage.setItem('refresh_token', tokens.refresh_token);
    localStorage.setItem('authUser', JSON.stringify(tokens.user));

    return tokens;
  }

  async getCurrentUser() {
    const response = await this.makeRequest('/auth/me');
    return response;
  }

  // Admin verification endpoints
  async getVerificationRequests() {
    return this.makeRequest('/admin/verification-requests');
  }

  async approveVerification(requestId: string) {
    return this.makeRequest(`/admin/verification-requests/${requestId}/approve`, {
      method: 'POST',
    });
  }

  async rejectVerification(requestId: string, notes?: string) {
    return this.makeRequest(`/admin/verification-requests/${requestId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    });
  }

  async uploadCSV(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const url = `${this.baseURL}/admin/csv-upload`;
    const headers = new Headers();
    if (this.token) {
      headers.set('Authorization', `Bearer ${this.token}`);
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error?.message || 'CSV upload failed');
      }

      return await response.json();
    } catch (error) {
      console.error('CSV upload failed:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await this.makeRequest('/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      this.removeTokenFromStorage();
    }
  }

  // Legacy login method (for backward compatibility)
  async loginLegacy(identifier: string, password: string): Promise<AuthTokens> {
    const tokens = await this.makeRequest<AuthTokens>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    });

    this.saveTokenToStorage(tokens.access_token);
    localStorage.setItem('refresh_token', tokens.refresh_token);
    localStorage.setItem('authUser', JSON.stringify(tokens.user));

    return tokens;
  }

  // Utility methods
  isAuthenticated(): boolean {
    return !!this.token;
  }

  getToken(): string | null {
    return this.token;
  }

  setAuthToken(token: string): void {
    this.saveTokenToStorage(token);
  }

  clearAuthToken(): void {
    this.removeTokenFromStorage();
  }

  // Generic HTTP methods for other API calls
  async get<T>(endpoint: string): Promise<T> {
    return this.makeRequest<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data: any): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.makeRequest<T>(endpoint, { method: 'DELETE' });
  }
}

// Create and export a singleton instance
export const apiClient = new ApiClient();
export default apiClient;