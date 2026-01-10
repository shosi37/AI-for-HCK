import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User as FirebaseUser,
  GoogleAuthProvider,
  signInWithPopup,
  OAuthCredential,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  updateEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './config';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  studentId?: string;
  department?: string;
  year?: string;
  createdAt: Date;
}

// Sign up new user
export const signUp = async (
  email: string,
  password: string,
  name: string,
  studentId?: string,
  department?: string,
  year?: string
): Promise<UserProfile> => {
  try {
    // Create auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update display name
    await updateProfile(user, { displayName: name });

    // Create user profile in Firestore
    const userProfile: UserProfile = {
      id: user.uid,
      email: user.email!,
      name,
      studentId,
      department,
      year,
      createdAt: new Date(),
    };

    await setDoc(doc(db, 'users', user.uid), userProfile);

    return userProfile;
  } catch (error: any) {
    console.error('Sign up error:', error);
    throw new Error(error.message || 'Failed to sign up');
  }
};

// Sign in user
export const signIn = async (email: string, password: string): Promise<UserProfile> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Try to get user profile from Firestore
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));

      if (userDoc.exists()) {
        const profileData = userDoc.data() as UserProfile;
        // Ensure the profile has an ID
        if (!profileData.id) {
          profileData.id = user.uid;
        }
        return profileData;
      }
    } catch (firestoreError) {
      console.error('Firestore error during sign in:', firestoreError);
      // Fall through to create fallback profile
    }

    // If Firestore document doesn't exist or there's an error, create fallback profile
    console.log('Creating fallback profile for sign in');
    const fallbackProfile: UserProfile = {
      id: user.uid,
      email: user.email || email,
      name: user.displayName || user.email?.split('@')[0] || 'User',
      createdAt: new Date(),
    };

    return fallbackProfile;
  } catch (error: any) {
    console.error('Sign in error:', error);

    // Provide more user-friendly error messages
    if (error.code === 'auth/invalid-credential') {
      throw new Error('Invalid email or password. Please check your credentials.');
    } else if (error.code === 'auth/user-not-found') {
      throw new Error('No account found with this email. Please sign up first.');
    } else if (error.code === 'auth/wrong-password') {
      throw new Error('Incorrect password. Please try again.');
    } else if (error.code === 'auth/too-many-requests') {
      throw new Error('Too many failed login attempts. Please try again later.');
    } else if (error.code === 'auth/network-request-failed') {
      throw new Error('Network error. Please check your connection.');
    }

    throw new Error(error.message || 'Failed to sign in');
  }
};

// Sign out user
export const logOut = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error: any) {
    console.error('Sign out error:', error);
    throw new Error(error.message || 'Failed to sign out');
  }
};

// Get current user profile
export const getCurrentUserProfile = async (user: FirebaseUser): Promise<UserProfile | null> => {
  if (!user || !user.uid) {
    console.error('getCurrentUserProfile called with invalid user');
    return null;
  }

  try {
    const userDoc = await getDoc(doc(db, 'users', user.uid));

    if (!userDoc.exists()) {
      // If document doesn't exist, create a basic profile from Firebase Auth data
      console.log('User document not found, creating fallback profile from Firebase Auth');
      const fallbackProfile: UserProfile = {
        id: user.uid,
        email: user.email || '',
        name: user.displayName || user.email?.split('@')[0] || 'User',
        createdAt: new Date(),
      };
      return fallbackProfile;
    }

    const profileData = userDoc.data() as UserProfile;

    // Ensure the profile has an ID
    if (!profileData.id) {
      profileData.id = user.uid;
    }

    return profileData;
  } catch (error: any) {
    console.error('Get user profile error:', error);

    // For ANY error, create fallback profile from Firebase Auth
    // This ensures we always have a valid user object with an ID
    console.log('Error getting user profile, creating fallback from Firebase Auth');
    const fallbackProfile: UserProfile = {
      id: user.uid,
      email: user.email || '',
      name: user.displayName || user.email?.split('@')[0] || 'User',
      createdAt: new Date(),
    };
    return fallbackProfile;
  }
};

// Update user profile
export const updateUserProfile = async (
  userId: string,
  updates: Partial<UserProfile>
): Promise<void> => {
  try {
    // Filter out undefined values and empty strings to prevent Firestore errors
    const filteredUpdates: any = {};
    Object.keys(updates).forEach(key => {
      const value = (updates as any)[key];
      // Only include non-undefined and non-empty string values
      // Exception: allow empty strings for optional fields to clear them
      if (value !== undefined && value !== null) {
        // For string fields, trim whitespace
        if (typeof value === 'string') {
          const trimmedValue = value.trim();
          // Only add non-empty strings or keep empty for clearing
          if (trimmedValue !== '' || key === 'studentId' || key === 'department' || key === 'year') {
            filteredUpdates[key] = trimmedValue || '';
          }
        } else {
          filteredUpdates[key] = value;
        }
      }
    });

    // Only update if there are valid fields
    if (Object.keys(filteredUpdates).length === 0) {
      console.log('No valid fields to update');
      return;
    }

    await updateDoc(doc(db, 'users', userId), filteredUpdates);

    // Update auth display name if name is changed
    if (filteredUpdates.name && auth.currentUser) {
      await updateProfile(auth.currentUser, { displayName: filteredUpdates.name });
    }
  } catch (error: any) {
    console.error('Update profile error:', error);

    // If permission denied, silently fail (Firebase rules not configured)
    if (error?.code === 'permission-denied') {
      console.log('Profile update blocked by Firebase security rules. Please configure rules.');
      return;
    }

    throw new Error(error.message || 'Failed to update profile');
  }
};

// Check if user is admin
export const isAdmin = (email: string): boolean => {
  return email === 'admin@hck.edu';
};

// Sign in with Google OAuth
export const signInWithGoogle = async (): Promise<{
  userProfile: UserProfile;
  idToken: string;
  accessToken?: string;
}> => {
  try {
    const provider = new GoogleAuthProvider();

    // Request ID token and access token
    provider.addScope('profile');
    provider.addScope('email');

    // Set custom parameters
    provider.setCustomParameters({
      prompt: 'select_account'
    });

    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Get the OAuth credential and ID token
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const accessToken = credential?.accessToken;
    const idToken = await user.getIdToken();

    console.log('Google Sign-In successful!');
    console.log('ID Token:', idToken);
    console.log('Access Token:', accessToken);
    console.log('User UID:', user.uid);
    console.log('User Email:', user.email);

    // Check if user profile already exists in Firestore
    let userProfile: UserProfile;

    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));

      if (userDoc.exists()) {
        // User already exists, return existing profile
        userProfile = userDoc.data() as UserProfile;
        if (!userProfile.id) {
          userProfile.id = user.uid;
        }
      } else {
        // New user, create profile
        userProfile = {
          id: user.uid,
          email: user.email!,
          name: user.displayName || user.email?.split('@')[0] || 'User',
          createdAt: new Date(),
        };

        await setDoc(doc(db, 'users', user.uid), userProfile);
        console.log('New user profile created in Firestore');
      }
    } catch (firestoreError) {
      console.error('Firestore error during Google sign in:', firestoreError);

      // Create fallback profile
      userProfile = {
        id: user.uid,
        email: user.email || '',
        name: user.displayName || user.email?.split('@')[0] || 'User',
        createdAt: new Date(),
      };
    }

    return {
      userProfile,
      idToken,
      accessToken,
    };
  } catch (error: any) {
    console.error('Google sign in error:', error);

    // Get current domain information
    const currentDomain = window.location.hostname;
    const currentOrigin = window.location.origin;

    // Provide user-friendly error messages
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('Sign-in cancelled. Please try again.');
    } else if (error.code === 'auth/popup-blocked') {
      throw new Error('Pop-up blocked by browser. Please allow pop-ups for this site.');
    } else if (error.code === 'auth/network-request-failed') {
      throw new Error('Network error. Please check your connection.');
    } else if (error.code === 'auth/unauthorized-domain') {
      console.error('🔴 UNAUTHORIZED DOMAIN ERROR 🔴');
      console.error('Current Domain:', currentDomain);
      console.error('Current Origin:', currentOrigin);
      console.error('You need to add this domain to Firebase authorized domains');
      throw new Error(
        `Domain not authorized: "${currentDomain}". ` +
        `Please add "${currentDomain}" to Firebase Console → Authentication → Settings → Authorized domains`
      );
    }

    throw new Error(error.message || 'Failed to sign in with Google');
  }
};

// Send password reset email
export const sendPasswordResetEmail = async (email: string): Promise<void> => {
  try {
    await firebaseSendPasswordResetEmail(auth, email);
    console.log('Password reset email sent successfully to:', email);
  } catch (error: any) {
    console.error('Password reset error:', error);

    // Provide user-friendly error messages
    if (error.code === 'auth/invalid-email') {
      throw new Error('Invalid email address format.');
    } else if (error.code === 'auth/user-not-found') {
      throw new Error('No account found with this email address.');
    } else if (error.code === 'auth/network-request-failed') {
      throw new Error('Network error. Please check your connection.');
    } else if (error.code === 'auth/too-many-requests') {
      throw new Error('Too many requests. Please try again later.');
    }

    throw new Error(error.message || 'Failed to send password reset email');
  }
};

// Update user email
export const updateUserEmail = async (
  newEmail: string,
  currentPassword: string
): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user || !user.email) {
      throw new Error('No user is currently signed in.');
    }

    // Reauthenticate user before email change (required by Firebase)
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);

    // Update email in Firebase Auth
    await updateEmail(user, newEmail);

    // Update email in Firestore
    await updateDoc(doc(db, 'users', user.uid), { email: newEmail });

    console.log('Email updated successfully to:', newEmail);
  } catch (error: any) {
    console.error('Update email error:', error);

    // Provide user-friendly error messages
    if (error.code === 'auth/invalid-email') {
      throw new Error('Invalid email address format.');
    } else if (error.code === 'auth/email-already-in-use') {
      throw new Error('This email is already in use by another account.');
    } else if (error.code === 'auth/requires-recent-login') {
      throw new Error('Please log out and log back in before changing your email.');
    } else if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
      throw new Error('Incorrect password. Please try again.');
    } else if (error.code === 'auth/network-request-failed') {
      throw new Error('Network error. Please check your connection.');
    }

    throw new Error(error.message || 'Failed to update email');
  }
};

// Update user password
export const updateUserPassword = async (
  currentPassword: string,
  newPassword: string
): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user || !user.email) {
      throw new Error('No user is currently signed in.');
    }

    // Validate new password
    if (newPassword.length < 6) {
      throw new Error('New password must be at least 6 characters long.');
    }

    // Reauthenticate user before password change (required by Firebase)
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);

    // Update password in Firebase Auth
    await updatePassword(user, newPassword);

    console.log('Password updated successfully');
  } catch (error: any) {
    console.error('Update password error:', error);

    // Provide user-friendly error messages
    if (error.code === 'auth/weak-password') {
      throw new Error('New password is too weak. Use at least 6 characters.');
    } else if (error.code === 'auth/requires-recent-login') {
      throw new Error('Please log out and log back in before changing your password.');
    } else if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
      throw new Error('Incorrect current password. Please try again.');
    } else if (error.code === 'auth/network-request-failed') {
      throw new Error('Network error. Please check your connection.');
    }

    throw new Error(error.message || 'Failed to update password');
  }
};