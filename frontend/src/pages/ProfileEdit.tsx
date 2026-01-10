import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  User,
  Mail,
  GraduationCap,
  BookOpen,
  Calendar,
  ArrowLeft,
  Save,
  LogOut,
  Lock,
  KeyRound,
  Shield,
  CheckCircle,
  AlertTriangle,
  Eye,
  EyeOff,
} from 'lucide-react';
import type { User as UserType } from '../types';
import { updateUserProfile } from '../utils/firebase/auth';
import { toast } from 'sonner';
import ThemeToggle from '../components/common/ThemeToggle';
import AnimatedBackground from '../components/common/AnimatedBackground';

interface ProfileEditProps {
  user: UserType;
  onUpdateProfile: (user: UserType) => void;
  onLogout: () => void;
}

export default function ProfileEdit({
  user,
  onUpdateProfile,
  onLogout,
}: ProfileEditProps) {
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    studentId: user.studentId || '',
    department: user.department || '',
    year: user.year || '',
  });

  // Removed email/password state as they are handled in Dashboard modals

  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Update profile in Firebase
      await updateUserProfile(user.id, {
        name: formData.name,
        studentId: formData.studentId,
        department: formData.department,
        year: formData.year,
      });

      const updatedUser: UserType = {
        ...user,
        name: formData.name,
        studentId: formData.studentId,
        department: formData.department,
        year: formData.year,
      };

      onUpdateProfile(updatedUser);

      // Update local storage to reflect changes immediately
      const existingUser = localStorage.getItem('backendUser');
      if (existingUser) {
        try {
          const parsed = JSON.parse(existingUser);
          const newBackendUser = { ...parsed, displayName: formData.name, email: formData.email, ...updatedUser };
          localStorage.setItem('backendUser', JSON.stringify(newBackendUser));
          sessionStorage.setItem('backendUser', JSON.stringify(newBackendUser));
        } catch (e) {
          console.error('Failed to update storage', e);
        }
      }

      toast.success('Profile updated successfully!');
    } catch (err: any) {
      console.error('Update profile error:', err);
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  // Removed handleEmailChange and handlePasswordChange handlers

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <AnimatedBackground />

      {/* Header */}
      <div className="relative z-10 border-b border-gray-200 dark:border-white/10 px-4 py-4 flex items-center justify-between glass">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors text-gray-600 dark:text-white/80 hover:text-gray-900 dark:hover:text-white"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-gray-900 dark:text-white">Edit Profile</h1>
            <p className="text-sm text-gray-600 dark:text-white/60">Update your information</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-3xl mx-auto p-4 py-8 space-y-6">
        {/* Profile Avatar */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full mb-4">
            <User className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-gray-900 dark:text-white mb-1">{user.name}</h2>
          <p className="text-gray-600 dark:text-white/60">{user.email}</p>
        </div>

        {/* Success/Error Messages */}


        {/* Basic Profile Form */}
        <div className="glass rounded-3xl p-8 shadow-2xl">
          <h3 className="text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <User className="w-5 h-5" />
            Basic Information
          </h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div className="md:col-span-2">
                <label htmlFor="name" className="block text-gray-700 dark:text-white/80 text-sm mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-white/40" />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 bg-gray-100 dark:bg-[#2d3748] text-gray-900 dark:text-white rounded-xl border border-transparent focus:border-indigo-500 focus:outline-none placeholder:text-gray-400 dark:placeholder:text-white/30"
                    placeholder="Your full name"
                  />
                </div>
              </div>

              {/* Student ID */}
              <div>
                <label htmlFor="studentId" className="block text-gray-700 dark:text-white/80 text-sm mb-2">
                  Student ID
                </label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-white/40" />
                  <input
                    id="studentId"
                    name="studentId"
                    type="text"
                    value={formData.studentId}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 bg-gray-100 dark:bg-[#2d3748] text-gray-900 dark:text-white rounded-xl border border-transparent focus:border-indigo-500 focus:outline-none placeholder:text-gray-400 dark:placeholder:text-white/30"
                    placeholder="e.g., HCK2024001"
                  />
                </div>
              </div>

              {/* Department */}
              <div>
                <label
                  htmlFor="department"
                  className="block text-gray-700 dark:text-white/80 text-sm mb-2"
                >
                  Department
                </label>
                <div className="relative">
                  <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-white/40" />
                  <select
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 bg-gray-100 dark:bg-[#2d3748] text-gray-900 dark:text-white rounded-xl border border-transparent focus:border-indigo-500 focus:outline-none appearance-none"
                  >
                    <option value="">Select Department</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Business Administration">
                      Business Administration
                    </option>
                    <option value="Arts & Humanities">Arts & Humanities</option>
                    <option value="Sciences">Sciences</option>
                    <option value="Medicine">Medicine</option>
                  </select>
                </div>
              </div>

              {/* Year */}
              <div className="md:col-span-2">
                <label htmlFor="year" className="block text-gray-700 dark:text-white/80 text-sm mb-2">
                  Year of Study
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-white/40" />
                  <select
                    id="year"
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 bg-gray-100 dark:bg-[#2d3748] text-gray-900 dark:text-white rounded-xl border border-transparent focus:border-indigo-500 focus:outline-none appearance-none"
                  >
                    <option value="">Select Year</option>
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                    <option value="Graduate">Graduate</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
              <Link
                to="/chat"
                className="px-6 py-3 border border-gray-300 dark:border-white/20 text-gray-700 dark:text-white/80 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors flex items-center justify-center"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>



        {/* Account Info */}
        <div className="bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 rounded-xl p-4">
          <h3 className="text-indigo-700 dark:text-indigo-300 mb-2 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Account Security
          </h3>
          <div className="space-y-1 text-sm text-indigo-600 dark:text-indigo-200/70">
            <p>• Your account ID: {user.id}</p>
            <p>• For security, you must re-enter your current password to change email or password</p>
            <p>• If you signed up with Google, you cannot change your password here</p>
            <p>• To delete your account, please contact support@hck.edu</p>
          </div>
        </div>
      </div>
    </div>
  );
}
