import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { GlobalImpact } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import {
  TrendingUp,
  Leaf,
  Coins,
  Droplets,
  Wind,
  ShieldCheck,
  Building2,
  HeartHandshake,
  BookOpen,
} from 'lucide-react';

export const ImpactDashboard: React.FC = () => {
  const [impact, setImpact] = useState<GlobalImpact | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadImpact() {
      try {
        const data = await api.getGlobalImpact();
        setImpact(data);
      } catch (err) {
        console.error('Failed to load global impact:', err);
      } finally {
        setLoading(false);
      }
    }
    loadImpact();
  }, []);

  if (loading) return <LoadingSpinner message="Calculating verified impact metrics..." />;

  const overview = impact?.overview || {
    total_products_listed: 0,
    total_rescued_units: 0,
    units_sold: 0,
    units_donated: 0,
    completed_reservations: 0,
    total_customer_savings_inr: 0,
    total_marketplace_volume_inr: 0,
  };

  const environmental = impact?.environmental || {
    estimated_waste_avoided_kg: 0,
    estimated_co2_prevented_kg: 0,
    estimated_water_saved_litres: 0,
  };

  const assumptions = impact?.methodology?.assumptions || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center space-x-1.5 bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-semibold">
          <Leaf className="w-3.5 h-3.5 text-emerald-600" />
          <span>Transparent Social & Ecological Metrics</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
          Live Impact Dashboard — Guwahati
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Real records calculated from every completed surplus transaction and verified NGO donation across Guwahati, Assam.
        </p>
      </div>

      {/* Primary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-emerald-600 to-forest-800 text-white p-6 sm:p-7 rounded-3xl shadow-lg space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
            <Coins className="w-5 h-5 text-emerald-200" />
          </div>
          <span className="text-xs uppercase tracking-wider text-emerald-200 font-bold block pt-2">
            Citizen Money Saved
          </span>
          <span className="text-3xl sm:text-4xl font-black tracking-tight block">
            ₹{overview.total_customer_savings_inr.toLocaleString()}
          </span>
          <p className="text-[11px] text-emerald-100">Direct discount savings back into Guwahati households.</p>
        </div>

        <div className="bg-gradient-to-br from-teal-600 to-teal-800 text-white p-6 sm:p-7 rounded-3xl shadow-lg space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
            <Leaf className="w-5 h-5 text-teal-200" />
          </div>
          <span className="text-xs uppercase tracking-wider text-teal-200 font-bold block pt-2">
            Surplus Diverted
          </span>
          <span className="text-3xl sm:text-4xl font-black tracking-tight block">
            {overview.total_rescued_units.toLocaleString()} Units
          </span>
          <p className="text-[11px] text-teal-100">
            {overview.units_sold} sold to shoppers + {overview.units_donated} donated to relief.
          </p>
        </div>

        <div className="bg-gradient-to-br from-slate-900 to-forest-950 text-white p-6 sm:p-7 rounded-3xl shadow-lg space-y-2 border border-slate-800">
          <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
            <Wind className="w-5 h-5 text-green-300" />
          </div>
          <span className="text-xs uppercase tracking-wider text-slate-300 font-bold block pt-2">
            CO₂e Emissions Saved
          </span>
          <span className="text-3xl sm:text-4xl font-black tracking-tight text-green-300 block">
            {environmental.estimated_co2_prevented_kg.toLocaleString()} kg
          </span>
          <p className="text-[11px] text-slate-400">Equivalent to preventing {Math.round(environmental.estimated_co2_prevented_kg * 4.2)} km driven by car.</p>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-cyan-800 text-white p-6 sm:p-7 rounded-3xl shadow-lg space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
            <Droplets className="w-5 h-5 text-cyan-200" />
          </div>
          <span className="text-xs uppercase tracking-wider text-cyan-200 font-bold block pt-2">
            Virtual Water Conserved
          </span>
          <span className="text-3xl sm:text-4xl font-black tracking-tight block">
            {environmental.estimated_water_saved_litres.toLocaleString()} L
          </span>
          <p className="text-[11px] text-cyan-100">Agricultural embedded water preserved from lost harvest.</p>
        </div>
      </div>

      {/* Detailed Breakdown Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-xl font-bold text-slate-900">Marketplace Operational Statistics</h2>
          <p className="text-xs text-slate-500">Live aggregated counts from relational database transaction tables.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-xs text-slate-400 block font-semibold">Total Listings Published</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">{overview.total_products_listed}</span>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-xs text-slate-400 block font-semibold">Customer Reservations</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">{overview.completed_reservations}</span>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-xs text-slate-400 block font-semibold">Waste Avoided (Mass)</span>
            <span className="text-2xl font-black text-emerald-700 mt-1 block">{environmental.estimated_waste_avoided_kg} kg</span>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-xs text-slate-400 block font-semibold">Marketplace Clearance Volume</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">₹{overview.total_marketplace_volume_inr}</span>
          </div>
        </div>
      </div>

      {/* Documented Methodology & Scientific Assumptions */}
      <div className="bg-emerald-50/70 rounded-3xl border border-emerald-200/90 p-6 sm:p-10 space-y-6">
        <div className="flex items-center space-x-2 text-emerald-900">
          <BookOpen className="w-5 h-5 text-emerald-700" />
          <h3 className="font-bold text-lg">Documented Calculation Methodology & Standards</h3>
        </div>

        <p className="text-xs text-emerald-950 leading-relaxed">
          In strict compliance with our platform transparency policy, environmental metrics are estimated using international scientific benchmarks rather than fabricated numbers:
        </p>

        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-emerald-900">
          {assumptions.map((assump, idx) => (
            <li key={idx} className="bg-white p-4 rounded-2xl border border-emerald-200/80 shadow-xs flex items-start space-x-2">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <span className="leading-relaxed">{assump}</span>
            </li>
          ))}
        </ul>

        <p className="text-[11px] text-emerald-700 italic text-center pt-2">
          Data benchmark: United Nations Food & Agriculture Organization (UN FAO) Food Loss and Waste Protocol.
        </p>
      </div>
    </div>
  );
};
