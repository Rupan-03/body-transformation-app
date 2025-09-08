import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Import all our page components
import AuthPage from './components/AuthPage';
import ProfilePage from './components/ProfilePage';
import DashboardPage from './components/DashboardPage';
import WeeklyProgressPage from './components/WeeklyProgressPage';

const AUTH_API_URL = `${import.meta.env.VITE_API_URL}/auth`;

function App() {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState('dashboard');

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
    // This function is passed down so child components can update the user state
    const handleUserUpdate = (updatedUser) => setUser(updatedUser);
    
    // This is our main content renderer
    const renderContent = () => {
        if (loading) {
            return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
        }

        if (!user) {
            // Note: For the new goal feature to work, your AuthPage component
            // will also need to be updated to include the goal selection field.
            return <AuthPage onAuthSuccess={handleAuthSuccess} />;
        }

        if (!user.weight) {
            return <ProfilePage onProfileSave={handleProfileSave} />;
        }

        // The main navigation logic
        switch (currentPage) {
            case 'weeklyProgress':
                return <WeeklyProgressPage onBack={() => setCurrentPage('dashboard')} onUpdateUser={handleUserUpdate} />;
            case 'dashboard':
            default:
                // --- THIS IS THE CRITICAL CHANGE ---
                // We now pass the 'onUpdateUser' function to the DashboardPage.
                // This allows the "Edit Goal" modal to update the app's central state.
                return <DashboardPage user={user} handleLogout={handleLogout} onNavigate={setCurrentPage} onUpdateUser={handleUserUpdate} />;
        }
    };

    return <div className="App">{renderContent()}</div>
}

export default App;