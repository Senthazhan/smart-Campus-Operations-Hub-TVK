import React from 'react';
import { X, AlertTriangle, HelpCircle } from 'lucide-react';
import { Button } from './Button';
import { Card } from './Card';

/**
 * Premium Confirmation Modal
 * Replaces native window.confirm for a high-end experience.
 */
export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'System Confirmation',
  message = 'Are you sure you want to proceed with this operation?',
  confirmLabel = 'Confirm Action',
  cancelLabel = 'Abort',
  variant = 'danger', // danger, primary, warning
  isLoading = false
}) {
  if (!isOpen) return null;

  const themes = {
    danger: {
      icon: <AlertTriangle className="w-5 h-5 text-error" />,
      bg: 'bg-error/5',
      btn: 'danger'
    },
    warning: {
      icon: <AlertTriangle className="w-5 h-5 text-warning" />,
      bg: 'bg-warning/5',
      btn: 'primary'
    },
    primary: {
      icon: <HelpCircle className="w-5 h-5 text-primary" />,
      bg: 'bg-primary/5',
      btn: 'primary'
    }
  };

  const theme = themes[variant] || themes.danger;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 animate-fade-in">
      <div 
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" 
        onClick={!isLoading ? onClose : undefined} 
      />
      
      <Card className="relative w-full max-w-[360px] p-0 overflow-hidden shadow-2xl animate-fade-in-up border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className={`p-5 ${theme.bg} border-b border-[var(--color-border)] flex items-center gap-4`}>
          <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-[var(--color-border)] flex items-center justify-center shadow-sm">
            {theme.icon}
          </div>
          <div>
            <h3 className="text-sm font-black text-[var(--color-text)] uppercase tracking-tight leading-tight">{title}</h3>
            <p className="text-[9px] font-bold text-[var(--color-muted)] uppercase tracking-widest mt-0.5 opacity-60">Signature Required</p>
          </div>
          {!isLoading && (
            <button 
              onClick={onClose}
              className="ml-auto p-1.5 rounded-lg hover:bg-[var(--color-bg-alt)] text-[var(--color-muted)] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="p-5">
           <p className="text-sm font-medium text-[var(--color-text-secondary)] leading-relaxed italic border-l-2 border-primary/20 pl-4 py-1">
             "{message}"
           </p>

           <div className="flex gap-2 mt-6 pt-5 border-t border-[var(--color-border)]">
              <Button
                variant={theme.btn}
                className="flex-[2] h-10 text-[9px] font-black uppercase tracking-widest rounded-lg shadow-premium"
                onClick={onConfirm}
                isLoading={isLoading}
              >
                {confirmLabel}
              </Button>
              <Button
                variant="secondary"
                className="flex-1 h-10 text-[9px] font-black uppercase tracking-widest rounded-lg"
                onClick={onClose}
                disabled={isLoading}
              >
                {cancelLabel}
              </Button>
           </div>
        </div>
      </Card>
    </div>
  );
}
