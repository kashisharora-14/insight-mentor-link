import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'student' | 'alumni';

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
const mockUsers: Record<string, User> = {
  'student@demo.com': {
    id: '1',
    name: 'Alex Johnson',
    email: 'student@demo.com',
    role: 'student' as UserRole,
    department: 'Computer Science',
    batchYear: 2024
  },
  'alumni@demo.com': {
    id: '2', 
    name: 'Dr. Sarah Chen',
    email: 'alumni@demo.com',
    role: 'alumni' as UserRole,
    department: 'Computer Science',
    batchYear: 2018,
    profession: 'Software Engineer'
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