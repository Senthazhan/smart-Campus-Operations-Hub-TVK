import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAdminAnalytics, getUserAnalytics } from '../api/analyticsApi';
import { listEbooks, listEbookReports, pendingEbookSubmissions } from '../api/ebooksApi';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { StatusIndicator } from '../components/common/StatusIndicator';
import { 
  CalendarDays, 
  Ticket, 
  LayoutGrid, 
  Activity, 
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Users,
  ChevronRight,
  Clock,
  Zap,
  Sparkles,
  RefreshCw,
  MoreVertical,
  BarChart3,
  BookOpen,
  Flag,
  UploadCloud
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell, Legend,
  PieChart, Pie
} from 'recharts';
import { useTheme } from '../context/ThemeContext';
import clsx from 'clsx';

/**
 * Premium Dashboard Page
 * Features theme-aware analytics, high-gloss metric cards, and a sophisticated data layout.
 */
export function DashboardPage() {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const isAdmin = user?.role?.name === 'ADMIN' || user?.role === 'ADMIN';
  const [data, setData] = useState(null);
  const [range, setRange] = useState(7);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [ebookStats, setEbookStats] = useState({ totalBooks: 0, totalReports: 0, pendingUploads: 0 });

  // Sri Lanka Standard Time (UTC+5:30) greeting
  const hour = parseInt(
    new Date().toLocaleString('en-US', { hour: 'numeric', hour12: false, timeZone: 'Asia/Colombo' })
  );
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const d = isAdmin ? await getAdminAnalytics(range) : await getUserAnalytics();
      console.log('Dashboard Analytics Data:', d);
      setData(d);

      if (isAdmin) {
        const [books, reports, pending] = await Promise.all([
          listEbooks({ page: 0, size: 1 }),
          listEbookReports({ page: 0, size: 1 }),
          pendingEbookSubmissions({ page: 0, size: 1 })
        ]);
        setEbookStats({
          totalBooks: books?.totalElements ?? books?.content?.length ?? 0,
          totalReports: reports?.totalElements ?? reports?.content?.length ?? 0,
          pendingUploads: pending?.totalElements ?? pending?.content?.length ?? 0
        });
      }
    } catch (e) {
      setError(e?.response?.data?.error?.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, [isAdmin, range]);

  // Premium Trend Data (Now sourced from backend)
  const chartData = data?.trends || [];

  const pieData = data ? [
    { name: 'Resources', value: data.totalResources },
    { name: 'Active Nodes', value: data.activeUsers },
    { name: 'Anomalies', value: data.openTickets }
  ] : [];

  const CHART_COLORS = [
    'hsl(230, 85%, 60%)', // Primary Sapphire
    'hsl(158, 65%, 45%)', // Success Emerald
    'hsl(0, 75%, 60%)'    // Error Rose
  ];

  const StatCard = ({ title, value, trend, icon: Icon, colorClass, gradientClass }) => (
    <div className="card-premium p-6 group overflow-hidden relative">
      <div className={clsx("absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-[0.03] transition-transform duration-700 group-hover:scale-150", gradientClass)} />
      
      <div className="flex items-start justify-between relative z-10">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className={clsx("w-8 h-8 rounded-lg flex items-center justify-center border shadow-soft", colorClass)}>
              <Icon className="w-4.5 h-4.5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-muted)]">{title}</span>
          </div>
          
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-[var(--color-text)] tracking-tighter">{value}</span>
            {trend && (
              <div className={clsx(
                "flex items-center gap-0.5 text-[10px] font-black px-1.5 py-0.5 rounded-md border",
                trend > 0 ? "bg-success/10 text-success border-success/20" : "bg-error/10 text-error border-error/20"
              )}>
                {trend > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {Math.abs(trend)}%
              </div>
            )}
          </div>
        </div>
        <button className="text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors">
          <MoreVertical className="w-4 h-4 opacity-40 group-hover:opacity-100" />
        </button>
      </div>
      
      <div className="mt-4 h-1 w-full bg-[var(--color-bg-alt)] rounded-full overflow-hidden">
        <div 
          className={clsx("h-full transition-all duration-1000 ease-out", gradientClass.replace('bg-', 'bg-'))} 
          style={{ width: '65%' }} 
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-10 animate-fade-in-up pb-10">
      {/* ── SaaS Dashboard Header ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div>
           <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-muted)] opacity-80">Platform Analytics</span>
           </div>
           <h2 className="text-4xl font-black tracking-tighter text-[var(--color-text)] italic">
             {greeting}, {user?.fullName?.split(' ')[0] || 'Member'}
           </h2>
           <p className="text-[var(--color-text-secondary)] font-medium mt-1 leading-none">Operational intelligence and infrastructure status.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={refresh} isLoading={loading} leftIcon={<RefreshCw className={clsx("w-4 h-4", loading && "animate-spin")} />}>
            Sync
          </Button>
          <Button onClick={() => navigate('/resources')} className="shadow-lg shadow-primary/20" leftIcon={<Zap className="w-4 h-4" />}>
            New Operation
          </Button>
        </div>
      </div>

      {error && (
        <div className="card-premium p-6 border-error/20 bg-error/5 flex items-center gap-5 border-dashed">
           <div className="w-14 h-14 bg-error text-white rounded-2xl flex items-center justify-center shadow-xl shadow-error/20">
              <Activity className="w-7 h-7" />
           </div>
           <div className="flex-1">
              <h4 className="text-lg font-black text-[var(--color-text)] tracking-tight">System Anomaly Detected</h4>
              <p className="text-sm text-[var(--color-text-secondary)] font-medium italic opacity-80">{error}</p>
           </div>
           <Button variant="danger" size="sm" onClick={refresh}>Hard Refresh</Button>
        </div>
      )}

      {loading && !data && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
           {[1, 2, 3, 4].map(i => (
             <div key={i} className="h-40 bg-[var(--color-bg-alt)] border border-[var(--color-border)] animate-pulse rounded-[32px]" />
           ))}
        </div>
      )}

      {data && (
        <>
          {/* ── High-Velocity Metrics ── */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard 
              title="Global Assets" 
              value={data.totalResources} 
              trend={0} 
              icon={LayoutGrid} 
              colorClass="bg-primary/10 text-primary border-primary/20"
              gradientClass="bg-primary"
            />
            <StatCard 
              title="e-Books" 
              value={ebookStats.totalBooks} 
              trend={0} 
              icon={BookOpen} 
              colorClass="bg-warning/10 text-warning border-warning/20"
              gradientClass="bg-warning"
            />
            <StatCard 
              title="User Reports" 
              value={ebookStats.totalReports} 
              trend={0} 
              icon={Flag} 
              colorClass="bg-error/10 text-error border-error/20"
              gradientClass="bg-error"
            />
            <StatCard 
              title="User Throughput" 
              value={data.activeUsers} 
              trend={0} 
              icon={Users} 
              colorClass="bg-success/10 text-success border-success/20"
              gradientClass="bg-success"
            />
          </div>

          {/* ── Analytics Visualizations ── */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Booking Area Chart */}
            <div className="lg:col-span-2 card-premium p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                   <h3 className="text-xl font-black text-[var(--color-text)] tracking-tight">Operational Trends</h3>
                   <p className="text-[10px] font-black text-[var(--color-muted)] uppercase tracking-widest mt-1">Resource Utilization & Anomalies</p>
                </div>
                <div className="flex items-center gap-2 p-1.5 bg-[var(--color-bg-alt)] rounded-xl border border-[var(--color-border)]">
                   <button 
                     onClick={() => setRange(7)}
                     className={clsx(
                       "px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all",
                       range === 7 ? "bg-[var(--color-surface)] shadow-sm" : "text-[var(--color-muted)] hover:text-[var(--color-text)]"
                     )}
                   >
                     7 Days
                   </button>
                   <button 
                     onClick={() => setRange(30)}
                     className={clsx(
                       "px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all",
                       range === 30 ? "bg-[var(--color-surface)] shadow-sm" : "text-[var(--color-muted)] hover:text-[var(--color-text)]"
                     )}
                   >
                     30 Days
                   </button>
                </div>
              </div>
              
              <div className="h-80 w-full mt-2" style={{ minHeight: '320px' }}>
                <ResponsiveContainer width="100%" height="100%" debounce={1} minWidth={300} minHeight={300}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorPrimary" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(230, 85%, 60%)" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="hsl(230, 85%, 60%)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="var(--color-border)" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fontWeight: 800, fill: 'var(--color-muted)' }} 
                      dy={15}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fontWeight: 800, fill: 'var(--color-muted)' }} 
                      dx={-10}
                      domain={[0, 'auto']}
                      allowDecimals={false}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'var(--color-surface)', 
                        borderRadius: '24px', 
                        border: '1px solid var(--color-border)',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                        padding: '12px 16px',
                        zIndex: 100
                      }}
                      itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                      labelStyle={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px', color: 'var(--color-muted)' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="bookings" 
                      stroke="hsl(230, 85%, 60%)" 
                      strokeWidth={4}
                      fillOpacity={1} 
                      fill="url(#colorPrimary)" 
                      animationDuration={1500}
                      connectNulls
                    />
                    <Area 
                      type="monotone" 
                      dataKey="tickets" 
                      stroke="hsl(0, 75%, 60%)" 
                      strokeWidth={3}
                      strokeDasharray="5 5"
                      fill="transparent"
                      animationDuration={1500}
                      connectNulls
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Resource Catalog Pie Chart */}
            <div className="card-premium p-8">
              <div className="mb-8">
                 <h3 className="text-xl font-black text-[var(--color-text)] tracking-tight italic">Resource Catalog</h3>
                 <p className="text-[10px] font-black text-[var(--color-muted)] uppercase tracking-widest mt-1">Infrastructure Distribution</p>
              </div>
              
              <div className="h-64 w-full flex items-center justify-center relative" style={{ minHeight: '256px' }}>
                <ResponsiveContainer width="100%" height="100%" debounce={1}>
                  <PieChart>
                    <Pie
                      data={data?.resourceDistribution || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={90}
                      paddingAngle={8}
                      dataKey="count"
                      nameKey="label"
                      stroke="none"
                      animationBegin={200}
                      animationDuration={1200}
                    >
                      {(data?.resourceDistribution || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'var(--color-surface)', 
                        borderRadius: '16px', 
                        border: '1px solid var(--color-border)',
                        fontSize: '11px',
                        fontWeight: 'bold'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                
                {/* Center Stat */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-2">
                   <span className="text-3xl font-black text-[var(--color-text)] leading-none">{data.totalResources}</span>
                   <span className="text-[8px] font-black text-[var(--color-muted)] uppercase tracking-[0.2em] mt-1">Total Assets</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mt-8">
                {(data?.resourceDistribution || []).map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--color-bg-alt)] border border-[var(--color-border)]">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                      <span className="text-[10px] font-black text-[var(--color-text)] uppercase tracking-tighter truncate">{item.label}</span>
                    </div>
                    <span className="text-xs font-black text-primary ml-2">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Sub-System Monitoring ── */}
          <div className="flex items-center gap-3 mt-6">
             <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <BarChart3 className="w-5 h-5" />
             </div>
             <div>
                <h3 className="text-xl font-black text-[var(--color-text)] tracking-tight italic">Live Monitoring</h3>
                <p className="text-[10px] font-black text-[var(--color-muted)] uppercase tracking-widest">Real-time infrastructure feeds</p>
             </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* e-Books Activity Feed */}
            <div className="card-premium overflow-hidden p-0">
               <div className="p-6 border-b border-[var(--color-border)] flex items-center justify-between bg-[var(--color-bg-alt)]/30">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center border border-primary/20"><BookOpen className="w-5 h-5" /></div>
                    <div>
                      <h3 className="text-base font-black text-[var(--color-text)] tracking-tight italic">e-Book Activity</h3>
                      <p className="text-[9px] font-black text-[var(--color-muted)] uppercase tracking-widest mt-0.5">Uploads & Reports</p>
                    </div>
                  </div>
                  <Badge variant="primary">LIVE STREAM</Badge>
               </div>
               
               <div className="divide-y divide-[var(--color-border)]">
                  {[
                    { label: 'Library titles', count: ebookStats.totalBooks, icon: BookOpen, status: 'info' },
                    { label: 'Pending uploads', count: ebookStats.pendingUploads, icon: UploadCloud, status: 'warning' },
                    { label: 'User reports', count: ebookStats.totalReports, icon: Flag, status: 'danger' }
                  ].map((x, i) => {
                    const Icon = x.icon;
                    return (
                      <div key={x.label} className="flex items-center justify-between p-5 hover:bg-[var(--color-primary-soft)] transition-colors duration-300 cursor-pointer group/row">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-[var(--color-bg-alt)] flex items-center justify-center text-primary border border-[var(--color-border)] group-hover/row:border-primary/30 transition-all">
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-sm font-black text-[var(--color-text)] tracking-tight uppercase tracking-tighter">{x.label}</div>
                            <div className="flex items-center gap-1.5 mt-1">
                              <Clock className="w-3.5 h-3.5 text-[var(--color-muted)]" />
                              <span className="text-[10px] font-black text-[var(--color-muted)] uppercase tracking-widest">Updated: just now</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-lg font-black text-primary">{x.count}</div>
                          <StatusIndicator status={x.status} />
                        </div>
                      </div>
                    );
                  })}
               </div>
               
               <Button 
                variant="ghost" 
                className="w-full h-14 text-[10px] font-black uppercase tracking-[0.2em] justify-between rounded-none border-t border-[var(--color-border)] hover:bg-[var(--color-bg-alt)] mt-auto"
                onClick={() => navigate('/admin/e-books')}
              >
                Open e-Books Console <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            {/* System Alerts Feed */}
            <div className="card-premium overflow-hidden p-0 border-error/10 hover:border-error/30">
               <div className="p-6 border-b border-[var(--color-border)] flex items-center justify-between bg-error/5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-error/10 text-error rounded-xl flex items-center justify-center border border-error/20"><Activity className="w-5 h-5" /></div>
                    <div>
                      <h3 className="text-base font-black text-[var(--color-text)] tracking-tight italic">Critical Events</h3>
                      <p className="text-[9px] font-black text-[var(--color-muted)] uppercase tracking-widest mt-0.5">High Priority Log</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-error animate-ping" />
                     <Badge variant="error">CRITICAL</Badge>
                  </div>
               </div>
               
               <div className="divide-y divide-[var(--color-border)]">
                  {(data.ticketsByStatus || []).length > 0 ? data.ticketsByStatus.slice(0, 4).map((x, i) => (
                    <div key={i} className="flex items-center justify-between p-5 hover:bg-error/5 transition-colors duration-300 cursor-pointer group/row">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-xl bg-[var(--color-bg-alt)] flex items-center justify-center font-black text-xs text-error border border-[var(--color-border)] group-hover/row:border-error/30 transition-all">#{i+1}</div>
                           <div>
                              <div className="text-sm font-black text-[var(--color-text)] tracking-tight uppercase tracking-tighter">{x.label}</div>
                              <div className="flex items-center gap-1.5 mt-1">
                                 <Zap className="w-3.5 h-3.5 text-error opacity-60" />
                                 <span className="text-[10px] font-black text-[var(--color-muted)] uppercase tracking-widest">Origin: Node_12</span>
                              </div>
                           </div>
                        </div>
                        <div className="flex items-center gap-3">
                           <div className="text-lg font-black text-error">{x.count}</div>
                           <StatusIndicator status={x.label === 'CRITICAL' ? 'error' : x.label === 'HIGH' ? 'warning' : 'info'} />
                        </div>
                    </div>
                  )) : (
                    <div className="py-20 text-center text-[var(--color-muted)] italic font-bold opacity-30">
                      SYSTEM_EQUILIBRIUM_MAINTAINED
                    </div>
                  )}
               </div>
               
               <Button 
                variant="ghost" 
                className="w-full h-14 text-[10px] font-black uppercase tracking-[0.2em] justify-between rounded-none border-t border-[var(--color-border)] hover:bg-error/5 text-error mt-auto"
                onClick={() => navigate(isAdmin ? '/admin/tickets' : '/tickets')}
              >
                Enter Incident Center <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
