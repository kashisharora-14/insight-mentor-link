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
        if (apiClient.isAuthenticated()) {
          console.log('🔍 Validating existing token...');
          const userData = await apiClient.getCurrentUser();
          console.log('✅ Token is valid, user authenticated:', userData.user.email);
          setUser({
            ...userData.user,
            isVerified: userData.user.isVerified || false,
            verificationMethod: userData.user.verificationMethod || 'pending',
            isEmailVerified: userData.user.isEmailVerified || false,
          });
          setIsAuthenticated(true);
        } else {
          console.log('ℹ️ No token found, user needs to login');
        }
      } catch (error: any) {
        console.error('❌ Auth initialization failed:', error.message);
        // Clear invalid tokens
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
      setUser({
        ...tokens.user,
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