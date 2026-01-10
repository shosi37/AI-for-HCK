import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
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
import { notify } from './utils/notifications';
import { User } from './types';



function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Listen to Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in
        try {
          // Get basic profile
          const userProfile = await getCurrentUserProfile(firebaseUser);
          if (userProfile) {
            setUser(userProfile);
            setIsAdmin(checkIsAdmin(userProfile.email));
          }

          // PERFOM BACKEND VERIFICATION & STORAGE GLOBALLY
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
                console.log('Global backend verification success');
                // Persist to Storage for User Visibility
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('backendUser', JSON.stringify(data.user));
                sessionStorage.setItem('authToken', data.token);
                sessionStorage.setItem('backendUser', JSON.stringify(data.user));

                if (data.user?.uid) {
                  localStorage.setItem('sessionId', data.user.uid);
                  sessionStorage.setItem('sessionId', data.user.uid);
                }
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
        sessionStorage.removeItem('authToken');
        sessionStorage.removeItem('backendUser');
        sessionStorage.removeItem('sessionId');
      }
      setIsLoading(false);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

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
                <Dashboard user={user} onLogout={handleLogout} />
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