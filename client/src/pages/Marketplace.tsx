import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { Product } from '../types';
import { ProductCard } from '../components/ProductCard';
import { ReservationModal } from '../components/ReservationModal';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { Search, Filter, SlidersHorizontal, MapPin, Tag, X } from 'lucide-react';

const CATEGORIES = [
  'All',
  'Bakery',
  'Meals & Cooked',
  'Produce & Fruits',
  'Dairy & Sweets',
  'Packaged Goods',
  'Beverages',
];

const LOCALITIES = [
  'All Localities',
  'Christian Basti',
  'GS Road',
  'Uzan Bazar',
  'Paltan Bazar',
  'Zoo Road',
  'Dispur',
  'Six Mile',
  'Jalukbari',
];

export const Marketplace: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Filters state initialized from query params
  const [search, setSearch] = useState<string>(searchParams.get('search') || '');
  const [category, setCategory] = useState<string>(searchParams.get('category') || 'All');
  const [locality, setLocality] = useState<string>(searchParams.get('locality') || 'All Localities');
  const [maxPrice, setMaxPrice] = useState<number>(Number(searchParams.get('maxPrice')) || 500);
  const [minDiscount, setMinDiscount] = useState<number>(Number(searchParams.get('minDiscount')) || 0);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const items = await api.getProducts({
        category: category !== 'All' ? category : undefined,
        locality: locality !== 'All Localities' ? locality : undefined,
        search: search.trim() || undefined,
        maxPrice,
        minDiscount: minDiscount > 0 ? minDiscount : undefined,
      });
      setProducts(items);
    } catch (err) {
      console.error('Failed to fetch marketplace products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [category, locality, minDiscount, maxPrice]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts();
  };

  const clearFilters = () => {
    setSearch('');
    setCategory('All');
    setLocality('All Localities');
    setMaxPrice(500);
    setMinDiscount(0);
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Title & Search Header */}
      <div className="bg-gradient-to-r from-forest-900 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center space-x-2 bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-xs font-semibold">
            <Tag className="w-3.5 h-3.5" />
            <span>Guwahati Fresh Surplus Marketplace</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            Rescue Delicious Surplus at 40% – 70% Off
          </h1>

          <p className="text-sm text-slate-300">
            Unsold bakery goods, fresh farm produce, and cooked meals ready for counter collection today.
          </p>

          {/* Search Bar Form */}
          <form onSubmit={handleSearchSubmit} className="pt-2 flex items-center max-w-xl">
            <div className="relative w-full">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search sourdough, croissants, paneer, strawberries..."
                className="w-full bg-white/10 backdrop-blur-md text-white placeholder-slate-400 pl-11 pr-4 py-3 rounded-2xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-sm"
              />
            </div>
            <button
              type="submit"
              className="ml-2 px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-forest-950 font-bold rounded-2xl text-sm transition shrink-0"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              category === cat
                ? 'bg-forest-800 text-white shadow-md'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Filter and Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filter Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900 flex items-center">
                <SlidersHorizontal className="w-4 h-4 mr-2 text-emerald-600" /> Refine Listings
              </h3>
              {(category !== 'All' || locality !== 'All Localities' || minDiscount > 0 || maxPrice < 500 || search) && (
                <button
                  onClick={clearFilters}
                  className="text-[11px] font-semibold text-rose-600 hover:underline flex items-center"
                >
                  <X className="w-3 h-3 mr-0.5" /> Clear
                </button>
              )}
            </div>

            {/* Locality Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Guwahati Locality
              </label>
              <select
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              >
                {LOCALITIES.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            {/* Max Price Slider */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2">
                <span>Max Price</span>
                <span className="text-emerald-700 font-black">₹{maxPrice}</span>
              </div>
              <input
                type="range"
                min="50"
                max="600"
                step="10"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>₹50</span>
                <span>₹600</span>
              </div>
            </div>

            {/* Minimum Discount Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Minimum Discount
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[0, 30, 50].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setMinDiscount(d)}
                    className={`py-1.5 text-xs font-semibold rounded-lg border transition ${
                      minDiscount === d
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {d === 0 ? 'Any' : `${d}%+`}
                  </button>
                ))}
              </div>
            </div>

            {/* Guwahati Note */}
            <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 text-[11px] text-emerald-900 leading-relaxed">
              <span className="font-bold block text-emerald-800 mb-0.5">🌱 Zero Waste Guarantee</span>
              All surplus items are fresh, inspected, and held by FSSAI registered Guwahati food businesses.
            </div>
          </div>
        </div>

        {/* Product Grid Area */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500">
              Showing <span className="text-slate-900 font-bold">{products.length}</span> surplus deal{products.length === 1 ? '' : 's'} in Guwahati
            </p>
          </div>

          {loading ? (
            <LoadingSpinner message="Fetching verified surplus listings in Guwahati..." />
          ) : products.length === 0 ? (
            <EmptyState
              title="No Surplus Products Found"
              description="No active listings match your current filter parameters. Try expanding your search or selecting 'All Localities'."
              actionText="Reset All Filters"
              onAction={clearFilters}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {products.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onReserveClick={(prod) => setSelectedProduct(prod)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reservation Modal */}
      <ReservationModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onSuccess={fetchProducts}
      />
    </div>
  );
};
