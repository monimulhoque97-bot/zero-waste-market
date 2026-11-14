import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Donation } from '../types';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import {
  HeartHandshake,
  ShieldCheck,
  MapPin,
  Clock,
  Calendar,
  AlertCircle,
  CheckCircle2,
  X,
  Building,
} from 'lucide-react';

export const Donations: React.FC = () => {
  const { user, isAuthenticated, role, quickLoginDemo } = useAuth();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>('available');
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [requestNotes, setRequestNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchDonations = async () => {
    setLoading(true);
    try {
      const data = await api.getDonations({
        status: statusFilter !== 'all' ? statusFilter : undefined,
      });
      setDonations(data);
    } catch (err) {
      console.error('Failed to load donations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, [statusFilter]);

  const handleRequestDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDonation) return;

    if (!isAuthenticated) {
      setActionMessage({ type: 'error', text: 'Please sign in with a verified NGO partner account.' });
      return;
    }

    if (role !== 'ngo') {
      setActionMessage({ type: 'error', text: `Your current role is '${role}'. Only verified NGOs can claim donations.` });
      return;
    }

    setSubmitting(true);
    setActionMessage(null);

    try {
      await api.requestDonation(selectedDonation.id, requestNotes);
      setActionMessage({
        type: 'success',
        text: 'Donation request registered! The donor merchant has been notified for pickup coordination.',
      });
      setSelectedDonation(null);
      setRequestNotes('');
      fetchDonations();
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Failed to submit donation request.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Banner */}
      <div className="bg-gradient-to-r from-amber-900 via-orange-950 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center space-x-2 bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full text-xs font-semibold">
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>Guwahati Hunger Relief & NGO Surplus Channel</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            Zero Hunger. Zero Waste.
          </h1>

          <p className="text-sm text-slate-300 leading-relaxed">
            Local bakeries and restaurants list edible, non-expired surplus supplies for registered Guwahati NGOs and community kitchens.
          </p>
        </div>

        {/* Quick NGO Login Helper */}
        {role !== 'ngo' && (
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 text-center shrink-0 w-full sm:w-auto">
            <span className="text-xs text-amber-300 font-semibold block mb-1">Evaluating as NGO?</span>
            <button
              onClick={() => quickLoginDemo('ngo')}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl shadow transition"
            >
              1-Click Demo Login as NGO
            </button>
          </div>
        )}
      </div>

      {/* Action Notification Alert */}
      {actionMessage && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-start space-x-2 ${
            actionMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {actionMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
          )}
          <span className="flex-1 font-medium">{actionMessage.text}</span>
          <button onClick={() => setActionMessage(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
        {['available', 'requested', 'completed', 'all'].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize transition ${
              statusFilter === s
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {s === 'all' ? 'All Donations' : s}
          </button>
        ))}
      </div>

      {/* Donation Listings Grid */}
      {loading ? (
        <LoadingSpinner message="Loading verified surplus donations in Guwahati..." />
      ) : donations.length === 0 ? (
        <EmptyState
          title="No Donations Found"
          description="There are currently no surplus donations matching this status in Guwahati."
          actionText="View Available Donations"
          onAction={() => setStatusFilter('available')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {donations.map((don) => (
            <div
              key={don.id}
              className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
                    {don.category}
                  </span>
                  <StatusBadge status={don.status} />
                </div>

                <h3 className="font-bold text-lg text-slate-900 leading-snug">{don.title}</h3>

                <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                  {don.description || 'Nutritious surplus ready for collection by verified relief volunteers.'}
                </p>

                {/* Info strip */}
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Total Quantity:</span>
                    <strong className="text-slate-900">{don.quantity} {don.unit}</strong>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Donor Business:</span>
                    <span className="font-semibold text-slate-800">{don.business_name || don.seller_name}</span>
                  </div>

                  <div className="flex items-center text-[11px] text-slate-500">
                    <MapPin className="w-3.5 h-3.5 mr-1 text-emerald-600 shrink-0" />
                    <span className="truncate">{don.pickup_location}</span>
                  </div>

                  <div className="flex items-center text-[11px] text-amber-700 font-medium">
                    <Calendar className="w-3.5 h-3.5 mr-1 shrink-0" />
                    <span>Best Before: {don.expiry_date}</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div>
                {don.status === 'available' ? (
                  <button
                    onClick={() => setSelectedDonation(don)}
                    className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center justify-center space-x-1.5"
                  >
                    <HeartHandshake className="w-4 h-4" />
                    <span>Claim for NGO Relief</span>
                  </button>
                ) : (
                  <div className="p-2.5 bg-slate-50 rounded-xl text-center text-xs text-slate-500 font-medium">
                    {don.status === 'requested'
                      ? `Requested by ${don.org_name || 'Verified NGO'}`
                      : 'Completed & Handed Over'}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Claim Donation Modal */}
      {selectedDonation && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setSelectedDonation(null)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-4">
              <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center">
                <HeartHandshake className="w-6 h-6" />
              </div>

              <div>
                <span className="text-xs font-semibold text-amber-700 uppercase tracking-widest block">
                  NGO Surplus Claim Request
                </span>
                <h3 className="font-extrabold text-xl text-slate-900 mt-1">{selectedDonation.title}</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Quantity: {selectedDonation.quantity} {selectedDonation.unit} from {selectedDonation.business_name}
                </p>
              </div>

              {/* Safety Confirmation Notice */}
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 space-y-1">
                <div className="font-bold flex items-center text-emerald-800">
                  <ShieldCheck className="w-4 h-4 mr-1 text-emerald-600" /> Verified NGO Safety Protocol
                </div>
                <p className="text-[11px] leading-relaxed">
                  Only verified non-profit trusts can claim edible surplus. Recipient must maintain food temperature and ensure hygienic distribution within 24 hours.
                </p>
              </div>

              <form onSubmit={handleRequestDonation} className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Pickup Coordination Note
                  </label>
                  <textarea
                    rows={3}
                    value={requestNotes}
                    onChange={(e) => setRequestNotes(e.target.value)}
                    required
                    placeholder="e.g. Volunteer van arriving at 4:30 PM with sanitized thermal containers for Zoo Road community distribution."
                    className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="flex items-center space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedDonation(null)}
                    className="w-1/2 py-2.5 border border-slate-300 text-slate-700 font-semibold rounded-xl text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-1/2 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-md transition"
                  >
                    {submitting ? 'Submitting Request...' : 'Confirm Request'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
