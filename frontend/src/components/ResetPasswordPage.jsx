// src/components/ResetPasswordPage.jsx
import React, { useMemo, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, CheckCircle2, AlertCircle, Circle, Lock } from "lucide-react";
import LoadingSpinner from "./LoadingSpinner";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;

export default function ResetPasswordPage({ token, onPasswordReset }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // { type: 'success' | 'error', message: string }
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Requirements (keeps API-compatible rule: min length 6 to submit)
  const reqLen = password.length >= 6;              // enforced
  const reqUpper = /[A-Z]/.test(password);
  const reqLower = /[a-z]/.test(password);
  const reqNum = /\d/.test(password);
  const reqSpecial = /[^A-Za-z0-9]/.test(password);

  const score = [reqLen, reqUpper, reqLower, reqNum, reqSpecial].filter(Boolean).length;
  const strength = useMemo(() => {
    if (score <= 2) return { label: "Weak", color: "bg-red-500" };
    if (score === 3) return { label: "Okay", color: "bg-amber-500" };
    return { label: "Strong", color: "bg-green-500" };
  }, [score]);

  const passwordsMatch = confirm.length > 0 && password === confirm;
  const canSubmit = reqLen && passwordsMatch && !loading && token;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);

    if (!reqLen) {
      setStatus({ type: "error", message: "Password must be at least 6 characters long." });
      return;
    }
    if (!passwordsMatch) {
      setStatus({ type: "error", message: "Passwords do not match." });
      return;
    }

    setLoading(true);
    try {
      await axios.put(`${API_BASE_URL}/auth/resetpassword/${token}`, { password });
      setStatus({
        type: "success",
        message: "Password reset successful! Redirecting to sign in…",
      });
      // Slight pause so user can read the banner
      setTimeout(() => onPasswordReset?.(), 2000);
    } catch (err) {
      setStatus({
        type: "error",
        message:
          err.response?.data?.data ||
          err.response?.data?.msg ||
          "The reset link may be invalid or expired. Please request a new one.",
      });
    } finally {
      setLoading(false);
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
      <motion.div variants={container} initial="hidden" animate="visible" className="w-full max-w-md">
        <motion.div
          variants={item}
          className="relative bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden"
        >
          {/* Saving overlay */}
          {loading && (
            <div className="absolute inset-0 z-10 rounded-2xl bg-white/70 backdrop-blur-[1px] flex items-center justify-center">
              <LoadingSpinner label="Resetting password…" />
            </div>
          )}

          {/* Header */}
          <div className="p-6 border-b border-slate-200/60">
            <h1 className="text-xl font-bold text-slate-800">Choose a New Password</h1>
            <p className="text-slate-600 mt-1">
              Make it strong and unique. You’ll use this to sign in next time.
            </p>
          </div>

          {/* Form */}
          <div className="p-6">
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {/* New password */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">New password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 border rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all border-slate-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {/* Strength bar */}
                <div className="mt-3">
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${strength.color}`}
                      style={{ width: `${(score / 5) * 100}%`, transition: "width 300ms ease" }}
                    />
                  </div>
                  <div className="mt-1 text-xs text-slate-600">
                    Strength: <span className="font-medium">{strength.label}</span>
                  </div>

                  {/* Requirements checklist */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-3 text-xs text-slate-600">
                    <Req ok={reqLen} label="At least 6 characters" />
                    <Req ok={reqUpper} label="One uppercase letter" />
                    <Req ok={reqLower} label="One lowercase letter" />
                    <Req ok={reqNum} label="One number" />
                    <Req ok={reqSpecial} label="One special character" />
                  </div>
                </div>
              </div>

              {/* Confirm password */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Confirm password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full pl-10 pr-10 py-3 border rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      confirm && !passwordsMatch ? "border-red-500 ring-1 ring-red-500" : "border-slate-300"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {confirm && !passwordsMatch && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 text-sm text-red-600">
                    Passwords do not match.
                  </motion.p>
                )}
              </div>

              <div className="flex items-center justify-end">
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="px-5 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Reset Password
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
                  {status.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                  <span className="text-sm font-medium">{status.message}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

/* ------------------------------ Helper ----------------------------------- */
function Req({ ok, label }) {
  return (
    <div className="flex items-center gap-2">
      {ok ? <CheckCircle2 size={14} className="text-emerald-600" /> : <Circle size={14} className="text-slate-400" />}
      <span className={ok ? "text-slate-700" : "text-slate-500"}>{label}</span>
    </div>
  );
}
