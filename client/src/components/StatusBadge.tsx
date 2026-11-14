import React from 'react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const s = status.toLowerCase();

  let styles = 'bg-slate-100 text-slate-700 border-slate-200';
  let label = status;

  if (s === 'confirmed' || s === 'verified' || s === 'active' || s === 'accepted') {
    styles = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    label = s === 'confirmed' ? 'Confirmed' : s === 'verified' ? 'Verified Partner' : s === 'accepted' ? 'Accepted' : 'Active';
  } else if (s === 'completed') {
    styles = 'bg-blue-50 text-blue-700 border-blue-200';
    label = 'Completed';
  } else if (s === 'available') {
    styles = 'bg-green-50 text-green-700 border-green-200';
    label = 'Available';
  } else if (s === 'pending' || s === 'requested') {
    styles = 'bg-amber-50 text-amber-700 border-amber-200';
    label = s === 'requested' ? 'Requested' : 'Pending Verification';
  } else if (s === 'cancelled' || s === 'rejected' || s === 'sold_out' || s === 'expired') {
    styles = 'bg-rose-50 text-rose-700 border-rose-200';
    label = s === 'sold_out' ? 'Sold Out' : s === 'cancelled' ? 'Cancelled' : s === 'rejected' ? 'Rejected' : 'Expired';
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span className={`inline-flex items-center rounded-full border ${sizeClasses} ${styles}`}>
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70"></span>
      {label}
    </span>
  );
};
