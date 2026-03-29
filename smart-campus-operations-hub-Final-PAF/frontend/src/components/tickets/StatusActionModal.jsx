import React, { useState } from 'react';
import { X, ShieldAlert, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '../common/Button';
import { Card } from '../common/Card';

export function StatusActionModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  description, 
  label, 
  placeholder, 
  confirmLabel,
  variant = 'primary',
  busy = false
}) {
  const [value, setValue] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!value.trim() || busy) return;
    onConfirm(value.trim());
    setValue('');
  };

  const variantStyles = {
    primary: {
      icon: <ShieldAlert className="w-6 h-6 text-primary" />,
      bg: 'bg-primary/5',
      border: 'border-primary/20',
      btn: 'bg-primary text-white shadow-premium'
    },
    success: {
      icon: <CheckCircle2 className="w-6 h-6 text-success" />,
      bg: 'bg-success/5',
      border: 'border-success/20',
      btn: 'bg-success text-white shadow-premium shadow-success/20'
    },
    danger: {
      icon: <AlertCircle className="w-6 h-6 text-error" />,
      bg: 'bg-error/5',
      border: 'border-error/20',
      btn: 'bg-error text-white shadow-premium shadow-error/20'
    }
  };

  const style = variantStyles[variant] || variantStyles.primary;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 animate-fade-in">
      <Card className="w-full max-w-[380px] p-0 overflow-hidden shadow-2xl bg-[var(--color-surface)] border-[var(--color-border)] rounded-2xl animate-fade-in-up">
        <div className={`p-4 ${style.bg} border-b border-[var(--color-border)] relative`}>
          <button 
            onClick={onClose}
            className="absolute top-3 right-3 p-1 rounded-full hover:bg-[var(--color-background)] text-[var(--color-muted)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center shadow-sm border border-[var(--color-border)]">
              {React.cloneElement(style.icon, { className: 'w-4 h-4' })}
            </div>
            <div>
              <h3 className="text-base font-black text-[var(--color-text)] tracking-tight leading-tight">{title}</h3>
              <p className="text-[9px] font-medium text-[var(--color-muted)] mt-0.5">{description}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <div className="space-y-1.5">
            <label className="text-[8px] font-black text-[var(--color-muted)] uppercase tracking-widest pl-1">
              {label}
            </label>
            <textarea
              autoFocus
              className="w-full h-16 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] p-3 text-sm font-medium outline-none transition-all focus:ring-8 focus:ring-primary/5 focus:border-primary placeholder:text-[var(--color-muted)] shadow-inner resize-none scrollbar-none"
              placeholder={placeholder}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              required
            />
          </div>

          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={busy || !value.trim()}
              className={`flex-[2] h-10 rounded-lg font-black uppercase tracking-widest text-[9px] ${style.btn}`}
            >
              {busy ? 'Syncing...' : confirmLabel}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={busy}
              className="flex-1 h-10 rounded-lg font-black uppercase tracking-widest text-[9px]"
            >
              Abort
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
