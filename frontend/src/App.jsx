import React, { useState, useEffect, Suspense, lazy } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FullAppSkeleton, PageShellSkeleton, AuthPageSkeleton } from './components/AppSkeletons';

// Lazy load components for better performance
const AuthPage = lazy(() => import('./components/AuthPage'));
const ProfilePage = lazy(() => import('./components/ProfilePage'));
const AppLayout = lazy(() => import('./components/AppLayout'));
const DashboardPage = lazy(() => import('./components/DashboardPage'));
const LogHistoryPage = lazy(() => import('./components/LogHistoryPage'));
const WeeklyProgressPage = lazy(() => import('./components/WeeklyProgressPage'));
const SettingsPage = lazy(() => import('./components/SettingsPage'));
const ForgotPasswordPage = lazy(() => import('./components/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./components/ResetPasswordPage'));

const AUTH_API_URL = `${import.meta.env.VITE_API_URL}/auth`;

// Decide if the profile is complete (prevents getting stuck on Profile page)
const isProfileComplete = (u) =>
  !!(u && u.gender && u.height && u.weight && u.activityLevel && u.primaryGoal);

// App-level loading (full-screen skeleton)
const AppLoading = () => <FullAppSkeleton />;

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [route, setRoute] = useState(window.location.pathname);

  // Route handling
  useEffect(() => {
    const onLocationChange = () => setRoute(window.location.pathname);
    window.addEventListener('popstate', onLocationChange);
    return () => window.removeEventListener('popstate', onLocationChange);
  }, []);

  // User authentication
  useEffect(() => {
    const fetchUserData = async () => {
      if (token) {
        localStorage.setItem('token', token);
        axios.defaults.headers.common['x-auth-token'] = token;
        try {
          const res = await axios.get(`${AUTH_API_URL}/user`);
          setUser(res.data);
        } catch (err) {
          setToken(null);
          console.error('Auth error:', err);
        }
      } else {
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['x-auth-token'];
        setUser(null);
      }
      setLoading(false);
    };
    fetchUserData();
  }, [token]);

  // Event handlers
  const handleAuthSuccess = (newToken) => {
    setCurrentPage('dashboard');
    setToken(newToken);
  };

  // After profile save, update user and redirect to dashboard if complete
  const handleProfileSave = (updatedUser) => {
    const next = updatedUser?.user || updatedUser; // accept {user: …} or user object
    setUser(next);
    if (isProfileComplete(next)) {
      handleNavigation('dashboard');
    }
  };

  const handleLogout = () => {
    setCurrentPage('dashboard');
    setToken(null);
  };

  const handleUserUpdate = (updatedUser) => setUser(updatedUser);

  const handleNavigation = (page) => {
    setCurrentPage(page);
    // Update URL without full page reload
    window.history.pushState({}, '', `/${page === 'dashboard' ? '' : page}`);
  };

  // Page rendering for logged-in users
  const renderLoggedInPages = () => {
    const pageConfig = {
      logHistory: <LogHistoryPage onNavigate={handleNavigation} />,
      weeklyProgress: (
        <WeeklyProgressPage onUpdateUser={handleUserUpdate} onNavigate={handleNavigation} />
      ),
      settings: (
        <SettingsPage user={user} onLogout={handleLogout} onUpdateUser={handleUserUpdate} />
      ),
      dashboard: (
        <DashboardPage user={user} onUpdateUser={handleUserUpdate} onNavigate={handleNavigation} />
      ),
    };

    return pageConfig[currentPage] || pageConfig.dashboard;
  };

  // Main routing logic
  const renderContent = () => {
    // Password reset route (highest priority)
    if (route.startsWith('/resetpassword/')) {
      const resetToken = route.split('/')[2];
      return (
        <ResetPasswordPage
          token={resetToken}
          onPasswordReset={() => {
            handleLogout();
            window.history.pushState({}, '', '/');
            setRoute('/');
          }}
        />
      );
    }

    // Unauthenticated users
    if (!user) {
      if (currentPage === 'forgotPassword') {
        return <ForgotPasswordPage onBackToLogin={() => handleNavigation('dashboard')} />;
      }
      return <AuthPage onAuthSuccess={handleAuthSuccess} onNavigate={handleNavigation} />;
    }

    // Profile setup required (use full completion check)
    if (!isProfileComplete(user)) {
      return <ProfilePage onProfileSave={handleProfileSave} onBackToAuth={handleLogout} />;
    }

    // Main application
    return (
      <AppLayout
        user={user}
        currentPage={currentPage}
        onNavigate={handleNavigation}
        onLogout={handleLogout}
      >
        {renderLoggedInPages()}
      </AppLayout>
    );
  };

  if (loading) {
    return <AppLoading />;
  }

  // 🔹 Choose a route-aware fallback: Auth skeleton when logged out, app shell inside
  const suspenseFallback = user ? <PageShellSkeleton /> : <AuthPageSkeleton />;

  return (
    <div className="min-h-screen bg-slate-50">
      <Suspense fallback={suspenseFallback}>
        <AnimatePresence mode="wait">
          <motion.div
            key={`${route}-${currentPage}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="w-full"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </Suspense>
    </div>
  );
}

export default App;
