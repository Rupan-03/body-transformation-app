import React, { useState, useEffect, Suspense, lazy } from 'react'; // <-- ADD Suspense, lazy
import axios from 'axios';

// --- Lazy Load ALL Your Page Components ---
// This tells React to only load these components' code when they are actually rendered.
const AuthPage = lazy(() => import('./components/AuthPage'));
const ProfilePage = lazy(() => import('./components/ProfilePage'));
const AppLayout = lazy(() => import('./components/AppLayout'));
const DashboardPage = lazy(() => import('./components/DashboardPage'));
const LogHistoryPage = lazy(() => import('./components/LogHistoryPage'));
const WeeklyProgressPage = lazy(() => import('./components/WeeklyProgressPage'));
const SettingsPage = lazy(() => import('./components/SettingsPage'));
const ForgotPasswordPage = lazy(() => import('./components/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./components/ResetPasswordPage'));
// --- END Lazy Load ---

const AUTH_API_URL = `${import.meta.env.VITE_API_URL}/auth`;

function App() {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState('dashboard');
    const [route, setRoute] = useState(window.location.pathname);

    useEffect(() => {
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
                    // Corrected endpoint based on your provided code: /auth/user
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
            case 'settings': return <SettingsPage user={user} onLogout={handleLogout} onUpdateUser={handleUserUpdate} />;
            case 'dashboard':
            default: return <DashboardPage user={user} onUpdateUser={handleUserUpdate} />;
        }
    };

    // A simple loading indicator for lazy-loaded components
    const PageFallbackLoader = () => (
        <div className="flex items-center justify-center min-h-screen text-gray-700 text-lg">
            Loading Page...
        </div>
    );

    // Initial app loading (e.g., checking token, fetching user data)
    if (loading) {
        return <div className="flex items-center justify-center min-h-screen text-gray-800 text-xl font-semibold">Loading Application...</div>;
    }

    // --- WRAP ALL ROUTING LOGIC IN SUSPENSE ---
    return (
        <div className="App">
            <Suspense fallback={<PageFallbackLoader />}>
                {(() => {
                    // STEP 1: Always check for the password reset route first. This takes priority over everything else.
                    if (route.startsWith('/resetpassword/')) {
                        const resetToken = route.split('/')[2];
                        return <ResetPasswordPage token={resetToken} onPasswordReset={() => {
                            handleLogout(); 
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
                })()}
            </Suspense>
        </div>
    );
    // --- END SUSPENSE WRAP ---
}

export default App;