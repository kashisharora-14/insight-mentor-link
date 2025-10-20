import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect based on user role
  const roleRedirect = {
    student: '/student-dashboard',
    alumni: '/alumni-dashboard',
    admin: '/admin'
  };

  return <Navigate to={roleRedirect[user.role]} replace />;
};

export default Dashboard;