import { useState } from 'react';
import { Lock, KeyRound, Shield, X, Eye, EyeOff, CheckCircle, AlertTriangle } from 'lucide-react';
import { updateUserPassword } from '../../utils/firebase/auth';
import { notify } from '../../utils/notifications';

interface PasswordEditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PasswordEditModal({ isOpen, onClose }: PasswordEditModalProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!currentPassword || !newPassword || !confirmPassword) {
        throw new Error('Please fill in all password fields');
      }

      if (newPassword !== confirmPassword) {
        throw new Error('New passwords do not match');
      }

      if (newPassword.length < 6) {
        throw new Error('New password must be at least 6 characters long');
      }

      if (currentPassword === newPassword) {
        throw new Error('New password must be different from current password');
      }

      // Update password in Firebase
      await updateUserPassword(currentPassword, newPassword);

      notify.password.success();
      handleClose();
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      console.error('Update password error:', err);
      notify.password.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
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
              <KeyRound className="w-6 h-6 text-indigo-500" />
            </div>
            Change Password
          </h3>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-white/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>



        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="currentPassword" className="block text-gray-700 dark:text-white/70 text-sm font-medium mb-2 ml-1">
              Current Password
            </label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-white/30 group-focus-within:text-indigo-500 transition-colors" />
              <input
                id="currentPassword"
                type={showCurrentPassword ? 'text' : 'password'}
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full pl-12 pr-12 py-3 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white rounded-2xl border border-gray-100 dark:border-white/10 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-white/20"
                placeholder="Current password"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-white/30 hover:text-indigo-500 transition-colors"
              >
                {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="newPassword" className="block text-gray-700 dark:text-white/70 text-sm font-medium mb-2 ml-1">
              New Password
            </label>
            <div className="relative group">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-white/30 group-focus-within:text-indigo-500 transition-colors" />
              <input
                id="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full pl-12 pr-12 py-3 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white rounded-2xl border border-gray-100 dark:border-white/10 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-white/20"
                placeholder="New password"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-white/30 hover:text-indigo-500 transition-colors"
              >
                {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-gray-700 dark:text-white/70 text-sm font-medium mb-2 ml-1">
              Confirm New Password
            </label>
            <div className="relative group">
              <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-white/30 group-focus-within:text-indigo-500 transition-colors" />
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-12 pr-12 py-3 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white rounded-2xl border border-gray-100 dark:border-white/10 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-white/20"
                placeholder="Confirm new password"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-white/30 hover:text-indigo-500 transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Info Note */}
          <div className="p-4 bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
            <p className="text-[11px] text-blue-600 dark:text-blue-300 leading-relaxed font-medium">
              <span className="font-bold">Strength Note:</span> Choose a new password that is at least 6 characters long. For better security, use a combination of letters, numbers, and symbols.
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
                <span>Update Password</span>
                <Lock className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
