import { toast } from 'sonner';

/**
 * Creative Success and Error Notification Utility
 */

export const showSuccessToast = (title: string, description?: string) => {
    toast.success(title, {
        description: description || 'Everything looks good!',
        duration: 5000,
    });
};

export const showErrorToast = (title: string, description?: string) => {
    toast.error(title, {
        description: description || 'Something went wrong. Let\'s try that again!',
        duration: 6000,
    });
};

// Specialized notifications with "Creative" messages
export const notify = {
    login: {
        success: (name: string) =>
            showSuccessToast('Login Successful!', `Welcome back, ${name}! Ready to tackle the day?`),
        error: (msg?: string) =>
            showErrorToast('Login Failed', msg || 'Oops! Those credentials don\'t seem right. Give it another shot?'),
    },
    signup: {
        success: (name: string) =>
            showSuccessToast('Account Created!', `Welcome aboard, ${name}! Your journey starts here.`),
        error: (msg?: string) =>
            showErrorToast('Signup Failed', msg || 'We couldn\'t set up your account just yet. Check your details?'),
    },
    logout: {
        success: () =>
            showSuccessToast('Logged Out', 'Successfully signed out. Hope to see you back soon!'),
    },
    profile: {
        success: () =>
            showSuccessToast('Profile Updated', 'Your changes have been saved and synced across the galaxy!'),
        error: (msg?: string) =>
            showErrorToast('Update Failed', msg || 'We hit a snag updating your profile. Try once more?'),
    },
    password: {
        success: () =>
            showSuccessToast('Password Changed', 'Your account is now even more secure. Nice work!'),
        error: (msg?: string) =>
            showErrorToast('Reset Failed', msg || 'We couldn\'t update your password. Is the current one correct?'),
    },
    email: {
        success: (email: string) =>
            showSuccessToast('Email Updated', `Your new address ${email} is all set. Don't forget to verify!`),
        error: (msg?: string) =>
            showErrorToast('Email Update Failed', msg || 'Failed to change your email address. Verify your password?'),
    },
    admin: {
        loginSuccess: () =>
            showSuccessToast('Admin Access Granted', 'Welcome back, Commander. System protocols initiated.'),
        logoutSuccess: () =>
            showSuccessToast('Admin Logged Out', 'System secured. Have a productive day!'),
    }
};
