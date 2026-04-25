import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, LogOut, Mail, KeyRound, User as UserIcon, ChevronDown } from 'lucide-react';
import type { User } from '../types';
import ThemeToggle from '../components/common/ThemeToggle';
import EmailEditModal from '../components/modals/EmailEditModal';
import PasswordEditModal from '../components/modals/PasswordEditModal';
import ProfileEditModal from '../components/modals/ProfileEditModal';
import VerifyEmailModal from '../components/modals/VerifyEmailModal';
import AnimatedBackground from '../components/common/AnimatedBackground';

interface DashboardProps {
  user: User;
  onLogout: () => void;
  onRefresh?: () => Promise<void>;
}

export default function Dashboard({ user, onLogout, onRefresh }: DashboardProps) {
  const navigate = useNavigate();
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(user);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleAIChatClick = () => {
    navigate('/chat');
  };

  const handleProfileClick = () => {
    setShowProfileModal(true);
  };

  const handleUpdateUser = (updatedUser: User) => {
    setCurrentUser(updatedUser);
  };

  const handleEmailVerified = async () => {
    // Optimistic UI update
    setCurrentUser({ ...currentUser, isVerified: true });
    // Trigger full session refresh to get new JWT with isVerified: true
    if (onRefresh) await onRefresh();
  };

  const getInitials = (name: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <AnimatedBackground />

      {/* Main Content */}
      <div className="relative z-10">
        {!currentUser.isVerified && (
          <div className="bg-amber-500/90 backdrop-blur text-white px-8 py-3 flex items-center justify-between animate-in slide-in-from-top duration-500">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5" />
              <span className="text-sm font-medium">Your email is not verified. Some features may be restricted.</span>
            </div>
            <button
              onClick={() => setShowVerifyModal(true)}
              className="text-xs bg-white text-amber-600 px-3 py-1 rounded-full font-bold hover:bg-amber-50 transition-colors"
            >
              Verify Now
            </button>
          </div>
        )}

        {/* Header */}
        <div className="px-8 py-6 flex items-center justify-between border-b border-gray-200 dark:border-white/10 glass relative z-20">
          <div>
            <h1 className="text-gray-900 dark:text-white text-3xl">Dashboard</h1>
            <p className="text-gray-600 dark:text-white/60 text-sm mt-1">
              Welcome back — quick overview below
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* AI Chat Button */}
            <button
              onClick={handleAIChatClick}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              AI Chat
            </button>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* User Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg px-3 py-2 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-white/10"
                aria-expanded={isMenuOpen}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white">{getInitials(currentUser.name)}</span>
                </div>
                <div className="text-left hidden md:block">
                  <div className="text-gray-900 dark:text-white text-sm">{currentUser.name}</div>
                  <div className="text-gray-600 dark:text-white/60 text-xs">{currentUser.email}</div>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-500 dark:text-white/60 transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 glass rounded-lg shadow-xl z-50 animate-in fade-in zoom-in-95 duration-200">
                  <button
                    onClick={handleProfileClick}
                    className="w-full text-left px-4 py-3 text-gray-700 dark:text-white/80 hover:bg-gray-100 dark:hover:bg-white/5 rounded-t-lg transition-colors flex items-center gap-2"
                  >
                    <UserIcon className="w-4 h-4" />
                    Edit Profile
                  </button>
                  <button
                    onClick={() => setShowEmailModal(true)}
                    className="w-full text-left px-4 py-3 text-gray-700 dark:text-white/80 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors flex items-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    Edit Email
                  </button>
                  <button
                    onClick={() => setShowPasswordModal(true)}
                    className="w-full text-left px-4 py-3 text-gray-700 dark:text-white/80 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors flex items-center gap-2"
                  >
                    <KeyRound className="w-4 h-4" />
                    Edit Password
                  </button>
                  <button
                    onClick={onLogout}
                    className="w-full text-left px-4 py-3 text-red-400 hover:bg-gray-100 dark:hover:bg-white/5 rounded-b-lg transition-colors flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="px-8 py-8 max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-gray-900 dark:text-white text-2xl mb-2">
              Hello, {currentUser.name || 'User'} 👋
            </h2>
            <p className="text-gray-600 dark:text-white/60">
              This is your dashboard. Add widgets, content, or tools here.
            </p>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Profile Status Card */}
            <div className="glass rounded-2xl p-6 border border-gray-200 dark:border-white/10">
              <div className="text-gray-500 dark:text-white/60 text-sm mb-2">Profile status</div>
              <div className="text-gray-900 dark:text-white text-xl flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${currentUser.isVerified ? 'bg-green-500' : 'bg-red-500'}`}></span>
                {currentUser.isVerified ? 'Verified' : 'Unverified'}
              </div>
            </div>

            {/* Email Card */}
            <div className="glass rounded-2xl p-6 border border-gray-200 dark:border-white/10">
              <div className="text-gray-500 dark:text-white/60 text-sm mb-2">Email</div>
              <div className="text-gray-900 dark:text-white text-lg break-all">{currentUser.email}</div>
            </div>

            {/* Account Card */}
            <div className="glass rounded-2xl p-6 border border-gray-200 dark:border-white/10">
              <div className="text-gray-500 dark:text-white/60 text-sm mb-2">Account</div>
              <div className="text-gray-900 dark:text-white text-lg">
                User ID: {currentUser.id ? currentUser.id.slice(0, 8) : 'N/A'}...
              </div>
            </div>
          </div>

          {/* Additional Info Cards if student details exist */}
          {(currentUser.studentId || currentUser.department || currentUser.year) && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              {currentUser.studentId && (
                <div className="glass rounded-2xl p-6 border border-gray-200 dark:border-white/10">
                  <div className="text-gray-500 dark:text-white/60 text-sm mb-2">Student ID</div>
                  <div className="text-gray-900 dark:text-white text-lg">{currentUser.studentId}</div>
                </div>
              )}

              {currentUser.department && (
                <div className="glass rounded-2xl p-6 border border-gray-200 dark:border-white/10">
                  <div className="text-gray-500 dark:text-white/60 text-sm mb-2">Department</div>
                  <div className="text-gray-900 dark:text-white text-lg">{currentUser.department}</div>
                </div>
              )}

              {currentUser.year && (
                <div className="glass rounded-2xl p-6 border border-gray-200 dark:border-white/10">
                  <div className="text-gray-500 dark:text-white/60 text-sm mb-2">Year</div>
                  <div className="text-gray-900 dark:text-white text-lg">{currentUser.year}</div>
                </div>
              )}
            </div>
          )}

          {/* Quick Actions */}
          <div className="mt-8">
            <h3 className="text-gray-900 dark:text-white text-xl mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                onClick={handleAIChatClick}
                className="bg-gradient-to-br from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white p-6 rounded-2xl transition-all hover:scale-105"
              >
                <MessageSquare className="w-8 h-8 mb-3" />
                <div className="text-lg">Start AI Chat</div>
                <div className="text-white/80 text-sm mt-1">
                  Get instant answers
                </div>
              </button>

              <button
                onClick={handleProfileClick}
                className="glass hover:bg-gray-100 dark:hover:bg-[#374151]/50 text-gray-900 dark:text-white p-6 rounded-2xl border border-gray-200 dark:border-white/10 transition-all hover:scale-105"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-3">
                  <span className="text-sm text-white">{getInitials(currentUser.name)}</span>
                </div>
                <div className="text-lg">Edit Profile</div>
                <div className="text-gray-600 dark:text-white/60 text-sm mt-1">
                  Update your info
                </div>
              </button>

              <div className="glass text-gray-900 dark:text-white p-6 rounded-2xl border border-gray-200 dark:border-white/10">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center mb-3">
                  <span className="text-green-500 text-xl">📚</span>
                </div>
                <div className="text-lg">Library Hours</div>
                <div className="text-gray-600 dark:text-white/60 text-sm mt-1">
                  Mon-Fri: 8 AM - 8 PM
                </div>
              </div>

              <div className="glass text-gray-900 dark:text-white p-6 rounded-2xl border border-gray-200 dark:border-white/10">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center mb-3">
                  <span className="text-blue-500 text-xl">📞</span>
                </div>
                <div className="text-lg">Contact Support</div>
                <div className="text-gray-600 dark:text-white/60 text-sm mt-1">
                  Available 24/7
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <EmailEditModal
        user={currentUser}
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        onUpdate={handleUpdateUser}
      />
      <PasswordEditModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />

      <ProfileEditModal
        user={currentUser}
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onUpdateProfile={handleUpdateUser}
      />

      <VerifyEmailModal
        isOpen={showVerifyModal}
        onClose={() => setShowVerifyModal(false)}
        userEmail={currentUser.email}
        userId={currentUser.id}
        onVerified={handleEmailVerified}
      />
    </div>
  );
}