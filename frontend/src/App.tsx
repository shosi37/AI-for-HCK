import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './utils/firebase/config';
import AnimatedBackground from './components/common/AnimatedBackground';
import { getCurrentUserProfile, isAdmin as checkIsAdmin } from './utils/firebase/auth';
import { ThemeProvider } from './context/ThemeContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import ChatPage from './pages/ChatPage';
import ProfileEdit from './pages/ProfileEdit';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import ForgotPassword from './pages/ForgotPassword';
import { Toaster } from 'sonner';
import { notify, showErrorToast } from './utils/notifications';
import { User } from './types';



function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const lastValidToken = useRef<string | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      // Use default persistence (Local), so no setPersistence call needed.
      const { signOut } = await import('firebase/auth');

      // Listen to Firebase auth state changes
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        // Dynamic check for new tab launch via session marker
        // If activeSession is MISSING, we dictate that this is a "Launch".
        // During launch, we do NOT allow auto-login.
        const isActiveSession = sessionStorage.getItem('activeSession');

        if (!isActiveSession) {
          // This is a new tab / launch scenario.
          if (firebaseUser) {
            // User exists but shouldn't (auto-login attempted).
            // Force clear everything and sign out.
            console.log('Launch detected with existing user (auto-login), forcing logout...');
            await signOut(auth);
            localStorage.clear();
            setUser(null);
            setIsLoading(false);

            // IMPORTANT: We do NOT set activeSession here.
            // We wait for the next event (which will be null user) to activate the session.
            return;
          } else {
            // User is null. This is the clean state we want on launch.
            // Now we can Mark session as active.
            console.log('Launch detected with clean state. Activating session.');
            sessionStorage.setItem('activeSession', 'true');
            setUser(null);
            setIsLoading(false);
            return;
          }
        }

        // If we are here, activeSession is TRUE.
        // This means we are in a valid session (either after launch cleanup, or a reload).
        if (firebaseUser) {
          // 1. Check if we have a stored token that needs verification
          const storedToken = localStorage.getItem('authToken');
          let verificationPassed = false;

          if (storedToken) {
            try {
              // Verify against backend using the stored token
              const verifyRes = await fetch('http://localhost:4000/api/profile', {
                headers: { 'Authorization': `Bearer ${storedToken}` }
              });

              if (!verifyRes.ok) {
                throw new Error('Token validation failed');
              }
              verificationPassed = true;
              lastValidToken.current = storedToken; // Mark this as valid
            } catch (err) {
              console.error('Stored token invalid or tampered, forcing logout', err);
              const { logOut } = await import('./utils/firebase/auth');
              await logOut();
              setUser(null);
              setIsAdmin(false);
              showErrorToast('Session Expired', 'Please login again.');
              return; // STOP HERE
            }
          }

          // 2. If verification passed OR we don't have a token yet (fresh login flow), proceed.
          try {
            // Get basic profile
            const userProfile = await getCurrentUserProfile(firebaseUser);
            if (userProfile) {
              setUser(userProfile);
              setIsAdmin(checkIsAdmin(userProfile.email));
            }

            // 3. Global Backend Verification / Session Refresh
            const idToken = await firebaseUser.getIdToken();
            const backendUrl = 'http://localhost:4000/api/login-token';

            fetch(backendUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ idToken }),
            })
              .then(res => res.json())
              .then(data => {
                if (data.token) {
                  lastValidToken.current = data.token; // Update valid reference
                  localStorage.setItem('authToken', data.token);
                  localStorage.setItem('backendUser', JSON.stringify(data.user));

                  if (data.user?.uid) {
                    localStorage.setItem('sessionId', data.user.uid);
                  }

                  // Update UI with verified backend data (bypasses Firestore rules issues)
                  setUser(prev => ({ ...prev, ...data.user }));
                  if (data.user.email) setIsAdmin(checkIsAdmin(data.user.email));
                }
              })
              .catch(err => console.error('Global verification failed', err));

          } catch (e) {
            console.error('Error fetching user profile', e);
          }
        } else {
          // User is signed out
          setUser(null);
          setIsAdmin(false);
          // Clear storage
          localStorage.removeItem('authToken');
          localStorage.removeItem('backendUser');
          localStorage.removeItem('sessionId');

          // We keep activeSession true so user can re-login in this tab without triggering 'Launch' logic
          // We do NOT clear activeSession here, because a user might just click "Logout".
          // Staying in the same tab, we want them to be able to log back in without 'launch' logic triggering again.
        }
        setIsLoading(false);
      });

      return unsubscribe;
    };

    const cleanupPromise = initAuth();

    // Polling for manual token tampering in DevTools
    const pollInterval = setInterval(() => {
      const token = localStorage.getItem('authToken');

      // 1. Garbage check
      if (token && token.length < 20) {
        showErrorToast('Session Expired', 'Invalid token detected.');
        import('./utils/firebase/auth').then(({ logOut }) => logOut());
        return;
      }

      // 2. Strict Equality Check (Anti-Tamper)
      // REMOVED: conflicting with multi-tab usage where token rotates.
      // Backend signature verification is sufficient for security.
      /*
      if (lastValidToken.current && token && token !== lastValidToken.current) {
        // This causes false positives when another tab updates the token.
      }
      */
    }, 1000);

    return () => {
      cleanupPromise.then(unsubscribe => unsubscribe && unsubscribe());
      clearInterval(pollInterval);
    };
  }, []);

  const refreshUser = async () => {
    if (!auth.currentUser) return;
    try {
      const firebaseUser = auth.currentUser;
      const userProfile = await getCurrentUserProfile(firebaseUser);
      if (userProfile) {
        setUser(userProfile);
      }

      const idToken = await firebaseUser.getIdToken(true); // Force refresh
      const backendUrl = 'http://localhost:4000/api/login-token';
      const res = await fetch(backendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });
      const data = await res.json();
      if (data.token) {
        lastValidToken.current = data.token;
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('backendUser', JSON.stringify(data.user));
        setUser(prev => ({ ...prev, ...data.user }));
      }
    } catch (e) {
      console.error('Manual refresh failed', e);
    }
  };

  const handleLogin = (userData: User) => {
    setUser(userData);
    setIsAdmin(checkIsAdmin(userData.email));
  };

  const handleAdminLogin = () => {
    setIsAdmin(true);
  };

  const handleLogout = async () => {
    const { logOut } = await import('./utils/firebase/auth');
    await logOut();
    setUser(null);
    setIsAdmin(false);
    notify.logout.success();
  };

  const handleAdminLogout = async () => {
    const { logOut } = await import('./utils/firebase/auth');
    await logOut();
    setIsAdmin(false);
    setUser(null);
    notify.admin.logoutSuccess();
  };

  const handleUpdateProfile = (updatedUser: User) => {
    setUser(updatedUser);
  };

  if (isLoading) {
    return (
      <ThemeProvider>
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
          <AnimatedBackground />
          <div className="text-center relative z-10">
            <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-900 dark:text-white mt-4 font-medium">Loading...</p>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <Toaster position="top-center" richColors />
      <Router>
        <Routes>
          <Route
            path="/login"
            element={
              isAdmin ? (
                <Navigate to="/admin/dashboard" />
              ) : user ? (
                <Navigate to="/dashboard" />
              ) : (
                <Login onLogin={handleLogin} onAdminLogin={handleAdminLogin} />
              )
            }
          />
          <Route
            path="/signup"
            element={
              user ? <Navigate to="/dashboard" /> : <Signup onSignup={handleLogin} />
            }
          />
          <Route
            path="/dashboard"
            element={
              user ? (
                <Dashboard user={user} onLogout={handleLogout} onRefresh={refreshUser} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/chat"
            element={
              user ? (
                <ChatPage user={user} onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/profile"
            element={
              user ? (
                <ProfileEdit
                  user={user}
                  onUpdateProfile={handleUpdateProfile}
                  onLogout={handleLogout}
                />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/admin/login"
            element={
              isAdmin ? (
                <Navigate to="/admin/dashboard" />
              ) : (
                <AdminLogin onAdminLogin={handleAdminLogin} />
              )
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              isAdmin ? (
                <AdminDashboard onLogout={handleAdminLogout} />
              ) : (
                <Navigate to="/admin/login" />
              )
            }
          />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;