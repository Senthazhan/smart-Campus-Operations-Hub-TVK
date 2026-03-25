import React from 'react';

export function Card({ children, className = '', hover = true }) {
  return (
    <div className={`card-premium p-6 ${hover ? 'hover:shadow-card hover:-translate-y-0.5' : ''} ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, icon: Icon, className = '' }) {
  return (
    <div className={`flex items-start justify-between mb-6 ${className}`}>
      <div>
        {subtitle && <div className="text-xs font-bold text-[var(--color-primary)] uppercase tracking-wider mb-1">{subtitle}</div>}
        <h3 className="text-xl font-bold text-[var(--color-text)]">{title}</h3>
      </div>
      {Icon && (
        <div className="p-3 bg-slate-50 rounded-xl text-[var(--color-primary)]">
          <Icon className="w-6 h-6" />
        </div>
      )}
    </div>
  );
}
