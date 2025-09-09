import React from 'react';
import DailyLog from './DailyLog';

export default function LogHistoryPage() {
    return (
        <div className="animate-in fade-in">
            <h1 className="text-2xl font-bold text-gray-900">Daily Log History</h1>
            <p className="mt-1 text-sm text-gray-500">Add a new entry for today or review your past progress.</p>
            <div className="mt-6">
                <DailyLog />
            </div>
        </div>
    );
}