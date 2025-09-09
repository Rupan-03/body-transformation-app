import React, { useState } from 'react';
import axios from 'axios';
import { AlertTriangle, Settings } from 'lucide-react';

const PROFILE_API_URL = `${import.meta.env.VITE_API_URL}/profile`;

export default function SettingsPage({ onLogout }) {
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [confirmText, setConfirmText] = useState("");
    const [deleteError, setDeleteError] = useState("");

    const handleDeleteAccountClick = () => {
        setIsDeleteModalOpen(true);
        setDeleteError("");
    };

    const handleConfirmDelete = async () => {
        if (confirmText !== "DELETE") {
            setDeleteError("Confirmation text does not match. Please type DELETE.");
            return;
        }
        
        try {
            await axios.delete(PROFILE_API_URL);
            alert('Your account has been successfully deleted.');
            onLogout(); // Log the user out after successful deletion
        } catch (err) {
            setDeleteError('Failed to delete your account. Please try again later.');
        }
    };

    return (
        <>
            <div className="space-y-8 animate-in fade-in">
                <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
                
                {/* --- DANGER ZONE SECTION --- */}
                <div className="p-6 bg-white border border-red-200 rounded-lg shadow-sm">
                    <h2 className="text-lg font-semibold text-red-800">Danger Zone</h2>
                    <div className="flex flex-col items-start gap-4 mt-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h3 className="font-medium text-gray-800">Delete Your Account</h3>
                            <p className="mt-1 text-sm text-gray-600">Permanently remove your account and all associated data. This action is irreversible.</p>
                        </div>
                        <button onClick={handleDeleteAccountClick} className="flex items-center justify-center gap-2 px-4 py-2 font-semibold text-white bg-red-600 rounded-md hover:bg-red-700 transition-transform duration-200 hover:scale-105 active:scale-100">
                            <AlertTriangle size={16} />
                            Delete Account
                        </button>
                    </div>
                </div>
            </div>

            {/* --- The Delete Confirmation Modal --- */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 animate-in fade-in">
                    <div className="w-full max-w-md p-6 mx-4 bg-white rounded-lg shadow-xl animate-in fade-in slide-up">
                        <h2 className="text-xl font-bold text-gray-900">Are you absolutely sure?</h2>
                        <p className="mt-2 text-sm text-gray-600">This action is permanent and will delete all your data.</p>
                        <p className="mt-4 text-sm font-medium text-gray-700">Please type <strong className="text-red-600">DELETE</strong> to confirm.</p>
                        <input type="text" value={confirmText} onChange={(e) => setConfirmText(e.target.value)} className="w-full px-3 py-2 mt-2 border border-gray-300 rounded-md" />
                        {deleteError && <p className="mt-2 text-sm text-red-600">{deleteError}</p>}
                        <div className="flex justify-end gap-4 mt-6">
                            <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">Cancel</button>
                            <button onClick={handleConfirmDelete} disabled={confirmText !== 'DELETE'} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:bg-red-300">I understand, delete my account</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}