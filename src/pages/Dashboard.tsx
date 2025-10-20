import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();

  console.log('Dashboard - User role:', user?.role);

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect based on user role
  const roleRedirect: Record<string, string> = {
    student: '/student-dashboard',
    alumni: '/alumni-dashboard',
    admin: '/admin'
  };

  const redirectPath = roleRedirect[user.role] || '/student-dashboard';
  console.log('Redirecting to:', redirectPath);

  return <Navigate to={redirectPath} replace />;
};

export default Dashboard;