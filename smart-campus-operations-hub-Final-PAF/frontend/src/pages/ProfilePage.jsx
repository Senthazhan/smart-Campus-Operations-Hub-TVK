import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  changePassword as changePasswordApi,
  updateProfile as updateProfileApi,
  updateAvatar as updateAvatarApi,
  getAvatarUrl,
} from '../api/profileApi';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Input } from '../components/common/Input';
import {
  User,
  Mail,
  ShieldCheck,
  LogOut,
  CheckCircle2,
  Camera,
  Lock,
  X,
  AlertCircle,
  Phone,
  Building2,
  Save,
  Edit2,
  KeyRound,
  Image as ImageIcon,
  Sparkles,
  Zap,
  Globe,
  Clock as ClockIcon
} from 'lucide-react';
import clsx from 'clsx';

/**
 * Premium Profile Page
 * Redesigned with high-gloss card clusters, premium typography, and role-based metadata.
 */
export function ProfilePage() {
  const { user, logout, updateUser } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [showPwdModal, setShowPwdModal] = useState(false);

  const [loading, setLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');

  const [avatarFailed, setAvatarFailed] = useState(false);
  const [avatarVersion, setAvatarVersion] = useState(Date.now());

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    department: '',
    language: 'en',
    timezone: 'UTC',
    emailNotifications: true,
    pushNotifications: true,
  });

  const [pwdData, setPwdData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const fileInputRef = useRef(null);


  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        phone: user.phone || '',
        department: user.department || '',
        language: user.language || 'en',
        timezone: user.timezone || 'UTC',
        emailNotifications: user.emailNotifications !== false,
        pushNotifications: user.pushNotifications !== false,
      });
    }
  }, [user]);

  useEffect(() => {
    setAvatarFailed(false);
    setAvatarVersion(Date.now());
  }, [user?.avatarUrl]);

  const initials = useMemo(() => {
    if (!user?.fullName) return 'U';
    return user.fullName
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }, [user]);

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setSuccess('');

    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a PNG, JPG, or WEBP image.');
      e.target.value = '';
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Profile image must be less than 10MB.');
      e.target.value = '';
      return;
    }

    const body = new FormData();
    body.append('file', file);

    setAvatarLoading(true);
    try {
      const res = await updateAvatarApi(body);
      if (res.success) {
        updateUser(res.data);
        setAvatarFailed(false);
        setAvatarVersion(Date.now());
        setSuccess('Profile image updated successfully.');
      } else {
        setError(res.error?.message || 'Failed to update profile image.');
      }
    } catch (err) {
      setError(err.message || 'Failed to update profile image.');
    } finally {
      setAvatarLoading(false);
      e.target.value = '';
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const cleanedName = formData.fullName.trim();
    if (!cleanedName) {
      setError('Name is required.');
      return;
    }

    setLoading(true);
    try {
      const res = await updateProfileApi({
        ...formData,
        fullName: cleanedName,
      });

      if (res.success) {
        updateUser(res.data);
        setSuccess('Profile updated successfully.');
        setIsEditing(false);
      } else {
        setError(res.error?.message || 'Failed to update profile.');
      }
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handlePwdChange = async (e) => {
    e.preventDefault();
    setPwdError('');
    setPwdSuccess('');

    if (!pwdData.oldPassword || !pwdData.newPassword || !pwdData.confirmPassword) {
      setPwdError('All password fields are required.');
      return;
    }

    if (pwdData.newPassword.length < 6) {
      setPwdError('New password must be at least 6 characters.');
      return;
    }

    if (pwdData.newPassword !== pwdData.confirmPassword) {
      setPwdError('Confirm password does not match.');
      return;
    }

    setPwdLoading(true);
    try {
      const res = await changePasswordApi({
        oldPassword: pwdData.oldPassword,
        newPassword: pwdData.newPassword,
      });

      if (res.success) {
        setPwdSuccess('Password changed successfully.');
        setPwdData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => {
          setShowPwdModal(false);
          setPwdSuccess('');
        }, 1500);
      } else {
        setPwdError(res.error?.message || 'Failed to change password.');
      }
    } catch (err) {
      setPwdError(err.message || 'Failed to change password.');
    } finally {
      setPwdLoading(false);
    }
  };

  const avatarSrc = getAvatarUrl(user?.avatarUrl, avatarVersion);

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-fade-in-up pb-10">
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 px-2">
        <div>
          <div className="flex items-center gap-2 mb-2">
             <User className="w-4 h-4 text-primary" />
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-muted)]">User Ecosystem</span>
          </div>
          <h2 className="text-4xl font-black tracking-tighter text-[var(--color-text)] italic underline decoration-primary/10 decoration-8 underline-offset-[-2px]">Profile Management</h2>
          <p className="text-[var(--color-text-secondary)] font-medium mt-1 leading-none italic opacity-80">Orchestrate your identity and security protocols.</p>
        </div>
        
        <Button
          variant="secondary"
          onClick={handleLogout}
          size="lg"
          className="h-14 px-8 rounded-2xl border-[var(--color-border)] text-error hover:bg-error/5 group"
          leftIcon={<LogOut className="w-4.5 h-4.5 group-hover:rotate-12 transition-transform" />}
        >
          Sign Out of Nexus
        </Button>
      </div>

      {(error || success) && (
        <div
          className={clsx(
            "p-6 rounded-[32px] border flex items-center gap-4 animate-shake relative overflow-hidden",
            error ? 'bg-error/5 border-error/10 text-error' : 'bg-success/5 border-success/10 text-success'
          )}
        >
          <div className={clsx("absolute inset-y-0 left-0 w-1.5", error ? "bg-error" : "bg-success")} />
          {error ? <AlertCircle className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
          <span className="text-xs font-black uppercase tracking-[0.05em]">{error || success}</span>
        </div>
      )}

      <div className="grid lg:grid-cols-12 gap-8">
        {/* ── Left Cluster: Identity ── */}
        <div className="lg:col-span-4 space-y-6">
           <Card className="p-10 rounded-[40px] border-[var(--color-border)] shadow-premium relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-primary/5 rounded-full blur-[80px] -mr-24 -mt-24 group-hover:bg-primary/10 transition-colors duration-700" />
              
              <div className="flex flex-col items-center text-center relative z-10">
                <div className="relative group/avatar">
                  <div className="w-40 h-40 rounded-[48px] overflow-hidden border-8 border-[var(--color-surface)] shadow-2xl bg-[var(--color-bg-alt)] flex items-center justify-center transition-transform duration-500 group-hover/avatar:scale-105 group-hover/avatar:rotate-3">
                    {avatarSrc && !avatarFailed ? (
                      <img
                        src={avatarSrc}
                        alt="Profile"
                        className="w-full h-full object-cover"
                        onError={() => setAvatarFailed(true)}
                      />
                    ) : (
                      <span className="text-5xl font-black text-primary italic">{initials}</span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleAvatarClick}
                    disabled={avatarLoading}
                    className="absolute -bottom-2 -right-2 w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center shadow-xl shadow-primary/40 hover:scale-110 active:scale-95 transition-all duration-300 border-4 border-[var(--color-surface)]"
                  >
                    {avatarLoading ? (
                      <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Camera className="w-6 h-6" />
                    )}
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>

                <div className="mt-8">
                   <div className="flex items-center justify-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-primary opacity-40" />
                      <span className="text-[10px] font-black text-[var(--color-muted)] uppercase tracking-[0.3em]">Authorized Entity</span>
                   </div>
                   <h2 className="text-3xl font-black text-[var(--color-text)] tracking-tighter italic leading-none">
                     {user?.fullName?.split(' ')[0] || 'Member'} <br />
                     <span className="text-primary">{user?.fullName?.split(' ').slice(1).join(' ') || 'User'}</span>
                   </h2>
                   <p className="text-[10px] font-black text-[var(--color-muted)] uppercase tracking-widest mt-4 opacity-60">{user?.email}</p>
                </div>

                <div className="mt-8 flex flex-wrap justify-center gap-2">
                   <Badge variant="primary" className="px-5 py-2 rounded-xl h-10 shadow-soft">{user?.role?.name || 'USER'}</Badge>
                   <div className="w-10 h-10 rounded-xl bg-[var(--color-bg-alt)] border border-[var(--color-border)] flex items-center justify-center text-primary">
                      <ShieldCheck className="w-5 h-5" />
                   </div>
                </div>
              </div>
           </Card>

           <div className="card-premium p-8 border-dashed flex items-center gap-6">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl border border-primary/20 flex items-center justify-center text-primary shrink-0 transition-transform hover:rotate-12">
                 <ImageIcon className="w-7 h-7" />
              </div>
              <div>
                 <h4 className="text-sm font-black text-[var(--color-text)] tracking-tight italic uppercase">Visual Identity</h4>
                 <p className="text-[10px] font-medium text-[var(--color-muted)] mt-1 leading-relaxed italic">Allowed: PNG, JPG, WEBP. <br /> Maximum Payload: 10.0 MB</p>
              </div>
           </div>
        </div>

        {/* ── Right Cluster: Protocols ── */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="p-10 rounded-[40px] border-[var(--color-border)] shadow-premium">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
              <div>
                <h3 className="text-2xl font-black text-[var(--color-text)] tracking-tighter italic underline decoration-primary/5 decoration-4">Personal Metadata</h3>
                <p className="text-[10px] font-black text-[var(--color-muted)] uppercase tracking-widest mt-1">Operational details and department mapping</p>
              </div>

              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)} size="lg" className="h-12 px-6 rounded-2xl shadow-soft" leftIcon={<Edit2 className="w-4 h-4" />}>
                  Modify Core
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  onClick={() => setIsEditing(false)}
                  className="h-12 px-6 rounded-2xl border-[var(--color-border)] text-[var(--color-text)]"
                  leftIcon={<X className="w-4 h-4 text-error" />}
                >
                  Cancel Edit
                </Button>
              )}
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <Input
                    label="Full Name Alias"
                    icon={<User className="w-4.5 h-4.5" />}
                    value={formData.fullName}
                    className="bg-[var(--color-bg-alt)]/50"
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    disabled={!isEditing}
                  />

                  <Input
                    label="System Identity (Email)"
                    icon={<Mail className="w-4.5 h-4.5" />}
                    value={user?.email || ''}
                    className="bg-[var(--color-bg-alt)]/50 opacity-60"
                    disabled
                  />
                </div>

                <div className="space-y-6">
                  <Input
                    label="In-Bound Comms (Phone)"
                    icon={<Phone className="w-4.5 h-4.5" />}
                    value={formData.phone}
                    className="bg-[var(--color-bg-alt)]/50"
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    disabled={!isEditing}
                    placeholder="+94 77 123 4567"
                  />

                  <Input
                    label="Locality / Department"
                    icon={<Building2 className="w-4.5 h-4.5" />}
                    value={formData.department}
                    className="bg-[var(--color-bg-alt)]/50"
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    disabled={!isEditing}
                    placeholder="IT Orchestration"
                  />
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8 pt-4 border-t border-[var(--color-divider)]">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[var(--color-bg-alt)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-muted)]">
                       <Globe className="w-5 h-5" />
                    </div>
                    <div>
                       <span className="text-[9px] font-black text-[var(--color-muted)] uppercase tracking-widest">Protocol Lang</span>
                       <p className="text-sm font-black text-[var(--color-text)] tracking-tight italic">English (Global)</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[var(--color-bg-alt)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-muted)]">
                       <ClockIcon className="w-5 h-5" />
                    </div>
                    <div>
                       <span className="text-[9px] font-black text-[var(--color-muted)] uppercase tracking-widest">System Delta (TZ)</span>
                       <p className="text-sm font-black text-[var(--color-text)] tracking-tight italic">UTC+5:30 (SLT)</p>
                    </div>
                 </div>
              </div>

              {isEditing && (
                <div className="flex justify-end gap-4 pt-8">
                  <Button
                    type="submit"
                    isLoading={loading}
                    size="lg"
                    className="h-14 px-10 rounded-[20px] shadow-lg shadow-primary/20"
                    leftIcon={<Save className="w-5 h-5" />}
                  >
                    Commit Metadata
                  </Button>
                </div>
              )}
            </form>
          </Card>

          <div className="card-premium p-10 rounded-[40px] border-[var(--color-border)] shadow-premium bg-gradient-to-r from-[var(--color-surface)] to-[var(--color-bg-alt)]/30 border-dashed">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 rounded-[24px] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 shadow-inner">
                   <KeyRound className="w-8 h-8 opacity-60" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-[var(--color-text)] tracking-tighter italic">Security Orchestration</h3>
                  <p className="text-[11px] font-medium text-[var(--color-muted)] mt-2 leading-relaxed italic opacity-80">
                    Your account is protected by industry-standard encryption protocols. Reset your password regularly to maintain peak security.
                  </p>
                </div>
              </div>

              <Button
                variant="soft"
                size="lg"
                onClick={() => {
                  setPwdError('');
                  setPwdSuccess('');
                  setPwdData({ oldPassword: '', newPassword: '', confirmPassword: '' });
                  setShowPwdModal(true);
                }}
                className="h-14 px-8 rounded-2xl shrink-0 group shadow-soft"
                leftIcon={<Lock className="w-5 h-5 text-primary group-hover:rotate-12 transition-transform" />}
              >
                Reset Access Protocol
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ── High-Fidelity Security Modal ── */}
      {showPwdModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 animate-fade-in">
           <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setShowPwdModal(false)} />
           
           <div className="relative bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-fade-in-up">
               <div className="p-6 border-b border-[var(--color-divider)] flex items-center justify-between bg-[var(--color-bg-alt)]/30">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-inner">
                       <Lock className="w-5 h-5" />
                     </div>
                     <div>
                       <h4 className="text-lg font-black text-[var(--color-text)] tracking-tighter italic">Key Reset</h4>
                       <p className="text-[9px] font-black text-[var(--color-muted)] uppercase tracking-widest mt-0.5 opacity-60">Credentials Update</p>
                     </div>
                  </div>

                  <button
                   type="button"
                   onClick={() => setShowPwdModal(false)}
                   className="p-2 rounded-xl bg-[var(--color-bg-alt)] border border-[var(--color-border)] flex items-center justify-center hover:bg-error/10 hover:text-error transition-all"
                  >
                     <X className="w-5 h-5" />
                  </button>
               </div>

               <div className="p-6">
                 {(pwdError || pwdSuccess) && (
                   <div
                     className={clsx(
                       "p-3 rounded-xl border flex items-center gap-3 mb-5",
                       pwdError ? 'bg-error/5 border-error/20 text-error' : 'bg-success/5 border-success/10 text-success'
                     )}
                   >
                     {pwdError ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                     <span className="text-[9px] font-black uppercase tracking-widest">{pwdError || pwdSuccess}</span>
                   </div>
                 )}

                 <form onSubmit={handlePwdChange} className="space-y-4">
                   <Input
                     label="Current Access Key"
                     type="password"
                     required
                     icon={<KeyRound className="w-4 h-4" />}
                     value={pwdData.oldPassword}
                     className="bg-[var(--color-bg-alt)]/50 h-10 rounded-lg text-sm"
                     onChange={(e) => setPwdData({ ...pwdData, oldPassword: e.target.value })}
                   />

                   <Input
                     label="New Operational Key"
                     type="password"
                     required
                     icon={<Lock className="w-4 h-4" />}
                     value={pwdData.newPassword}
                     className="bg-[var(--color-bg-alt)]/50 h-10 rounded-lg text-sm"
                     onChange={(e) => setPwdData({ ...pwdData, newPassword: e.target.value })}
                     hint="Min 6 characters"
                   />

                   <Input
                     label="Verify New Key"
                     type="password"
                     required
                     icon={<ShieldCheck className="w-4 h-4" />}
                     value={pwdData.confirmPassword}
                     className="bg-[var(--color-bg-alt)]/50 h-10 rounded-lg text-sm"
                     onChange={(e) => setPwdData({ ...pwdData, confirmPassword: e.target.value })}
                   />

                   <div className="flex gap-3 pt-4 border-t border-[var(--color-divider)]">
                     <Button
                       type="button"
                       variant="secondary"
                       className="flex-1 h-11 rounded-xl font-black uppercase tracking-widest text-[9px]"
                       onClick={() => setShowPwdModal(false)}
                     >
                       Abort
                     </Button>

                     <Button type="submit" isLoading={pwdLoading} className="flex-1 h-11 rounded-xl font-black uppercase tracking-widest text-[9px] shadow-lg shadow-primary/20 text-white">
                       Commit Reset
                     </Button>
                   </div>
                 </form>
               </div>
           </div>
        </div>
      )}
    </div>
  );
}