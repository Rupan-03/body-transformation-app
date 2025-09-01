import React from 'react';
import { LogOut, BarChart3, TrendingUp } from 'lucide-react';
import DailyLog from './DailyLog';

export default function DashboardPage({ user, handleLogout, onNavigate }) {
    const targetCalories = user.maintenanceCalories ? user.maintenanceCalories - 500 : 'N/A';
    
    return (
        <div className="min-h-screen p-4 bg-gray-50 sm:p-6 md:p-8">
            <div className="max-w-5xl mx-auto animate-in fade-in">
                <header className="flex flex-col items-center justify-between gap-4 pb-4 mb-8 border-b sm:flex-row">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Welcome, {user.name}!</h1>
                        <p className="text-sm text-gray-500">Your personal dashboard is ready.</p>
                    </div>
                    <div className="flex items-center self-stretch gap-2 sm:self-auto">
                        <button onClick={() => onNavigate('weeklyProgress')} className="flex items-center justify-center flex-1 gap-2 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-100 border border-transparent rounded-md hover:bg-blue-200 transition-colors">
                            <BarChart3 size={16} />
                            Weekly Progress
                        </button>
                        <button onClick={handleLogout} className="flex items-center justify-center flex-1 gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border rounded-md hover:bg-gray-100 transition-colors">
                            <LogOut size={16} />
                            Logout
                        </button>
                    </div>
                </header>

                <main className="space-y-8">
                    <section>
                         <h2 className="text-xl font-semibold text-gray-800">Your Stats & Goals</h2>
                         <div className="grid grid-cols-1 gap-4 mt-4 sm:grid-cols-2 lg:grid-cols-4">
                            <StatCard title="Current Weight" value={`${user.weight} kg`} icon={<TrendingUp />} />
                            <StatCard title="Maintenance" value={`${user.maintenanceCalories} kcal`} />
                            <StatCard title="Fat Loss Target" value={`${targetCalories} kcal`} />
                            <StatCard title="Protein Goal" value={`${user.proteinGoal} g`} />
                         </div>
                    </section>
                    
                    <section>
                        <DailyLog />
                    </section>
                </main>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon }) {
    return (
        <div className="p-4 bg-white border rounded-lg shadow-sm transition-transform duration-300 hover:scale-105 hover:shadow-md animate-in fade-in slide-up">
            <h3 className="text-sm font-medium text-gray-500">{title}</h3>
            <p className="mt-1 text-3xl font-bold text-gray-900">{value}</p>
        </div>
    );
}