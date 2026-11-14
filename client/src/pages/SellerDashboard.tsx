import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Product, Reservation } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import {
  Sparkles,
  ShoppingBag,
  TrendingUp,
  Package,
  CheckCircle2,
  Clock,
  MapPin,
  PlusCircle,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Search,
} from 'lucide-react';

export const SellerDashboard: React.FC = () => {
  const [data, setData] = useState<any | null>(null);
  const [myProducts, setMyProducts] = useState<Product[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [codeFilter, setCodeFilter] = useState<string>('');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [dash, prods, orders] = await Promise.all([
        api.getSellerDashboard(),
        api.getMyProducts(),
        api.getSellerReservations(),
      ]);
      setData(dash);
      setMyProducts(prods);
      setReservations(orders);
    } catch (err) {
      console.error('Failed to load seller dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleConfirmHandover = async (resId: number) => {
    try {
      await api.updateReservationStatus(resId, 'completed');
      setActionSuccess('Order marked as completed! Customer handover confirmed.');
      loadDashboard();
    } catch (err: any) {
      alert('Error updating order: ' + err.message);
    }
  };

  const handleDeleteProduct = async (prodId: number) => {
    if (!confirm('Are you sure you want to remove this surplus listing?')) return;
    try {
      await api.deleteProduct(prodId);
      setActionSuccess('Product listing removed.');
      loadDashboard();
    } catch (err: any) {
      alert('Error deleting product: ' + err.message);
    }
  };

  if (loading) return <LoadingSpinner message="Loading merchant dashboard..." />;

  const stats = data?.stats || {};
  const profile = data?.profile || {};

  const filteredOrders = reservations.filter((r) =>
    codeFilter ? r.pickup_code.toLowerCase().includes(codeFilter.toLowerCase()) : true
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-forest-950 via-forest-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>FSSAI Licensed Merchant • {profile.locality || 'Christian Basti'}, Guwahati</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold">{profile.business_name || 'Brahmaputra Bakers'}</h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            {profile.business_address || 'Central Mall Arcade, GS Road, Guwahati'} • License: #{profile.fssai_license || '10321999000123'}
          </p>
        </div>

        <Link
          to="/seller/add-product"
          className="px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-forest-950 font-black rounded-2xl text-xs shadow-lg transition flex items-center space-x-2 shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          <span>Add Surplus with AI</span>
        </Link>
      </div>

      {actionSuccess && (
        <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl text-xs flex items-center justify-between">
          <span>{actionSuccess}</span>
          <button onClick={() => setActionSuccess(null)} className="font-bold text-slate-400 hover:text-slate-600">×</button>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
          <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider block">Total Rescued</span>
          <span className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 block">
            {stats.total_units_sold || 0}
          </span>
          <span className="text-[11px] text-emerald-600 font-semibold block mt-1">items sold via surplus</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
          <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider block">Surplus Revenue</span>
          <span className="text-2xl sm:text-3xl font-black text-emerald-700 mt-1 block">
            ₹{stats.total_revenue_inr || 0}
          </span>
          <span className="text-[11px] text-slate-500 block mt-1">recovered from clearance</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
          <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider block">Waste Avoided</span>
          <span className="text-2xl sm:text-3xl font-black text-teal-700 mt-1 block">
            {stats.waste_avoided_kg || 0} kg
          </span>
          <span className="text-[11px] text-teal-600 block mt-1">diverted from landfill</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
          <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider block">Active Orders</span>
          <span className="text-2xl sm:text-3xl font-black text-amber-600 mt-1 block">
            {stats.active_reservations || 0}
          </span>
          <span className="text-[11px] text-amber-600 block mt-1">pending customer pickup</span>
        </div>
      </div>

      {/* INCOMING CUSTOMER ORDERS SECTION */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Customer Pickup Orders</h2>
            <p className="text-xs text-slate-500">Verify customer voucher codes and confirm payment collection.</p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={codeFilter}
              onChange={(e) => setCodeFilter(e.target.value)}
              placeholder="Search code (e.g. ZW-GUW)..."
              className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">No orders currently match your query.</p>
        ) : (
          <div className="divide-y divide-slate-100 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[10px] uppercase font-bold text-slate-400">
                <tr>
                  <th className="pb-3">Voucher Code</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Item Reserved</th>
                  <th className="pb-3">Qty & Price</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 font-mono font-bold text-emerald-800 text-sm">
                      {ord.pickup_code}
                    </td>
                    <td className="py-3.5">
                      <span className="font-semibold text-slate-800 block">{ord.customer_name}</span>
                      <span className="text-[10px] text-slate-400">{ord.customer_phone || 'Customer'}</span>
                    </td>
                    <td className="py-3.5 font-medium text-slate-800 max-w-xs truncate">
                      {ord.product_name}
                    </td>
                    <td className="py-3.5">
                      <strong className="text-slate-900">{ord.quantity}x</strong> (₹{ord.total_price})
                    </td>
                    <td className="py-3.5">
                      <StatusBadge status={ord.status} size="sm" />
                    </td>
                    <td className="py-3.5 text-right">
                      {ord.status === 'confirmed' || ord.status === 'pending' ? (
                        <button
                          onClick={() => handleConfirmHandover(ord.id)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] shadow-sm transition"
                        >
                          Confirm Handover
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400">Completed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ACTIVE SURPLUS LISTINGS */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">My Surplus Listings ({myProducts.length})</h2>
            <p className="text-xs text-slate-500">Manage active items, inventory levels, and deadlines.</p>
          </div>
          <Link
            to="/seller/add-product"
            className="text-xs font-bold text-emerald-700 hover:underline flex items-center"
          >
            <PlusCircle className="w-3.5 h-3.5 mr-1" /> Add New Item
          </Link>
        </div>

        {myProducts.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">No listings published yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myProducts.map((p) => (
              <div key={p.id} className="border border-slate-200 rounded-2xl p-4 space-y-3 bg-slate-50/50">
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-xl bg-slate-200 overflow-hidden shrink-0">
                    <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                  </div>
                  <button
                    onClick={() => handleDeleteProduct(p.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="Delete listing"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-emerald-700 uppercase">{p.category}</span>
                  <h4 className="font-bold text-sm text-slate-900 line-clamp-1">{p.name}</h4>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-sm font-black text-emerald-700">₹{p.discounted_price}</span>
                    <span className="text-xs text-slate-400 line-through">₹{p.original_price}</span>
                    <span className="text-[10px] text-slate-500">({p.quantity} {p.unit} in stock)</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                  <StatusBadge status={p.status} size="sm" />
                  <Link to={`/products/${p.id}`} className="hover:text-emerald-700 flex items-center font-medium">
                    View <ExternalLink className="w-3 h-3 ml-0.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
