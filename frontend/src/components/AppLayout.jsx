import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import Sidebar from './Sidebar'; // We will create this next

export default function AppLayout({ user, currentPage, onNavigate, onLogout, children }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const pageTitles = {
        dashboard: "Dashboard",
        logHistory: "Daily Log History",
        weeklyProgress: "Weekly Progress"
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <Sidebar 
                user={user} 
                currentPage={currentPage} 
                onNavigate={onNavigate}
                isOpen={isSidebarOpen}
                setIsOpen={setIsSidebarOpen}
                onLogout={onLogout}
            />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="flex items-center justify-between p-4 bg-white border-b md:justify-end">
                    {/* Burger Menu for Mobile */}
                    <button onClick={() => setIsSidebarOpen(true)} className="text-gray-500 md:hidden">
                        <Menu size={24} />
                    </button>
                    <h1 className="text-lg font-semibold text-gray-800 md:hidden">{pageTitles[currentPage]}</h1>
                    <div className="text-sm text-gray-600">
                        Signed in as <span className="font-semibold">{user.name}</span>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
                    <div className="p-4 sm:p-6 md:p-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}