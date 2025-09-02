import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Import all our page components
import AuthPage from './components/AuthPage';
import ProfilePage from './components/ProfilePage';
import DashboardPage from './components/DashboardPage';
import WeeklyProgressPage from './components/WeeklyProgressPage'; // <-- IMPORT NEW PAGE

const AUTH_API_URL = `${import.meta.env.VITE_API_URL}/api/auth`;

function App() {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState('dashboard'); // <-- NEW STATE FOR NAVIGATION


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

    const handleAuthSuccess = (newToken) => setToken(newToken);
    const handleProfileSave = (updatedUser) => setUser(updatedUser);
    const handleLogout = () => {
        setToken(null);
        setCurrentPage('dashboard'); // Reset to dashboard on logout
    };
    const handleUserUpdate = (updatedUser) => setUser(updatedUser);
    
    // This is our main content renderer
    const renderContent = () => {
        if (loading) {
            return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
        }

        if (!user) {
            return <AuthPage onAuthSuccess={handleAuthSuccess} />;
        }

        if (!user.weight) {
            return <ProfilePage onProfileSave={handleProfileSave} />;
        }

        // --- NEW NAVIGATION LOGIC ---
        switch (currentPage) {
            case 'weeklyProgress':
                return <WeeklyProgressPage onBack={() => setCurrentPage('dashboard')} onUpdateUser={handleUserUpdate} />;
            case 'dashboard':
            default:
                return <DashboardPage user={user} handleLogout={handleLogout} onNavigate={setCurrentPage} />;
        }
        // --- END NEW LOGIC ---
    };

    return <div className="App">{renderContent()}</div>
}

export default App;