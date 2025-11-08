// src/components/ForgotPasswordPage.jsx
import React, { useMemo, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import LoadingSpinner from "./LoadingSpinner";

const FORGOT_URL = `${import.meta.env.VITE_API_URL}/auth/forgotpassword`;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordPage({ onBackToLogin }) {
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null); // { type: "success" | "error", message: string }
  const [cooldown, setCooldown] = useState(0);

  const valid = emailRegex.test(email);
  const showEmailError = touched && !valid;
  const cooldownText = useMemo(() => (cooldown > 0 ? ` (${cooldown}s)` : ""), [cooldown]);

  const startCooldown = (secs = 30) => {
    setCooldown(secs);
    const iv = setInterval(() => {
      setCooldown((s) => {
        if (s <= 1) {
          clearInterval(iv);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched(true);
    setStatus(null);
    if (!valid) return;

    setSubmitting(true);
    try {
      await axios.post(FORGOT_URL, { email });
      setStatus({
        type: "success",
        message:
          "If an account exists for that email, we’ve sent a password reset link.",
      });
      startCooldown(30);
    } catch (err) {
      setStatus({
        type: "error",
        message:
          err.response?.data?.msg ||
          err.response?.data?.message ||
          "We couldn’t send the reset email right now. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Animations
  const container = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };
  const item = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center p-4">
      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md"
      >
        {/* Card */}
        <motion.div
          variants={item}
          className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-200/60">
            <h1 className="text-xl font-bold text-slate-800">Reset Password</h1>
            <p className="text-slate-600 mt-1">
              Enter your email and we’ll send you a link to get back into your account.
            </p>
          </div>

          {/* Form */}
          <div className="p-6">
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email address
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => setTouched(true)}
                    placeholder="you@example.com"
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      showEmailError
                        ? "border-red-500 ring-1 ring-red-500"
                        : "border-slate-300"
                    }`}
                  />
                </div>
                {showEmailError && (
                  <p className="mt-2 text-sm text-red-600">
                    Please enter a valid email.
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={onBackToLogin}
                  className="text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors flex items-center gap-2"
                >
                  <ArrowLeft size={16} />
                  Back to Sign In
                </button>

                <button
                  type="submit"
                  disabled={submitting || !valid || cooldown > 0}
                  className="px-5 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {submitting
                    ? "Sending…"
                    : `Send Reset Link${cooldownText}`}
                </button>
              </div>
            </form>

            {/* Status banner */}
            <AnimatePresence>
              {status && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className={`mt-4 flex items-center gap-3 p-3 rounded-xl border ${
                    status.type === "success"
                      ? "bg-green-50 text-green-700 border-green-200"
                      : "bg-red-50 text-red-700 border-red-200"
                  }`}
                >
                  {status.type === "success" ? (
                    <CheckCircle2 size={18} />
                  ) : (
                    <AlertCircle size={18} />
                  )}
                  <span className="text-sm font-medium">{status.message}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Subtle inline loader (only if submitting takes long) */}
            {submitting && (
              <LoadingSpinner inline size="sm" className="mt-3" label="Processing…" />
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
