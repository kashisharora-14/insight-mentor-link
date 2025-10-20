import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

interface EmailLoginFormProps {
  onSuccess?: () => void;
}

export default function EmailLoginForm({ onSuccess }: EmailLoginFormProps) {
  const { sendLoginCode, verifyLoginCode } = useAuth();
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [identifier, setIdentifier] = useState('');
  const [code, setCode] = useState('');
  const [userId, setUserId] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showRegisterPrompt, setShowRegisterPrompt] = useState(false);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError('Please enter your email or student ID');
      return;
    }

    setLoading(true);
    setError('');
    setShowRegisterPrompt(false);

    try {
      const result = await sendLoginCode(identifier.trim());

      if (result.success) {
        setUserId(result.userId);
        setUserEmail(result.email);
        setStep('code');
        setSuccess(`Login code sent to ${result.email}`);
      } else {
        // Check if error indicates user not found
        if (result.error?.includes('not found') || result.error?.includes('Student ID not found')) {
          setShowRegisterPrompt(true);
          setError('Account not found. Please register first.');
        } else {
          setError(result.error || 'Failed to send login code');
        }
      }
    } catch (error: any) {
      setError(error.message || 'Failed to send login code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setError('Please enter the verification code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const success = await verifyLoginCode(userId, code.trim());

      if (success) {
        setSuccess('Login successful! Redirecting...');
        setTimeout(() => {
          onSuccess?.();
        }, 500);
      } else {
        setError('Invalid verification code. Please try again.');
      }
    } catch (error: any) {
      setError(error.message || 'Login verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToEmail = () => {
    setStep('email');
    setCode('');
    setError('');
    setSuccess('');
  };

  const handleResendCode = async () => {
    setLoading(true);
    setError('');

    try {
      const result = await sendLoginCode(identifier);
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
          {step === 'email' ? <Mail className="h-5 w-5" /> : <Shield className="h-5 w-5" />}
          {step === 'email' ? 'Sign In to Re-Connect' : 'Verify Your Identity'}
        </CardTitle>
        <CardDescription>
          {step === 'email' 
            ? 'Students: Use your student ID or registered email for secure login'
            : `Check your inbox: ${userEmail}`
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

        {step === 'email' ? (
          <form onSubmit={handleSendCode} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="identifier">Email or Student ID</Label>
              <Input
                id="identifier"
                type="text"
                placeholder="e.g., student@example.com or CS2021001"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                disabled={loading}
                required
              />
              <p className="text-xs text-muted-foreground">
                💡 Students can use their student ID (e.g., CS2021001) or registered email
              </p>
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
          <form onSubmit={handleVerifyCode} className="space-y-4">
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

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify & Sign In'
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
                onClick={handleBackToEmail}
                disabled={loading}
                className="w-full"
              >
                Back to Email
              </Button>
            </div>
          </form>
        )}

        {showRegisterPrompt && (
          <Alert className="bg-blue-50 border-blue-200">
            <AlertDescription className="text-blue-800">
              <div className="space-y-2">
                <p className="font-semibold">No account found!</p>
                <p className="text-sm">Please register first using the <strong>Register</strong> tab above.</p>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="text-center text-sm text-muted-foreground space-y-1">
          <p>Don't have an account? Use the <strong>Register</strong> tab above.</p>
          {step === 'code' && (
            <p className="text-xs">
              💡 If you don't receive the code, check your spam folder or verify the email address.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}