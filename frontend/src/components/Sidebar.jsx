// Part of Sidebar.jsx
import React from 'react';
import { LayoutDashboard, Book, BarChart3, Settings, LogOut, X, UserCircle2, Crown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Sidebar({ user, currentPage, onNavigate, isOpen, setIsOpen, onLogout }) {
    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'logHistory', label: 'Daily Logs', icon: Book },
        { id: 'weeklyProgress', label: 'Progress', icon: BarChart3 },
    ];

    const handleNavigate = (page) => {
        onNavigate(page);
        setIsOpen(false);
    };

    // Animation variants
    const sidebarVariants = {
        closed: { x: "-100%", transition: { duration: 0.3, ease: "easeInOut" } },
        open: { x: 0, transition: { duration: 0.3, ease: "easeInOut" } }
    };

    const itemVariants = {
        closed: { opacity: 0, x: -20 },
        open: (i) => ({
            opacity: 1,
            x: 0,
            transition: { delay: i * 0.1, duration: 0.3 }
        })
    };

    const staggerContainer = {
        open: {
            transition: {
                staggerChildren: 0.1
            }
        },
        closed: {
            transition: {
                staggerChildren: 0.05,
                staggerDirection: -1
            }
        }
    };

    return (
        <>
            {/* Modern Sidebar */}
            <motion.aside
                variants={sidebarVariants}
                initial="closed"
                animate={isOpen ? "open" : "closed"}
                className="fixed top-0 left-0 z-50 flex h-full w-80 flex-col bg-white/90 backdrop-blur-md border-r border-slate-200/60 shadow-xl md:relative md:shadow-none md:backdrop-blur-0"
            >
                {/* Header with Branding */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200/60">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                                <Crown className="w-5 h-5 text-white" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                                ZenithFit
                            </h1>
                            <p className="text-xs text-slate-500">Body Transformation</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setIsOpen(false)} 
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors md:hidden"
                    >
                        <X size={20} className="text-slate-600" />
                    </button>
                </div>
                
                {/* Navigation Items */}
                <motion.nav 
                    variants={staggerContainer}
                    className="flex-1 p-6 space-y-2"
                >
                    {navItems.map((item, index) => {
                        const Icon = item.icon;
                        const isActive = currentPage === item.id;
                        
                        return (
                            <motion.button
                                key={item.id}
                                custom={index}
                                variants={itemVariants}
                                onClick={() => handleNavigate(item.id)}
                                className={`flex items-center w-full gap-4 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                                    isActive 
                                        ? 'bg-blue-50 text-blue-600 shadow-sm border border-blue-100' 
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800 hover:shadow-sm'
                                }`}
                            >
                                <div className={`p-2 rounded-lg ${
                                    isActive 
                                        ? 'bg-blue-100 text-blue-600' 
                                        : 'bg-slate-100 text-slate-600'
                                }`}>
                                    <Icon size={18} />
                                </div>
                                <span className="font-semibold">{item.label}</span>
                                {isActive && (
                                    <motion.div 
                                        layoutId="activeIndicator"
                                        className="w-1.5 h-1.5 bg-blue-500 rounded-full ml-auto"
                                    />
                                )}
                            </motion.button>
                        );
                    })}
                </motion.nav>

                {/* User Profile & Actions */}
                <motion.div 
                    variants={staggerContainer}
                    className="p-6 border-t border-slate-200/60 space-y-4"
                >
                    {/* User Profile */}
                    <motion.button 
                        variants={itemVariants}
                        custom={3}
                        onClick={() => handleNavigate('settings')}
                        className="flex items-center w-full gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group"
                    >
                        <div className="relative">
                            <UserCircle2 size={40} className="text-slate-600 group-hover:text-blue-600 transition-colors" />
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white"></div>
                        </div>
                        <div className="flex-1 text-left">
                            <div className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                                {user.name}
                            </div>
                            <div className="text-xs text-slate-500">View Profile</div>
                        </div>
                    </motion.button>

                    {/* Settings & Logout */}
                    <motion.div 
                        variants={itemVariants}
                        custom={4}
                        className="space-y-2"
                    >
                        <button 
                            onClick={() => handleNavigate('settings')}
                            className="flex items-center w-full gap-3 px-4 py-2 text-sm text-slate-600 rounded-lg hover:bg-slate-50 hover:text-slate-800 transition-colors"
                        >
                            <Settings size={18} />
                            Settings
                        </button>
                        <button 
                            onClick={onLogout}
                            className="flex items-center w-full gap-3 px-4 py-2 text-sm text-slate-600 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors group"
                        >
                            <LogOut size={18} />
                            Sign Out
                        </button>
                    </motion.div>

                    {/* Progress Indicator */}
                    <motion.div
                        variants={itemVariants}
                        custom={5}
                        className="pt-4 border-t border-slate-200/60"
                    >
                        <div className="flex justify-between text-xs text-slate-500 mb-2">
                            <span>Transformation Progress</span>
                            <span>65%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-1.5">
                            <div 
                                className="bg-gradient-to-r from-blue-500 to-blue-600 h-1.5 rounded-full transition-all duration-500"
                                style={{ width: '65%' }}
                            ></div>
                        </div>
                    </motion.div>
                </motion.div>
            </motion.aside>
        </>
    );
}