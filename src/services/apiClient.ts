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
      // Use Express backend directly
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
        // If 401, token is invalid - user needs to login again
        if (response.status === 401) {
          this.removeTokenFromStorage();
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



  // Authentication methods
  async sendLoginCode(identifier: string): Promise<any> {
    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ identifier }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to send login code');
    }

    const data = await response.json();
    return data.data;
  }

  async verifyLoginCode(userId: string, code: string): Promise<AuthTokens> {
    const response = await fetch(`${this.baseURL}/auth/verify-login-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id: userId, code }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to verify code');
    }

    const data = await response.json();
    this.setAuthToken(data.data.access_token);
    return data.data;
  }

  async sendRegistrationCode(
    email: string,
    name: string,
    studentId?: string,
    role: string = 'student'
  ): Promise<RegistrationResponse> {
    const response = await fetch(`${this.baseURL}/auth/register/send-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, name, studentId, role }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to send registration code');
    }

    return await response.json();
  }

  async completeRegistration(email: string, code: string, password: string): Promise<AuthTokens> {
    const response = await fetch(`${this.baseURL}/auth/register/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, code, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Registration failed');
    }

    const data = await response.json();
    this.setAuthToken(data.token);
    return data;
  }

  async getCurrentUser() {
    try {
      const response = await this.get('/auth/me');
      return response.data;
    } catch (error: any) {
      // If token is invalid, clear it and force re-login
      if (error.response?.status === 401) {
        console.error('❌ Invalid token detected, clearing authentication');
        this.clearAuthToken();
        throw new Error('Session expired. Please login again.');
      }
      throw error;
    }
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
  async loginLegacy(email: string, password: string): Promise<AuthTokens> {
    // Use direct fetch for admin login to avoid double processing
    const endpoint = email.includes('admin') ? '/auth/admin-login' : '/auth/login-password';
    const url = `${this.baseURL}${endpoint}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    const data = await response.json();

    this.setAuthToken(data.token);
    localStorage.setItem('refresh_token', data.token + '_refresh');
    localStorage.setItem('authUser', JSON.stringify(data.user));

    return {
      access_token: data.token,
      refresh_token: data.token + '_refresh',
      token_type: 'Bearer',
      expires_in: 604800,
      user: data.user
    };
  }

  // Utility methods
  setAuthToken(token: string) {
    // Validate token format before storing
    if (!token || token === 'null' || token === 'undefined' || token.trim() === '') {
      console.error('❌ Attempted to save invalid token');
      return;
    }

    // Validate JWT format (3 parts separated by dots)
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      console.error('❌ Token is malformed, not saving');
      return;
    }

    this.token = token;
    localStorage.setItem('authToken', token);
    console.log('✅ Auth token saved to localStorage');
  }

  clearAuthToken() {
    this.token = null;
    localStorage.removeItem('authToken');
    console.log('🗑️ Auth token cleared from localStorage');
  }

  isAuthenticated(): boolean {
    const token = this.token || localStorage.getItem('authToken');
    if (!token || token === 'null' || token === 'undefined' || token.trim() === '') {
      return false;
    }
    // Validate JWT format
    const tokenParts = token.split('.');
    return tokenParts.length === 3;
  }

  // Generic HTTP methods for other API calls
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>('GET', endpoint);
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>('POST', endpoint, data);
  }

  async put<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>('PUT', endpoint, data);
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>('DELETE', endpoint);
  }

  // Helper to get authorization headers, used by getCurrentUser
  private getAuthHeaders(): HeadersInit {
    const headers = new Headers();
    if (this.token) {
      headers.set('Authorization', `Bearer ${this.token}`);
    }
    headers.set('Content-Type', 'application/json');
    return headers;
  }

  private async request<T>(method: string, url: string, data?: any): Promise<T> {
    const token = this.token || localStorage.getItem('authToken');

    console.log(`🌐 Making ${method} request to: ${url}`);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token && token !== 'null' && token !== 'undefined') {
      // Validate token format before using it
      const tokenParts = token.split('.');
      if (tokenParts.length === 3) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('🔑 Request includes authorization token');
      } else {
        console.error('❌ Token is malformed, clearing it');
        this.clearAuthToken();
        throw new Error('Session expired. Please login again.');
      }
    }

    const response = await fetch(`${this.baseURL}${url}`, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: { message: 'Request failed' } }));
      console.error(`❌ Request failed with status ${response.status}:`, errorData);

      if (response.status === 401) {
        console.error('❌ Token is invalid or expired during fetch');
        this.clearAuthToken();
        throw new Error('Session expired. Please login again.');
      }

      throw new Error(errorData.error?.message || errorData.message || `HTTP error ${response.status}`);
    }

    return await response.json();
  }
}

// Create and export a singleton instance
export const apiClient = new ApiClient();
export default apiClient;