import { useState } from 'react';
import { X } from 'lucide-react';

interface VerifyEmailModalProps {
    isOpen: boolean;
    onClose: () => void;
    userEmail: string;
    userId: string;
    onVerified: () => void;
}

export default function VerifyEmailModal({ isOpen, onClose, userEmail, userId, onVerified }: VerifyEmailModalProps) {
    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    if (!isOpen) return null;

    const handleSendOtp = async () => {
        if (resendTimer > 0) return;
        setIsLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await fetch('http://localhost:4000/api/otp/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: userEmail, uid: userId }),
            });

            const data = await response.json();

            if (response.ok) {
                setResendTimer(60);
                setSuccess(data.message || 'Verification code sent! Check your email.');

                // Start countdown
                const interval = setInterval(() => {
                    setResendTimer((prev) => {
                        if (prev <= 1) {
                            clearInterval(interval);
                            return 0;
                        }
                        return prev - 1;
                    });
                }, 1000);
            } else {
                setError(data.error || 'Failed to send verification code. Please try again.');
            }
        } catch (err) {
            setError('Network error. Please check your connection.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!otp || otp.length < 6) return;

        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:4000/api/otp/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: userEmail, otp, uid: userId }),
            });

            const data = await response.json();

            if (data.success) {
                setSuccess('Email verified successfully!');
                setTimeout(() => {
                    onVerified();
                    onClose();
                }, 1500);
            } else {
                setError(data.error || 'Invalid verification code');
            }
        } catch (err) {
            setError('Verification failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="glass rounded-3xl p-8 max-w-md w-full shadow-2xl relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                    <X className="w-5 h-5" />
                </button>

                <h2 className="text-gray-900 dark:text-white text-2xl font-bold mb-2">Verify Your Email</h2>
                <p className="text-gray-500 dark:text-white/60 text-sm mb-6">
                    We'll send a 6-digit code to <span className="text-indigo-600 dark:text-indigo-400 font-bold">{userEmail}</span>
                </p>

                {error && (
                    <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl mb-4 text-sm">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 text-green-600 dark:text-green-400 px-4 py-3 rounded-xl mb-4 text-sm">
                        {success}
                    </div>
                )}

                <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <div>
                        <label className="block text-gray-700 dark:text-white/80 text-sm mb-2">
                            Verification Code
                        </label>
                        <input
                            type="text"
                            maxLength={6}
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                            className="w-full bg-gray-100 dark:bg-[#2d3748] text-gray-900 dark:text-white text-center text-2xl tracking-widest py-3 rounded-xl border border-transparent focus:border-indigo-500 focus:outline-none placeholder:text-gray-400"
                            placeholder="000000"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || otp.length < 6}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                        {isLoading ? 'Verifying...' : 'Verify Email'}
                    </button>
                </form>

                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-white/10 text-center">
                    <p className="text-sm text-gray-500 dark:text-white/60 mb-3">
                        {resendTimer > 0 ? `Resend code in ${resendTimer}s` : "Didn't receive the code?"}
                    </p>
                    <button
                        onClick={handleSendOtp}
                        disabled={isLoading || resendTimer > 0}
                        className={`text-sm font-bold transition-colors ${resendTimer > 0
                                ? 'text-gray-400 cursor-not-allowed'
                                : 'text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 underline'
                            }`}
                    >
                        {resendTimer > 0 ? 'Please wait...' : 'Send Verification Code'}
                    </button>
                </div>
            </div>
        </div>
    );
}
