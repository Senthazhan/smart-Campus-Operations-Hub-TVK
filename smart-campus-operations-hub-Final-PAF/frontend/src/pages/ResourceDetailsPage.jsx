import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getResource } from '../api/resourcesApi';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { StatusIndicator } from '../components/common/StatusIndicator';
import { 
  Box,
  ChevronRight,
  BookOpen,
  Presentation,
  Mic2,
  FlaskConical,
  Monitor,
  Building2,
  Users,
  ArrowLeft,
  Edit3,
  Zap,
  Info,
  Layers,
  ShieldCheck,
  Globe,
  DoorOpen,
  Calendar,
  MapPin
} from 'lucide-react';

export function ResourceDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const me = useSelector((s) => s.auth.me);
  const isAdmin = me?.role?.name === 'ADMIN' || me?.role === 'ADMIN';

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    getResource(id)
      .then((d) => {
        if (!alive) return;
        setData(d);
      })
      .catch((e) => {
        if (!alive) return;
        setError(e?.response?.data?.error?.message || 'Failed to load resource');
      })
      .finally(() => {
        if (!alive) return;
        setLoading(false);
      });
    return () => { alive = false; };
  }, [id]);

  const STATUS_MAP = {
    ACTIVE: 'success',
    UNDER_MAINTENANCE: 'warning',
    OUT_OF_SERVICE: 'error',
  };

  const TYPE_ICONS = {
    LECTURE_HALL: Building2,
    LAB: FlaskConical,
    MEETING_ROOM: Users,
    EQUIPMENT: Monitor,
    SEMINAR_ROOM: Presentation,
    AUDITORIUM: Mic2,
    STUDY_ROOM: BookOpen,
  };

  const Icon = data ? (TYPE_ICONS[data.type] || Box) : Box;

  const next7Days = React.useMemo(() => {
    const base = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      const day = d.toLocaleDateString(undefined, { weekday: 'short' });

      const status = data?.status;
      let state = 'ONLINE';
      if (status === 'OUT_OF_SERVICE') state = 'UNAVAILABLE';
      else if (status === 'UNDER_MAINTENANCE' || status === 'MAINTENANCE') state = i === 0 ? 'UNAVAILABLE' : 'ONLINE';
      else if (status === 'ACTIVE') state = 'ONLINE';
      else state = 'ONLINE';

      return { day, state, isToday: i === 0 };
    });
  }, [data?.status]);

  return (
    <div className="space-y-8 animate-fade-in-up pb-20">
      {/* Navigation & Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="secondary" 
            onClick={() => navigate('/resources')}
            className="p-2.5 min-w-0 rounded-2xl border-[var(--color-border)] hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2 mb-1">
               <Icon className="w-4 h-4 text-primary" />
               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-muted)]">Asset Identity: {data?.resourceCode || '...'}</span>
            </div>
            <h2 className="text-3xl font-black tracking-tight text-[var(--color-text)]">
              {loading ? 'Decrypting Records...' : data?.name}
            </h2>
          </div>
        </div>
        
        {isAdmin && !loading && data && (
          <Button 
            onClick={() => navigate(`/admin/resources/${id}/edit`)}
            className="gap-2 shadow-premium"
          >
            <Edit3 className="w-4 h-4" />
            Configure Node
          </Button>
        )}
      </div>

      {loading ? (
        <div className="grid lg:grid-cols-12 gap-8">
           <div className="lg:col-span-8 h-[500px] bg-slate-100 dark:bg-slate-800 rounded-3xl animate-pulse" />
           <div className="lg:col-span-4 h-[500px] bg-slate-100 dark:bg-slate-800 rounded-3xl animate-pulse" />
        </div>
      ) : error ? (
        <Card className="bg-error/5 border-error/20 p-12 text-center">
           <Zap className="w-12 h-12 text-error mx-auto mb-4 opacity-30" />
           <h3 className="text-xl font-black text-[var(--color-text)] tracking-tight">Access Restricted</h3>
           <p className="text-[var(--color-muted)] mt-2 font-medium">{error}</p>
           <Button variant="secondary" className="mt-8" onClick={() => navigate('/resources')}>Return to Catalogue</Button>
        </Card>
      ) : data ? (
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Main Info Area */}
          <div className="lg:col-span-8 space-y-8">
            <Card className="overflow-hidden border-[var(--color-border)] p-0">
               <div className="p-8">
                  <div className="flex items-start justify-between gap-6 pb-8 border-b border-[var(--color-border)]">
                     <div className="space-y-4">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                              <Info className="w-5 h-5" />
                           </div>
                           <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[var(--color-text)]">Executive Summary</h3>
                        </div>
                        <p className="text-lg font-medium text-[var(--color-muted)] leading-relaxed italic">
                           "{data.description || 'No descriptive metadata has been indexed for this infrastructure asset.'}"
                        </p>
                     </div>
                     <StatusIndicator status={STATUS_MAP[data.status] || 'info'} label={data.status} className="scale-110" />
                  </div>

                  <div className="grid md:grid-cols-3 gap-8 pt-8">
                     <div className="space-y-3">
                        <div className="flex items-center gap-2 text-[10px] font-black text-[var(--color-muted)] uppercase tracking-widest">
                           <Layers className="w-3.5 h-3.5" /> Classification
                        </div>
                        <Badge variant="secondary" className="font-black uppercase tracking-widest text-[10px] py-1.5 px-4 rounded-xl">
                           {data.type.replace('_', ' ')}
                        </Badge>
                     </div>

                     <div className="space-y-3">
                        <div className="flex items-center gap-2 text-[10px] font-black text-[var(--color-muted)] uppercase tracking-widest">
                           <Users className="w-3.5 h-3.5" /> Capacity Limit
                        </div>
                        <div className="text-2xl font-black text-[var(--color-text)] flex items-baseline gap-1.5">
                           {data.capacity}
                           <span className="text-[10px] font-black text-[var(--color-muted)] uppercase tracking-tight">Units</span>
                        </div>
                     </div>

                     <div className="space-y-3">
                        <div className="flex items-center gap-2 text-[10px] font-black text-[var(--color-muted)] uppercase tracking-widest">
                           <ShieldCheck className="w-3.5 h-3.5" /> Governance
                        </div>
                        <div className="text-xs font-bold text-[var(--color-text)] border-l-2 border-primary pl-3 py-1 bg-primary/5 rounded-r-lg">
                           Authenticated Access Only
                        </div>
                     </div>
                  </div>
               </div>
               
               <div className="bg-[var(--color-surface)]/40 p-8 border-t border-[var(--color-border)]">
                  <div className="flex items-center gap-3 mb-6">
                     <div className="w-8 h-8 rounded-lg bg-success/10 text-success flex items-center justify-center border border-success/20">
                        <Globe className="w-4 h-4" />
                     </div>
                     <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--color-muted)]">Node Availability</h4>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
                     {next7Days.map(({ day, state, isToday }) => {
                       const isOnline = state === 'ONLINE';
                       return (
                         <div
                           key={`${day}-${isToday ? 'today' : ''}`}
                           className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-[var(--color-border)] text-center shadow-soft"
                         >
                           <div className="text-[10px] font-black uppercase text-[var(--color-muted)] mb-1">
                             {day}{isToday ? ' (Today)' : ''}
                           </div>
                           <div className={`text-[11px] font-bold uppercase tracking-tighter ${isOnline ? 'text-success' : 'text-error'}`}>
                             {isOnline ? 'Online' : 'U.A'}
                           </div>
                         </div>
                       );
                     })}
                  </div>
               </div>
            </Card>
          </div>

          {/* Sidebar Area */}
          <div className="lg:col-span-4 space-y-8">
            <Card className="p-8 border-[var(--color-border)] shadow-premium space-y-8">
               <div className="space-y-6">
                  <div className="pb-6 border-b border-[var(--color-border)]">
                     <h3 className="text-sm font-black uppercase tracking-widest text-[var(--color-text)] flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary" />
                        Location Grid
                     </h3>
                  </div>

                  <div className="space-y-6">
                     <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-[var(--color-border)] flex items-center justify-center text-[var(--color-muted)] group-hover:text-primary transition-colors">
                           <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                           <div className="text-[10px] font-black text-[var(--color-muted)] uppercase tracking-widest leading-none">Building Complex</div>
                           <div className="text-sm font-black text-[var(--color-text)] mt-1.5">{data.building}</div>
                        </div>
                     </div>

                     <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-[var(--color-border)] flex items-center justify-center text-[var(--color-muted)]">
                           <Layers className="w-5 h-5" />
                        </div>
                        <div>
                           <div className="text-[10px] font-black text-[var(--color-muted)] uppercase tracking-widest leading-none">Floor Level</div>
                           <div className="text-sm font-black text-[var(--color-text)] mt-1.5">Level {data.floor || '0 (Ground)'}</div>
                        </div>
                     </div>

                     <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-[var(--color-border)] flex items-center justify-center text-[var(--color-muted)]">
                           <DoorOpen className="w-5 h-5" />
                        </div>
                        <div>
                           <div className="text-[10px] font-black text-[var(--color-muted)] uppercase tracking-widest leading-none">Locale ID</div>
                           <div className="text-sm font-black text-[var(--color-text)] mt-1.5">{data.roomNumber || 'Access Point'}</div>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="pt-8 border-t border-[var(--color-border)]">
                  <Button 
                    onClick={() => navigate(`/bookings/new?resourceId=${data.id}`)}
                    className="w-full h-14 rounded-2xl shadow-premium font-black uppercase tracking-[0.2em] text-xs gap-3"
                  >
                     <Calendar className="w-4 h-4" />
                     Initialize Booking
                   </Button>
                  <p className="mt-4 text-[10px] font-black text-[var(--color-muted)] text-center uppercase tracking-widest flex items-center justify-center gap-2">
                     <ShieldCheck className="w-3 h-3" /> Subject to review
                  </p>
               </div>
            </Card>

            <div className="p-6 bg-slate-900 rounded-3xl shadow-xl space-y-4 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/30 transition-all" />
               <div className="relative z-10 flex items-center gap-4">
                  <div className="p-3 bg-white/10 rounded-xl backdrop-blur-md">
                     <Zap className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-white">
                     <div className="text-[9px] font-black uppercase tracking-[0.2em] text-primary">Quick Logic</div>
                     <div className="text-xs font-bold mt-1 tracking-tight leading-relaxed text-slate-300">
                        Instant handshake available for this asset category.
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

