import React from 'react';
import clsx from 'clsx';

export function StatusBadge({ value }) {
  const map = {
    ACTIVE: 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-[0_1px_2px_rgba(16,185,129,0.1)]',
    UNDER_MAINTENANCE: 'bg-amber-50 text-amber-700 border-amber-200 shadow-[0_1px_2px_rgba(245,158,11,0.1)]',
    OUT_OF_SERVICE: 'bg-red-50 text-red-700 border-red-200 shadow-[0_1px_2px_rgba(239,68,68,0.1)]',
  };
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide',
        map[value] || 'bg-black/5 text-[var(--color-muted)] border-[var(--color-border)]'
      )}
    >
      {value}
    </span>
  );
}

