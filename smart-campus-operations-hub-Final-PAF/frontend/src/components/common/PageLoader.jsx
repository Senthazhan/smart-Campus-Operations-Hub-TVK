import React from 'react';
import clsx from 'clsx';

/**
 * Unified, premium full-page loader used across the application.
 * Provides a consistent, on-brand loading experience.
 */
export function PageLoader({ text = 'Loading...', className }) {
  return (
    <div
      className={clsx(
        'min-h-[40vh] flex flex-col items-center justify-center gap-6 p-10',
        className
      )}
    >
      {/* Dual-ring spinner using brand primary color */}
      <div className="relative w-14 h-14">
        {/* Outer dim ring */}
        <div className="absolute inset-0 rounded-full border-4 border-primary/15" />
        {/* Spinning accent */}
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin" />
        {/* Inner pulsing dot */}
        <div className="absolute inset-[18px] rounded-full bg-primary/20 animate-pulse" />
      </div>

      {text && (
        <p className="text-[11px] font-black uppercase tracking-[0.25em] text-[var(--color-muted)] animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
}

/**
 * Card-variant loader – fills a card/panel instead of a full screen.
 */
export function CardLoader({ text = 'Fetching data...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 bg-[var(--color-surface)] rounded-3xl border border-[var(--color-border)] shadow-soft">
      <div className="relative w-14 h-14 mb-6">
        <div className="absolute inset-0 rounded-[1.2rem] border-4 border-primary/15" />
        <div className="absolute inset-0 rounded-[1.2rem] border-4 border-transparent border-t-primary animate-spin" />
        <div className="absolute inset-[18px] rounded-full bg-primary/20 animate-pulse" />
      </div>
      <p className="text-[11px] font-black uppercase tracking-[0.25em] text-[var(--color-muted)] animate-pulse">
        {text}
      </p>
    </div>
  );
}
