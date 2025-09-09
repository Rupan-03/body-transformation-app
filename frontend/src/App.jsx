import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Import all the top-level "page" and "layout" components that App.jsx manages.
import AuthPage from './components/AuthPage';
import ProfilePage from './components/ProfilePage';
import AppLayout from './components/AppLayout';
import DashboardPage from './components/DashboardPage';
import LogHistoryPage from './components/LogHistoryPage';
import WeeklyProgressPage from './components/WeeklyProgressPage';
import SettingsPage from './components/SettingsPage';

const AUTH_API_URL = `${import.meta.env.VITE_API_URL}/auth`;

// This is the main component for the entire application.
function App() {
    // --- State Management ---
    // 'token' is the user's authentication JWT, persisted in localStorage for session continuity.
    const [token, setToken] = useState(localStorage.getItem('token'));
    // 'user' holds the data of the currently logged-in user.
    const [user, setUser] = useState(null);
    // 'loading' is used to show a loading indicator while fetching initial user data.
    const [loading, setLoading] = useState(true);
    // 'currentPage' controls which page is displayed inside the main AppLayout (e.g., dashboard, settings).
    const [currentPage, setCurrentPage] = useState('dashboard'); 

    // This crucial useEffect hook runs when the app loads or when the token changes.
    // Its job is to verify the token and fetch the user's data to establish a session.
    useEffect(() => {
        const fetchUserData = async () => {
            if (token) {
                // If a token exists, persist it and set it as a default header for all API requests.
                localStorage.setItem('token', token);
                axios.defaults.headers.common['x-auth-token'] = token;
                try {
                    // Attempt to fetch the user's data from the protected backend route.
                    const res = await axios.get(`${AUTH_API_URL}/user`);
                    setUser(res.data);
                } catch (err) {
                    // If the token is invalid or expired, clear it and log the user out.
                    setToken(null);
                }
            } else {
                // If no token exists, ensure the session is fully cleared.
                localStorage.removeItem('token');
                delete axios.defaults.headers.common['x-auth-token'];
                setUser(null);
            }
            setLoading(false); // Stop the loading indicator
        };
        fetchUserData();
    }, [token]);

    // --- Handler Functions ---
    // These functions are passed down as props to child components to allow them to update the app's central state.

    const handleAuthSuccess = (newToken) => setToken(newToken);
    const handleProfileSave = (updatedUser) => setUser(updatedUser);
    const handleLogout = () => setToken(null);
    const handleUserUpdate = (updatedUser) => setUser(updatedUser);
    
    // This function returns the component for the current active page inside the AppLayout.
    const renderPage = () => {
        switch (currentPage) {
            case 'logHistory':
                return <LogHistoryPage />;
            case 'weeklyProgress':
                return <WeeklyProgressPage onUpdateUser={handleUserUpdate} onNavigate={setCurrentPage} />;
            case 'settings':
                return <SettingsPage onLogout={handleLogout} />;
            case 'dashboard':
            default:
                return <DashboardPage user={user} onUpdateUser={handleUserUpdate} />;
        }
    };

    // --- Main Render Logic ---
    // This is the high-level routing that decides which major view to show.

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen text-gray-500">Loading Application...</div>;
    }

    // SCENE 1: If there is no user object, the user is logged out. Show the AuthPage.
    if (!user) {
        return <AuthPage onAuthSuccess={handleAuthSuccess} />;
    }

    // SCENE 2: If the user is logged in but hasn't set their initial weight, show the ProfilePage.
    if (!user.weight) {
        return <ProfilePage onProfileSave={handleProfileSave} />;
    }

    // SCENE 3: If the user is fully authenticated and has a profile, show the main application layout.
    // The AppLayout component acts as the "shell" with the sidebar and header.
    // We pass the currently selected page component as its `children`.
    return (
        <AppLayout 
            user={user} 
            currentPage={currentPage}
            onNavigate={setCurrentPage}
            onLogout={handleLogout}
        >
            {renderPage()}
        </AppLayout>
    );
}

export default App;