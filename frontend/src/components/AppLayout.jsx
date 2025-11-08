import React, { useState, Suspense } from 'react';
import { Menu, X, User, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import { PageShellSkeleton } from './AppSkeletons'; // ⮕ skeleton fallback for page content

export default function AppLayout({ user, currentPage, onNavigate, onLogout, children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const pageTitles = {
    dashboard: 'Dashboard',
    logHistory: 'Daily Log History',
    weeklyProgress: 'Weekly Progress',
    settings: 'Settings',
  };

  // Animation variants
  const sidebarOverlayVariants = {
    closed: { opacity: 0, pointerEvents: 'none' },
    open: { opacity: 1, pointerEvents: 'auto' },
  };

  const contentVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar
          user={user}
          currentPage={currentPage}
          onNavigate={onNavigate}
          isOpen={true}
          setIsOpen={setIsSidebarOpen}
          onLogout={onLogout}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial="closed"
              animate="open"
              exit="closed"
              variants={sidebarOverlayVariants}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
            <div className="fixed left-0 top-0 h-full z-50 lg:hidden">
              <Sidebar
                user={user}
                currentPage={currentPage}
                onNavigate={(page) => {
                  onNavigate(page);
                  setIsSidebarOpen(false);
                }}
                isOpen={isSidebarOpen}
                setIsOpen={setIsSidebarOpen}
                onLogout={onLogout}
              />
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Modern Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-30">
          <div className="flex items-center justify-between p-4 lg:px-6">
            {/* Left: Mobile menu and title */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors lg:hidden"
                aria-label="Open navigation"
              >
                <Menu size={20} className="text-slate-600" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-2 h-8 bg-blue-500 rounded-full" />
                <div>
                  <h1 className="text-xl font-bold text-slate-800">{pageTitles[currentPage]}</h1>
                  <p className="text-sm text-slate-500 hidden sm:block">
                    Track your transformation journey
                  </p>
                </div>
              </div>
            </div>

            {/* Right: User info and actions */}
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-slate-800">{user.name}</p>
                <p className="text-xs text-slate-500">Transformation Tracker</p>
              </div>

              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors" aria-label="Profile">
                  <User size={18} className="text-slate-600" />
                </button>
                <button
                  onClick={onLogout}
                  className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
                  aria-label="Log out"
                >
                  <LogOut size={18} className="text-slate-600 group-hover:text-red-600" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Animated Page Content with Suspense skeleton */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <Suspense fallback={<PageShellSkeleton />}>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPage}
                variants={contentVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="h-full"
              >
                <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">{children}</div>
              </motion.div>
            </AnimatePresence>
          </Suspense>
        </main>
      </div>
    </div>
  );
}
