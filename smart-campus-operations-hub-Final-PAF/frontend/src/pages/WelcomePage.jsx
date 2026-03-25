import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Package,
  CalendarCheck,
  Ticket,
  Bell,
  ArrowRight,
  BookOpen,
  Cpu,
  ShieldCheck,
  Activity,
  Zap,
  MapPin,
  Users,
  Clock,
  CheckCircle2,
  ClipboardList,
  Headphones,
  Sparkles,
  TrendingUp,
  Layout
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import clsx from 'clsx';

/**
 * Premium Welcome Page
 * Redesigned for high impact with role-aware Hero sections and Quick Actions.
 */
export function WelcomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const isAdmin = user?.role?.name === 'ADMIN' || user?.role === 'ADMIN';
  const isTechnician = user?.role?.name === 'TECHNICIAN' || user?.role === 'TECHNICIAN';
  const firstName = user?.fullName?.split(' ')[0] || user?.username || 'Member';

  const now = new Date();
  const hour = parseInt(
    now.toLocaleString('en-US', { hour: 'numeric', hour12: false, timeZone: 'Asia/Colombo' })
  );
  
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const features = [
    {
      icon: Package,
      title: 'Resource Catalogue',
      desc: 'Explore and discover available campus facilities and equipment.',
      to: '/resources',
      color: 'primary'
    },
    {
      icon: CalendarCheck,
      title: 'Secure Booking',
      desc: 'Reserve your workspace or equipment with automated approval flows.',
      to: '/my-bookings',
      color: 'success'
    },
    {
      icon: Ticket,
      title: 'Support Center',
      desc: 'Submit technical tickets or report infrastructure issues.',
      to: '/tickets',
      color: 'error'
    },
    {
      icon: Bell,
      title: 'Action Center',
      desc: 'Stay synchronized with real-time operational notifications.',
      to: '/notifications',
      color: 'warning'
    }
  ];

  const highlights = [
    { icon: Cpu, title: 'Smart Infrastructure', desc: 'IoT-ready management for all facilities.' },
    { icon: ShieldCheck, title: 'Role Architecture', desc: 'Secure, precision-mapped user access.' },
    { icon: Activity, title: 'Operational Delta', desc: 'Real-time throughput and status tracking.' },
    { icon: TrendingUp, title: 'Scale Efficiency', desc: 'Optimizing resource allocation campus-wide.' }
  ];

  return (
    <div className="space-y-12 animate-fade-in-up pb-10">
      {/* ── High-Impact Hero Section ── */}
      <section className="relative group">
        <div className="absolute inset-0 bg-primary blur-[100px] opacity-10 rounded-full scale-90 transition-transform duration-700 group-hover:scale-110" />
        
        <div className="relative overflow-hidden rounded-[40px] bg-slate-950 p-10 md:p-16 border border-white/5 shadow-2xl">
          {/* Animated Background Gradients */}
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] -mr-48 -mt-48 transition-all duration-700 group-hover:bg-primary/30" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-[80px] -ml-24 -mb-24" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.05] pointer-events-none" />

          <div className="relative z-20 flex flex-col lg:flex-row lg:items-center justify-between gap-12">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80">
                  Campus Operations OS v2.0
                </span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter leading-[1.05] mb-6">
                {greeting}, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-400">
                  {firstName}.
                </span>
              </h1>
              
              <p className="text-slate-400 text-lg md:text-xl leading-relaxed font-medium mb-10 max-w-lg">
                {isAdmin 
                  ? "Welcome to the central command hub. You hold full governance over campus resources, user orchestration, and operational integrity."
                  : isTechnician 
                    ? "Your technical queue is synchronized. Access maintenance protocols and infrastructure tickets to ensure campus peak-performance."
                    : "Welcome to your digital campus workspace. Discover resources, manage bookings, and stay connected with the pulse of campus operations."}
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <Button 
                  size="lg" 
                  onClick={() => navigate(isAdmin ? '/dashboard' : isTechnician ? '/technician/dashboard' : '/resources')}
                  className="px-10 h-14"
                >
                  {isAdmin ? "Launch Dashboard" : isTechnician ? "Enter Workspace" : "Explore Catalogue"}
                </Button>
                <Button 
                  variant="secondary" 
                  size="lg" 
                  onClick={() => navigate('/notifications')}
                  className="bg-white/5 border-white/10 text-white hover:bg-white/10 px-10 h-14"
                  leftIcon={<Bell className="w-5 h-5 text-primary" />}
                >
                   Action Center
                </Button>
              </div>
            </div>

            {/* Premium Stats Grid */}
            <div className="grid grid-cols-2 gap-4 lg:w-[400px] shrink-0">
               {[
                  { label: "Status", value: "Optimal", icon: Activity, color: "text-success" },
                  { label: "Sync", value: "Real-time", icon: Zap, color: "text-primary" },
                  { label: "Uptime", value: "99.9%", icon: CheckCircle2, color: "text-indigo-400" },
                  { label: "Load", value: "Stable", icon: TrendingUp, color: "text-warning" }
               ].map((stat, i) => (
                 <div key={i} className="p-6 rounded-[32px] bg-white/5 border border-white/10 backdrop-blur-xl hover:bg-white/10 transition-all duration-300 group/stat">
                   <stat.icon className={clsx("w-6 h-6 mb-4 transition-transform group-hover/stat:scale-110", stat.color)} />
                   <div className="text-2xl font-black text-white">{stat.value}</div>
                   <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">{stat.label}</div>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Dynamic Action Center ── */}
      <section>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Layout className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-[var(--color-text)] tracking-tight italic">Deep Services</h2>
            <p className="text-[10px] font-black text-[var(--color-muted)] uppercase tracking-widest">Select an operation to begin</p>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <div 
              key={i}
              onClick={() => navigate(f.to)}
              className="card-premium p-8 group cursor-pointer relative overflow-hidden"
            >
              <div className={clsx(
                "absolute -right-8 -bottom-8 w-32 h-32 rounded-full opacity-5 transition-transform duration-700 group-hover:scale-150",
                f.color === 'primary' && "bg-primary",
                f.color === 'success' && "bg-success",
                f.color === 'error' && "bg-error",
                f.color === 'warning' && "bg-warning"
              )} />
              
              <div className={clsx(
                "w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-soft",
                f.color === 'primary' && "bg-primary/10 text-primary",
                f.color === 'success' && "bg-success/10 text-success",
                f.color === 'error' && "bg-error/10 text-error",
                f.color === 'warning' && "bg-warning/10 text-warning"
              )}>
                <f.icon className="w-7 h-7" />
              </div>
              
              <h3 className="text-lg font-black text-[var(--color-text)] mb-2 tracking-tight">{f.title}</h3>
              <p className="text-sm text-[var(--color-text-secondary)] font-medium leading-relaxed mb-6 italic opacity-80">{f.desc}</p>
              
              <div className={clsx(
                "flex items-center gap-2 text-xs font-black uppercase tracking-widest opacity-0 -translate-x-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0",
                f.color === 'primary' && "text-primary",
                f.color === 'success' && "text-success",
                f.color === 'error' && "text-error",
                f.color === 'warning' && "text-warning"
              )}>
                Initialize <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Enterprise Overview ── */}
      <section className="card-premium overflow-hidden">
        <div className="grid lg:grid-cols-[1fr_1.5fr]">
          <div className="p-10 lg:p-14 bg-[var(--color-bg-alt)]/50 border-r border-[var(--color-border)]">
             <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center text-primary mb-8 shadow-inner">
               <ShieldCheck className="w-6 h-6" />
             </div>
             <h2 className="text-3xl font-black text-[var(--color-text)] tracking-tighter mb-4 leading-none italic">The Ops Ecosystem.</h2>
             <p className="text-[var(--color-text-secondary)] font-medium leading-relaxed mb-8 opacity-80">
               SmartHub is more than a management tool—it's a high-performance ecosystem designed to bridge infrastructure and innovation.
             </p>
             <div className="flex flex-wrap gap-2">
                {[ "ISO-27001 Ready", "256-bit AES", "Real-time Sync", "Auto-Governor" ].map(tag => (
                  <span key={tag} className="px-3 py-1.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-[9px] font-black uppercase tracking-widest text-[var(--color-muted)]">
                    {tag}
                  </span>
                ))}
             </div>
          </div>

          <div className="p-10 lg:p-14 grid sm:grid-cols-2 gap-8 bg-[var(--color-surface)]">
             {highlights.map((h, i) => (
               <div key={i} className="group/highlight">
                  <div className="w-10 h-10 rounded-xl bg-[var(--color-bg-alt)] flex items-center justify-center mb-5 group-hover/highlight:bg-primary transition-all duration-300 group-hover/highlight:shadow-lg group-hover/highlight:shadow-primary/20">
                    <h.icon className="w-5 h-5 text-[var(--color-muted)] group-hover/highlight:text-white" />
                  </div>
                  <h4 className="text-base font-black text-[var(--color-text)] mb-2 tracking-tight group-hover/highlight:text-primary transition-colors">{h.title}</h4>
                  <p className="text-xs text-[var(--color-text-secondary)] font-medium leading-relaxed italic opacity-70">{h.desc}</p>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* ── Final Interaction ── */}
      {!isAdmin && (
        <section className="card-premium p-8 flex flex-col sm:flex-row items-center justify-between gap-8 bg-gradient-to-r from-[var(--color-surface)] to-[var(--color-bg-alt)]/30 border-dashed">
          <div className="flex items-center gap-6">
             <div className="w-16 h-16 rounded-[24px] bg-primary/5 border border-primary/10 flex items-center justify-center text-primary shrink-0 shadow-inner">
                <Headphones className="w-8 h-8 opacity-60" />
             </div>
             <div>
                <h3 className="text-lg font-black text-[var(--color-text)] tracking-tight leading-none italic">Need Expert Assistance?</h3>
                <p className="text-sm text-[var(--color-muted)] font-medium mt-2 leading-tight">Our technical orchestration team is ready to assist with any operational issues.</p>
             </div>
          </div>
          <Button onClick={() => navigate('/tickets/new')} size="lg" className="px-10 h-14 shrink-0 shadow-soft">
            Initiate Ticket
          </Button>
        </section>
      )}
    </div>
  );
}
