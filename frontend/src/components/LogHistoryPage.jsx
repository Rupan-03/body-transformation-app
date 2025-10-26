import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DailyLog from './DailyLog';

const EXERCISE_LIST_URL = `${import.meta.env.VITE_API_URL}/logs/exerciselist`;

export default function LogHistoryPage() {
    // --- NEW: State to hold the user's exercise "memory" ---
    const [exerciseLists, setExerciseLists] = useState({ strengthNames: [], cardioNames: [] });
    const [listLoading, setListLoading] = useState(true);

    useEffect(() => {
        const fetchExerciseLists = async () => {
            try {
                const res = await axios.get(EXERCISE_LIST_URL);
                setExerciseLists(res.data);
            } catch (err) {
                console.error("Could not fetch exercise lists", err);
                // Not a critical error, the component will just not show suggestions
            }
            setListLoading(false);
        };
        fetchExerciseLists();
    }, []);

    return (
        <div className="animate-in fade-in">
            <h1 className="text-2xl font-bold text-gray-900">Daily Log History</h1>
            <p className="mt-1 text-sm text-gray-500">Add a new entry for today or review your past progress.</p>
            <div className="mt-6">
                {/* --- Pass the lists down to the DailyLog component --- */}
                {!listLoading && (
                    <DailyLog 
                        strengthNameSuggestions={exerciseLists.strengthNames} 
                        cardioNameSuggestions={exerciseLists.cardioNames} 
                    />
                )}
            </div>
        </div>
    );
}