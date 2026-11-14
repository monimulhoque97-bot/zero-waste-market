import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Product, GlobalImpact } from '../types';
import { ProductCard } from '../components/ProductCard';
import { ReservationModal } from '../components/ReservationModal';
import {
  Sparkles,
  ShoppingBag,
  Leaf,
  HeartHandshake,
  ArrowRight,
  TrendingUp,
  MapPin,
  ShieldCheck,
  Building2,
  Clock,
  Coins,
} from 'lucide-react';

export const Home: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [impact, setImpact] = useState<GlobalImpact | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [prods, imp] = await Promise.all([
          api.getProducts(),
          api.getGlobalImpact(),
        ]);
        setFeaturedProducts(prods.slice(0, 6));
        setImpact(imp);
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-16 pb-16">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-forest-950 via-forest-900 to-slate-900 text-white pt-16 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#4ade80_1px,transparent_1px)] [background-size:16px_16px]"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Pill */}
              <div className="inline-flex items-center space-x-2 bg-emerald-500/20 border border-emerald-500/30 px-3 py-1.5 rounded-full text-emerald-300 text-xs font-semibold backdrop-blur-sm">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>Now Live Across Guwahati, Assam</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
                Save Products. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-green-300 to-teal-200">
                  Save Money.
                </span>{' '}
                Save the Planet.
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
                Guwahati’s surplus marketplace connecting local bakeries, markets, and cafes with conscious customers and food relief NGOs. AI-assisted listings, transparent discounts, zero waste.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                <Link
                  to="/marketplace"
                  className="w-full sm:w-auto px-7 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-forest-950 font-bold rounded-2xl shadow-lg hover:shadow-emerald-500/25 transition flex items-center justify-center space-x-2 text-sm"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Explore Surplus Deals</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/seller/add-product"
                  className="w-full sm:w-auto px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-2xl border border-white/20 transition flex items-center justify-center space-x-2 text-sm"
                >
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>List Surplus with AI</span>
                </Link>
              </div>

              {/* Assurance Tag */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-slate-400">
                <span className="flex items-center">
                  <ShieldCheck className="w-4 h-4 mr-1 text-emerald-400" /> FSSAI Licensed Partners
                </span>
                <span className="flex items-center">
                  <Coins className="w-4 h-4 mr-1 text-emerald-400" /> Pay-at-Pickup Vouchers
                </span>
                <span className="flex items-center">
                  <Clock className="w-4 h-4 mr-1 text-emerald-400" /> Real-time Inventory Lock
                </span>
              </div>
            </div>

            {/* Impact Highlights Card */}
            <div className="lg:col-span-5">
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-white/15 shadow-2xl space-y-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <h3 className="font-bold text-lg text-white flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-emerald-400" /> Guwahati Impact Ticker
                  </h3>
                  <span className="text-[11px] font-mono text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                    LIVE
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-forest-900/60 p-4 rounded-2xl border border-white/10">
                    <span className="text-xs text-slate-300 block font-medium">Surplus Diverted</span>
                    <span className="text-2xl sm:text-3xl font-black text-emerald-400">
                      {impact ? impact.overview.total_rescued_units : '45+'}
                    </span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">items rescued from waste</span>
                  </div>

                  <div className="bg-forest-900/60 p-4 rounded-2xl border border-white/10">
                    <span className="text-xs text-slate-300 block font-medium">Customer Savings</span>
                    <span className="text-2xl sm:text-3xl font-black text-white">
                      ₹{impact ? impact.overview.total_customer_savings_inr : '740+'}
                    </span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">saved on groceries & food</span>
                  </div>

                  <div className="bg-forest-900/60 p-4 rounded-2xl border border-white/10">
                    <span className="text-xs text-slate-300 block font-medium">Waste Avoided</span>
                    <span className="text-2xl sm:text-3xl font-black text-teal-300">
                      {impact ? impact.environmental.estimated_waste_avoided_kg : '29.3'} kg
                    </span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">diverted from local landfill</span>
                  </div>

                  <div className="bg-forest-900/60 p-4 rounded-2xl border border-white/10">
                    <span className="text-xs text-slate-300 block font-medium">CO₂e Prevented</span>
                    <span className="text-2xl sm:text-3xl font-black text-green-300">
                      {impact ? impact.environmental.estimated_co2_prevented_kg : '73.3'} kg
                    </span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">greenhouse emissions saved</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 text-center italic">
                  *Metrics calculated using UN FAO standards from actual platform transactions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* GUWAHATI LOCALITY HUBS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2 text-slate-800">
            <Building2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="text-sm font-bold">Featured Pickup Localities in Guwahati:</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {['Christian Basti', 'GS Road', 'Uzan Bazar', 'Paltan Bazar', 'Zoo Road', 'Dispur'].map((loc) => (
              <Link
                key={loc}
                to={`/marketplace?locality=${encodeURIComponent(loc)}`}
                className="px-3 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 text-xs font-semibold rounded-lg transition"
              >
                {loc}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest block mb-2">
            Simple 3-Step Process
          </span>
          <h2 className="text-3xl font-black text-slate-900">How ZeroWaste Market Works</h2>
          <p className="text-sm text-slate-500 mt-2">
            No upfront payments. Reserve your item online, pick it up at the local Guwahati shop before the deadline, and pay at the counter.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto text-xl font-black">
              1
            </div>
            <h3 className="font-bold text-lg text-slate-900">Sellers List Surplus</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Bakeries, grocers, and cafes photograph surplus stock. Gemini AI suggests descriptions, categories, and safe clearance discounts.
            </p>
          </div>

          <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto text-xl font-black">
              2
            </div>
            <h3 className="font-bold text-lg text-slate-900">Customers Reserve</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Browse nearby surplus at 40-70% off. Select quantity, lock inventory with database transactions, and get a pickup voucher code.
            </p>
          </div>

          <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto text-xl font-black">
              3
            </div>
            <h3 className="font-bold text-lg text-slate-900">Collect & Pay at Counter</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Show your voucher code at the store counter in Guwahati, verify the fresh package, pay discounted price, and save landfill emissions.
            </p>
          </div>
        </div>
      </section>

      {/* FEATURED SURPLUS LISTINGS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest block mb-1">
              Fresh Surplus Today
            </span>
            <h2 className="text-3xl font-black text-slate-900">Available in Guwahati Counters</h2>
          </div>
          <Link
            to="/marketplace"
            className="inline-flex items-center font-bold text-sm text-emerald-700 hover:text-emerald-800 transition"
          >
            <span>View All Marketplace Listings</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-2xl h-80 animate-pulse border border-slate-200"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onReserveClick={(p) => setSelectedProduct(p)}
              />
            ))}
          </div>
        )}
      </section>

      {/* THREE ROLES BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* For Shoppers */}
          <div className="bg-gradient-to-br from-emerald-50 to-green-100/50 p-8 rounded-3xl border border-emerald-200 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-xl text-slate-900">For Conscious Shoppers</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Enjoy premium bakery bread, fresh produce, and local sweets at a fraction of the cost while actively fighting climate change.
              </p>
            </div>
            <Link
              to="/marketplace"
              className="inline-flex items-center text-xs font-bold text-emerald-800 hover:text-emerald-950"
            >
              Browse Deals <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          {/* For Sellers */}
          <div className="bg-gradient-to-br from-slate-900 to-forest-950 text-white p-8 rounded-3xl border border-slate-800 flex flex-col justify-between space-y-6 shadow-xl">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center shadow-md">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-xl text-white">For Guwahati Businesses</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Turn end-of-day surplus inventory into revenue instead of loss. List in under 60 seconds with Gemini AI Listing Assistant.
              </p>
            </div>
            <Link
              to="/seller/add-product"
              className="inline-flex items-center text-xs font-bold text-emerald-400 hover:text-emerald-300"
            >
              List with AI <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          {/* For NGOs */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-8 rounded-3xl border border-amber-200 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center shadow-md">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-xl text-slate-900">For Verified NGOs</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Registered food relief and welfare trusts can claim free eligible surplus supplies directly from licensed local businesses.
              </p>
            </div>
            <Link
              to="/donations"
              className="inline-flex items-center text-xs font-bold text-amber-800 hover:text-amber-950"
            >
              View Available Donations <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* RESERVATION MODAL */}
      <ReservationModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onSuccess={() => {
          // reload featured products
          api.getProducts().then((p) => setFeaturedProducts(p.slice(0, 6)));
        }}
      />
    </div>
  );
};
