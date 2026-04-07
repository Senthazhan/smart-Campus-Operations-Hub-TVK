import React from 'react';
import clsx from 'clsx';

export function Select({ label, hint, error, options = [], className, containerClassName, ...props }) {
  return (
    <div className={clsx('flex flex-col gap-1 w-full', containerClassName)}>
      {label && <span className="text-[9px] font-black text-[var(--color-muted)] uppercase tracking-widest ml-0.5">{label}</span>}
      <div className="relative">
        <select
          className={clsx(
            'input-premium pr-10 appearance-none cursor-pointer',
            error && 'border-error/60 focus:border-error focus:ring-error/10',
            className
          )}
          {...props}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        {/* Custom arrow icon could be added here if needed, but keeping it minimal */}
      </div>
      {error && <span className="text-[10px] font-bold text-error ml-0.5">{error}</span>}
      {!error && hint && <span className="text-[10px] text-[var(--color-muted)] font-medium ml-0.5">{hint}</span>}
    </div>
  );
}

