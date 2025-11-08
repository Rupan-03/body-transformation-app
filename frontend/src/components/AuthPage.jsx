// src/components/AuthPage.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, User, Mail, Lock, Crown, Activity, TrendingUp } from 'lucide-react';

const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AuthPage({ onAuthSuccess, onNavigate }) {
  const [isRegister, setIsRegister] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [shake, setShake] = useState(false); // <-- no remounting, just animate

  const extractErrMsg = (err) => {
    const d = err?.response?.data;
    return (
      d?.msg ||
      d?.message ||
      d?.error ||
      (Array.isArray(d?.errors) && d.errors[0]?.msg) ||
      err?.message ||
      'Invalid email or password.'
    );
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      const next = { ...errors };
      delete next[e.target.name];
      setErrors(next);
    }
  };

  const validateForm = () => {
    const next = {};
    if (isRegister && !formData.name.trim()) next.name = 'Name is required.';
    if (!formData.email.trim()) next.email = 'Email is required.';
    else if (!emailRegex.test(formData.email)) next.email = 'Please enter a valid email address.';
    if (!formData.password) next.password = 'Password is required.';
    else if (formData.password.length < 6) next.password = 'Password must be at least 6 characters long.';
    return next;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      setIsLoading(false);
      return;
    }

    const payload = isRegister
      ? { name: formData.name, email: formData.email, password: formData.password }
      : { email: formData.email, password: formData.password };

    const url = isRegister ? `${API_BASE_URL}/auth/register` : `${API_BASE_URL}/auth/login`;

    try {
      const res = await axios.post(url, payload);
      onAuthSuccess(res.data.token);
    } catch (err) {
      const msg = extractErrMsg(err);
      setError(msg);
      if (!isRegister) setErrors((prev) => ({ ...prev, password: msg }));

      // Trigger shake without unmounting the form
      setShake(true);
      setTimeout(() => setShake(false), 400);
    } finally {
      setIsLoading(false);
    }
  };

  /* --------- animations ---------- */
  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
  const panelVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { when: 'beforeChildren', staggerChildren: 0.08 } },
    exit: { opacity: 0, x: -20 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left Side */}
        <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="hidden lg:block space-y-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">ZenithFit</h1>
              <p className="text-slate-600 text-sm">Body Transformation Tracker</p>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-4xl font-bold text-slate-800 leading-tight">
              Transform Your Body,<br />
              <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">Track Your Progress</span>
            </h2>
            <p className="text-lg text-slate-600">
              Join thousands of users achieving their fitness goals with our comprehensive body transformation tracking platform.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-white/50 backdrop-blur-sm rounded-2xl border border-slate-200/60">
              <div className="p-3 bg-blue-100 rounded-xl text-blue-600"><Activity size={24} /></div>
              <div>
                <h3 className="font-semibold text-slate-800">Daily Progress Tracking</h3>
                <p className="text-slate-600 text-sm">Log workouts, nutrition, and measurements</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-white/50 backdrop-blur-sm rounded-2xl border border-slate-200/60">
              <div className="p-3 bg-emerald-100 rounded-xl text-emerald-600"><TrendingUp size={24} /></div>
              <div>
                <h3 className="font-semibold text-slate-800">Visual Progress Analytics</h3>
                <p className="text-slate-600 text-sm">See your transformation with detailed charts</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Side */}
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="w-full max-w-md mx-auto">
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden">
            {/* Mobile header */}
            <div className="lg:hidden p-6 border-b border-slate-200/60 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-center">
              <div className="flex items-center justify-center gap-3 mb-2">
                <Crown size={32} />
                <h1 className="text-2xl font-bold">ZenithFit</h1>
              </div>
              <p className="text-blue-100">Body Transformation Tracker</p>
            </div>

            <div className="p-8">
              {/* Tabs */}
              <div className="flex bg-slate-100 rounded-xl p-1 mb-8">
                <button
                  onClick={() => setIsRegister(true)}
                  className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-300 ${isRegister ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}
                >
                  Create Account
                </button>
                <button
                  onClick={() => setIsRegister(false)}
                  className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-300 ${!isRegister ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}
                >
                  Sign In
                </button>
              </div>

              <AnimatePresence mode="wait">
                <motion.div key={isRegister ? 'register' : 'login'} variants={panelVariants} initial="hidden" animate="visible" exit="exit">
                  <h2 className="text-2xl font-bold text-slate-800 mb-2 text-center">
                    {isRegister ? 'Start Your Journey' : 'Welcome Back'}
                  </h2>
                  <p className="text-slate-600 text-center mb-8">
                    {isRegister ? 'Create your account to begin tracking' : 'Sign in to continue your transformation'}
                  </p>

                  {/* Error banner */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        className="flex items-center gap-3 p-4 mb-6 bg-red-50 border border-red-200 rounded-xl text-red-700"
                      >
                        <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Lock size={14} />
                        </div>
                        <span className="font-medium text-sm">{error}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Form (always mounted; shake animation only) */}
                  <motion.form
                    onSubmit={handleSubmit}
                    className="space-y-6"
                    noValidate
                    animate={shake ? { x: [0, -6, 6, -6, 6, 0] } : {}}
                    transition={{ duration: 0.35 }}
                  >
                    <AnimatePresence initial={false}>
                      {isRegister && (
                        <motion.div
                          key="name-field"
                          variants={itemVariants}
                          initial="hidden"
                          animate="visible"
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input
                              name="name"
                              type="text"
                              value={formData.name}
                              onChange={handleChange}
                              placeholder="Full Name"
                              className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white ${
                                errors.name ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300'
                              }`}
                            />
                          </div>
                          {errors.name && <p className="mt-2 text-sm text-red-600">{errors.name}</p>}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <motion.div variants={itemVariants}>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="Email Address"
                          className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white ${
                            errors.email ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300'
                          }`}
                        />
                      </div>
                      {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email}</p>}
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="Password"
                          className={`w-full pl-12 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white ${
                            errors.password ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                      {errors.password && <p className="mt-2 text-sm text-red-600">{errors.password}</p>}
                    </motion.div>

                    {!isRegister && (
                      <motion.div variants={itemVariants} className="text-right">
                        <button
                          type="button"
                          onClick={() => onNavigate('forgotPassword')}
                          className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                        >
                          Forgot your password?
                        </button>
                      </motion.div>
                    )}

                    <motion.button
                      variants={itemVariants}
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-4 font-semibold text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          {isRegister ? 'Creating Account...' : 'Signing In...'}
                        </>
                      ) : (
                        <>
                          <Lock size={18} />
                          {isRegister ? 'Create Account' : 'Sign In'}
                        </>
                      )}
                    </motion.button>
                  </motion.form>

                  <motion.div variants={itemVariants} className="mt-6 text-center">
                    <p className="text-slate-600">
                      {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
                      <button onClick={() => setIsRegister((v) => !v)} className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                        {isRegister ? 'Sign In' : 'Create Account'}
                      </button>
                    </p>
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
