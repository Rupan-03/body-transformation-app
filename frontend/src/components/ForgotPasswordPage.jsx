import React, { useState } from 'react';
import axios from 'axios';
import { ArrowLeft } from 'lucide-react';

const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;

export default function ForgotPasswordPage({ onBackToLogin }) {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        try {
            await axios.post(`${API_BASE_URL}/auth/forgotpassword`, { email });
            setMessage('Success! If an account with that email exists, a password reset link has been sent.');
        } catch (err) {
            setMessage('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen px-4 bg-gray-50">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg animate-in fade-in slide-up">
                <div className="text-center">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Reset Password</h1>
                    <p className="mt-2 text-gray-500">Enter your email and we'll send you a link to get back into your account.</p>
                </div>
                {message && <p className="p-3 text-sm text-center text-blue-800 bg-blue-100 rounded-md">{message}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-gray-700">Email Address</label>
                        <input name="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md" />
                    </div>
                    <button type="submit" disabled={loading} className="w-full py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-300">
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </form>
                <div className="text-center">
                    <button onClick={onBackToLogin} className="flex items-center justify-center w-full gap-2 text-sm font-medium text-gray-600 hover:text-blue-600">
                        <ArrowLeft size={16} /> Back to Login
                    </button>
                </div>
            </div>
        </div>
    );
}