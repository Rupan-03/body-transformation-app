import React, { useState } from 'react';
import axios from 'axios';
import { Eye, EyeOff } from 'lucide-react'; // Import Eye icons

const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AuthPage({ onAuthSuccess, onNavigate }) {
    const [isRegister, setIsRegister] = useState(true);
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false); // New state for password visibility

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (errors[e.target.name]) {
            const newErrors = { ...errors };
            delete newErrors[e.target.name];
            setErrors(newErrors);
        }
    };
    
    const validateForm = () => {
        const newErrors = {};
        if (isRegister && !formData.name.trim()) {
            newErrors.name = "Name is required.";
        }
        if (!formData.email.trim()) {
            newErrors.email = "Email is required.";
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = "Please enter a valid email address.";
        }
        if (!formData.password) {
            newErrors.password = "Password is required.";
        } else if (formData.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters long.";
        }
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const formErrors = validateForm();
        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return;
        }

        const payload = isRegister ? { name: formData.name, email: formData.email, password: formData.password } : { email: formData.email, password: formData.password };
        const url = isRegister ? `${API_BASE_URL}/auth/register` : `${API_BASE_URL}/auth/login`;
        try {
            const res = await axios.post(url, payload);
            onAuthSuccess(res.data.token);
        } catch (err) {
            setError(err.response?.data?.msg || 'An error occurred. Please try again.');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen px-4 bg-gray-50">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg animate-in fade-in slide-up">
                <div className="text-center">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Welcome</h1>
                    <p className="mt-2 text-gray-500">{isRegister ? "Create an account to get started." : "Sign in to your account."}</p>
                </div>
                <div className="flex border-b">
                    <button onClick={() => setIsRegister(true)} className={`flex-1 py-2 text-sm font-medium transition-colors duration-300 ${isRegister ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>Register</button>
                    <button onClick={() => setIsRegister(false)} className={`flex-1 py-2 text-sm font-medium transition-colors duration-300 ${!isRegister ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>Login</button>
                </div>
                {error && <p className="p-3 text-sm text-red-700 bg-red-100 rounded-md">{error}</p>}
                
                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                    {isRegister && (
                        <>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Name</label>
                                <input name="name" type="text" value={formData.name} onChange={handleChange} className={`w-full px-3 py-2 mt-1 border rounded-md shadow-sm transition-shadow ${errors.name ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`} />
                                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                            </div>
                        </>
                    )}
                    <div>
                        <label className="text-sm font-medium text-gray-700">Email</label>
                        <input name="email" type="email" value={formData.email} onChange={handleChange} className={`w-full px-3 py-2 mt-1 border rounded-md shadow-sm transition-shadow ${errors.email ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`} />
                        {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                    </div>
                    {/* --- PASSWORD FIELD WITH EYE BUTTON --- */}
                    <div>
                        <label className="text-sm font-medium text-gray-700">Password</label>
                        <div className="relative mt-1">
                            <input
                                name="password"
                                type={showPassword ? 'text' : 'password'} // Toggle type
                                value={formData.password}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border rounded-md shadow-sm transition-shadow ${errors.password ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
                    </div>
                    {/* --- END PASSWORD FIELD --- */}
                    
                    {!isRegister && (
                         <div className="text-right">
                            <button type="button" onClick={() => onNavigate('forgotPassword')} className="text-sm font-medium text-blue-600 hover:underline">
                                Forgot Password?
                            </button>
                        </div>
                    )}
                    
                    <button type="submit" className="w-full py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-transform duration-200 hover:scale-105 active:scale-100">
                        {isRegister ? 'Create Account' : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    );
}