import React from 'react';
import { Reservation } from '../types';
import { StatusBadge } from './StatusBadge';
import { MapPin, Clock, CheckCircle2, XCircle, ShoppingBag } from 'lucide-react';

interface ReservationCardProps {
  reservation: Reservation;
  isSellerView?: boolean;
  onCancel?: (id: number) => void;
  onComplete?: (id: number) => void;
}

export const ReservationCard: React.FC<ReservationCardProps> = ({
  reservation,
  isSellerView = false,
  onCancel,
  onComplete,
}) => {
  const isCancellable = reservation.status === 'confirmed' || reservation.status === 'pending';
  const isCompletable = isSellerView && (reservation.status === 'confirmed' || reservation.status === 'pending');

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm hover:shadow-md transition">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
            <img
              src={reservation.image_url || 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=300&q=80'}
              alt={reservation.product_name}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider block">
              {reservation.category || 'Surplus Item'}
            </span>
            <h4 className="font-bold text-base text-slate-900">{reservation.product_name}</h4>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <StatusBadge status={reservation.status} />
        </div>
      </div>

      {/* Verification Code Strip */}
      <div className="my-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-wrap items-center justify-between gap-2">
        <div>
          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">
            Pickup Voucher Code
          </span>
          <span className="text-xl font-mono font-black text-forest-900 tracking-wider">
            {reservation.pickup_code}
          </span>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-500 uppercase font-medium block">Total Due at Counter</span>
          <span className="text-lg font-black text-emerald-700">₹{reservation.total_price}</span>
          <span className="text-xs text-slate-400 block">({reservation.quantity} item{reservation.quantity > 1 ? 's' : ''} × ₹{reservation.unit_price})</span>
        </div>
      </div>

      {/* Location & Details */}
      <div className="space-y-1.5 text-xs text-slate-600 mb-4">
        {isSellerView ? (
          <div>
            <strong>Customer:</strong> {reservation.customer_name} ({reservation.customer_phone || 'Phone upon pickup'})
          </div>
        ) : (
          <div className="flex items-start">
            <MapPin className="w-4 h-4 mr-1.5 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              <strong>Pickup Location:</strong> {reservation.pickup_location || reservation.business_name}
            </span>
          </div>
        )}

        <div className="flex items-center text-[11px] text-slate-500">
          <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
          Reserved on: {new Date(reservation.reserved_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
        {isCompletable && onComplete && (
          <button
            onClick={() => onComplete(reservation.id)}
            className="inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
          >
            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
            Confirm Handover & Payment
          </button>
        )}

        {!isSellerView && isCancellable && onCancel && (
          <button
            onClick={() => onCancel(reservation.id)}
            className="inline-flex items-center px-3 py-1.5 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold transition"
          >
            <XCircle className="w-3.5 h-3.5 mr-1" />
            Cancel Reservation
          </button>
        )}
      </div>
    </div>
  );
};
