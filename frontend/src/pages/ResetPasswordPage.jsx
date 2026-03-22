import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { AuthLayout } from '../components/layout/AuthLayout';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Lock, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import axios from 'axios';

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [tokenValid, setTokenValid] = useState(null); // null = loading
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setTokenValid(false);
      return;
    }
    axios.get(`/api/v1/auth/validate-reset-token?token=${token}`)
      .then(res => {
        setTokenValid(res.data?.data === true);
      })
      .catch(() => setTokenValid(false));
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await axios.post('/api/v1/auth/reset-password', { token, newPassword });
      setSuccess(true);
      setTimeout(() => navigate('/login', { state: { passwordReset: true } }), 2500);
    } catch (err) {
      setError(err?.response?.data?.error?.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  // Loading state while validating
  if (tokenValid === null) {
    return (
      <AuthLayout title="Verifying link..." subtitle="Please wait while we validate your reset link">
        <div className="flex flex-col items-center gap-5 py-10">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-4 border-primary/15" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin" />
            <div className="absolute inset-[14px] rounded-full bg-primary/20 animate-pulse" />
          </div>
          <p className="text-[11px] font-black uppercase tracking-[0.25em] text-[var(--color-muted)] animate-pulse">Checking your reset link...</p>
        </div>
      </AuthLayout>
    );
  }

  // Invalid token
  if (!tokenValid) {
    return (
      <AuthLayout title="Link Expired or Invalid" subtitle="This password reset link is no longer valid">
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-[var(--color-bg-alt)] border-2 border-red-500/20 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-10 h-10 text-red-500/80" />
          </div>
          <div className="space-y-2">
            <p className="text-[var(--color-text)] font-bold uppercase tracking-tight">Link Expired or Invalid</p>
            <p className="text-[var(--color-text-secondary)] text-sm font-medium">Reset links are valid for 1 hour. Please request a new one.</p>
          </div>
          <div className="flex flex-col gap-3">
            <Link to="/forgot-password">
              <Button className="w-full rounded-2xl font-black uppercase tracking-widest text-[11px] h-12">
                Request New Link
              </Button>
            </Link>
            <Link to="/login" className="inline-flex items-center justify-center gap-2 text-slate-500 text-sm font-medium hover:text-indigo-600 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  // Success state
  if (success) {
    return (
      <AuthLayout title="Password Reset!" subtitle="Your password has been changed successfully">
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-[var(--color-bg-alt)] border-2 border-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10 text-emerald-500" />
          </div>
          <div className="space-y-2">
            <p className="text-[var(--color-text)] font-bold text-lg italic tracking-tight">All done! 🎉</p>
            <p className="text-[var(--color-text-secondary)] text-sm font-medium">Redirecting you to login...</p>
          </div>
        </div>
      </AuthLayout>
    );
  }

  // Reset form
  return (
    <AuthLayout
      title="Set New Password"
      subtitle="Enter a new secure password for your account"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm font-medium">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        )}

        <Input
          label="New Password"
          name="newPassword"
          type="password"
          placeholder="At least 6 characters"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          icon={<Lock className="w-4 h-4" />}
          required
        />

        <Input
          label="Confirm New Password"
          name="confirmPassword"
          type="password"
          placeholder="Repeat your password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          icon={<Lock className="w-4 h-4" />}
          required
        />

        {/* Password strength hints */}
        {newPassword.length > 0 && (
          <div className="space-y-1">
            <div className={`flex items-center gap-2 text-xs font-medium ${newPassword.length >= 6 ? 'text-emerald-600' : 'text-slate-400'}`}>
              <div className={`w-2 h-2 rounded-full ${newPassword.length >= 6 ? 'bg-emerald-500' : 'bg-slate-200'}`} />
              At least 6 characters
            </div>
            <div className={`flex items-center gap-2 text-xs font-medium ${/[A-Z]/.test(newPassword) ? 'text-emerald-600' : 'text-slate-400'}`}>
              <div className={`w-2 h-2 rounded-full ${/[A-Z]/.test(newPassword) ? 'bg-emerald-500' : 'bg-slate-200'}`} />
              Contains an uppercase letter
            </div>
            <div className={`flex items-center gap-2 text-xs font-medium ${/[0-9]/.test(newPassword) ? 'text-emerald-600' : 'text-slate-400'}`}>
              <div className={`w-2 h-2 rounded-full ${/[0-9]/.test(newPassword) ? 'bg-emerald-500' : 'bg-slate-200'}`} />
              Contains a number
            </div>
          </div>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-2xl gap-2 text-lg font-bold shadow-lg shadow-blue-100"
        >
          {loading ? (
            <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            'Reset Password'
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}
