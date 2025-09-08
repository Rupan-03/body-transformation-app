import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PlusCircle, Calendar, ChevronDown, Trash2 } from 'lucide-react';

const LOGS_API_URL = `${import.meta.env.VITE_API_URL}/logs`;

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
    const [activeWeekKey, setActiveWeekKey] = useState(null);
    
    // --- NEW STATE for the custom log deletion modal ---
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [logToDelete, setLogToDelete] = useState(null); // Will store the ID of the log to be deleted

    const weeklyLogs = groupLogsByWeek(logs);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const res = await axios.get(LOGS_API_URL);
                setLogs(res.data);
                const grouped = groupLogsByWeek(res.data);
                if (grouped.length > 0) {
                    setActiveWeekKey(grouped[0][0]);
                }
            } catch (err) { setError('Could not fetch log history.'); }
            setLoading(false);
        };
        fetchLogs();
    }, []);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    
    const handleSubmit = async (e) => {
        e.preventDefault();
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

    const handleWeekToggle = (weekKey) => {
        setActiveWeekKey(activeWeekKey === weekKey ? null : weekKey);
    };

    // --- UPDATED HANDLER: This now opens the modal instead of showing a browser confirm ---
    const handleDeleteLogClick = (logId) => {
        setLogToDelete(logId); // Store the ID of the log we intend to delete
        setIsDeleteModalOpen(true); // Open the modal
    };

    // --- NEW HANDLER: This function runs when the user confirms deletion inside the modal ---
    const handleConfirmDelete = async () => {
        if (!logToDelete) return; // Safety check

        try {
            await axios.delete(`${LOGS_API_URL}/${logToDelete}`);
            // Instantly update the UI by removing the log from the local state
            setLogs(logs.filter(log => log._id !== logToDelete));
        } catch (err) {
            setError('Failed to delete log entry. Please try again.');
        } finally {
            // Reset and close the modal regardless of success or failure
            setIsDeleteModalOpen(false);
            setLogToDelete(null);
        }
    };

    return (
        <> {/* Use a Fragment to allow the modal to be a sibling */}
            <div className="p-4 sm:p-6 bg-white border rounded-lg shadow-sm">
                <h2 className="text-lg font-semibold text-gray-800">Daily Progress Log</h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 mt-4 sm:grid-cols-2 lg:grid-cols-4">
                    <input name="weight" type="number" step="0.1" placeholder="Weight (kg)" value={formData.weight} onChange={handleChange} required className="w-full px-3 py-2 border rounded-md" />
                    <input name="calorieIntake" type="number" placeholder="Calories (kcal)" value={formData.calorieIntake} onChange={handleChange} required className="w-full px-3 py-2 border rounded-md" />
                    <input name="proteinIntake" type="number" placeholder="Protein (g)" value={formData.proteinIntake} onChange={handleChange} required className="w-full px-3 py-2 border rounded-md" />
                    <button type="submit" className="flex items-center justify-center w-full gap-2 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-transform duration-200 hover:scale-105 active:scale-100 sm:col-span-2 lg:col-span-1">
                        <PlusCircle size={18} /> Add Log
                    </button>
                </form>
                {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

                <div className="mt-8">
                    <h3 className="font-semibold text-gray-700">History</h3>
                    {loading ? <p className="p-4 text-center text-gray-500">Loading history...</p> :
                     weeklyLogs.length === 0 ? <p className="p-4 mt-2 text-center text-gray-500 bg-gray-50 rounded-md">No logs yet.</p> :
                     <div className="mt-4 space-y-2">
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
                                    <div className={`transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[1000px]' : 'max-h-0'}`}> {/* Increased max-h for more items */}
                                        
                                        {/* --- THIS IS THE RESPONSIVE FIX --- */}
                                        <ul className="p-2 space-y-1 sm:p-4">
                                            {weekLogs.sort((a,b) => new Date(b.date) - new Date(a.date)).map(log => (
                                                <li key={log._id} className="p-3 transition-colors rounded-md hover:bg-white">
                                                    <div className="flex items-center justify-between">
                                                        {/* --- On ALL screens, show the day and the delete button --- */}
                                                        <div className="font-semibold text-gray-800">{new Date(log.date).toLocaleDateString(undefined, { weekday: 'long' })}</div>
                                                        <button onClick={() => handleDeleteLogClick(log._id)} title="Delete this log" className="p-1 text-gray-400 rounded-full hover:bg-red-100 hover:text-red-600">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                    
                                                    {/* --- On MOBILE (small screens), show labeled data stacked vertically --- */}
                                                    <div className="grid grid-cols-3 gap-4 mt-2 sm:hidden">
                                                        <div>
                                                            <div className="text-xs text-gray-500">Weight</div>
                                                            <div className="text-sm font-medium text-gray-800">{log.weight} kg</div>
                                                        </div>
                                                        <div>
                                                            <div className="text-xs text-gray-500">Calories</div>
                                                            <div className="text-sm font-medium text-gray-800">{log.calorieIntake} kcal</div>
                                                        </div>
                                                        <div>
                                                            <div className="text-xs text-gray-500">Protein</div>
                                                            <div className="text-sm font-medium text-gray-800">{log.proteinIntake} g</div>
                                                        </div>
                                                    </div>

                                                    {/* --- On DESKTOP (sm screens and up), hide the mobile view and show the inline view --- */}
                                                    <div className="items-center hidden sm:grid sm:grid-cols-4 sm:gap-2">
                                                        <div className="font-semibold text-gray-800 sm:col-span-1">{/* Placeholder for alignment */}</div>
                                                        <div className="text-sm text-gray-600"><span className="font-medium text-gray-800">{log.weight}</span> kg</div>
                                                        <div className="text-sm text-gray-600"><span className="font-medium text-gray-800">{log.calorieIntake}</span> kcal</div>
                                                        <div className="text-sm text-gray-600"><span className="font-medium text-gray-800">{log.proteinIntake}</span> g</div>
                                                    </div>
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

            {/* --- NEW: The Custom Confirmation Modal for deleting a single log --- */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 animate-in fade-in">
                    <div className="w-full max-w-sm p-6 mx-4 bg-white rounded-lg shadow-xl animate-in fade-in slide-up">
                        <h2 className="text-lg font-bold text-gray-900">Delete Log Entry?</h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Are you sure you want to permanently delete this log entry? This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-4 mt-6">
                            <button 
                                onClick={() => setIsDeleteModalOpen(false)} 
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleConfirmDelete}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
                            >
                                Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}