import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AlumniDirectory from "./pages/AlumniDirectory";
import Events from "./pages/Events";
import AIChat from "./pages/AIChat";
import GlobalMap from "./pages/GlobalMap";
import StudentDashboard from "./pages/StudentDashboard";
import AlumniDashboard from "./pages/AlumniDashboard";
import Donations from "./pages/Donations";
import GiftShop from "./pages/GiftShop";
import JobBoard from "./pages/JobBoard";
import AlumniProfile from "./pages/AlumniProfile";
import Mentorship from "./pages/Mentorship";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";
import NotFound from "./pages/NotFound";
import StudentProfileForm from "./pages/StudentProfileForm";

const queryClient = new QueryClient();

function LoginRoute() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Login />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginRoute />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/alumni" element={<AlumniDirectory />} />
            <Route path="/events" element={<Events />} />
            <Route path="/ai-chat" element={<AIChat />} />
            <Route path="/map" element={<GlobalMap />} />
            <Route path="/donations" element={<Donations />} />
            <Route path="/gift-shop" element={<GiftShop />} />
            <Route path="/jobs" element={<JobBoard />} />
            <Route 
              path="/student-dashboard" 
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/alumni-dashboard" 
              element={
                <ProtectedRoute allowedRoles={['alumni']}>
                  <AlumniDashboard />
                </ProtectedRoute>
              } 
            />
            <Route path="/alumni-profile" element={<AlumniProfile />} />
            <Route path="/mentorship" element={<Mentorship />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route 
              path="/admin-dashboard" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route 
              path="/student-profile" 
              element={
                <ProtectedRoute>
                  <StudentProfileForm />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;