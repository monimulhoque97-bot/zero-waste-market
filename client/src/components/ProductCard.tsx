import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { MapPin, Clock, Tag, ShoppingBag, ShieldCheck } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onReserveClick?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onReserveClick }) => {
  const discountPercent = product.discount_percentage || Math.round(
    ((product.original_price - product.discounted_price) / product.original_price) * 100
  );

  const formattedDeadline = product.pickup_end
    ? new Date(product.pickup_end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'Tonight';

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
      <div>
        {/* Image Container with Badges */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
          <img
            src={product.image_url || 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />

          {/* Discount Badge */}
          <div className="absolute top-3 left-3 bg-rose-600 text-white font-extrabold text-xs px-2.5 py-1 rounded-full shadow-md flex items-center space-x-1">
            <Tag className="w-3 h-3" />
            <span>{discountPercent}% OFF</span>
          </div>

          {/* Category Tag */}
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-slate-800 text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-sm border border-slate-200">
            {product.category}
          </div>

          {/* Stock Availability Pill */}
          <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-sm text-white text-[11px] font-medium px-2 py-0.5 rounded-md flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>{product.quantity} {product.unit || 'left'}</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5">
          {/* Seller / Locality */}
          <div className="flex items-center justify-between text-xs text-slate-700 mb-1.5">
            <span className="font-semibold text-slate-700 truncate max-w-[150px]">
              {product.business_name || 'Verified Guwahati Merchant'}
            </span>
            <span className="inline-flex items-center text-emerald-700 font-medium">
              <MapPin className="w-3 h-3 mr-0.5 text-emerald-600" />
              {product.locality || 'Guwahati'}
            </span>
          </div>

          {/* Product Title */}
          <Link to={`/products/${product.id}`} className="block">
            <h3 className="font-bold text-base text-slate-900 group-hover:text-emerald-700 transition line-clamp-1">
              {product.name}
            </h3>
          </Link>

          {/* Description snippet */}
          <p className="text-xs text-slate-700 mt-1.5 line-clamp-2 leading-relaxed">
            {product.description || 'Safe surplus stock available for today’s collection counter.'}
          </p>

          {/* Timing details */}
          <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-700">
            <span className="inline-flex items-center">
              <Clock className="w-3.5 h-3.5 mr-1 text-amber-500" />
              Pickup by: <strong className="ml-1 text-slate-800">{formattedDeadline}</strong>
            </span>
            {product.expiry_date && (
              <span className="text-slate-700">Best before: {product.expiry_date}</span>
            )}
          </div>
        </div>
      </div>

      {/* Footer Pricing & CTA */}
      <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-0">
        <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100 mb-3">
          <div>
            <span className="text-[10px] text-slate-700 uppercase tracking-wider block font-medium">Surplus Price</span>
            <div className="flex items-baseline space-x-2">
              <span className="text-lg font-black text-emerald-700">₹{product.discounted_price}</span>
              <span className="text-xs text-slate-700 line-through">₹{product.original_price}</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-emerald-700 font-bold block">
              Save ₹{(product.original_price - product.discounted_price).toFixed(0)}
            </span>
            <span className="text-[10px] text-slate-700">Pay at counter</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Link
            to={`/products/${product.id}`}
            className="w-full text-center py-2 px-3 border border-slate-300 hover:border-emerald-600 hover:text-emerald-700 rounded-xl text-xs font-semibold text-slate-700 transition"
          >
            Details
          </Link>
          <button
            onClick={() => onReserveClick ? onReserveClick(product) : undefined}
            className="w-full inline-flex items-center justify-center py-2 px-3 bg-forest-800 hover:bg-forest-900 text-white rounded-xl text-xs font-semibold shadow-sm hover:shadow transition"
          >
            <ShoppingBag className="w-3.5 h-3.5 mr-1" />
            Reserve
          </button>
        </div>
      </div>
    </div>
  );
};
