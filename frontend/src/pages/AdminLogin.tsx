import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  AlertTriangle,
  Shield,
} from "lucide-react";
import { notify } from "../utils/notifications";
import ThemeToggle from '../components/common/ThemeToggle';
import AnimatedBackground from '../components/common/AnimatedBackground';

interface AdminLoginProps {
  onAdminLogin: () => void;
}

export default function AdminLogin({
  onAdminLogin,
}: AdminLoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (username === "admin" && password === "admin") {
      onAdminLogin();
      notify.admin.loginSuccess();
      navigate("/admin/dashboard");
    } else {
      notify.login.error("Invalid admin credentials. Please try again or contact the principal!");
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
              onClick={() => navigate("/login")}
              className="text-gray-600 dark:text-white/80 hover:text-gray-900 dark:hover:text-white flex items-center gap-2 text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <ThemeToggle />
          </div>

          {/* Admin Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-orange-600 rounded-full flex items-center justify-center">
              <Shield className="w-10 h-10 text-white" />
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-gray-900 dark:text-white text-3xl mb-2">
              Admin Portal
            </h1>
            <p className="text-gray-500 dark:text-white/60 text-sm">
              HCK College Administration
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div>
              <label className="block text-gray-700 dark:text-white/70 text-sm font-medium mb-2 ml-1">
                Username
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-4 pr-4 py-3 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white rounded-2xl border border-gray-100 dark:border-white/10 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 focus:outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-white/20"
                placeholder="admin"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-gray-700 dark:text-white/70 text-sm font-medium mb-2 ml-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-4 pr-4 py-3 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white rounded-2xl border border-gray-100 dark:border-white/10 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 focus:outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-white/20"
                placeholder="••••••••"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-red-500/25 transition-all active:scale-[0.98]"
            >
              Access Admin Panel
            </button>
          </form>

          {/* Info */}
          <div className="mt-8 p-4 bg-red-500/5 dark:bg-red-500/10 border border-red-500/20 rounded-2xl">
            <p className="text-red-700 dark:text-red-400 text-[10px] uppercase tracking-wider font-bold text-center">
              ⚠️ Secure Area: Unauthorized Access Prohibited
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}