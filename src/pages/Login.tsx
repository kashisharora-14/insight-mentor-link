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

  const demoCredentials = [
    {
      role: 'Student',
      email: 'student@demo.com',
      icon: User,
      color: 'bg-blue-500'
    },
    {
      role: 'Alumni', 
      email: 'alumni@demo.com',
      icon: UserCheck,
      color: 'bg-green-500'
    },
    {
      role: 'Admin',
      email: 'admin@demo.com',
      icon: Shield,
      color: 'bg-red-500'
    }
  ];

  const fillCredentials = (demoEmail: string) => {
    setIdentifier(demoEmail);
    setPassword('demo123');
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
              Choose your preferred sign-in method
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Temporarily simplified - just show the new email login */}
            <div className="space-y-6">
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
                    <h3 className="text-lg font-semibold mb-2">🔐 Sign In</h3>
                    <p className="text-sm text-muted-foreground">
                      Students: Use your <strong>student ID</strong> or <strong>registered email</strong>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      A verification code will be sent to your email
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
                    <h3 className="text-lg font-semibold mb-2">🎓 Join Re-Connect</h3>
                    <p className="text-sm text-muted-foreground">Create your account to join the alumni network</p>
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
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-muted"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-muted-foreground">Or use legacy login</span>
                </div>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="identifier">Email or Student ID (Legacy)</Label>
                  <Input
                    id="identifier"
                    type="text"
                    placeholder="Enter your email or student ID"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
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
                  variant="outline"
                >
                  {isLoading ? "Signing in..." : "Legacy Sign In"}
                </Button>
              </form>

              <div className="mt-4 space-y-2">
                <p className="text-xs text-center text-muted-foreground">Demo Credentials:</p>
                {demoCredentials.map((cred, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start h-auto p-2"
                    onClick={() => fillCredentials(cred.email)}
                  >
                    <div className={`w-6 h-6 ${cred.color} rounded-full flex items-center justify-center mr-2`}>
                      <cred.icon className="w-3 h-3 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-medium">{cred.role}: {cred.email}</div>
                    </div>
                    <Badge variant="secondary" className="ml-auto text-xs">
                      demo123
                    </Badge>
                  </Button>
                ))}
              </div>
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