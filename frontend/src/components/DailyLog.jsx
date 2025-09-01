import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PlusCircle } from 'lucide-react';

const LOGS_API_URL = 'http://localhost:5001/api/logs';

export default function DailyLog() {
    const [logs, setLogs] = useState([]);
    const [formData, setFormData] = useState({ weight: '', calorieIntake: '', proteinIntake: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const res = await axios.get(LOGS_API_URL);
                setLogs(res.data);
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

    return (
        <div className="p-6 bg-white border rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800">Daily Progress Log</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 mt-4 sm:grid-cols-4">
                <input name="weight" type="number" placeholder="Weight (kg)" value={formData.weight} onChange={handleChange} required className="w-full px-3 py-2 border rounded-md" />
                <input name="calorieIntake" type="number" placeholder="Calories (kcal)" value={formData.calorieIntake} onChange={handleChange} required className="w-full px-3 py-2 border rounded-md" />
                <input name="proteinIntake" type="number" placeholder="Protein (g)" value={formData.proteinIntake} onChange={handleChange} required className="w-full px-3 py-2 border rounded-md" />
                <button type="submit" className="flex items-center justify-center gap-2 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 sm:col-span-1">
                    <PlusCircle size={18} /> Add Log
                </button>
            </form>
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

            <div className="mt-6">
                <h3 className="font-semibold text-gray-700">History</h3>
                <div className="mt-2 overflow-x-auto border rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-xs font-medium text-left text-gray-500 uppercase">Date</th>
                                <th className="px-4 py-2 text-xs font-medium text-left text-gray-500 uppercase">Weight</th>
                                <th className="px-4 py-2 text-xs font-medium text-left text-gray-500 uppercase">Calories</th>
                                <th className="px-4 py-2 text-xs font-medium text-left text-gray-500 uppercase">Protein</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (<tr><td colSpan="4" className="p-4 text-center text-gray-500">Loading...</td></tr>) :
                            logs.map(log => (
                                <tr key={log._id}>
                                    <td className="px-4 py-2 text-sm text-gray-800">{new Date(log.date).toLocaleDateString()}</td>
                                    <td className="px-4 py-2 text-sm text-gray-800">{log.weight} kg</td>
                                    <td className="px-4 py-2 text-sm text-gray-800">{log.calorieIntake} kcal</td>
                                    <td className="px-4 py-2 text-sm text-gray-800">{log.proteinIntake} g</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}