import React from 'react';
import { LogOut, BarChart3 } from 'lucide-react'; // <-- Import new icon
import DailyLog from './DailyLog';

// We now receive a new prop: 'onNavigate'
export default function DashboardPage({ user, handleLogout, onNavigate }) {
    const targetCalories = user.maintenanceCalories ? user.maintenanceCalories - 500 : 'N/A';
    
    return (
        <div className="min-h-screen p-4 bg-gray-50 sm:p-6 md:p-8">
            <div className="max-w-4xl mx-auto">
                <header className="flex items-center justify-between pb-4 mb-6 border-b">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Welcome, {user.name}!</h1>
                        <p className="text-sm text-gray-500">Your personal dashboard is ready.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* --- NEW BUTTON --- */}
                        <button onClick={() => onNavigate('weeklyProgress')} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-100 border border-blue-200 rounded-md hover:bg-blue-200">
                            <BarChart3 size={16} />
                            Weekly Progress
                        </button>
                        <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border rounded-md hover:bg-gray-100">
                            <LogOut size={16} />
                            Logout
                        </button>
                    </div>
                </header>

                <main className="space-y-8">
                    {/* Stats & Goals Section (no changes here) */}
                    <section>
                         <h2 className="text-lg font-semibold text-gray-800">Your Stats & Goals</h2>
                         <div className="grid grid-cols-1 gap-4 mt-4 sm:grid-cols-2 md:grid-cols-4">
                            <StatCard title="Current Weight" value={`${user.weight} kg`} />
                            <StatCard title="Maintenance" value={`${user.maintenanceCalories} kcal`} />
                            <StatCard title="Fat Loss" value={`${targetCalories} kcal`} />
                            <StatCard title="Protein Goal" value={`${user.proteinGoal} g`} />
                         </div>
                    </section>
                    
                    {/* Daily Logging Section (no changes here) */}
                    <section>
                        <DailyLog />
                    </section>
                </main>
            </div>
        </div>
    );
}

// A reusable StatCard component for the dashboard
function StatCard({ title, value }) {
    return (
        <div className="p-4 bg-white border rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">{title}</h3>
            <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
        </div>
    );
}