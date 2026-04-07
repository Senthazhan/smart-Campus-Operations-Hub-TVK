import React from 'react';
import clsx from 'clsx';

export function StatusIndicator({ status = 'info', label, className }) {
  const statuses = {
    success: 'bg-success shadow-[0_0_8px_rgba(34,197,94,0.4)]',
    error: 'bg-error shadow-[0_0_8px_rgba(239,68,68,0.4)]',
    warning: 'bg-warning shadow-[0_0_8px_rgba(245,158,11,0.4)]',
    info: 'bg-primary shadow-[0_0_8px_rgba(37,99,235,0.4)]',
    neutral: 'bg-slate-400',
  };

  return (
    <div className={clsx('flex items-center gap-2', className)}>
      <div className={clsx('w-2 h-2 rounded-full', statuses[status] || statuses.info)} />
      {label && <span className="text-xs font-bold text-[var(--color-text)] uppercase tracking-tight">{label}</span>}
    </div>
  );
}
