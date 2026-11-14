import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Leaf, Lock, Mail, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';

export const Login: React.FC = () => {
  const { login, quickLoginDemo } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await api.login({ email, password });
      login(res.token, res.user);

      // Redirect according to role
      if (res.user.role === 'seller') navigate('/seller/dashboard');
      else if (res.user.role === 'ngo') navigate('/ngo/dashboard');
      else navigate('/customer/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid login credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoClick = async (role: 'seller' | 'customer' | 'ngo') => {
    setError(null);
    await quickLoginDemo(role);
    if (role === 'seller') navigate('/seller/dashboard');
    else if (role === 'ngo') navigate('/ngo/dashboard');
    else navigate('/customer/dashboard');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xl">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-forest-800 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto shadow-md">
            <Leaf className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Sign in to ZeroWaste</h2>
          <p className="text-xs text-slate-500">
            Access your Guwahati surplus deals, inventory, or NGO relief claims.
          </p>
        </div>

        {/* 1-Click Demo Accounts Strip */}
        <div className="bg-emerald-50/80 p-4 rounded-2xl border border-emerald-200 space-y-2.5">
          <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider block text-center">
            ⚡ Hackathon Evaluator: 1-Click Demo Logins
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleDemoClick('seller')}
              className="py-2 px-1 bg-white hover:bg-emerald-100 text-slate-800 text-xs font-bold rounded-xl border border-emerald-300 shadow-xs transition text-center"
            >
              👨‍🍳 Seller
            </button>
            <button
              type="button"
              onClick={() => handleDemoClick('customer')}
              className="py-2 px-1 bg-white hover:bg-emerald-100 text-slate-800 text-xs font-bold rounded-xl border border-emerald-300 shadow-xs transition text-center"
            >
              🛍️ Customer
            </button>
            <button
              type="button"
              onClick={() => handleDemoClick('ngo')}
              className="py-2 px-1 bg-white hover:bg-emerald-100 text-slate-800 text-xs font-bold rounded-xl border border-emerald-300 shadow-xs transition text-center"
            >
              🤝 NGO
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 text-rose-800 border border-rose-200 rounded-xl text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@zerowaste.in"
                className="w-full text-xs pl-10 pr-3.5 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs pl-10 pr-3.5 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-forest-800 hover:bg-forest-900 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-md transition flex items-center justify-center space-x-2"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          Don’t have an account yet?{' '}
          <Link to="/register" className="font-bold text-emerald-700 hover:underline">
            Register as Customer, Seller, or NGO
          </Link>
        </div>
      </div>
    </div>
  );
};
