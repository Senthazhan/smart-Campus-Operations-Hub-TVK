import React from 'react';
import clsx from 'clsx';

export function Card({ children, className = '', title, subtitle, footer, p = '6' }) {
  const paddingClass = `p-${p}`;
  
  return (
    <div className={clsx('card-premium overflow-hidden', className)}>
      {(title || subtitle) && (
        <div className="px-6 py-4 border-b border-[var(--color-border)] bg-[var(--color-surface)]/40">
          {title && <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-muted)]">{title}</h3>}
          {subtitle && <p className="text-xs font-medium text-[var(--color-text)] mt-1">{subtitle}</p>}
        </div>
      )}
      <div className={clsx('transition-colors', paddingClass)}>
        {children}
      </div>
      {footer && (
        <div className="px-6 py-3.5 bg-[var(--color-bg)]/50 border-t border-[var(--color-border)]">
          {footer}
        </div>
      )}
    </div>
  );
}
