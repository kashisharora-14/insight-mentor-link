import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Shield, UserPlus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface EmailRegistrationFormProps {
  onSuccess?: () => void;
}

export default function EmailRegistrationForm({ onSuccess }: EmailRegistrationFormProps) {
  const { sendRegistrationCode, completeRegistration } = useAuth();
  const [step, setStep] = useState<'details' | 'code'>('details');
  
  // Step 1 - User details
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [role, setRole] = useState('student');
  
  // Step 2 - Verification
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !name.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    if (email && !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await sendRegistrationCode(
        email.trim(), 
        name.trim(), 
        studentId.trim() || undefined, 
        role
      );
      
      if (result.success) {
        setStep('code');
        setSuccess(`Registration code sent to ${email}`);
      } else {
        setError(result.error || 'Failed to send registration code');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to send registration code');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code.trim() || !password.trim()) {
      setError('Please enter verification code and password');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const success = await completeRegistration(email, code.trim(), password);
      
      if (success) {
        setSuccess('Registration completed successfully!');
        onSuccess?.();
      } else {
        setError('Invalid verification code or registration failed');
      }
    } catch (error: any) {
      setError(error.message || 'Registration completion failed');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToDetails = () => {
    setStep('details');
    setCode('');
    setPassword('');
    setConfirmPassword('');
    setError('');
    setSuccess('');
  };

  const handleResendCode = async () => {
    setLoading(true);
    setError('');
    
    try {
      const result = await sendRegistrationCode(email, name, studentId || undefined, role);
      if (result.success) {
        setSuccess('New code sent to your email');
      } else {
        setError(result.error || 'Failed to resend code');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to resend code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          {step === 'details' ? <UserPlus className="h-5 w-5" /> : <Shield className="h-5 w-5" />}
          {step === 'details' ? 'Join Re-Connect' : 'Complete Registration'}
        </CardTitle>
        <CardDescription>
          {step === 'details' 
            ? 'Create your account to join the alumni network'
            : `Enter the code sent to ${email} and set your password`
          }
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert>
            <AlertDescription className="text-green-600">{success}</AlertDescription>
          </Alert>
        )}

        {step === 'details' ? (
          <form onSubmit={handleSendCode} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="studentId">Student ID (Optional)</Label>
              <Input
                id="studentId"
                type="text"
                placeholder="Enter your student ID"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                disabled={loading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Select value={role} onValueChange={setRole} disabled={loading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Current Student</SelectItem>
                  <SelectItem value="alumni">Alumni</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending Code...
                </>
              ) : (
                'Send Verification Code'
              )}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleCompleteRegistration} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Verification Code</Label>
              <Input
                id="code"
                type="text"
                placeholder="Enter 6-digit code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                disabled={loading}
                maxLength={6}
                className="text-center text-lg tracking-widest"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Create Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a secure password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Complete Registration'
              )}
            </Button>
            
            <div className="flex flex-col gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleResendCode}
                disabled={loading}
                className="w-full"
              >
                Resend Code
              </Button>
              
              <Button 
                type="button" 
                variant="ghost" 
                onClick={handleBackToDetails}
                disabled={loading}
                className="w-full"
              >
                Back to Details
              </Button>
            </div>
          </form>
        )}
        
        <div className="text-center text-sm text-muted-foreground">
          <p>Already have an account? Use the login form above.</p>
        </div>
      </CardContent>
    </Card>
  );
}