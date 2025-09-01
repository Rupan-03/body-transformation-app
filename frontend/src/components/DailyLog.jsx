import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PlusCircle, Calendar, ChevronDown } from 'lucide-react';

const LOGS_API_URL = '${import.meta.env.VITE_API_URL}/logs';

// --- Helper function to get the start of the week (Sunday) for a given date ---
const getStartOfWeek = (date) => {
    const d = new Date(date);
    d.setDate(d.getDate() - d.getDay());
    d.setHours(0, 0, 0, 0);
    return d;
};

// --- Helper function to group logs by week ---
const groupLogsByWeek = (logs) => {
    const grouped = logs.reduce((acc, log) => {
        const weekStartDate = getStartOfWeek(log.date);
        const weekKey = weekStartDate.toISOString();

        if (!acc[weekKey]) acc[weekKey] = [];
        acc[weekKey].push(log);
        return acc;
    }, {});
    return Object.entries(grouped).sort((a, b) => new Date(b[0]) - new Date(a[0]));
};

// --- Helper function to create user-friendly week titles ---
const formatWeekHeader = (weekKey, index) => {
    const today = new Date();
    const currentWeekStart = getStartOfWeek(today).toISOString();
    
    if (weekKey === currentWeekStart) return "This Week";
    if (index === 1) return "Last Week"; // Assuming the array is sorted by most recent
    
    return `Week of ${new Date(weekKey).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}`;
};

export default function DailyLog() {
    const [logs, setLogs] = useState([]);
    const [formData, setFormData] = useState({ weight: '', calorieIntake: '', proteinIntake: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    
    // --- NEW STATE: To track which week's accordion is open ---
    const [activeWeekKey, setActiveWeekKey] = useState(null);

    const weeklyLogs = groupLogsByWeek(logs);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const res = await axios.get(LOGS_API_URL);
                setLogs(res.data);
                // After fetching, set the current week to be open by default
                const grouped = groupLogsByWeek(res.data);
                if (grouped.length > 0) {
                    setActiveWeekKey(grouped[0][0]); // Set the first week (most recent) as active
                }
            } catch (err) { setError('Could not fetch log history.'); }
            setLoading(false);
        };
        fetchLogs();
    }, []);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleSubmit = async (e) => { e.preventDefault();
        setError('');
        try {
            await axios.post(LOGS_API_URL, formData);
            const res = await axios.get(LOGS_API_URL);
            setLogs(res.data);
            setFormData({ weight: '', calorieIntake: '', proteinIntake: '' });
        } catch (err) {
            setError(err.response?.data?.msg || 'Could not save log entry.');
        }
     };

    // --- NEW HANDLER: To open/close the accordion for a week ---
    const handleWeekToggle = (weekKey) => {
        // If the clicked week is already open, close it. Otherwise, open it.
        setActiveWeekKey(activeWeekKey === weekKey ? null : weekKey);
    };

    return (
        <div className="p-4 sm:p-6 bg-white border rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800">Daily Progress Log</h2>
            {/* The form for adding a log remains the same */}
            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 mt-4 sm:grid-cols-4">
                <input name="weight" type="number" placeholder="Weight (kg)" value={formData.weight} onChange={handleChange} required className="w-full px-3 py-2 border rounded-md" />
                <input name="calorieIntake" type="number" placeholder="Calories (kcal)" value={formData.calorieIntake} onChange={handleChange} required className="w-full px-3 py-2 border rounded-md" />
                <input name="proteinIntake" type="number" placeholder="Protein (g)" value={formData.proteinIntake} onChange={handleChange} required className="w-full px-3 py-2 border rounded-md" />
                <button type="submit" className="flex items-center justify-center gap-2 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 sm:col-span-1">
                    <PlusCircle size={18} /> Add Log
                </button>
            </form>
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

            <div className="mt-8">
                <h3 className="font-semibold text-gray-700">History</h3>
                {loading ? <p className="p-4 text-center text-gray-500">Loading history...</p> :
                 weeklyLogs.length === 0 ? <p className="p-4 mt-2 text-center text-gray-500 bg-gray-50 rounded-md">No logs yet.</p> :
                 <div className="mt-4 space-y-2">
                    {/* --- NEW ACCORDION RENDERING LOGIC --- */}
                    {weeklyLogs.map(([weekKey, weekLogs], index) => {
                        const isOpen = activeWeekKey === weekKey;
                        return (
                            <div key={weekKey} className="overflow-hidden border rounded-lg bg-gray-50 animate-in fade-in">
                                <button onClick={() => handleWeekToggle(weekKey)} className="flex items-center justify-between w-full p-4 text-left">
                                    <div className="flex items-center gap-3">
                                        <Calendar size={18} className="text-gray-500" />
                                        <span className="font-semibold text-gray-800">{formatWeekHeader(weekKey, index)}</span>
                                    </div>
                                    <ChevronDown size={20} className={`text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                                </button>
                                {/* The content panel with smooth transition */}
                                <div className={`transition-all duration-500 ease-in-out ${isOpen ? 'max-h-screen' : 'max-h-0'}`}>
                                    <ul className="p-2 space-y-1 sm:p-4">
                                        {weekLogs.sort((a,b) => new Date(b.date) - new Date(a.date)).map(log => (
                                            <li key={log._id} className="grid items-center grid-cols-2 gap-4 p-3 rounded-md sm:grid-cols-4 hover:bg-white transition-colors">
                                                <div className="font-semibold text-gray-800">{new Date(log.date).toLocaleDateString(undefined, { weekday: 'long' })}</div>
                                                <div className="text-sm text-right text-gray-600 sm:text-left"><span className="font-medium text-gray-800">{log.weight}</span> kg</div>
                                                <div className="text-sm text-left text-gray-600 sm:text-left"><span className="font-medium text-gray-800">{log.calorieIntake}</span> kcal</div>
                                                <div className="text-sm text-right text-gray-600 sm:text-left"><span className="font-medium text-gray-800">{log.proteinIntake}</span> g</div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )
                    })}
                 </div>
                }
            </div>
        </div>
    );
}