import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { ReservationCard } from '../components/ReservationCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import {
  ShoppingBag,
  Leaf,
  Coins,
  TrendingDown,
  ArrowRight,
  Clock,
  MapPin,
  CheckCircle2,
} from 'lucide-react';

export const CustomerDashboard: React.FC = () => {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.getCustomerDashboard();
      setData(res);
    } catch (err) {
      console.error('Failed to load customer dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCancel = async (id: number) => {
    if (!confirm('Are you sure you want to cancel this reservation? Stock will be released back to the shop.')) return;
    try {
      await api.cancelReservation(id);
      loadData();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  if (loading) return <LoadingSpinner message="Loading customer dashboard..." />;

  const stats = data?.stats || {};
  const upcomingPickups = data?.upcoming_pickups || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-forest-900 via-forest-800 to-emerald-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="text-xs font-semibold text-emerald-300 uppercase tracking-widest">
            Conscious Customer Dashboard
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold">Your Surplus Rescue Impact</h1>
          <p className="text-xs text-slate-300 max-w-xl">
            Track your financial savings, active pickup vouchers in Guwahati, and greenhouse emissions prevented.
          </p>
        </div>

        <Link
          to="/marketplace"
          className="px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-forest-950 font-bold rounded-2xl text-xs shadow-md transition flex items-center space-x-1.5 shrink-0"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Browse Today's Deals</span>
        </Link>
      </div>

      {/* Personal Impact Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
          <div className="flex items-center space-x-2 text-emerald-600 mb-1">
            <Coins className="w-4 h-4" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Money Saved</span>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-emerald-700">₹{stats.money_saved_inr || 0}</span>
          <span className="text-[11px] text-slate-500 block mt-1">on local surplus goods</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
          <div className="flex items-center space-x-2 text-teal-600 mb-1">
            <ShoppingBag className="w-4 h-4" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Items Rescued</span>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-slate-900">{stats.units_rescued || 0}</span>
          <span className="text-[11px] text-slate-500 block mt-1">portions saved from waste</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
          <div className="flex items-center space-x-2 text-green-600 mb-1">
            <Leaf className="w-4 h-4" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Waste Avoided</span>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-forest-900">{stats.waste_avoided_kg || 0} kg</span>
          <span className="text-[11px] text-slate-500 block mt-1">food weight diverted</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
          <div className="flex items-center space-x-2 text-teal-600 mb-1">
            <TrendingDown className="w-4 h-4" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">CO₂e Prevented</span>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-teal-700">{stats.co2_avoided_kg || 0} kg</span>
          <span className="text-[11px] text-slate-500 block mt-1">methane & carbon reduction</span>
        </div>
      </div>

      {/* ACTIVE UPCOMING PICKUPS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Active Upcoming Pickups ({upcomingPickups.length})</h2>
            <p className="text-xs text-slate-500">Show your voucher code at the store counter in Guwahati to collect.</p>
          </div>
          <Link
            to="/customer/reservations"
            className="text-xs font-bold text-emerald-700 hover:underline flex items-center"
          >
            <span>All Reservations</span> <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        {upcomingPickups.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-3xl border border-slate-200/80">
            <p className="text-xs text-slate-500">No active reservations right now. Hungry for surplus deals?</p>
            <Link
              to="/marketplace"
              className="mt-3 inline-block px-4 py-2 bg-forest-800 text-white rounded-xl text-xs font-bold"
            >
              Explore Deals in Guwahati
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {upcomingPickups.map((res: any) => (
              <ReservationCard
                key={res.id}
                reservation={res}
                onCancel={handleCancel}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
