import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Donation } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import {
  HeartHandshake,
  ShieldCheck,
  Building,
  CheckCircle2,
  Clock,
  MapPin,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';

export const NgoDashboard: React.FC = () => {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.getNgoDashboard();
      setData(res);
    } catch (err) {
      console.error('Failed to load NGO dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) return <LoadingSpinner message="Loading NGO partner dashboard..." />;

  const profile = data?.profile || {};
  const stats = data?.stats || {};
  const availableDonations = data?.available_donations || [];
  const myRequests = data?.my_requests || [];

  const isVerified = profile.verification_status === 'verified';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-950 via-amber-900 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center space-x-2 text-xs font-semibold">
            {isVerified ? (
              <span className="inline-flex items-center bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3 py-1 rounded-full">
                <ShieldCheck className="w-4 h-4 mr-1 text-emerald-400" /> Admin Verified Food Relief Partner
              </span>
            ) : (
              <span className="inline-flex items-center bg-amber-500/20 text-amber-300 border border-amber-500/40 px-3 py-1 rounded-full">
                <Clock className="w-4 h-4 mr-1" /> Verification Pending
              </span>
            )}
            <span className="text-slate-300 text-xs font-mono">Reg #{profile.registration_number || 'KAM-METRO-2019-4821'}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold">{profile.org_name || 'Assam Food Relief Trust'}</h1>
          <p className="text-xs text-slate-300">
            {profile.cause_area || 'Food Relief & Community Kitchens'} • Contact: {profile.contact_person || 'Anjali Baruah'}
          </p>
        </div>

        <Link
          to="/donations"
          className="px-5 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-2xl text-xs shadow-md transition flex items-center space-x-1.5 shrink-0"
        >
          <HeartHandshake className="w-4 h-4" />
          <span>Browse Available Surplus</span>
        </Link>
      </div>

      {/* Verification Notice if not verified */}
      {!isVerified && (
        <div className="p-4 bg-amber-50 text-amber-900 border border-amber-200 rounded-2xl text-xs flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong>Verification In Progress:</strong> Your non-profit documents are being verified by the Guwahati administrator. Once verified, you will be authorized to claim surplus food distributions.
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
          <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider block">Meals Rescued</span>
          <span className="text-2xl sm:text-3xl font-black text-amber-700 mt-1 block">
            {stats.meals_rescued || 0}
          </span>
          <span className="text-[11px] text-slate-500 block mt-1">distributed to beneficiaries</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
          <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider block">Waste Avoided</span>
          <span className="text-2xl sm:text-3xl font-black text-emerald-700 mt-1 block">
            {stats.waste_avoided_kg || 0} kg
          </span>
          <span className="text-[11px] text-slate-500 block mt-1">food mass diverted from landfill</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
          <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider block">Total Claims</span>
          <span className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 block">
            {stats.total_requests || 0}
          </span>
          <span className="text-[11px] text-slate-500 block mt-1">donation requests processed</span>
        </div>
      </div>

      {/* MY DONATION REQUESTS TRACKER */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900">My Donation Requests & Dispatches</h2>
          <p className="text-xs text-slate-500">Track pickup coordination with Guwahati donor shops.</p>
        </div>

        {myRequests.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">No active requests currently.</p>
        ) : (
          <div className="divide-y divide-slate-100 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[10px] uppercase font-bold text-slate-400">
                <tr>
                  <th className="pb-3">Title</th>
                  <th className="pb-3">Donor Merchant</th>
                  <th className="pb-3">Quantity</th>
                  <th className="pb-3">Pickup Location</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {myRequests.map((req: any) => (
                  <tr key={req.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 font-bold text-slate-900">{req.title}</td>
                    <td className="py-3.5 text-slate-700">{req.business_name || req.seller_name}</td>
                    <td className="py-3.5 font-semibold text-emerald-800">{req.quantity} {req.unit}</td>
                    <td className="py-3.5 text-slate-500 text-[11px] truncate max-w-xs">{req.pickup_location}</td>
                    <td className="py-3.5"><StatusBadge status={req.status} size="sm" /></td>
                    <td className="py-3.5 text-slate-400 text-[11px]">{req.created_at ? new Date(req.created_at).toLocaleDateString() : 'Today'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CURRENTLY AVAILABLE DONATIONS QUICK VIEW */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Surplus Available for Immediate Claim</h2>
          <Link to="/donations" className="text-xs font-bold text-amber-700 hover:underline flex items-center">
            <span>View All</span> <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableDonations.map((don: any) => (
            <div key={don.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-amber-700 uppercase">{don.category}</span>
                <StatusBadge status={don.status} size="sm" />
              </div>
              <h4 className="font-bold text-sm text-slate-900">{don.title}</h4>
              <p className="text-xs text-slate-500 line-clamp-2">{don.description}</p>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <strong className="text-slate-800">{don.quantity} {don.unit}</strong>
                <Link to="/donations" className="font-bold text-amber-700 hover:underline">
                  Claim Now →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
