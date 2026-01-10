import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Mail, CheckCircle } from 'lucide-react';
import { sendPasswordResetEmail } from '../utils/firebase/auth';
import ThemeToggle from '../components/common/ThemeToggle';
import AnimatedBackground from '../components/common/AnimatedBackground';
import { notify, showErrorToast, showSuccessToast } from '../utils/notifications';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setIsLoading(true);

    // Simple validation
    if (!email || !email.includes('@')) {
      showErrorToast('Invalid Email', 'Please enter a valid email address so we can find your account.');
      setIsLoading(false);
      return;
    }

    try {
      await sendPasswordResetEmail(email);
      setSuccess(true);
      showSuccessToast('Reset Link Sent!', 'Check your inbox! We\'ve sent you instructions to get back in.');
      setEmail('');
    } catch (err: any) {
      console.error('Password reset error:', err);
      showErrorToast('Link Failed', err.message || 'We couldn\'t send the reset link. Is the email correct?');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated Background */}
      <AnimatedBackground />

      <div className="w-full max-w-md relative z-10">
        {/* Card */}
        <div className="glass rounded-3xl p-8 shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Link
              to="/login"
              className="text-gray-600 dark:text-white/80 hover:text-gray-900 dark:hover:text-white flex items-center gap-2 text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Link>
            <ThemeToggle />
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h1 className="text-gray-900 dark:text-white text-3xl mb-2">Forgot Password?</h1>
            <p className="text-gray-500 dark:text-white/60 text-sm">
              No worries! Enter your email and we'll send you reset instructions.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-gray-700 dark:text-white/80 text-sm mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-100 dark:bg-[#2d3748] text-gray-900 dark:text-white px-4 py-3 rounded-xl border border-transparent focus:border-indigo-500 focus:outline-none placeholder:text-gray-400 dark:placeholder:text-white/30"
                placeholder="you@company.com"
                disabled={isLoading}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-500/25 transition-all active:scale-[0.98] disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          {/* Additional Info */}
          <div className="mt-8 text-center border-t border-gray-100 dark:border-white/5 pt-8">
            <p className="text-gray-500 dark:text-white/60 text-sm">
              Remember your password?{' '}
              <Link
                to="/login"
                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-bold"
              >
                Sign in
              </Link>
            </p>
          </div>

          {/* Google Account Notice */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 rounded-2xl">
            <p className="text-blue-800 dark:text-blue-300 text-[11px] leading-relaxed">
              <strong className="block text-blue-900 dark:text-blue-200 mb-1 uppercase tracking-wider">Note:</strong>
              If you signed up with Google, you don't need to reset your password.
              Simply use "Continue with Google" on the login page.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
