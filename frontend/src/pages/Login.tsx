import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Check, Loader2, Shield, CheckCircle } from 'lucide-react';
import { notify } from '../utils/notifications';
import type { User } from '../types';
import { signIn, signInWithGoogle } from '../utils/firebase/auth';
import { auth } from '../utils/firebase/config';
import ThemeToggle from '../components/common/ThemeToggle';
import AnimatedBackground from '../components/common/AnimatedBackground';

interface LoginProps {
  onLogin: (user: User) => void;
  onAdminLogin: () => void;
}

export default function Login({ onLogin, onAdminLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailValid, setEmailValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState('');

  // Debug State
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [authTokens, setAuthTokens] = useState<{ idToken?: string; accessToken?: string; backendToken?: string }>({});
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [finalUserProfile, setFinalUserProfile] = useState<User | null>(null);

  const navigate = useNavigate();

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setEmailValid(value.includes('@') && value.length > 5);

    // Email Suggestion Logic
    if (value && !value.includes('@')) {
      setSuggestion(`${value}@gmail.com`);
    } else if (value && value.includes('@')) {
      const [local, domain] = value.split('@');
      const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'heraldcollege.edu.np'];
      const match = domains.find(d => d.startsWith(domain) && d !== domain);
      if (match) {
        setSuggestion(`${local}@${match}`);
      } else {
        setSuggestion('');
      }
    } else {
      setSuggestion('');
    }
  };

  const acceptSuggestion = () => {
    setEmail(suggestion);
    setEmailValid(suggestion.includes('@') && suggestion.length > 5);
    setSuggestion('');
  };

  const handleProceed = () => {
    if (finalUserProfile) {
      onLogin(finalUserProfile);
      navigate('/dashboard');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simple validation
    if (!email || !password) {
      notify.login.error('Please enter both email and password');
      setIsLoading(false);
      return;
    }

    try {
      // Sign in with Firebase
      const userProfile = await signIn(email, password);

      // Get ID token immediately for UI/Storage parity with Google Sign In
      let idToken = '';
      try {
        if (auth.currentUser) {
          idToken = await auth.currentUser.getIdToken();
          localStorage.setItem('firebaseIdToken', idToken);
          setAuthTokens(prev => ({ ...prev, idToken }));
        }
      } catch (tokenErr) {
        console.warn('Failed to retrieve ID token after login', tokenErr);
      }

      onLogin(userProfile);
      setFinalUserProfile(userProfile);
      notify.login.success(userProfile.name);

      // Verify with Backend (Get authToken parity)
      // Note: We already likely have tokens from the backend if onLogin does it, 
      // but to ensure UI shows it nicely in the success screen:
      try {
        if (idToken) {
          const backendUrl = 'http://localhost:4000/api/login-token';
          fetch(backendUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken }),
          }).then(res => res.json()).then(data => {
            if (data.token) {
              setAuthTokens(prev => ({ ...prev, backendToken: data.token }));
              // Ensure storage has it (though onLogin might have handled it)
              localStorage.setItem('authToken', data.token);
            }
          }).catch(e => console.warn('Background token fetch failed', e));
        }
      } catch (e) { }

      // Show Success Screen instead of immediate navigate
      setLoginSuccess(true);

      // Check if admin (Logic moved to handleProceed or just checked here for redirection target)
      // We will let handleProceed handle the navigation now.

    } catch (err: any) {
      console.error('Login error:', err);

      // Show user-friendly error message
      if (err.code === 'auth/invalid-credential' || err.message.includes('Invalid email or password') || err.message.includes('INVALID_LOGIN_CREDENTIALS')) {
        notify.login.error('Incorrect email or password. Please check your credentials and try again.');
      } else if (err.code === 'auth/user-not-found') {
        notify.login.error('No account found with this email. Please sign up first.');
      } else if (err.code === 'auth/wrong-password') {
        notify.login.error('Incorrect password. Please try again or click "Forgot password?"');
      } else if (err.code === 'auth/too-many-requests') {
        notify.login.error('Too many failed login attempts. Please try again later or reset your password.');
      } else if (err.code === 'auth/network-request-failed') {
        notify.login.error('Network error. Please check your internet connection.');
      } else {
        notify.login.error(err.message);
      }
      setIsLoading(false); // Only stop loading on error, keep loading true on success until transition or component unmount? 
      // Actually, we want to show the success screen, so stop loading.
      setIsLoading(false); // But wait, success screen needs isLoading false? Yes.
    } finally {
      if (!loginSuccess) setIsLoading(false); // Ensure loading stops if not success (already handled in catch, but safety)
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);

    try {
      const { userProfile, idToken, accessToken } = await signInWithGoogle();

      // Store tokens for display
      setAuthTokens({ idToken: idToken || '', accessToken: accessToken });
      setFinalUserProfile(userProfile);

      // Verify with Backend
      try {
        const backendUrl = 'http://localhost:4000/api/login-token';
        const response = await fetch(backendUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ idToken }),
        });

        if (response.ok) {
          const data = await response.json();
          setVerificationResult({ success: true, data });
          notify.login.success(data.user?.displayName || data.user?.email?.split('@')[0] || 'User');

          // Store in Session Storage as requested -> Changed to Local Storage
          if (data.token) {
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('backendUser', JSON.stringify(data.user));
            if (data.user?.uid) localStorage.setItem('sessionId', data.user.uid);
          }
          // Also store Google tokens if available
          if (idToken) localStorage.setItem('firebaseIdToken', idToken);
          if (accessToken) localStorage.setItem('googleAccessToken', accessToken);

          setAuthTokens(prev => ({ ...prev, backendToken: data.token }));

        } else {
          const errText = await response.text();
          setVerificationResult({ success: false, status: response.status, error: errText });
        }
      } catch (backendErr: any) {
        setVerificationResult({ success: false, error: backendErr.message || 'Connection failed' });
      }

      setLoginSuccess(true);
      // Removed auto-navigate to let user see tokens
    } catch (err: any) {
      console.error('Google login error:', err);
      notify.login.error(err.message || 'Google login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (loginSuccess) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-8">
        <AnimatedBackground />
        <div className="glass rounded-3xl p-8 shadow-2xl max-w-2xl w-full relative z-10 text-center">
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center animate-in zoom-in duration-500">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Login Successful!</h1>
          <p className="text-gray-600 dark:text-white/60 mb-8">
            Welcome back, <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{finalUserProfile?.name || 'User'}</span>
          </p>

          <div className="text-left space-y-4 mb-8">
            {authTokens.backendToken && (
              <div className="bg-indigo-50/50 dark:bg-indigo-500/10 p-4 rounded-xl border border-indigo-200 dark:border-indigo-500/20 shadow-sm">
                <h3 className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mb-2 uppercase tracking-wider flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Unique Backend JWT (Changes every time)
                </h3>
                <code className="text-[10px] break-all text-indigo-700 dark:text-indigo-300 block max-h-24 overflow-y-auto custom-scrollbar font-mono leading-relaxed bg-white/50 dark:bg-black/20 p-2 rounded-lg">
                  {authTokens.backendToken}
                </code>
              </div>
            )}

            {authTokens.idToken && (
              <div className="bg-gray-50/50 dark:bg-black/20 p-4 rounded-xl border border-gray-100 dark:border-white/5">
                <h3 className="text-sm font-bold text-gray-400 dark:text-white/40 mb-2 uppercase tracking-wider">
                  Firebase ID Token (Google Identity)
                </h3>
                <code className="text-[10px] break-all text-gray-600 dark:text-white/40 block max-h-24 overflow-y-auto custom-scrollbar">
                  {authTokens.idToken}
                </code>
              </div>
            )}

            {authTokens.accessToken && (
              <div className="bg-gray-50/50 dark:bg-black/20 p-4 rounded-xl border border-gray-100 dark:border-white/5">
                <h3 className="text-sm font-bold text-gray-400 dark:text-white/40 mb-2 uppercase tracking-wider">Google Access Token</h3>
                <code className="text-[10px] break-all text-blue-600/60 dark:text-blue-400/60 block max-h-24 overflow-y-auto custom-scrollbar">
                  {authTokens.accessToken}
                </code>
              </div>
            )}
          </div>

          {verificationResult && (
            <div className={`p-4 rounded-xl border ${verificationResult.success ? 'bg-green-50/50 dark:bg-green-500/10 border-green-200 dark:border-green-500/20 text-green-800 dark:text-green-400' : 'bg-red-50/50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-800 dark:text-red-400'}`}>
              <h3 className="text-sm font-bold mb-2 uppercase tracking-wider flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Backend Verification: {verificationResult.success ? 'PASSED' : 'FAILED'}
              </h3>
              {verificationResult.success ? (
                <div className="space-y-1">
                  <p className="text-[10px] opacity-70 italic font-medium">Session Cookie has been set securely.</p>
                </div>
              ) : (
                <p className="text-[10px] font-medium">{verificationResult.error || 'Unknown error occurred'}</p>
              )}
            </div>
          )}

          <button
            onClick={handleProceed}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-500/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2 group mt-6"
          >
            <span>Enter Dashboard</span>
            <Check className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>
    );
  }

  return (

    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated Background */}
      <AnimatedBackground />

      <div className="w-full max-w-md relative z-10">
        {/* Card */}
        <div className="glass rounded-3xl p-8 shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div />
            <ThemeToggle />
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-gray-900 dark:text-white text-3xl mb-2">Welcome</h1>
            <p className="text-gray-500 dark:text-white/60 text-sm">Sign in to your account</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-gray-700 dark:text-white/80 text-sm mb-2">Email</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  onKeyDown={(e) => {
                    if (e.key === 'Tab' && suggestion) {
                      e.preventDefault();
                      acceptSuggestion();
                    }
                  }}
                  className="w-full bg-gray-100 dark:bg-[#2d3748] text-gray-900 dark:text-white px-4 py-3 rounded-xl border border-transparent focus:border-indigo-500 focus:outline-none placeholder:text-gray-400 dark:placeholder:text-white/30"
                  placeholder="you@company.com"
                />
                {suggestion && (
                  <div
                    onClick={acceptSuggestion}
                    className="absolute right-12 top-1/2 -translate-y-1/2 bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs text-gray-500 dark:text-gray-400 cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors pointer-events-auto z-10 hidden sm:block shadow-sm border border-gray-300 dark:border-gray-600"
                  >
                    Suggest: {suggestion}
                  </div>
                )}
                {emailValid && (
                  <Check className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-400" />
                )}
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-gray-700 dark:text-white/80 text-sm mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-100 dark:bg-[#2d3748] text-gray-900 dark:text-white px-4 py-3 rounded-xl border border-transparent focus:border-indigo-500 focus:outline-none placeholder:text-gray-400 dark:placeholder:text-white/30"
                placeholder="••••••••"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl transition-colors disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Log in'}
            </button>
          </form>

          {/* Forgot Password */}
          <div className="text-center mt-4">
            <Link
              to="/forgot-password"
              className="text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white text-sm"
            >
              Forgot password?
            </Link>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-gray-300 dark:bg-white/10"></div>
            <span className="text-gray-400 dark:text-white/40 text-sm">or continue with</span>
            <div className="flex-1 h-px bg-gray-300 dark:bg-white/10"></div>
          </div>

          {/* Social Login */}
          <div className="space-y-3">
            <button
              className="w-full bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-900 dark:text-white py-3 rounded-xl flex items-center justify-center gap-3 transition-colors border border-gray-300 dark:border-white/10"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>

          {/* Sign Up Link */}
          <div className="text-center mt-6">
            <p className="text-gray-600 dark:text-white/60 text-sm">
              Don't have an account?{' '}
              <Link to="/signup" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}