import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import AlumniDirectory from "./pages/AlumniDirectory";
import Events from "./pages/Events";
import AIChat from "./pages/AIChat";
import GlobalMap from "./pages/GlobalMap";
import StudentDashboard from "./pages/StudentDashboard";
import AlumniDashboard from "./pages/AlumniDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/alumni" element={<AlumniDirectory />} />
          <Route path="/events" element={<Events />} />
          <Route path="/ai-chat" element={<AIChat />} />
          <Route path="/map" element={<GlobalMap />} />
          <Route path="/student-dashboard" element={<StudentDashboard />} />
          <Route path="/alumni-dashboard" element={<AlumniDashboard />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
