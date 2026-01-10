import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import type { User as UserType } from "../types";
import { signUp, signInWithGoogle } from "../utils/firebase/auth";
import ThemeToggle from "../components/common/ThemeToggle";
import AnimatedBackground from "../components/common/AnimatedBackground";
import { notify } from "../utils/notifications";

interface SignupProps {
  onSignup: (user: UserType) => void;
}

export default function Signup({ onSignup }: SignupProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    studentId: "",
    department: "",
    year: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validation
    if (
      !formData.name ||
      !formData.email ||
      !formData.password
    ) {
      notify.signup.error("Please fill in all required fields to join us!");
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      notify.signup.error("Password must be at least 6 characters for better security.");
      setIsLoading(false);
      return;
    }

    try {
      // Create user with Firebase
      const userProfile = await signUp(
        formData.email,
        formData.password,
        formData.name,
        formData.studentId,
        formData.department,
        formData.year
      );

      // Login user
      onSignup(userProfile);
      notify.signup.success(formData.name);
      navigate("/dashboard");
    } catch (err: any) {
      console.error('Signup error:', err);
      if (err.message.includes('email-already-in-use')) {
        notify.signup.error("An account with this email already exists. Maybe try logging in?");
      } else {
        notify.signup.error(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);

    try {
      const { userProfile, idToken } = await signInWithGoogle();

      // Log the ID token to console
      console.log('='.repeat(50));
      console.log('Google OAuth ID Token:');
      console.log(idToken);
      console.log('='.repeat(50));

      // Login user
      onSignup(userProfile);
      notify.signup.success(userProfile.name);
      navigate("/dashboard");
    } catch (err: any) {
      console.error('Google Sign In error:', err);
      notify.signup.error(err.message);
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
            <button
              onClick={() => navigate(-1)}
              className="text-gray-600 dark:text-white/80 hover:text-gray-900 dark:hover:text-white flex items-center gap-2 text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <ThemeToggle />
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-gray-900 dark:text-white text-3xl mb-2">
              Create Account
            </h1>
            <p className="text-gray-500 dark:text-white/60 text-sm">
              Create an account to get started
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Row 1: Full Name and Email */}
            <div className="grid grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="block text-gray-700 dark:text-white/80 text-sm mb-2">
                  Full name
                </label>
                <input
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-gray-100 dark:bg-[#2d3748] text-gray-900 dark:text-white px-4 py-3 rounded-xl border border-transparent focus:border-indigo-500 focus:outline-none placeholder:text-gray-400 dark:placeholder:text-white/30"
                  placeholder="Jane Doe"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-gray-700 dark:text-white/80 text-sm mb-2">
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-gray-100 dark:bg-[#2d3748] text-gray-900 dark:text-white px-4 py-3 rounded-xl border border-transparent focus:border-indigo-500 focus:outline-none placeholder:text-gray-400 dark:placeholder:text-white/30"
                  placeholder="you@company.com"
                />
              </div>
            </div>

            {/* Row 2: Password and Student ID */}
            <div className="grid grid-cols-2 gap-4">
              {/* Password */}
              <div>
                <label className="block text-gray-700 dark:text-white/80 text-sm mb-2">
                  Password
                </label>
                <input
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-gray-100 dark:bg-[#2d3748] text-gray-900 dark:text-white px-4 py-3 rounded-xl border border-transparent focus:border-indigo-500 focus:outline-none placeholder:text-gray-400 dark:placeholder:text-white/30"
                  placeholder="••••••••"
                />
              </div>

              {/* Student ID */}
              <div>
                <label className="block text-gray-700 dark:text-white/80 text-sm mb-2">
                  Student ID (Optional)
                </label>
                <input
                  name="studentId"
                  type="text"
                  value={formData.studentId}
                  onChange={handleChange}
                  className="w-full bg-gray-100 dark:bg-[#2d3748] text-gray-900 dark:text-white px-4 py-3 rounded-xl border border-transparent focus:border-indigo-500 focus:outline-none placeholder:text-gray-400 dark:placeholder:text-white/30"
                  placeholder="STU123456"
                />
              </div>
            </div>

            {/* Row 3: Department and Year */}
            <div className="grid grid-cols-2 gap-4">
              {/* Department */}
              <div>
                <label className="block text-gray-700 dark:text-white/80 text-sm mb-2">
                  Department (Optional)
                </label>
                <input
                  name="department"
                  type="text"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full bg-gray-100 dark:bg-[#2d3748] text-gray-900 dark:text-white px-4 py-3 rounded-xl border border-transparent focus:border-indigo-500 focus:outline-none placeholder:text-gray-400 dark:placeholder:text-white/30"
                  placeholder="Computer Science"
                />
              </div>

              {/* Year */}
              <div>
                <label className="block text-gray-700 dark:text-white/80 text-sm mb-2">
                  Year (Optional)
                </label>
                <select
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  className="w-full bg-gray-100 dark:bg-[#2d3748] text-gray-900 dark:text-white px-4 py-3 rounded-xl border border-transparent focus:border-indigo-500 focus:outline-none"
                >
                  <option value="">Select year</option>
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-500/25 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 group mt-4"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowLeft className="w-5 h-5 rotate-180 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-gray-300 dark:bg-white/10"></div>
            <span className="text-gray-400 dark:text-white/40 text-sm font-medium">
              or continue with
            </span>
            <div className="flex-1 h-px bg-gray-300 dark:bg-white/10"></div>
          </div>

          {/* Social Login */}
          <div className="space-y-3">
            <button
              onClick={handleGoogleSignIn}
              className="w-full bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-900 dark:text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all border border-gray-100 dark:border-white/10 shadow-sm active:scale-[0.98]"
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

          {/* Log In Link */}
          <div className="text-center mt-8">
            <p className="text-gray-600 dark:text-white/60 text-sm">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-bold"
              >
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}