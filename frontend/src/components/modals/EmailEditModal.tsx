import { useState } from 'react';
import { Mail, Lock, X, Eye, EyeOff, CheckCircle, AlertTriangle } from 'lucide-react';
import { updateUserEmail } from '../../utils/firebase/auth';
import type { User } from '../../types';
import { notify } from '../../utils/notifications';

interface EmailEditModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (user: User) => void;
}

export default function EmailEditModal({ user, isOpen, onClose, onUpdate }: EmailEditModalProps) {
  const [newEmail, setNewEmail] = useState(user.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!newEmail || !currentPassword) {
        throw new Error('Please fill in all fields');
      }

      if (newEmail === user.email) {
        throw new Error('New email must be different from current email');
      }

      // Update email in Firebase
      await updateUserEmail(newEmail, currentPassword);

      const updatedUser: User = {
        ...user,
        email: newEmail,
      };

      onUpdate(updatedUser);
      notify.email.success(newEmail);
      handleClose();
      setCurrentPassword('');
    } catch (err: any) {
      console.error('Update email error:', err);
      notify.email.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setNewEmail(user.email || '');
    setCurrentPassword('');
    onClose();
  };

  if (!isOpen) return null;



  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="glass rounded-3xl p-8 shadow-2xl max-w-md w-full relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-gray-900 dark:text-white text-xl font-bold flex items-center gap-2">
            <div className="p-2 bg-indigo-500/10 rounded-lg">
              <Mail className="w-6 h-6 text-indigo-500" />
            </div>
            Change Email
          </h3>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-white/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>



        {/* Current Email Display */}
        <div className="mb-6 p-4 bg-gray-50/50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl">
          <p className="text-gray-500 dark:text-white/40 text-[10px] uppercase tracking-wider font-bold mb-1">Current Email</p>
          <p className="text-gray-900 dark:text-white font-medium">{user.email}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="newEmail" className="block text-gray-700 dark:text-white/70 text-sm font-medium mb-2 ml-1">
              New Email Address
            </label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-white/30 group-focus-within:text-indigo-500 transition-colors" />
              <input
                id="newEmail"
                type="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white rounded-2xl border border-gray-100 dark:border-white/10 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-white/20"
                placeholder="newemail@example.com"
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label htmlFor="currentPassword" className="block text-gray-700 dark:text-white/70 text-sm font-medium mb-2 ml-1">
              Confirm Password
            </label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-white/30 group-focus-within:text-indigo-500 transition-colors" />
              <input
                id="currentPassword"
                type={showPassword ? 'text' : 'password'}
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full pl-12 pr-12 py-3 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white rounded-2xl border border-gray-100 dark:border-white/10 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-white/20"
                placeholder="Your current password"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-white/30 hover:text-indigo-500 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Info Note */}
          <div className="p-4 bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-start gap-3">
            <Lock className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
            <p className="text-[11px] text-blue-600 dark:text-blue-300 leading-relaxed font-medium">
              <span className="font-bold">Security Note:</span> For your protection, you must re-authenticate with your current password to change your email address.
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-500/25 transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2 group"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Update Email</span>
                <Mail className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
