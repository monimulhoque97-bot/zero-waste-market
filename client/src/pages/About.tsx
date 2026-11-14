import React from 'react';
import { Leaf, ShieldCheck, HeartHandshake, MapPin, Users, Target } from 'lucide-react';

export const About: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="text-center space-y-4">
        <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest block">
          About ZeroWaste Market
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          Save Products. Save Money. Save the Planet.
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
          Built for Guwahati, Assam, India. An AI-powered social enterprise platform designed to tackle retail surplus, relieve landfill burden, and feed local communities.
        </p>
      </div>

      {/* Vision & Mission Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">The Problem in Guwahati</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Every evening, dozens of high-quality bakeries, cafes, produce marts, and restaurants across Guwahati (from Christian Basti to Uzan Bazar) discard unsold, perfectly edible items because they lack an efficient redistribution channel. At the same time, households face inflationary grocery prices, and local welfare kitchens seek steady supply.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-forest-100 text-forest-800 flex items-center justify-center font-bold">
            <Leaf className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Our Technological Solution</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            ZeroWaste Market bridges this gap with an AI-assisted marketplace. Merchants list surplus in 60 seconds with Gemini AI assistance, citizens reserve goods at 40-70% off with reserve-now-pay-at-pickup vouchers, and non-profits claim eligible donations before closing time.
          </p>
        </div>
      </div>

      {/* Pillars */}
      <div className="bg-slate-50 p-8 sm:p-10 rounded-3xl border border-slate-200/80 space-y-6">
        <h2 className="text-xl font-bold text-slate-900 text-center">Core Platform Pillars</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div className="p-4 bg-white rounded-2xl border border-slate-100 space-y-2">
            <ShieldCheck className="w-8 h-8 text-emerald-600 mx-auto" />
            <h4 className="font-bold text-sm text-slate-900">Food Safety First</h4>
            <p className="text-xs text-slate-500">
              Only FSSAI-compliant businesses list surplus. Expired food is strictly forbidden.
            </p>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-100 space-y-2">
            <HeartHandshake className="w-8 h-8 text-amber-600 mx-auto" />
            <h4 className="font-bold text-sm text-slate-900">Verified NGO Partnerships</h4>
            <p className="text-xs text-slate-500">
              Unsold surplus is channeled to vetted non-profit trusts for community relief.
            </p>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-100 space-y-2">
            <MapPin className="w-8 h-8 text-teal-600 mx-auto" />
            <h4 className="font-bold text-sm text-slate-900">Hyper-Local Guwahati Focus</h4>
            <p className="text-xs text-slate-500">
              Zero shipping miles. In-person counter collection eliminates courier packaging and emissions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
