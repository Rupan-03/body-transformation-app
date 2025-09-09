import React from 'react';
import { LayoutDashboard, Book, BarChart3, Settings, LogOut, X, UserCircle2 } from 'lucide-react'; // <-- Import new icon

export default function Sidebar({ user, currentPage, onNavigate, isOpen, setIsOpen, onLogout }) {
    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'logHistory', label: 'Log History', icon: Book },
        { id: 'weeklyProgress', label: 'Weekly Progress', icon: BarChart3 },
    ];

    const handleNavigate = (page) => {
        onNavigate(page);
        setIsOpen(false); // Close sidebar after navigation on mobile
    };

    return (
        <>
            {/* Mobile Overlay */}
            <div className={`fixed inset-0 z-20 bg-black bg-opacity-50 transition-opacity md:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsOpen(false)} ></div>

            {/* --- REDESIGNED SIDEBAR --- */}
            <aside className={`fixed top-0 left-0 z-30 flex h-full w-64 flex-col bg-white border-r transform transition-transform md:relative md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <h1 className="text-xl font-bold text-blue-600">BodyTrack</h1>
                    <button onClick={() => setIsOpen(false)} className="text-gray-500 md:hidden"><X size={24} /></button>
                </div>
                
                {/* Main Navigation */}
                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map(item => (
                        <button key={item.id} onClick={() => handleNavigate(item.id)} className={`flex items-center w-full gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${currentPage === item.id ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`} >
                            <item.icon size={18} />
                            {item.label}
                        </button>
                    ))}
                </nav>

                {/* Footer with User Profile and Logout */}
                <div className="p-4 border-t">
                    <button onClick={() => handleNavigate('settings')} className="flex items-center w-full gap-3 px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-100">
                        <UserCircle2 size={32} />
                        <div>
                            <div className="font-semibold text-left">{user.name}</div>
                            <div className="text-xs text-left text-gray-500">Account Settings</div>
                        </div>
                    </button>
                    <button onClick={onLogout} className="flex items-center w-full gap-3 px-3 py-2 mt-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-100">
                        <LogOut size={18} />
                        Logout
                    </button>
                </div>
            </aside>
        </>
    );
}