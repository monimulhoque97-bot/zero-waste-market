import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Reservation } from '../types';
import { ReservationCard } from '../components/ReservationCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { ShoppingBag, ArrowLeft } from 'lucide-react';

export const MyReservations: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const data = await api.getMyReservations();
      setReservations(data);
    } catch (err) {
      console.error('Failed to load customer reservations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleCancel = async (id: number) => {
    if (!confirm('Are you sure you want to cancel this reservation? Stock will be restored for other shoppers.')) return;
    try {
      await api.cancelReservation(id);
      fetchReservations();
    } catch (err: any) {
      alert('Error cancelling: ' + err.message);
    }
  };

  const filtered = reservations.filter((r) =>
    statusFilter === 'all' ? true : r.status === statusFilter
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">My Surplus Reservations</h1>
          <p className="text-xs text-slate-500 mt-1">
            Track active vouchers and history of your rescued purchases across Guwahati.
          </p>
        </div>

        <Link
          to="/marketplace"
          className="px-4 py-2.5 bg-forest-800 hover:bg-forest-900 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center space-x-1.5 shrink-0"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Find More Surplus</span>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2">
        {['all', 'confirmed', 'completed', 'cancelled'].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition ${
              statusFilter === s
                ? 'bg-forest-800 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {s === 'all' ? 'All Vouchers' : s}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner message="Loading your reservation vouchers..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No Reservations Found"
          description="You don't have any reservations under this category. Visit the marketplace to reserve fresh surplus goods today."
          actionText="Browse Guwahati Marketplace"
          onAction={() => window.location.href = '/marketplace'}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((res) => (
            <ReservationCard
              key={res.id}
              reservation={res}
              onCancel={handleCancel}
            />
          ))}
        </div>
      )}
    </div>
  );
};
