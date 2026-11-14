import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Heart, ShieldCheck, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
                <Leaf className="w-5 h-5" />
              </div>
              <span className="text-xl font-extrabold text-white tracking-tight">
                ZeroWaste<span className="text-emerald-400">Market</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Guwahati’s AI-powered surplus product marketplace. Connecting local bakeries, markets, and restaurants with citizens and NGOs to prevent food waste.
            </p>
            <div className="flex items-center space-x-1.5 text-xs text-emerald-400">
              <MapPin className="w-3.5 h-3.5" />
              <span>Serving Guwahati, Kamrup Metro, Assam</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm tracking-wider uppercase">Marketplace</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/marketplace" className="hover:text-emerald-400 transition">
                  Browse Surplus Products
                </Link>
              </li>
              <li>
                <Link to="/donations" className="hover:text-emerald-400 transition">
                  NGO Surplus Donations
                </Link>
              </li>
              <li>
                <Link to="/impact" className="hover:text-emerald-400 transition">
                  Environmental Impact Tracker
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-emerald-400 transition">
                  How Reserve-at-Pickup Works
                </Link>
              </li>
            </ul>
          </div>

          {/* Guwahati Localities Covered */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm tracking-wider uppercase">Guwahati Hubs</h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>• Christian Basti & GS Road</li>
              <li>• Uzan Bazar Ghat & Latasil</li>
              <li>• Paltan Bazar & Panbazar</li>
              <li>• Zoo Road & Chandmari</li>
              <li>• Six Mile & Dispur Capital</li>
              <li>• Jalukbari & Maligaon</li>
            </ul>
          </div>

          {/* Food Safety & Responsibility Notice */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-sm tracking-wider uppercase flex items-center">
              <ShieldCheck className="w-4 h-4 mr-1.5 text-emerald-400" /> Food Safety Standard
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              All participating sellers adhere to strict FSSAI food hygiene standards. AI models assist in listing creation but do not independently certify safety.
            </p>
            <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700/60 text-[11px] text-slate-300">
              <span className="font-semibold text-emerald-400">Guwahati Hackathon 2026 Edition</span>
              <p className="mt-0.5 text-slate-400">Save Products. Save Money. Save the Planet.</p>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} ZeroWaste Market Guwahati. Built with sustainable commerce architecture.</p>
          <div className="flex items-center space-x-4">
            <Link to="/about" className="hover:text-slate-400">
              About Platform
            </Link>
            <Link to="/how-it-works" className="hover:text-slate-400">
              Safety Guidelines
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
