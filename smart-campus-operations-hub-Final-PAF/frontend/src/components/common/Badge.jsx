import React from 'react';
import clsx from 'clsx';

/**
 * Premium Badge Component
 * High-quality pill style with HSL-aware variants and high contrast text.
 */
export function Badge({ children, variant = 'primary', className = '' }) {
  const variants = {
    primary: 'bg-primary/10 text-primary border-primary/20',
    secondary: 'bg-[var(--color-bg-alt)] text-[var(--color-text-secondary)] border-[var(--color-border)]',
    success: 'bg-success/10 text-success border-success/20',
    error: 'bg-error/10 text-error border-error/20',
    warning: 'bg-warning/10 text-warning border-warning/20',
    info: 'bg-info/10 text-info border-info/20',
    ghost: 'bg-transparent text-[var(--color-muted)] border-[var(--color-border)]'
  };

  return (
    <span className={clsx(
      'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-[0.1em] transition-all duration-300',
      variants[variant] || variants.primary,
      className
    )}>
      {children}
    </span>
  );
}
