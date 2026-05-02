import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
}) => {
  if (!isOpen) return null;

  const variantStyles = {
    danger: 'bg-red-600 hover:bg-red-700 shadow-red-500/25',
    warning: 'bg-orange-600 hover:bg-orange-700 shadow-orange-500/25',
    info: 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/25',
  };

  const iconStyles = {
    danger: 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400',
    warning: 'bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400',
    info: 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400',
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md glass rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${iconStyles[variant]}`}>
              <AlertTriangle className="w-6 h-6" />
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {title}
            </h3>
            <p className="text-gray-600 dark:text-white/60 leading-relaxed">
              {message}
            </p>
          </div>

          {/* Footer */}
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-white font-medium rounded-2xl hover:bg-gray-200 dark:hover:bg-white/10 transition-all active:scale-[0.98]"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`flex-1 px-6 py-3 text-white font-bold rounded-2xl shadow-lg transition-all active:scale-[0.98] ${variantStyles[variant]}`}
            >
              {confirmText}
            </button>
          </div>
        </div>

        {/* Decorative background element */}
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-indigo-500/10 blur-3xl rounded-full" />
      </div>
    </div>
  );
};

export default ConfirmModal;
