
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from './components/ui/toaster';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import StudentDashboard from './pages/StudentDashboard';
import AlumniDashboard from './pages/AlumniDashboard';
import Events from './pages/Events';
import JobBoard from './pages/JobBoard';
import AlumniProfile from './pages/AlumniProfile';
import StudentProfileForm from './pages/StudentProfileForm';
import Mentorship from './pages/Mentorship';
import AIChat from './pages/AIChat';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AlumniDirectory from './pages/AlumniDirectory';
import GlobalMap from './pages/GlobalMap';
import Donations from './pages/Donations';
import GiftShop from './pages/GiftShop';
import NotFound from './pages/NotFound';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/admin" element={<Navigate to="/admin-dashboard" replace />} />

            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/student-dashboard" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
            <Route path="/alumni-dashboard" element={<ProtectedRoute><AlumniDashboard /></ProtectedRoute>} />
            <Route path="/admin-dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            <Route path="/complete-profile" element={<ProtectedRoute><StudentProfileForm /></ProtectedRoute>} />

            <Route path="/events" element={<ProtectedRoute><Events /></ProtectedRoute>} />
            <Route path="/jobs" element={<ProtectedRoute><JobBoard /></ProtectedRoute>} />
            <Route path="/mentorship" element={<ProtectedRoute><Mentorship /></ProtectedRoute>} />
            <Route path="/ai-chat" element={<ProtectedRoute><AIChat /></ProtectedRoute>} />
            <Route path="/alumni-directory" element={<ProtectedRoute><AlumniDirectory /></ProtectedRoute>} />
            <Route path="/global-map" element={<ProtectedRoute><GlobalMap /></ProtectedRoute>} />
            <Route path="/donations" element={<ProtectedRoute><Donations /></ProtectedRoute>} />
            <Route path="/gift-shop" element={<ProtectedRoute><GiftShop /></ProtectedRoute>} />
            <Route path="/profile/:id" element={<ProtectedRoute><AlumniProfile /></ProtectedRoute>} />

            {/* Catch-all route for 404 - must be last */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
