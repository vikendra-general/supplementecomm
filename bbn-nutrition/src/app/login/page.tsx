'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, AlertCircle, Shield, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/components/ui/Notification';

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, register, verifyOTPAndLogin, completeRegistration, isLoading, isAuthenticated, user } = useAuth();
  const { showNotification } = useNotification();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [registrationStep, setRegistrationStep] = useState(1); // 1: Form, 2: OTP Verification
  const [otpSent, setOtpSent] = useState({ email: false });
  const [otpValues, setOtpValues] = useState({ email: '' });
  const [otpVerified, setOtpVerified] = useState({ email: false });
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  });
  
  // Check if this is an admin login request
  const isAdminLogin = searchParams.get('admin') === 'true';
  
  // Handle mode parameter and pre-fill admin credentials for demo purposes
  useEffect(() => {
    const mode = searchParams.get('mode');
    
    // Set register mode if specified in URL
    if (mode === 'register') {
      setIsLogin(false);
    }
  }, [searchParams, isLogin]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading && user) {
      const redirectTo = searchParams.get('redirect');
      
      // Validate redirect URL based on user role
      if (redirectTo) {
        // Check if redirect URL is admin-only and user is not admin
        const isAdminRoute = redirectTo.startsWith('/admin');
        if (isAdminRoute && user.role !== 'admin') {
          // Redirect non-admin users to home instead of admin routes
          router.push('/');
        } else if (!isAdminRoute || user.role === 'admin') {
          // Allow redirect if it's not an admin route, or user is admin
          router.push(redirectTo);
        } else {
          // Fallback to role-based default
          router.push(user.role === 'admin' ? '/admin/dashboard' : '/');
        }
      } else if (user.role === 'admin') {
        // Redirect admin users to admin dashboard
        router.push('/admin/dashboard');
      } else {
        // Default redirect for regular users
        router.push('/');
      }
    }
  }, [isAuthenticated, isLoading, user, router, searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError(''); // Clear error when user starts typing
  };

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/(?=.*\d)/.test(password)) {
      return 'Password must contain at least one number';
    }
    if (!/(?=.*[@$!%*?&])/.test(password)) {
      return 'Password must contain at least one special character (@$!%*?&)';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
        // Show success notification
        showNotification('success', 'Login successful!');
        // Check if user is admin
        if (formData.email === 'admin@bbn-nutrition.com') {
          showNotification('info', 'Welcome to the admin dashboard');
        }
        // Redirect will be handled by useEffect
      } else {
        if (registrationStep === 1) {
          // Step 1: Validate form and create user
          if (formData.password !== formData.confirmPassword) {
            throw new Error('Passwords do not match');
          }
          
          const passwordError = validatePassword(formData.password);
          if (passwordError) {
            throw new Error(passwordError);
          }
          
          // Register user (this will create unverified user or return existing unverified user)
          const registrationResult = await register(formData.name, formData.email, formData.password);
          
          // Move to OTP verification step
          setRegistrationStep(2);
          
          // Show appropriate message based on whether user was created or already existed
          if (registrationResult.message && registrationResult.message.includes('exists but not verified')) {
            showNotification('info', 'Account found! Please verify your email to complete registration.');
          } else {
            showNotification('success', 'Account created! Please verify your email to complete registration.');
          }
        } else if (registrationStep === 2) {
          // Step 2: This step is now handled automatically by the verifyOTP function
          // The complete registration happens automatically after email verification
          // This code block should not be reached in the new flow
          throw new Error('Registration flow error. Please try again.');
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setError(errorMessage);
      showNotification('error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const sendOTP = async (type: 'email') => {
    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/auth/send-${type}-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          [type]: formData.email
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `Failed to send ${type} OTP`);
      }

      setOtpSent(prev => ({ ...prev, [type]: true }));
      showNotification('success', `OTP sent to your ${type}!`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Failed to send ${type} OTP`;
      setError(errorMessage);
      showNotification('error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const verifyOTP = async (type: 'email') => {
    try {
      setIsSubmitting(true);
      
      const identifier = formData.email;
      
      const data = await verifyOTPAndLogin(identifier, otpValues[type]);

      setOtpVerified(prev => ({ ...prev, [type]: true }));
      
      // Check if we got a token and user back (registration completed automatically)
      if (data.token && data.user) {
        showNotification('success', 'Registration completed successfully! You are now logged in.');
        
        // Redirect to home page or intended destination
        const redirectTo = searchParams.get('redirect');
        if (redirectTo) {
          router.push(decodeURIComponent(redirectTo));
        } else {
          router.push('/');
        }
      } else {
        // This shouldn't happen with the new flow, but keep as fallback
        showNotification('success', `${type.charAt(0).toUpperCase() + type.slice(1)} verified successfully!`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Failed to verify ${type} OTP`;
      setError(errorMessage);
      showNotification('error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setRegistrationStep(1);
    setOtpSent({ email: false });
    setOtpValues({ email: '' });
    setOtpVerified({ email: false });
    setFormData({
      email: '',
      password: '',
      name: '',
      confirmPassword: ''
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render the form if already authenticated
  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {isAdminLogin ? 'Admin Login' : isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-gray-600">
            {isAdminLogin 
              ? 'Sign in with your admin credentials' 
              : isLogin 
                ? 'Sign in to your account' 
                : 'Join BBN for premium supplements'
            }
          </p>
          {isAdminLogin && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Admin Access:</strong> Please enter your administrator credentials to access the admin panel.
              </p>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && registrationStep === 1 && (
            <>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white text-gray-900"
                    placeholder="Enter your full name"
                    required={!isLogin}
                    minLength={2}
                    maxLength={50}
                  />
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  Name must be between 2-50 characters
                </div>
              </div>

            </>
          )}

          {!isLogin && registrationStep === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <Shield className="w-12 h-12 text-primary mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Verify Your Account</h3>
                <p className="text-sm text-gray-600">
                  We&apos;ve sent verification codes to secure your account. Please verify either your email or phone number to continue.
                </p>
              </div>

              {/* Email OTP Verification */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-5 h-5 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Email Verification</span>
                    {otpVerified.email && <CheckCircle className="w-5 h-5 text-green-500" />}
                  </div>
                  {!otpSent.email && (
                    <button
                      type="button"
                      onClick={() => sendOTP('email')}
                      disabled={isSubmitting}
                      className="text-sm bg-primary text-white px-3 py-1 rounded hover:bg-primary-dark disabled:opacity-50"
                    >
                      Send OTP
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-500 mb-2">{formData.email}</p>
                {otpSent.email && !otpVerified.email && (
                  <div className="space-y-2">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="Enter 6-digit OTP"
                        value={otpValues.email}
                        onChange={(e) => setOtpValues(prev => ({ ...prev, email: e.target.value }))}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                        maxLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => verifyOTP('email')}
                        disabled={isSubmitting || otpValues.email.length !== 6}
                        className="bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700 disabled:opacity-50"
                      >
                        Verify
                      </button>
                    </div>
                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => sendOTP('email')}
                        disabled={isSubmitting}
                        className="text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50"
                      >
                        Didn&apos;t receive OTP? Resend
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Complete Registration Button */}
              <div className="mt-6">
                <button
                  type="submit"
                  disabled={!otpVerified.email || isSubmitting}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {isSubmitting ? 'Completing Registration...' : 'Complete Registration'}
                </button>
              </div>
            </div>
          )}

          {/* Login/Register Button */}
          {(isLogin || registrationStep === 1) && (
            <>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address {!isLogin && <span className="text-red-500">*</span>}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white text-gray-900"
                    placeholder="Enter your email"
                    required
                  />
                </div>
                {!isLogin && (
                  <div className="mt-1 text-xs text-gray-500">
                    Valid email address is required for registration
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password {!isLogin && <span className="text-red-500">*</span>}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white text-gray-900"
                    placeholder="Enter your password"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {!isLogin && registrationStep === 1 && (
                  <div className="mt-2 text-xs text-gray-500">
                    Password must contain at least 8 characters, including uppercase, lowercase, number, and special character.
                  </div>
                )}
              </div>

              {!isLogin && registrationStep === 1 && (
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white text-gray-900"
                      placeholder="Confirm your password"
                      required={!isLogin}
                      minLength={8}
                    />
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    Password confirmation is required
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary text-white py-3 px-4 rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </>
          )}

        </form>

        <div className="mt-6 text-center">
          <button
            onClick={toggleMode}
            className="text-primary hover:text-primary-dark font-medium"
          >
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </div>

        {isLogin && (
          <div className="mt-6 text-center">
            <Link href="/forgot-password" className="text-gray-600 hover:text-gray-700 text-sm">
              Forgot your password?
            </Link>
          </div>
        )}

        <div className="mt-6 text-center">
          <Link href="/" className="text-gray-600 hover:text-gray-700 text-sm">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <LoginPageContent />
    </Suspense>
  );
}