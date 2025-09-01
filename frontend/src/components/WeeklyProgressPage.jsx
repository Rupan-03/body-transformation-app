import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowLeft, RefreshCw, BarChart3 } from 'lucide-react';

const GOALS_API_URL = 'http://localhost:5001/api/goals';

export default function WeeklyProgressPage({ onBack, onUpdateUser }) {
    const [summary, setSummary] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState(''); // 'success' or 'error'

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const res = await axios.get(`${GOALS_API_URL}/weekly-summary`);
                setSummary(res.data);
            } catch (err) {
                setMessage('Could not fetch weekly summary.');
                setMessageType('error');
            }
            setLoading(false);
        };
        fetchSummary();
    }, []);

    const handleManualUpdate = async () => {
        setMessage('Updating goals...');
        setMessageType('');
        try {
            const res = await axios.post(`${GOALS_API_URL}/manual-update`);
            onUpdateUser(res.data); // Update the main user state in App.jsx
            setMessage('Your goals have been successfully updated based on last Sunday\'s weight!');
            setMessageType('success');
        } catch (err) {
            setMessage(err.response?.data?.msg || 'An error occurred during the update.');
            setMessageType('error');
        }
    };

    return (
        <div className="min-h-screen p-4 bg-gray-50 sm:p-6 md:p-8">
            <div className="max-w-4xl mx-auto">
                <header className="flex items-center justify-between pb-4 mb-6 border-b">
                    <div className="flex items-center gap-4">
                        <BarChart3 className="text-blue-600" size={32} />
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Weekly Progress</h1>
                            <p className="text-sm text-gray-500">Review your progress and update your goals.</p>
                        </div>
                    </div>
                    <button onClick={onBack} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border rounded-md hover:bg-gray-100">
                        <ArrowLeft size={16} />
                        Back to Dashboard
                    </button>
                </header>

                <main className="space-y-8">
                    <div className="p-6 bg-white border rounded-lg shadow-sm">
                        <h2 className="text-lg font-semibold text-gray-800">Recalculate Your Goals</h2>
                        <p className="mt-1 text-sm text-gray-600">Click the button below to update your Maintenance Calories and Protein Goal based on your weight from the most recent Sunday. This is useful if you forgot to log on Sunday and want to update your goals now.</p>
                        <button onClick={handleManualUpdate} className="flex items-center justify-center gap-2 px-4 py-2 mt-4 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700">
                            <RefreshCw size={16} />
                            Update My Goals Now
                        </button>
                        {message && <p className={`mt-4 text-sm p-3 rounded-md ${messageType === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{message}</p>}
                    </div>

                    <div className="p-6 bg-white border rounded-lg shadow-sm">
                         <h2 className="text-lg font-semibold text-gray-800">Sunday Weight History</h2>
                         <div className="mt-2 overflow-x-auto border rounded-lg">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-xs font-medium text-left text-gray-500 uppercase">Week Of</th>
                                        <th className="px-4 py-2 text-xs font-medium text-left text-gray-500 uppercase">Weight Recorded</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {loading ? (<tr><td colSpan="2" className="p-4 text-center text-gray-500">Loading history...</td></tr>) :
                                    summary.map(log => (
                                        <tr key={log.date}>
                                            <td className="px-4 py-2 text-sm text-gray-800">{new Date(log.date).toLocaleDateString()}</td>
                                            <td className="px-4 py-2 text-sm font-bold text-gray-800">{log.weight} kg</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}