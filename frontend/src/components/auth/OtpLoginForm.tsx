import React, { useState, useEffect } from 'react';
import { ArrowLeft, Mail, Loader2, Shield, Clock, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { authApi } from '@/services/userManagementApi';

interface OtpLoginFormProps {
  onLoginSuccess?: (result: any) => void;
  onBackToLogin?: () => void;
}

type Step = 'email' | 'otp';

export const OtpLoginForm: React.FC<OtpLoginFormProps> = ({
  onLoginSuccess,
  onBackToLogin
}) => {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [countdown, setCountdown] = useState(0);
  const [canResend, setCanResend] = useState(false);

  // Countdown timer for OTP resend
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [countdown]);

  const validateEmail = (email: string): boolean => {
    const errors: Record<string, string> = {};

    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email address';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateOtp = (code: string): boolean => {
    const errors: Record<string, string> = {};

    if (!code.trim()) {
      errors.otpCode = 'Verification code is required';
    } else if (code.length < 4) {
      errors.otpCode = 'Please enter the complete verification code';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    if (field === 'email') {
      setEmail(value);
    } else if (field === 'otpCode') {
      // Only allow numbers and limit length
      const numericValue = value.replace(/\D/g, '');
      if (numericValue.length <= 6) {
        setOtpCode(numericValue);
      }
    }

    // Clear validation errors
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    // Clear general error
    if (error) {
      setError(null);
    }
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(email)) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await authApi.requestOtpLogin(email);
      setStep('otp');
      setCountdown(60); // 60 seconds countdown
      setCanResend(false);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to send verification code. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateOtp(otpCode)) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await authApi.loginWithOtp(email, otpCode);
      
      // Store tokens in localStorage
      localStorage.setItem('accessToken', result.accessToken);
      localStorage.setItem('refreshToken', result.refreshToken);
      localStorage.setItem('user', JSON.stringify(result.user));
      
      onLoginSuccess?.(result);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Invalid verification code. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await authApi.requestOtpLogin(email);
      setCountdown(60);
      setCanResend(false);
      setOtpCode('');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to resend verification code. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-purple-100 rounded-full">
              <Shield className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            {step === 'email' ? 'Passwordless Login' : 'Enter Verification Code'}
          </CardTitle>
          <CardDescription className="text-center">
            {step === 'email' 
              ? 'Enter your email to receive a secure login code'
              : `We've sent a 6-digit code to ${email}`
            }
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={step === 'email' ? handleRequestOtp : handleVerifyOtp}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {step === 'email' ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`pl-10 ${validationErrors.email ? 'border-red-500' : ''}`}
                      disabled={isLoading}
                      autoFocus
                    />
                  </div>
                  {validationErrors.email && (
                    <p className="text-sm text-red-500">{validationErrors.email}</p>
                  )}
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-medium text-purple-900 mb-2">🔐 Secure & Convenient</h4>
                  <ul className="text-sm text-purple-800 space-y-1">
                    <li>• No password needed - just your email</li>
                    <li>• Get a secure 6-digit code instantly</li>
                    <li>• Code expires in 10 minutes for security</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otpCode">Verification Code</Label>
                  <Input
                    id="otpCode"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={otpCode}
                    onChange={(e) => handleInputChange('otpCode', e.target.value)}
                    className={`text-center text-2xl font-mono tracking-wider ${validationErrors.otpCode ? 'border-red-500' : ''}`}
                    disabled={isLoading}
                    maxLength={6}
                    autoFocus
                  />
                  {validationErrors.otpCode && (
                    <p className="text-sm text-red-500">{validationErrors.otpCode}</p>
                  )}
                </div>

                <div className="space-y-3">
                  {countdown > 0 ? (
                    <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>Code expires in {formatTime(countdown)}</span>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-2">Didn't receive the code?</p>
                      <Button
                        type="button"
                        onClick={handleResendOtp}
                        variant="outline"
                        size="sm"
                        disabled={isLoading || !canResend}
                      >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Resend Code
                      </Button>
                    </div>
                  )}

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800">
                      <strong>Security tip:</strong> Never share this code with anyone. 
                      We'll never ask for it via phone or email.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || (step === 'email' && !email.trim()) || (step === 'otp' && otpCode.length < 4)}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {step === 'email' ? 'Sending Code...' : 'Verifying...'}
                </>
              ) : (
                step === 'email' ? 'Send Verification Code' : 'Login'
              )}
            </Button>

            <div className="flex flex-col space-y-2 w-full">
              {step === 'otp' && (
                <Button
                  type="button"
                  onClick={() => {
                    setStep('email');
                    setOtpCode('');
                    setCountdown(0);
                    setCanResend(false);
                    setError(null);
                    setValidationErrors({});
                  }}
                  variant="outline"
                  className="w-full"
                  disabled={isLoading}
                >
                  Use Different Email
                </Button>
              )}

              {onBackToLogin && (
                <Button
                  type="button"
                  onClick={onBackToLogin}
                  variant="ghost"
                  className="w-full"
                  disabled={isLoading}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Password Login
                </Button>
              )}
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};