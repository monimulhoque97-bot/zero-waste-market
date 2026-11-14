import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  Sparkles,
  HeartHandshake,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  MapPin,
  HelpCircle,
} from 'lucide-react';

export const HowItWorks: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest block">
          Platform Architecture & Operations
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          How ZeroWaste Market Works
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Connecting Guwahati businesses, customers, and registered NGOs through a secure reserve-now, pay-at-counter model.
        </p>
      </div>

      {/* 3 User Journeys */}
      <div className="space-y-12">
        {/* Journey A: Shoppers */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-12 shadow-sm space-y-8">
          <div className="flex items-center space-x-3 text-emerald-800">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center font-bold">
              🛍️
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Workflow A</span>
              <h2 className="text-2xl font-bold text-slate-900">For Conscious Shoppers</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
              <span className="text-xs font-bold text-emerald-700">Step 1</span>
              <h4 className="font-bold text-sm text-slate-900">Browse Surplus</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Filter by bakery, produce, or meals in Guwahati localities like Christian Basti and Uzan Bazar.
              </p>
            </div>

            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
              <span className="text-xs font-bold text-emerald-700">Step 2</span>
              <h4 className="font-bold text-sm text-slate-900">Reserve Online</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Lock your quantity. Database transaction protects inventory from overselling.
              </p>
            </div>

            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
              <span className="text-xs font-bold text-emerald-700">Step 3</span>
              <h4 className="font-bold text-sm text-slate-900">Get Pickup Code</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Receive an encrypted voucher code (e.g. ZW-GUW-8A29) with store counter directions.
              </p>
            </div>

            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
              <span className="text-xs font-bold text-emerald-700">Step 4</span>
              <h4 className="font-bold text-sm text-slate-900">Collect & Pay</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Show voucher at the shop before deadline. Pay discounted price at pickup. Zero pre-payment.
              </p>
            </div>
          </div>
        </div>

        {/* Journey B: Sellers */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-12 shadow-sm space-y-8">
          <div className="flex items-center space-x-3 text-emerald-800">
            <div className="w-10 h-10 rounded-2xl bg-forest-100 text-forest-800 flex items-center justify-center font-bold">
              👨‍🍳
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Workflow B</span>
              <h2 className="text-2xl font-bold text-slate-900">For Guwahati Merchants & Bakeries</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
              <span className="text-xs font-bold text-emerald-700">Step 1</span>
              <h4 className="font-bold text-sm text-slate-900">Upload Photo</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Snap an image of surplus morning bake or market produce.
              </p>
            </div>

            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
              <span className="text-xs font-bold text-emerald-700">Step 2</span>
              <h4 className="font-bold text-sm text-slate-900">Gemini AI Assist</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Gemini identifies product, writes descriptions, and recommends optimal clearance discounts.
              </p>
            </div>

            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
              <span className="text-xs font-bold text-emerald-700">Step 3</span>
              <h4 className="font-bold text-sm text-slate-900">Set Counter Deadline</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Set availability end-time (e.g. 9:00 PM closing) and optional donation eligibility.
              </p>
            </div>

            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
              <span className="text-xs font-bold text-emerald-700">Step 4</span>
              <h4 className="font-bold text-sm text-slate-900">Handover & Recover</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Customer presents voucher. Tap 'Confirm Handover' and recover costs from unsold inventory.
              </p>
            </div>
          </div>
        </div>

        {/* Journey C: NGOs */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-12 shadow-sm space-y-8">
          <div className="flex items-center space-x-3 text-amber-800">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center font-bold">
              🤝
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600">Workflow C</span>
              <h2 className="text-2xl font-bold text-slate-900">For Verified Food Relief NGOs</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
              <span className="text-xs font-bold text-amber-700">Step 1</span>
              <h4 className="font-bold text-sm text-slate-900">Registration & Verification</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Submit trust registration details for admin verification. Only genuine organizations receive clearance.
              </p>
            </div>

            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
              <span className="text-xs font-bold text-amber-700">Step 2</span>
              <h4 className="font-bold text-sm text-slate-900">Claim Eligible Surplus</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Browse non-expired donation listings donated by bakeries and restaurants.
              </p>
            </div>

            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
              <span className="text-xs font-bold text-amber-700">Step 3</span>
              <h4 className="font-bold text-sm text-slate-900">Relief Distribution</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Collect directly from counter with volunteers and serve community kitchens or shelters.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Food Safety & Legal Compliance Notice */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-10 border border-slate-800 space-y-4">
        <h3 className="text-lg font-bold flex items-center">
          <ShieldCheck className="w-5 h-5 mr-2 text-emerald-400" /> Food Safety Standard & Disclaimers
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
          ZeroWaste Market strictly enforces FSSAI food hygiene principles. Expired food or spoiled items are strictly prohibited from listing and donation. Sellers retain ultimate responsibility for product quality. AI models provide informational assistance only and do not certify microbiological safety.
        </p>
      </div>
    </div>
  );
};
