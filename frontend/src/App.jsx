import React, { useState, useEffect, Suspense, lazy } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';

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

// Modern loading components
const AppLoading = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
    <div className="text-center space-y-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="mx-auto"
      >
        <Loader2 className="h-8 w-8 text-blue-600" />
      </motion.div>
      <p className="text-slate-600 font-medium">Loading your transformation journey...</p>
    </div>
  </div>
);

const PageFallbackLoader = () => (
  <div className="min-h-[400px] flex items-center justify-center">
    <div className="text-center space-y-3">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="mx-auto"
      >
        <Loader2 className="h-6 w-6 text-blue-500" />
      </motion.div>
      <p className="text-slate-500 text-sm">Loading page...</p>
    </div>
  </div>
);

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

  const handleProfileSave = (updatedUser) => setUser(updatedUser);
  
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
        <WeeklyProgressPage 
          onUpdateUser={handleUserUpdate} 
          onNavigate={handleNavigation} 
        />
      ),
      settings: (
        <SettingsPage 
          user={user} 
          onLogout={handleLogout} 
          onUpdateUser={handleUserUpdate} 
        />
      ),
      dashboard: (
        <DashboardPage 
          user={user} 
          onUpdateUser={handleUserUpdate} 
          onNavigate={handleNavigation} // ← FIXED: Added missing prop
        />
      )
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

    // Profile setup required
    if (!user.weight) {
      return <ProfilePage onProfileSave={handleProfileSave} />;
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

  return (
    <div className="min-h-screen bg-slate-50">
      <Suspense fallback={<PageFallbackLoader />}>
        <AnimatePresence mode="wait">
          <motion.div
            key={`${route}-${currentPage}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
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