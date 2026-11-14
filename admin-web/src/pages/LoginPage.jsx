import React, { useState } from 'react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { Shield, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';

export default function LoginPage({ onBackToWebsite }) {
  const { login } = useAdminAuth();
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(loginId, password);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed. Please check credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090A0D] flex items-center justify-center p-4 selection:bg-zinc-700 selection:text-white">
      <div className="w-full max-w-md bg-[#121318] rounded-3xl shadow-2xl p-8 border border-zinc-700/80">
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl mx-auto overflow-hidden border border-zinc-600/80 shadow-2xl shadow-black/60 mb-4 bg-black flex items-center justify-center">
            <img
              src="/assets/campus_f1_square.png"
              alt="Campus Drivers Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Admin Portal</h2>
          <p className="text-sm text-zinc-400 mt-1">Campus Drivers – Chandigarh University UP</p>
          <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-800/80 text-zinc-300 text-xs font-semibold border border-zinc-700">
            <span>Official Lucknow Campus Administration</span>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-800/50 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
              Admin Credential / Staff ID
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 text-zinc-500" size={18} />
              <input
                type="text"
                required
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                placeholder="Enter Admin ID"
                autoComplete="off"
                className="w-full pl-11 pr-4 py-3 bg-zinc-900/90 border border-zinc-700 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:bg-zinc-900 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
              Secure Admin Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 text-zinc-500" size={18} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                autoComplete="new-password"
                className="w-full pl-11 pr-4 py-3 bg-zinc-900/90 border border-zinc-700 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:bg-zinc-900 transition"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 px-4 bg-white hover:bg-zinc-200 active:scale-[0.99] text-black font-extrabold rounded-xl text-sm shadow-xl shadow-white/10 flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              <span>{submitting ? 'Authenticating...' : 'Sign In to Admin Dashboard'}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </form>

        {onBackToWebsite && (
          <div className="mt-5 text-center">
            <button
              type="button"
              onClick={onBackToWebsite}
              className="text-xs font-semibold text-zinc-400 hover:text-white transition"
            >
              ← Back to Campus Drivers Public Website & Download APK
            </button>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-zinc-800 text-center">
          <p className="text-xs text-zinc-500">
            Authorized university security personnel only. All access attempts are recorded in system audit logs.
          </p>
        </div>
      </div>
    </div>
  );
}
