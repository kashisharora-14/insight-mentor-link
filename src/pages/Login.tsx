import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { GraduationCap, User, UserCheck, Shield, Mail, Key, UserPlus } from 'lucide-react';
import EmailLoginForm from '@/components/auth/EmailLoginForm';
import EmailRegistrationForm from '@/components/auth/EmailRegistrationForm';

const Login = () => {
  const [activeRole, setActiveRole] = useState<'student' | 'alumni' | 'admin'>('student');
  const [step, setStep] = useState<'login' | 'register'>('login');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(identifier, password);
      if (success) {
        toast({
          title: "Login successful!",
          description: "Welcome back to Re-Connect",
        });
        navigate('/dashboard');
      } else {
        toast({
          title: "Login failed",
          description: "Please check your credentials and try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Login error", 
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <span className="font-bold text-2xl text-white">Re-Connect</span>
          </Link>
          <p className="text-white/80 mt-2">Sign in to your account</p>
        </div>

        <Card className="bg-white/95 backdrop-blur-sm shadow-glow">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Welcome Back</CardTitle>
            <CardDescription className="text-center">
              Select your role to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Role Selection Tabs */}
              <div className="grid grid-cols-3 gap-2">
                <Button 
                  variant={activeRole === 'student' ? 'default' : 'outline'}
                  onClick={() => setActiveRole('student')}
                  className="flex flex-col items-center gap-1 h-auto py-3"
                >
                  <User className="h-5 w-5" />
                  <span className="text-xs">Student</span>
                </Button>
                <Button 
                  variant={activeRole === 'alumni' ? 'default' : 'outline'}
                  onClick={() => setActiveRole('alumni')}
                  className="flex flex-col items-center gap-1 h-auto py-3"
                >
                  <UserCheck className="h-5 w-5" />
                  <span className="text-xs">Alumni</span>
                </Button>
                <Button 
                  variant={activeRole === 'admin' ? 'default' : 'outline'}
                  onClick={() => setActiveRole('admin')}
                  className="flex flex-col items-center gap-1 h-auto py-3"
                >
                  <Shield className="h-5 w-5" />
                  <span className="text-xs">Admin</span>
                </Button>
              </div>

              {/* Student Login */}
              {activeRole === 'student' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Button 
                      variant={step === 'login' ? 'default' : 'outline'}
                      onClick={() => setStep('login')}
                      className="flex items-center gap-2"
                    >
                      <Mail className="h-4 w-4" />
                      Sign In
                    </Button>
                    <Button 
                      variant={step === 'register' ? 'default' : 'outline'}
                      onClick={() => setStep('register')}
                      className="flex items-center gap-2"
                    >
                      <UserPlus className="h-4 w-4" />
                      Register
                    </Button>
                  </div>
                  
                  {step === 'login' ? (
                    <div>
                      <div className="text-center mb-4">
                        <h3 className="text-lg font-semibold mb-2">🎓 Student Sign In</h3>
                        <p className="text-sm text-muted-foreground">
                          Use your <strong>student ID</strong> or <strong>registered email</strong>
                        </p>
                      </div>
                      
                      <EmailLoginForm onSuccess={() => {
                        toast({
                          title: "Login successful!",
                          description: "Welcome back to Re-Connect",
                        });
                        navigate('/dashboard');
                      }} />
                    </div>
                  ) : (
                    <div>
                      <div className="text-center mb-4">
                        <h3 className="text-lg font-semibold mb-2">🎓 Student Registration</h3>
                        <p className="text-sm text-muted-foreground">Create your student account</p>
                      </div>
                      
                      <EmailRegistrationForm onSuccess={() => {
                        toast({
                          title: "Registration successful!",
                          description: "Welcome to Re-Connect! Please sign in.",
                        });
                        setStep('login');
                      }} />
                    </div>
                  )}
                </div>
              )}

              {/* Alumni Login */}
              {activeRole === 'alumni' && (
                <div className="space-y-4">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold mb-2">🎓 Alumni Sign In</h3>
                    <p className="text-sm text-muted-foreground">
                      Enter your email and password
                    </p>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="alumni-email">Email Address</Label>
                      <Input
                        id="alumni-email"
                        type="email"
                        placeholder="alumni@example.com"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="alumni-password">Password</Label>
                      <Input
                        id="alumni-password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? "Signing in..." : "Sign In as Alumni"}
                    </Button>
                  </form>
                </div>
              )}

              {/* Admin Login */}
              {activeRole === 'admin' && (
                <div className="space-y-4">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold mb-2">🛡️ Admin Sign In</h3>
                    <p className="text-sm text-muted-foreground">
                      Authorized personnel only
                    </p>
                  </div>
                  
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    setIsLoading(true);
                    
                    try {
                      const response = await fetch('/api/auth/admin-login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email: identifier, password })
                      });
                      
                      const data = await response.json();
                      
                      if (response.ok) {
                        localStorage.setItem('token', data.token);
                        toast({
                          title: "Login successful!",
                          description: "Welcome to Admin Dashboard",
                        });
                        navigate('/admin');
                      } else {
                        toast({
                          title: "Login failed",
                          description: data.error || "Invalid credentials",
                          variant: "destructive",
                        });
                      }
                    } catch (error) {
                      toast({
                        title: "Login error",
                        description: "Something went wrong",
                        variant: "destructive",
                      });
                    } finally {
                      setIsLoading(false);
                    }
                  }} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="admin-email">Admin Email</Label>
                      <Input
                        id="admin-email"
                        type="email"
                        placeholder="admin@example.com"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="admin-password">Password</Label>
                      <Input
                        id="admin-password"
                        type="password"
                        placeholder="Enter admin password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? "Signing in..." : "Sign In as Admin"}
                    </Button>
                  </form>
                  <div className="text-xs text-center text-muted-foreground">
                    <p>Test credentials: admin@example.com / admin123</p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 text-center">
              <Link to="/" className="text-sm text-muted-foreground hover:text-primary">
                ← Back to Home
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;