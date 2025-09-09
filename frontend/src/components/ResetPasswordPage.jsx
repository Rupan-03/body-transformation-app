import React, { useState } from 'react';
import axios from 'axios';
import { Eye, EyeOff } from 'lucide-react'; 

const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;

export default function ResetPasswordPage({ token, onPasswordReset }) {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
     const [showPassword, setShowPassword] = useState(false); // New state for password visibility
    const [showConfirmPassword, setShowConfirmPassword] = useState(false); // New state for confirm password visibility

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (password !== confirmPassword) return setError("Passwords do not match.");
        if (password.length < 6) return setError("Password must be at least 6 characters long.");

        setLoading(true);
        try {
            await axios.put(`${API_BASE_URL}/auth/resetpassword/${token}`, { password });
            setMessage('Password reset successful! You will be redirected to the login page shortly.');
            setTimeout(onPasswordReset, 3000); // Redirect to login after 3 seconds
        } catch (err) {
            setError(err.response?.data?.data || 'An error occurred. The link may be invalid or expired.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen px-4 bg-gray-50">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg animate-in fade-in slide-up">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900">Choose a New Password</h1>
                </div>
                {message && <p className="p-3 text-sm text-green-800 bg-green-100 rounded-md">{message}</p>}
                {error && <p className="p-3 text-sm text-red-700 bg-red-100 rounded-md">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* --- NEW PASSWORD FIELD WITH EYE BUTTON --- */}
                    <div>
                        <label className="text-sm font-medium text-gray-700">New Password</label>
                        <div className="relative mt-1">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>
                    {/* --- CONFIRM NEW PASSWORD FIELD WITH EYE BUTTON --- */}
                    <div>
                        <label className="text-sm font-medium text-gray-700">Confirm New Password</label>
                        <div className="relative mt-1">
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
                            >
                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>
                    {/* --- END PASSWORD FIELDS --- */}
                    <button type="submit" disabled={loading} className="w-full py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-300">
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>
            </div>
        </div>
    );
}