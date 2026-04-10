import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const VARIANT_STYLES = {
  success: {
    panel: 'border-emerald-400/20 bg-emerald-500/10 text-emerald-200',
    iconWrap: 'bg-emerald-500/15 text-emerald-300',
    icon: CheckCircle2,
  },
  error: {
    panel: 'border-red-400/20 bg-red-500/10 text-red-200',
    iconWrap: 'bg-red-500/15 text-red-300',
    icon: AlertCircle,
  },
  info: {
    panel: 'border-primary/20 bg-primary/10 text-[var(--color-text)]',
    iconWrap: 'bg-primary/15 text-primary',
    icon: Info,
  },
};

export function Toast({ open, title, message, variant = 'success', onClose, duration = 2800 }) {
  useEffect(() => {
    if (!open || !onClose || duration <= 0) return undefined;
    const timer = window.setTimeout(() => onClose(), duration);
    return () => window.clearTimeout(timer);
  }, [open, onClose, duration]);

  if (!open) return null;

  const style = VARIANT_STYLES[variant] || VARIANT_STYLES.info;
  const Icon = style.icon;

  return (
    <div className="fixed top-5 right-5 z-[140] w-full max-w-sm animate-fade-in-up px-4 sm:px-0">
      <div className={`rounded-2xl border shadow-2xl backdrop-blur-xl ${style.panel}`}>
        <div className="flex items-start gap-3 p-4">
          <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${style.iconWrap}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-black tracking-tight">{title}</div>
            {message && <div className="mt-1 text-sm leading-relaxed opacity-90">{message}</div>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-current/70 transition hover:bg-white/10 hover:text-current"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
