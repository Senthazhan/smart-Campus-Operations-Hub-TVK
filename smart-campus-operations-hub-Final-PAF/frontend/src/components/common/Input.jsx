import React from 'react';
import clsx from 'clsx';

export function Input({ label, hint, error, icon, className, inputClassName, containerClassName, ...props }) {
  return (
    <div className={clsx('flex flex-col gap-1 w-full', containerClassName)}>
      {label && (
        <span className="text-[9px] font-black text-[var(--color-muted)] uppercase tracking-widest ml-0.5">
          {label}
        </span>
      )}

      <div className="relative">
        {icon && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)] pointer-events-none">
            {typeof icon === 'function' || (typeof icon === 'object' && icon.render)
              ? React.createElement(icon, { className: 'w-4 h-4 opacity-70' })
              : icon}
          </span>
        )}

        <input
          className={clsx(
            'input-premium',
            icon ? '!pl-11' : '',
            error && 'border-error/60 focus:border-error focus:ring-error/10',
            className,
            inputClassName
          )}
          {...props}
        />
      </div>

      {error && <span className="text-[10px] font-bold text-error ml-0.5">{error}</span>}
      {!error && hint && <span className="text-[10px] text-[var(--color-muted)] font-medium ml-0.5">{hint}</span>}
    </div>
  );
}