import React from 'react';
import clsx from 'clsx';

export function BookingStatusBadge({ value }) {
  const map = {
    PENDING: 'bg-amber-600/10 text-amber-700 border-amber-200',
    APPROVED: 'bg-emerald-600/10 text-emerald-700 border-emerald-200',
    REJECTED: 'bg-red-600/10 text-red-700 border-red-200',
    CANCELLED: 'bg-slate-600/10 text-slate-700 border-slate-200',
    EXPIRED: 'bg-rose-600/10 text-rose-700 border-rose-200',
  };
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold',
        map[value] || 'bg-black/5 text-[var(--color-muted)] border-[var(--color-border)]'
      )}
    >
      {value}
    </span>
  );
}

