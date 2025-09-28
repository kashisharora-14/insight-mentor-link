import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'student' | 'alumni' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  batchYear?: number;
  profession?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Dummy credentials for demo  
const mockUsers = {
  'student@demo.com': {
    id: '1',
    name: 'John Student',
    email: 'student@demo.com',
    role: 'student' as const
  },
  'alumni@demo.com': {
    id: '2',
    name: 'Jane Alumni',
    email: 'alumni@demo.com',
    role: 'alumni' as const
  },
  'admin@demo.com': {
    id: '3',
    name: 'Admin User',
    email: 'admin@demo.com',
    role: 'admin' as const
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is already logged in (localStorage)
    const savedUser = localStorage.getItem('authUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Demo login - accept any password for demo users
    const demoUser = mockUsers[email as keyof typeof mockUsers];

    if (demoUser && password === 'demo123') {
      setUser(demoUser);
      setIsAuthenticated(true);
      localStorage.setItem('authUser', JSON.stringify(demoUser));
      return true;
    }

    return false;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('authUser');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
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