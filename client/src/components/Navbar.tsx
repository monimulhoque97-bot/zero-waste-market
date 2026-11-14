import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ShoppingBag,
  Leaf,
  Store,
  HeartHandshake,
  User,
  LogOut,
  Menu,
  X,
  MapPin,
  Sparkles,
  BarChart3,
  PlusCircle,
  Clock,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, role, logout, quickLoginDemo } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Top Demo Bar */}
      <div className="bg-gradient-to-r from-forest-900 via-forest-800 to-emerald-900 text-white px-4 py-1.5 text-xs flex flex-wrap items-center justify-between gap-2 shadow-inner">
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono text-[11px] font-semibold">
            <MapPin className="w-3 h-3 mr-1" /> Guwahati, Assam
          </span>
          <span className="hidden sm:inline text-slate-300">
            AI-Powered Surplus Food & Retail Rescue Platform
          </span>
        </div>

        {/* 1-Click Role Switcher */}
        <div className="flex items-center space-x-1.5 text-[11px]">
          <span className="text-slate-300 hidden md:inline">1-Click Demo Switcher:</span>
          <button
            onClick={() => quickLoginDemo('seller')}
            className={`px-2 py-0.5 rounded font-medium transition ${
              role === 'seller' ? 'bg-emerald-500 text-white shadow' : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            👨‍🍳 Seller (Bakery)
          </button>
          <button
            onClick={() => quickLoginDemo('customer')}
            className={`px-2 py-0.5 rounded font-medium transition ${
              role === 'customer' ? 'bg-emerald-500 text-white shadow' : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            🛍️ Customer
          </button>
          <button
            onClick={() => quickLoginDemo('ngo')}
            className={`px-2 py-0.5 rounded font-medium transition ${
              role === 'ngo' ? 'bg-emerald-500 text-white shadow' : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            🤝 NGO Relief
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-forest-800 text-emerald-400 flex items-center justify-center shadow-md group-hover:scale-105 transition transform">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-xl tracking-tight text-slate-900 group-hover:text-forest-800 transition">
                  ZeroWaste<span className="text-emerald-600">Market</span>
                </span>
              </div>
              <p className="text-[10px] text-slate-700 tracking-wider uppercase font-semibold">Guwahati Surplus Hub</p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link
              to="/marketplace"
              className="px-3 py-2 text-sm font-medium text-slate-700 hover:text-emerald-700 hover:bg-emerald-50/50 rounded-lg transition"
            >
              Browse Surplus
            </Link>
            <Link
              to="/donations"
              className="px-3 py-2 text-sm font-medium text-slate-700 hover:text-emerald-700 hover:bg-emerald-50/50 rounded-lg transition"
            >
              Donations for NGOs
            </Link>
            <Link
              to="/impact"
              className="px-3 py-2 text-sm font-medium text-slate-700 hover:text-emerald-700 hover:bg-emerald-50/50 rounded-lg transition"
            >
              Impact Analytics
            </Link>
            <Link
              to="/how-it-works"
              className="px-3 py-2 text-sm font-medium text-slate-700 hover:text-emerald-700 hover:bg-emerald-50/50 rounded-lg transition"
            >
              How It Works
            </Link>

            {/* Role-Specific Shortcuts */}
            {role === 'seller' && (
              <>
                <Link
                  to="/seller/add-product"
                  className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition ml-2"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1 text-emerald-600" /> AI Add Listing
                </Link>
                <Link
                  to="/seller/dashboard"
                  className="px-3 py-2 text-sm font-medium text-slate-700 hover:text-emerald-700 rounded-lg transition"
                >
                  Seller Dashboard
                </Link>
              </>
            )}

            {role === 'customer' && (
              <Link
                to="/customer/reservations"
                className="px-3 py-2 text-sm font-medium text-slate-700 hover:text-emerald-700 rounded-lg transition"
              >
                My Reservations
              </Link>
            )}

            {role === 'ngo' && (
              <Link
                to="/ngo/dashboard"
                className="px-3 py-2 text-sm font-medium text-slate-700 hover:text-emerald-700 rounded-lg transition"
              >
                NGO Dashboard
              </Link>
            )}
          </nav>

          {/* User Profile / Auth Actions */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated && user ? (
              <div className="flex items-center space-x-3">
                <Link
                  to={
                    role === 'seller'
                      ? '/seller/dashboard'
                      : role === 'ngo'
                      ? '/ngo/dashboard'
                      : '/customer/dashboard'
                  }
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-emerald-50 border border-slate-200 transition"
                >
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                    {user.name.charAt(0)}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-slate-800 leading-none">{user.name}</p>
                    <p className="text-[10px] text-emerald-600 capitalize font-medium">{role}</p>
                  </div>
                </Link>

                <button
                  onClick={handleLogout}
                  title="Log out"
                  className="p-2 text-slate-700 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-emerald-700 rounded-lg transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-forest-800 hover:bg-forest-900 rounded-lg shadow-sm hover:shadow transition"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-6 space-y-2">
          <Link
            to="/marketplace"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-emerald-50"
          >
            Browse Surplus
          </Link>
          <Link
            to="/donations"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-emerald-50"
          >
            Donations for NGOs
          </Link>
          <Link
            to="/impact"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-emerald-50"
          >
            Impact Analytics
          </Link>
          <Link
            to="/how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-emerald-50"
          >
            How It Works
          </Link>

          {role === 'seller' && (
            <>
              <Link
                to="/seller/add-product"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-emerald-700 bg-emerald-50"
              >
                ✨ Add Product with AI
              </Link>
              <Link
                to="/seller/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-emerald-50"
              >
                Seller Dashboard
              </Link>
            </>
          )}

          {role === 'customer' && (
            <Link
              to="/customer/reservations"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-emerald-50"
            >
              My Reservations
            </Link>
          )}

          {role === 'ngo' && (
            <Link
              to="/ngo/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-emerald-50"
            >
              NGO Dashboard
            </Link>
          )}

          <div className="pt-4 border-t border-slate-200">
            {isAuthenticated && user ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-800">{user.name}</p>
                  <p className="text-xs text-emerald-600 capitalize">{role}</p>
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="px-3 py-1.5 text-xs text-rose-600 border border-rose-200 rounded-lg"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center px-4 py-2 bg-forest-800 text-white rounded-lg text-sm font-medium"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
