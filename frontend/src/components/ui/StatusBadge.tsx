import React from 'react';

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  let styles = '';
  let label = status.replace(/_/g, ' ');

  switch (status.toUpperCase()) {
    case 'AVAILABLE':
      styles = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      break;
    case 'ON_TRIP':
      styles = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      break;
    case 'IN_SHOP':
      styles = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      break;
    case 'RETIRED':
    case 'SUSPENDED':
      styles = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      break;
    case 'OFF_DUTY':
    case 'DRAFT':
    case 'CANCELLED':
    default:
      styles = 'bg-gray-500/10 text-gray-400 border-gray-800';
      break;
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles}`}
    >
      {label}
    </span>
  );
}
