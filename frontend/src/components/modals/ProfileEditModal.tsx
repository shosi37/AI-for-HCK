import { useState } from 'react';
import {
    User,
    GraduationCap,
    BookOpen,
    Calendar,
    Save,
    X,
    CheckCircle,
    AlertTriangle
} from 'lucide-react';
import type { User as UserType } from '../../types';
import { updateUserProfile } from '../../utils/firebase/auth';
import { notify } from '../../utils/notifications';

interface ProfileEditModalProps {
    user: UserType;
    isOpen: boolean;
    onClose: () => void;
    onUpdateProfile: (user: UserType) => void;
}

export default function ProfileEditModal({
    user,
    isOpen,
    onClose,
    onUpdateProfile,
}: ProfileEditModalProps) {
    const [formData, setFormData] = useState({
        name: user.name || '',
        studentId: user.studentId || '',
        department: user.department || '',
        year: user.year || '',
    });

    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleClose = () => {
        onClose();
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
                    const newBackendUser = { ...parsed, displayName: formData.name, ...updatedUser };
                    localStorage.setItem('backendUser', JSON.stringify(newBackendUser));
                    sessionStorage.setItem('backendUser', JSON.stringify(newBackendUser));
                } catch (e) {
                    console.error('Failed to update storage', e);
                }
            }

            notify.profile.success();
            handleClose();
        } catch (err: any) {
            console.error('Update profile error:', err);
            notify.profile.error(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;



    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="glass rounded-3xl p-8 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-gray-900 dark:text-white text-2xl font-bold flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/10 rounded-xl">
                            <User className="w-6 h-6 text-indigo-500" />
                        </div>
                        Edit Profile
                    </h3>
                    <button
                        onClick={handleClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-white/60"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>



                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Full Name */}
                        <div className="md:col-span-2">
                            <label htmlFor="name" className="block text-gray-700 dark:text-white/70 text-sm font-medium mb-2 ml-1">
                                Full Name
                            </label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-white/30 group-focus-within:text-indigo-500 transition-colors" />
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white rounded-2xl border border-gray-100 dark:border-white/10 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-white/20"
                                    placeholder="Your full name"
                                />
                            </div>
                        </div>

                        {/* Student ID */}
                        <div>
                            <label htmlFor="studentId" className="block text-gray-700 dark:text-white/70 text-sm font-medium mb-2 ml-1">
                                Student ID
                            </label>
                            <div className="relative group">
                                <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-white/30 group-focus-within:text-indigo-500 transition-colors" />
                                <input
                                    id="studentId"
                                    name="studentId"
                                    type="text"
                                    value={formData.studentId}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white rounded-2xl border border-gray-100 dark:border-white/10 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-white/20"
                                    placeholder="e.g., HCK2024001"
                                />
                            </div>
                        </div>

                        {/* Department */}
                        <div>
                            <label htmlFor="department" className="block text-gray-700 dark:text-white/70 text-sm font-medium mb-2 ml-1">
                                Department
                            </label>
                            <div className="relative group">
                                <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-white/30 group-focus-within:text-indigo-500 transition-colors pointer-events-none" />
                                <select
                                    id="department"
                                    name="department"
                                    value={formData.department}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white rounded-2xl border border-gray-100 dark:border-white/10 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all appearance-none"
                                >
                                    <option value="">Select Department</option>
                                    <option value="Computer Science">Computer Science</option>
                                    <option value="Engineering">Engineering</option>
                                    <option value="Business Administration">Business Administration</option>
                                    <option value="Arts & Humanities">Arts & Humanities</option>
                                    <option value="Sciences">Sciences</option>
                                    <option value="Medicine">Medicine</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 dark:text-white/30">
                                    <Calendar className="w-4 h-4 rotate-90" />
                                </div>
                            </div>
                        </div>

                        {/* Year */}
                        <div className="md:col-span-2">
                            <label htmlFor="year" className="block text-gray-700 dark:text-white/70 text-sm font-medium mb-2 ml-1">
                                Year of Study
                            </label>
                            <div className="relative group">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-white/30 group-focus-within:text-indigo-500 transition-colors pointer-events-none" />
                                <select
                                    id="year"
                                    name="year"
                                    value={formData.year}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white rounded-2xl border border-gray-100 dark:border-white/10 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all appearance-none"
                                >
                                    <option value="">Select Year</option>
                                    <option value="1st Year">1st Year</option>
                                    <option value="2nd Year">2nd Year</option>
                                    <option value="3rd Year">3rd Year</option>
                                    <option value="4th Year">4th Year</option>
                                    <option value="Graduate">Graduate</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 dark:text-white/30">
                                    <Calendar className="w-4 h-4 rotate-90" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Info Note */}
                    <div className="p-4 bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-start gap-3">
                        <Calendar className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
                        <p className="text-[11px] text-blue-600 dark:text-blue-300 leading-relaxed font-medium">
                            <span className="font-bold">Sync Note:</span> Your profile information will be updated across all instances of the application immediately after saving.
                        </p>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-500/25 transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2 group"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <span>Save Changes</span>
                                    <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                </>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-8 py-4 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-white/70 font-bold rounded-2xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
