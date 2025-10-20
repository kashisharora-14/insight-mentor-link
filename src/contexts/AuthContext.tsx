import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '@/services/apiClient';

export type UserRole = 'student' | 'alumni' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  batchYear?: number;
  profession?: string;
  verification_status?: string;
  email_verified?: boolean;
  student_id?: string;
  isVerified?: boolean;
  verificationMethod?: string; // 'csv_upload' | 'admin_manual' | 'pending'
  isEmailVerified?: boolean;
}

interface AuthContextType {
  user: User | null;
  sendLoginCode: (identifier: string) => Promise<{ userId: string; email: string; success: boolean; error?: string }>;
  verifyLoginCode: (userId: string, code: string) => Promise<boolean>;
  sendRegistrationCode: (email: string, name: string, studentId?: string, role?: string) => Promise<{ success: boolean; error?: string }>;
  completeRegistration: (email: string, code: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
  // Legacy method for backward compatibility
  login: (email: string, password: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in and validate token
    const initializeAuth = async () => {
      try {
        // Clear any invalid tokens first
        const token = localStorage.getItem('authToken');
        
        // Check if token exists and is not malformed
        if (!token || token === 'null' || token === 'undefined' || token.trim() === '') {
          console.log('ℹ️ No valid token found, user needs to login');
          // Clean up all token storage
          localStorage.removeItem('authToken');
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('authUser');
          setLoading(false);
          return;
        }

        // Validate token format (JWT has 3 parts separated by dots)
        const tokenParts = token.split('.');
        if (tokenParts.length !== 3) {
          console.error('❌ Token is malformed, clearing all auth data');
          localStorage.removeItem('authToken');
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('authUser');
          apiClient.clearAuthToken();
          setUser(null);
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }

        console.log('🔍 Validating existing token...');
        const userData = await apiClient.getCurrentUser();
        console.log('✅ Token is valid, user authenticated:', userData.email);
        setUser({
          id: userData.id,
          email: userData.email,
          name: userData.name,
          role: userData.role,
          studentId: userData.studentId,
          isVerified: userData.isVerified || false,
          verificationMethod: userData.verificationMethod || 'pending',
          isEmailVerified: userData.isEmailVerified || false,
        });
        setIsAuthenticated(true);
      } catch (error: any) {
        console.error('❌ Auth initialization failed:', error.message);
        // Clear all invalid tokens
        localStorage.removeItem('authToken');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('authUser');
        apiClient.clearAuthToken();
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const sendLoginCode = async (identifier: string) => {
    try {
      const response = await apiClient.sendLoginCode(identifier);
      return {
        userId: response.user_id,
        email: response.email,
        success: true
      };
    } catch (error: any) {
      return {
        userId: '',
        email: '',
        success: false,
        error: error.message || 'Failed to send login code'
      };
    }
  };

  const verifyLoginCode = async (userId: string, code: string): Promise<boolean> => {
    try {
      const tokens = await apiClient.verifyLoginCode(userId, code);
      
      // Validate the token before saving
      if (!tokens.access_token || tokens.access_token === 'null' || tokens.access_token === 'undefined') {
        console.error('❌ Received invalid token from server');
        return false;
      }

      const tokenParts = tokens.access_token.split('.');
      if (tokenParts.length !== 3) {
        console.error('❌ Received malformed token from server');
        return false;
      }

      // Save the token
      apiClient.setAuthToken(tokens.access_token);
      
      setUser({
        id: tokens.user.id,
        email: tokens.user.email,
        name: tokens.user.name,
        role: tokens.user.role,
        studentId: tokens.user.studentId,
        isVerified: tokens.user.isVerified || false,
        verificationMethod: tokens.user.verificationMethod || 'pending',
        isEmailVerified: tokens.user.isEmailVerified || false,
      });
      setIsAuthenticated(true);
      return true;
    } catch (error: any) {
      console.error('Login verification failed:', error);
      return false;
    }
  };

  const sendRegistrationCode = async (
    email: string, 
    name: string, 
    studentId?: string, 
    role: string = 'student'
  ) => {
    try {
      const response = await apiClient.sendRegistrationCode(email, name, studentId, role);
      // Assuming the apiClient returns the full response or parsed data
      return { success: true, ...response };
    } catch (error: any) {
      // Attempt to parse the error response from the server
      const errorMessage = error.response?.data?.error || error.message || 'Failed to send registration code';
      return {
        success: false,
        error: errorMessage
      };
    }
  };

  const completeRegistration = async (
    email: string, 
    code: string, 
    password: string
  ): Promise<boolean> => {
    try {
      await apiClient.completeRegistration(email, code, password);
      return true;
    } catch (error: any) {
      console.error('Registration completion failed:', error);
      return false;
    }
  };

  // Legacy login method for backward compatibility
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const tokens = await apiClient.loginLegacy(email, password);
      setUser({
        ...tokens.user,
        isVerified: tokens.user.isVerified || false,
        verificationMethod: tokens.user.verificationMethod || 'pending',
        isEmailVerified: tokens.user.isEmailVerified || false,
      });
      setIsAuthenticated(true);
      return true;
    } catch (error: any) {
      console.error('Legacy login failed:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await apiClient.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      // Clear all authentication data
      localStorage.clear(); // Clear everything to ensure no stale data
      apiClient.clearAuthToken();
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  // Show loading screen while initializing auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      sendLoginCode,
      verifyLoginCode,
      sendRegistrationCode,
      completeRegistration,
      login, 
      logout, 
      isAuthenticated,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};