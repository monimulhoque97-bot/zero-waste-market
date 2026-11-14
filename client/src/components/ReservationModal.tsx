import React, { useState } from 'react';
import { Product } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { X, CheckCircle, Clock, MapPin, AlertCircle, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ReservationModalProps {
  product: Product | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ReservationModal: React.FC<ReservationModalProps> = ({ product, onClose, onSuccess }) => {
  const { isAuthenticated, role, quickLoginDemo } = useAuth();
  const navigate = useNavigate();

  const [quantity, setQuantity] = useState<number>(1);
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmedReservation, setConfirmedReservation] = useState<any | null>(null);

  if (!product) return null;

  const unitPrice = Number(product.discounted_price);
  const totalPrice = unitPrice * quantity;
  const originalTotal = Number(product.original_price) * quantity;
  const totalSavings = originalTotal - totalPrice;

  const handleIncrement = () => {
    if (quantity < product.quantity) setQuantity(quantity + 1);
  };

  const handleDecrement = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const handleConfirm = async () => {
    if (!isAuthenticated) {
      setError('Please log in as a Customer to reserve surplus items.');
      return;
    }

    if (role !== 'customer') {
      setError(`Your current role is '${role}'. Only Customer accounts can place reservations.`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await api.createReservation({
        product_id: product.id,
        quantity,
        notes: notes.trim() || undefined,
      });
      setConfirmedReservation(res);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to complete reservation. Inventory may have changed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {confirmedReservation ? (
          /* Confirmation Screen */
          <div className="text-center py-4 space-y-5">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle className="w-10 h-10" />
            </div>

            <div>
              <h3 className="text-2xl font-black text-slate-900">Surplus Reserved!</h3>
              <p className="text-sm text-slate-500 mt-1">
                Your reservation has been confirmed with {product.business_name || 'the seller'}.
              </p>
            </div>

            {/* Voucher Code Box */}
            <div className="p-5 bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl border border-emerald-200 text-center">
              <span className="text-xs font-semibold text-emerald-800 uppercase tracking-widest block mb-1">
                Pickup Verification Code
              </span>
              <span className="text-3xl font-mono font-black text-forest-900 tracking-wider">
                {confirmedReservation.pickup_code}
              </span>
              <p className="text-xs text-slate-600 mt-2">
                Show this code at the pickup counter. Pay <strong>₹{totalPrice.toFixed(0)}</strong> upon collection.
              </p>
            </div>

            {/* Pickup Details */}
            <div className="bg-slate-50 p-4 rounded-xl text-left space-y-2 text-xs text-slate-700">
              <div className="flex items-start">
                <MapPin className="w-4 h-4 mr-2 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Counter:</strong> {product.pickup_location || product.business_name}
                </span>
              </div>
              <div className="flex items-start">
                <Clock className="w-4 h-4 mr-2 text-amber-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Collect By:</strong>{' '}
                  {product.pickup_end ? new Date(product.pickup_end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Tonight'}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <button
                onClick={() => {
                  onClose();
                  navigate('/customer/reservations');
                }}
                className="w-full py-3 bg-forest-800 hover:bg-forest-900 text-white rounded-xl text-sm font-bold shadow-md transition"
              >
                View in My Reservations
              </button>
            </div>
          </div>
        ) : (
          /* Reservation Form */
          <div>
            <div className="flex items-center space-x-3 mb-5">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider block">
                  Reserve Surplus Item
                </span>
                <h3 className="font-bold text-lg text-slate-900 line-clamp-1">{product.name}</h3>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 mb-5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-semibold text-slate-800 block">Quantity</span>
                  <span className="text-xs text-slate-500">Available: {product.quantity} {product.unit || 'units'}</span>
                </div>
                <div className="flex items-center space-x-3 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-sm">
                  <button
                    onClick={handleDecrement}
                    disabled={quantity <= 1}
                    className="text-slate-500 hover:text-slate-800 disabled:opacity-30 font-black text-base w-6 text-center"
                  >
                    -
                  </button>
                  <span className="font-bold text-slate-900 text-sm w-6 text-center">{quantity}</span>
                  <button
                    onClick={handleIncrement}
                    disabled={quantity >= product.quantity}
                    className="text-slate-500 hover:text-slate-800 disabled:opacity-30 font-black text-base w-6 text-center"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Price Calculation */}
              <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-sm">
                <div>
                  <span className="text-xs text-slate-500 block">Amount to pay at pickup:</span>
                  <span className="text-xl font-black text-emerald-700">₹{totalPrice.toFixed(0)}</span>
                  <span className="text-xs text-slate-400 line-through ml-2">₹{originalTotal.toFixed(0)}</span>
                </div>
                <div className="text-right">
                  <span className="inline-block bg-emerald-100 text-emerald-800 font-bold text-xs px-2.5 py-1 rounded-full">
                    You save ₹{totalSavings.toFixed(0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Optional Pickup Note */}
            <div className="mb-5">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Note for Merchant (Optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Arriving between 6:30 PM - 7:00 PM"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span>{error}</span>
                  {!isAuthenticated && (
                    <button
                      onClick={() => quickLoginDemo('customer')}
                      className="block mt-1 font-bold text-emerald-700 hover:underline"
                    >
                      Click here to 1-Click Login as Customer
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                onClick={handleConfirm}
                disabled={loading}
                className="w-full py-3 bg-forest-800 hover:bg-forest-900 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition flex items-center justify-center space-x-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{loading ? 'Processing Transaction...' : 'Confirm Surplus Reservation'}</span>
              </button>
              <p className="text-[11px] text-center text-slate-400">
                Reserve-now, pay-at-counter model. Safe transaction verification with zero waste.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
