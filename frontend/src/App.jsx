import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Import all our page components
import AuthPage from './components/AuthPage';
import ProfilePage from './components/ProfilePage';
import AppLayout from './components/AppLayout';
import DashboardPage from './components/DashboardPage';
import LogHistoryPage from './components/LogHistoryPage';
import WeeklyProgressPage from './components/WeeklyProgressPage';
import SettingsPage from './components/SettingsPage';
import ForgotPasswordPage from './components/ForgotPasswordPage';
import ResetPasswordPage from './components/ResetPasswordPage';

const AUTH_API_URL = `${import.meta.env.VITE_API_URL}/auth`;

function App() {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState('dashboard');
    
    // This state now reads the browser's URL path.
    // This is ESSENTIAL for handling the password reset link from an email.
    const [route, setRoute] = useState(window.location.pathname);

    useEffect(() => {
        // This allows the app to react to the browser's back/forward buttons
        const onLocationChange = () => setRoute(window.location.pathname);
        window.addEventListener('popstate', onLocationChange);
        return () => window.removeEventListener('popstate', onLocationChange);
    }, []);

    useEffect(() => {
        const fetchUserData = async () => {
            if (token) {
                localStorage.setItem('token', token);
                axios.defaults.headers.common['x-auth-token'] = token;
                try {
                    const res = await axios.get(`${AUTH_API_URL}/user`);
                    setUser(res.data);
                } catch (err) { setToken(null); }
            } else {
                localStorage.removeItem('token');
                delete axios.defaults.headers.common['x-auth-token'];
                setUser(null);
            }
            setLoading(false);
        };
        fetchUserData();
    }, [token]);

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
    
    const renderLoggedInPages = () => {
        switch (currentPage) {
            case 'logHistory': return <LogHistoryPage />;
            case 'weeklyProgress': return <WeeklyProgressPage onUpdateUser={handleUserUpdate} onNavigate={setCurrentPage} />;
            case 'settings': return <SettingsPage onLogout={handleLogout} />;
            case 'dashboard':
            default: return <DashboardPage user={user} onUpdateUser={handleUserUpdate} />;
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

// --- UPDATED HIGH-LEVEL ROUTING LOGIC ---

    // STEP 1: Always check for the password reset route first. This takes priority over everything else.
    if (route.startsWith('/resetpassword/')) {
        const resetToken = route.split('/')[2];
        return <ResetPasswordPage token={resetToken} onPasswordReset={() => {
            // After reset, clear the user's session to force a fresh login
            handleLogout(); 
            // Change URL back to the root without reloading
            window.history.pushState({}, '', '/'); 
            setRoute('/');
        }}/>;
    }

    // STEP 2: If it's not a password reset, THEN check if the user is logged in.
    if (!user) {
        if (currentPage === 'forgotPassword') {
            return <ForgotPasswordPage onBackToLogin={() => setCurrentPage('dashboard')} />;
        }
        return <AuthPage onAuthSuccess={handleAuthSuccess} onNavigate={setCurrentPage} />;
    }

    // STEP 3: Handle the logged-in user's journey.
    if (!user.weight) {
        return <ProfilePage onProfileSave={handleProfileSave} />;
    }

    // STEP 4: If all checks pass, show the main application.
    return (
        <AppLayout 
            user={user} 
            currentPage={currentPage}
            onNavigate={setCurrentPage}
            onLogout={handleLogout}
        >
            {renderLoggedInPages()}
        </AppLayout>
    );
}

export default App;