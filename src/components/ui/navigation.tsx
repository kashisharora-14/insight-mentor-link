import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { 
  GraduationCap, 
  Users, 
  Calendar, 
  MessageCircle, 
  Map, 
  User,
  Menu,
  X,
  LogOut,
  Settings,
  Briefcase,
  ShoppingBag as Shopping,
  Heart
} from "lucide-react";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const getAllNavItems = () => [
    { name: "Home", path: "/", icon: GraduationCap, roles: ['student', 'alumni', 'admin'] },
    { name: "Alumni Directory", path: "/alumni", icon: Users, roles: ['student', 'admin'] },
    { name: "My Profile", path: "/alumni-profile", icon: User, roles: ['alumni'] },
    { name: "Find Mentors", path: "/mentorship", icon: MessageCircle, roles: ['student'] },
    { name: "Mentorship Requests", path: "/alumni-dashboard", icon: MessageCircle, roles: ['alumni'] },
    { name: "Events", path: "/events", icon: Calendar, roles: ['student', 'alumni', 'admin'] },
    { name: "Jobs", path: "/jobs", icon: Briefcase, roles: ['student', 'alumni'] },
    { name: "Gift Shop", path: "/gift-shop", icon: Shopping, roles: ['student', 'alumni', 'admin'] },
    { name: "Donations", path: "/donations", icon: Heart, roles: ['student', 'alumni', 'admin'] },
    { name: "AI Mentor", path: "/ai-chat", icon: MessageCircle, roles: ['student', 'alumni'] },
    { name: "Global Map", path: "/map", icon: Map, roles: ['student', 'alumni', 'admin'] },
    { name: "Admin", path: "/admin-dashboard", icon: Settings, roles: ['admin'] },
  ];

  const getFilteredNavItems = () => {
    const allItems = getAllNavItems();

    if (!isAuthenticated || !user) {
      // Show public items for non-authenticated users
      return allItems.filter(item => 
        ['Home', 'Alumni Directory', 'Events', 'Gift Shop', 'Donations', 'Global Map'].includes(item.name)
      );
    }

    // Filter items based on user role
    if (user.role === 'admin') {
      // Admin should only see admin-specific items
      return allItems.filter(item => 
        ['Home', 'Events', 'Global Map', 'Admin'].includes(item.name)
      );
    }

    // For other roles, filter based on role permissions
    return allItems.filter(item => item.roles.includes(user.role));
  };

  const navItems = getFilteredNavItems();

  return (
    <nav className="bg-white/95 backdrop-blur-sm border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-hero rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-primary">AlumniConnect</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            ))}
          </div>

          {/* Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated && user ? (
              <>
                <Link to="/dashboard">
                  <Button variant="ghost" size="sm">
                    <User className="w-4 h-4 mr-1" />
                    {user.name}
                  </Button>
                </Link>
                <Badge variant="secondary" className={`${
                  user.role === 'alumni' ? 'bg-green-100 text-green-800' :
                  user.role === 'admin' ? 'bg-red-100 text-red-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </Badge>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    <User className="w-4 h-4 mr-1" />
                    Login
                  </Button>
                </Link>
                <Badge variant="secondary" className="bg-accent/20 text-accent-foreground">
                  Demo Mode
                </Badge>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-background border-t">
              <Link
                to="/dashboard"
                className="block px-3 py-2 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Dashboard
              </Link>
              {user?.role === 'student' && (
                <Link
                  to="/mentorship"
                  className="block px-3 py-2 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Find Mentors
                </Link>
              )}
              {user?.role === 'alumni' && (
                <Link
                  to="/alumni-dashboard"
                  className="block px-3 py-2 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Mentorship Requests
                </Link>
              )}
              <Link
                to="/events"
                className="block px-3 py-2 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Events
              </Link>
              <Link
                to="/job-board"
                className="block px-3 py-2 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Job Board
              </Link>
              <Link
                to="/ai-chat"
                className="block px-3 py-2 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                onClick={() => setIsOpen(false)}
              >
                AI Assistant
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;