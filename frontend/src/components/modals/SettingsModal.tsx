import React, { useState } from 'react';
import { X, User as UserIcon, Mail, Lock, LogOut, ChevronRight } from 'lucide-react';
import type { User } from '../../types';
import ProfileEditModal from './ProfileEditModal';
import EmailEditModal from './EmailEditModal';
import PasswordEditModal from './PasswordEditModal';

interface SettingsModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (user: User) => void;
  onLogout: () => void;
}

type SettingsTab = 'menu' | 'profile' | 'email' | 'password';

const SettingsModal: React.FC<SettingsModalProps> = ({
  user,
  isOpen,
  onClose,
  onUpdate,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('menu');

  if (!isOpen) return null;

  const handleBack = () => setActiveTab('menu');

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="animate-in slide-in-from-right duration-300">
             <button onClick={handleBack} className="mb-4 text-indigo-600 dark:text-indigo-400 text-sm flex items-center gap-1 hover:underline">
                ← Back to Settings
             </button>
             <ProfileEditModal user={user} isOpen={true} onClose={handleBack} onUpdateProfile={(u) => { onUpdate(u); handleBack(); }} isIntegrated={true} />
          </div>
        );
      case 'email':
        return (
          <div className="animate-in slide-in-from-right duration-300">
             <button onClick={handleBack} className="mb-4 text-indigo-600 dark:text-indigo-400 text-sm flex items-center gap-1 hover:underline">
                ← Back to Settings
             </button>
             <EmailEditModal user={user} isOpen={true} onClose={handleBack} onUpdate={(u) => { onUpdate(u); handleBack(); }} isIntegrated={true} />
          </div>
        );
      case 'password':
        return (
          <div className="animate-in slide-in-from-right duration-300">
             <button onClick={handleBack} className="mb-4 text-indigo-600 dark:text-indigo-400 text-sm flex items-center gap-1 hover:underline">
                ← Back to Settings
             </button>
             <PasswordEditModal isOpen={true} onClose={handleBack} isIntegrated={true} />
          </div>
        );
      default:
        return (
          <div className="space-y-3 animate-in fade-in duration-300">
            <button
              onClick={() => setActiveTab('profile')}
              className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-2xl transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <UserIcon className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-gray-900 dark:text-white">Edit Profile</div>
                  <div className="text-xs text-gray-500 dark:text-white/40">Name, student details, and more</div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-500 transition-colors" />
            </button>

            <button
              onClick={() => setActiveTab('email')}
              className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-2xl transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-gray-900 dark:text-white">Edit Email</div>
                  <div className="text-xs text-gray-500 dark:text-white/40">Update your primary email address</div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-500 transition-colors" />
            </button>

            <button
              onClick={() => setActiveTab('password')}
              className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-2xl transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center text-orange-600 dark:text-orange-400">
                  <Lock className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-gray-900 dark:text-white">Change Password</div>
                  <div className="text-xs text-gray-500 dark:text-white/40">Update your security credentials</div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-500 transition-colors" />
            </button>

            <div className="pt-4 mt-4 border-t border-gray-200 dark:border-white/10">
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-4 p-4 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-2xl transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-500/20 flex items-center justify-center">
                  <LogOut className="w-5 h-5" />
                </div>
                <div className="text-left font-bold">Logout</div>
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
      
      <div className="relative w-full max-w-md glass rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-6 border-b border-gray-200 dark:border-white/10 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Settings</h2>
            <p className="text-xs text-gray-500 dark:text-white/40">Manage your account and preferences</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl transition-all">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
