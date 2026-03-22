import React from 'react';
import clsx from 'clsx';

/**
 * Premium Button Component
 * Supports multiple variants including 'soft' for high-quality SaaS feel.
 */
export function Button({ 
  variant = 'primary', 
  size = 'md', 
  isLoading = false,
  leftIcon,
  rightIcon,
  className, 
  children,
  ...props 
}) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-xl font-bold transition-all duration-300 active:scale-[0.96] disabled:pointer-events-none disabled:opacity-40 select-none cursor-pointer';
  
  const variants = {
    primary:
      'bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary-hover hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5',
    secondary:
      'border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-bg-alt)] hover:border-[var(--color-primary-border)] hover:text-primary hover:-translate-y-0.5 shadow-soft',
    soft:
      'bg-primary/10 text-primary border border-primary/10 hover:bg-primary/20 hover:border-primary/20',
    danger: 
      'bg-error text-white shadow-lg shadow-error/20 hover:bg-red-600 hover:shadow-xl hover:shadow-error/30 hover:-translate-y-0.5',
    ghost: 
      'text-[var(--color-text-secondary)] hover:bg-[var(--color-primary-soft)] hover:text-primary',
    outline:
      'border-2 border-primary text-primary hover:bg-primary hover:text-white hover:shadow-lg hover:shadow-primary/20',
  };

  const sizes = {
    sm: 'px-3.5 py-2 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3.5 text-base',
  };

  return (
    <button 
      className={clsx(base, variants[variant], sizes[size], className)} 
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && (
        <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin flex-shrink-0" />
      )}
      {!isLoading && leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
    </button>
  );
}
