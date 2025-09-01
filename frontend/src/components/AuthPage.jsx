import React, { useState } from 'react';
import axios from 'axios';

const AUTH_API_URL = 'http://localhost:5001/api/auth';

export default function AuthPage({ onAuthSuccess }) {
    const [isRegister, setIsRegister] = useState(true);
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const url = isRegister ? `${AUTH_API_URL}/register` : `${AUTH_API_URL}/login`;
        try {
            const res = await axios.post(url, formData);
            onAuthSuccess(res.data.token);
        } catch (err) {
            setError(err.response?.data?.msg || 'An error occurred. Please try again.');
        }
    };

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900">Welcome</h1>
                    <p className="text-gray-500">{isRegister ? "Create an account to get started." : "Sign in to your account."}</p>
                </div>
                <div className="flex border-b">
                    <button onClick={() => setIsRegister(true)} className={`flex-1 py-2 text-sm font-medium ${isRegister ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>Register</button>
                    <button onClick={() => setIsRegister(false)} className={`flex-1 py-2 text-sm font-medium ${!isRegister ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>Login</button>
                </div>
                {error && <p className="p-3 text-sm text-red-700 bg-red-100 rounded-md">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {isRegister && (
                        <div>
                            <label className="text-sm font-medium text-gray-700">Name</label>
                            <input name="name" type="text" required onChange={handleChange} className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                    )}
                    <div>
                        <label className="text-sm font-medium text-gray-700">Email</label>
                        <input name="email" type="email" required onChange={handleChange} className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700">Password</label>
                        <input name="password" type="password" required minLength="6" onChange={handleChange} className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <button type="submit" className="w-full py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700">
                        {isRegister ? 'Create Account' : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    );
}