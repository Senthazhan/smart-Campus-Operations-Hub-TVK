import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthLayout } from '../components/layout/AuthLayout';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await axios.post('/api/v1/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      setError(err?.response?.data?.error?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <AuthLayout
        title="Check Your Inbox"
        subtitle="We've dispatched a secure reset link to your registered email"
      >
        <div className="text-center space-y-8 py-4">
          <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
             <div className="absolute inset-0 bg-emerald-500/10 rounded-full animate-ping opacity-20" />
             <div className="relative w-24 h-24 bg-[var(--color-surface)] border border-emerald-500/20 rounded-full flex items-center justify-center shadow-premium backdrop-blur-sm">
                <CheckCircle className="w-12 h-12 text-emerald-500" />
             </div>
          </div>
          
          <div className="space-y-3">
            <p className="text-[var(--color-text)] font-black text-xl tracking-tight uppercase">Transmission Success</p>
            <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed max-w-xs mx-auto font-medium">
              If an account is associated with <strong>{email}</strong>, you will receive a security credential reset link shortly.
            </p>
            <div className="pt-4 p-4 bg-[var(--color-bg-alt)] rounded-2xl border border-[var(--color-border)] text-[10px] text-[var(--color-muted)] font-bold uppercase tracking-widest leading-relaxed">
              Link expires in 60 minutes <br/> 
              Check spam if not received within 2 minutes
            </div>
          </div>

          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-primary font-black uppercase tracking-widest text-[11px] hover:text-primary-hover transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Proceed to Login
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Security Recovery"
      subtitle="Enter your credentials to receive an authentication reset link"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm font-medium">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        )}

        <Input
          label="Email Address"
          name="email"
          type="email"
          placeholder="you@university.edu"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={<Mail className="w-4 h-4" />}
          required
        />

        <Button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-2xl gap-2 text-lg font-bold shadow-lg shadow-blue-100"
        >
          {loading ? (
            <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            'Send Reset Link'
          )}
        </Button>

        <div className="text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-slate-500 font-medium hover:text-indigo-600 transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
