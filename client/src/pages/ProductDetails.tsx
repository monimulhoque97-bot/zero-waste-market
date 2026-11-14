import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Product } from '../types';
import { ReservationModal } from '../components/ReservationModal';
import { LoadingSpinner } from '../components/LoadingSpinner';
import {
  MapPin,
  Clock,
  ShieldCheck,
  ShoppingBag,
  ArrowLeft,
  Tag,
  Building2,
  Calendar,
  AlertTriangle,
  Heart,
  Share2,
} from 'lucide-react';

export const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isReserveModalOpen, setIsReserveModalOpen] = useState<boolean>(false);

  const fetchProduct = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await api.getProductById(Number(id));
      setProduct(data);
    } catch (err: any) {
      setError(err.message || 'Product not found.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  if (loading) return <LoadingSpinner message="Loading product details..." />;

  if (error || !product) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center">
        <h2 className="text-xl font-bold text-slate-900">Product Unavailable</h2>
        <p className="text-xs text-slate-500 mt-2">{error || 'This listing may have ended or been reserved.'}</p>
        <Link
          to="/marketplace"
          className="mt-6 inline-flex items-center px-4 py-2 bg-forest-800 text-white rounded-xl text-xs font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back to Marketplace
        </Link>
      </div>
    );
  }

  const discountPercent = product.discount_percentage || Math.round(
    ((product.original_price - product.discounted_price) / product.original_price) * 100
  );
  const savingsAmount = product.original_price - product.discounted_price;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-xs text-slate-500">
        <Link to="/marketplace" className="hover:text-emerald-700 flex items-center">
          <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Marketplace
        </Link>
        <span>/</span>
        <span className="text-slate-400">{product.category}</span>
        <span>/</span>
        <span className="text-slate-800 font-semibold truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Image Card */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-sm">
          <div className="relative aspect-[4/3] w-full bg-slate-100">
            <img
              src={product.image_url || 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80'}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 bg-rose-600 text-white font-extrabold text-sm px-3 py-1.5 rounded-full shadow-lg flex items-center space-x-1.5">
              <Tag className="w-4 h-4" />
              <span>{discountPercent}% OFF SURPLUS</span>
            </div>
            <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-md text-white text-xs font-semibold px-3 py-1.5 rounded-full border border-white/20">
              {product.category}
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
                Product & Batch Details
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {product.description || 'Fresh usable surplus made available for daily collection.'}
              </p>
            </div>

            {/* Food Safety & Compliance Disclaimer */}
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2">
              <div className="flex items-center text-xs font-bold text-emerald-800">
                <ShieldCheck className="w-4 h-4 mr-1.5 text-emerald-600 shrink-0" />
                Guwahati Food Safety Compliance
              </div>
              <p className="text-[11px] text-emerald-900 leading-relaxed">
                {product.safety_notes || 'Product inspected by licensed merchant. Certified safe for immediate human consumption within stated expiry limits.'}
              </p>
              {product.fssai_license && (
                <p className="text-[10px] text-emerald-700 font-mono">
                  Merchant FSSAI License: #{product.fssai_license}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Pricing & Booking Action */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-6 sticky top-24">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span className="font-semibold text-slate-700">{product.business_name}</span>
                <span className="inline-flex items-center text-emerald-700 font-medium">
                  <MapPin className="w-3.5 h-3.5 mr-1" /> {product.locality || 'Guwahati'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                {product.name}
              </h1>
            </div>

            {/* Price Banner */}
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Surplus Discount Price
                </span>
                <div className="flex items-baseline space-x-3">
                  <span className="text-3xl font-black text-emerald-700">₹{product.discounted_price}</span>
                  <span className="text-base text-slate-400 line-through">₹{product.original_price}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-block bg-emerald-100 text-emerald-800 font-bold text-xs px-2.5 py-1 rounded-full">
                  Save ₹{savingsAmount.toFixed(0)}
                </span>
                <span className="text-[11px] text-slate-500 block mt-1">Pay upon collection</span>
              </div>
            </div>

            {/* Availability and Deadlines */}
            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Available Stock:</span>
                <span className="font-bold text-slate-900">{product.quantity} {product.unit || 'units'} left</span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Pickup Deadline:</span>
                <span className="font-bold text-amber-600 flex items-center">
                  <Clock className="w-3.5 h-3.5 mr-1" />
                  {product.pickup_end ? new Date(product.pickup_end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Tonight'}
                </span>
              </div>

              {product.expiry_date && (
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Best Before:</span>
                  <span className="font-bold text-slate-800 flex items-center">
                    <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    {product.expiry_date}
                  </span>
                </div>
              )}
            </div>

            {/* Merchant Location Card */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
              <h4 className="text-xs font-bold text-slate-800 flex items-center">
                <Building2 className="w-4 h-4 mr-1.5 text-emerald-600" /> Collection Counter
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {product.pickup_location || product.business_address || 'Christian Basti, Guwahati'}
              </p>
            </div>

            {/* Reservation CTA Button */}
            <button
              onClick={() => setIsReserveModalOpen(true)}
              disabled={product.quantity <= 0}
              className="w-full py-4 bg-forest-800 hover:bg-forest-900 disabled:opacity-50 text-white rounded-2xl text-base font-bold shadow-lg hover:shadow-xl transition flex items-center justify-center space-x-2"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>{product.quantity > 0 ? 'Reserve Item for Pickup' : 'Sold Out'}</span>
            </button>

            <p className="text-[11px] text-center text-slate-400">
              Safe lock. Pay in-person at the counter. Zero online payment needed.
            </p>
          </div>
        </div>
      </div>

      {/* Reservation Modal */}
      <ReservationModal
        product={isReserveModalOpen ? product : null}
        onClose={() => setIsReserveModalOpen(false)}
        onSuccess={() => {
          fetchProduct();
        }}
      />
    </div>
  );
};
