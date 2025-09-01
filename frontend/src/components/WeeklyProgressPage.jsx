import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowLeft, RefreshCw, BarChart3 } from 'lucide-react';

const GOALS_API_URL = 'http://localhost:5001/api/goals';

// A reusable UI component to display a stat with a progress bar.
// This helps visualize performance against a goal.
const ProgressStat = ({ label, value, goal, unit }) => {
    // Calculate the completion percentage, capping it at 100% for visual consistency.
    const percentage = goal > 0 ? Math.min((value / goal) * 100, 100) : 0;
    // Determine if the user has exceeded their goal, which might be good or bad depending on the metric.
    const isOver = value > goal;
    
    return (
        <div className="flex-1 min-w-[200px]">
            <div className="flex justify-between items-baseline">
                <span className="text-sm font-medium text-gray-600">{label}</span>
                <span className={`text-sm font-semibold ${isOver ? 'text-red-600' : 'text-gray-800'}`}>
                    {value} / {goal} {unit}
                </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-1" title={`${Math.round(percentage)}% of goal`}>
                <div 
                    className={`h-2 rounded-full transition-all duration-500 ${isOver ? 'bg-red-500' : 'bg-blue-600'}`} 
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
        </div>
    );
};

// The main component for the Weekly Progress page.
export default function WeeklyProgressPage({ onBack, onUpdateUser }) {
    const [summary, setSummary] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState(''); // Can be 'success' or 'error' for styling

    // This hook fetches the weekly summary data from the backend when the page loads.
    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const res = await axios.get(`${GOALS_API_URL}/weekly-summary`);
                setSummary(res.data);
            } catch (err) {
                setMessage('Could not fetch weekly summary data.');
                setMessageType('error');
            }
            setLoading(false);
        };
        fetchSummary();
    }, []);

    // This function handles the click on the "Update My Goals" button.
    const handleManualUpdate = async () => {
        setMessage('Updating your goals...');
        setMessageType('');
        try {
            const res = await axios.post(`${GOALS_API_URL}/manual-update`);
            onUpdateUser(res.data); // This updates the main user state in App.jsx
            setMessage('Your goals have been successfully updated based on last Sunday\'s weight!');
            setMessageType('success');
        } catch (err) {
            setMessage(err.response?.data?.msg || 'An error occurred during the update.');
            setMessageType('error');
        }
    };

    return (
        <div className="min-h-screen p-4 bg-gray-50 sm:p-6 md:p-8">
            <div className="max-w-4xl mx-auto animate-in fade-in">
                {/* --- Page Header --- */}
                <header className="flex flex-col items-center justify-between gap-4 pb-4 mb-6 border-b sm:flex-row">
                    <div className="flex items-center gap-4">
                        <BarChart3 className="text-blue-600" size={32} />
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Weekly Progress</h1>
                            <p className="text-sm text-gray-500">Review your performance and update your goals.</p>
                        </div>
                    </div>
                    <button onClick={onBack} className="flex items-center self-stretch justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border rounded-md sm:self-auto hover:bg-gray-100 transition-colors">
                        <ArrowLeft size={16} />
                        Back to Dashboard
                    </button>
                </header>

                <main className="space-y-8">
                    {/* --- Manual Update Section --- */}
                    <div className="p-6 bg-white border rounded-lg shadow-sm">
                        <h2 className="text-lg font-semibold text-gray-800">Recalculate Your Goals</h2>
                        <p className="mt-1 text-sm text-gray-600">Click this button to update your Maintenance Calories and Protein Goal using your weight from the most recent Sunday. This automatically happens every Monday, but you can trigger it manually here.</p>
                        <button onClick={handleManualUpdate} className="flex items-center justify-center gap-2 px-4 py-2 mt-4 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-transform duration-200 hover:scale-105 active:scale-100">
                            <RefreshCw size={16} />
                            Update My Goals Now
                        </button>
                        {message && <p className={`mt-4 text-sm p-3 rounded-md animate-in fade-in ${messageType === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{message}</p>}
                    </div>

                    {/* --- Weekly Performance Summary Section --- */}
                    <div className="space-y-6">
                         <h2 className="text-xl font-semibold text-gray-800">Weekly Performance Summary</h2>
                         {loading ? <p className="p-4 text-center text-gray-500">Loading your summary...</p> : 
                          summary.length === 0 ? <p className="p-4 text-center text-gray-500 bg-gray-100 rounded-md">No weekly data to display yet. Keep logging your progress!</p> :
                          summary.map(week => (
                            <div key={week.weekOf} className="p-4 bg-white border rounded-lg shadow-sm sm:p-6 animate-in fade-in slide-up">
                                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                                    <div>
                                        <h3 className="font-bold text-gray-900">
                                            Week of {new Date(week.weekOf).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}
                                        </h3>
                                        <p className="text-sm text-gray-500">End of Week Weight: <span className="font-semibold text-gray-700">{week.endOfWeekWeight} kg</span></p>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-6 pt-4 mt-4 border-t sm:flex-row">
                                    <ProgressStat label="Avg. Daily Calories" value={week.avgCalories} goal={week.calorieGoal} unit="kcal" />
                                    <ProgressStat label="Avg. Daily Protein" value={week.avgProtein} goal={week.proteinGoal} unit="g" />
                                </div>
                            </div>
                          ))
                         }
                    </div>
                </main>
            </div>
        </div>
    );
}