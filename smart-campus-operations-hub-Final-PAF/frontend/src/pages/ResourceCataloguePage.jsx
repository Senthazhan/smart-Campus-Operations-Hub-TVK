import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { listResources } from '../api/resourcesApi';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Table, TableAction } from '../components/common/Table';
import { StatusIndicator } from '../components/common/StatusIndicator';
import { 
  Search, 
  Plus, 
  Filter, 
  MapPin, 
  Users, 
  Building2, 
  FlaskConical, 
  ChevronLeft,
  ChevronRight,
  Monitor,
  LayoutGrid,
  List,
  ArrowRight,
  Box,
  Layers,
  BookOpen,
  Presentation,
  Mic2,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import clsx from 'clsx';

const TYPE_ICONS = {
  LECTURE_HALL: Building2,
  LAB: FlaskConical,
  MEETING_ROOM: Users,
  EQUIPMENT: Monitor,
  SEMINAR_ROOM: Presentation,
  AUDITORIUM: Mic2,
  STUDY_ROOM: BookOpen,
};

const STATUS_VARIANTS = {
  ACTIVE: 'success',
  UNDER_MAINTENANCE: 'warning',
  OUT_OF_SERVICE: 'error',
};

/**
 * Premium Resource Catalogue Page
 * Features deep filtering, high-gloss grid/list toggle, and responsive data orchestration.
 */
export function ResourceCataloguePage() {
  const me = useSelector((s) => s.auth.me);
  const isAdmin = me?.role?.name === 'ADMIN' || me?.role === 'ADMIN';
  const navigate = useNavigate();

  const [viewMode, setViewMode] = useState('grid');
  const [q, setQ] = useState('');
  const [type, setType] = useState('');
  const [building, setBuilding] = useState('');
  const [page, setPage] = useState(0);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const queryParams = useMemo(() => {
    const p = { page, size: viewMode === 'grid' ? 12 : 10 };
    if (q) p.q = q;
    if (type) p.type = type;
    if (building) p.building = building;
    return p;
  }, [q, type, building, page, viewMode]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    listResources(queryParams)
      .then((d) => {
        if (!alive) return;
        setData(d);
      })
      .catch((e) => {
        if (!alive) return;
        setError(e?.response?.data?.error?.message || 'Failed to load resources');
      })
      .finally(() => {
        if (!alive) return;
        setLoading(false);
      });
    return () => { alive = false; };
  }, [queryParams]);

  const handleReset = () => {
    setQ('');
    setType('');
    setBuilding('');
    setPage(0);
  };

  return (
    <div className="space-y-10 animate-fade-in-up pb-10">
      {/* ── Page Header ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
             <Box className="w-4 h-4 text-primary" />
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-muted)]">Resource Catalogue</span>
          </div>
          <h2 className="text-4xl font-black tracking-tighter text-[var(--color-text)] italic underline decoration-primary/10 decoration-8 underline-offset-[-2px]">Campus Infrastructure</h2>
          <p className="text-[var(--color-text-secondary)] font-medium mt-1 leading-none italic opacity-80">Discover and book high-performance facilities and equipment.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center p-1.5 bg-[var(--color-bg-alt)] rounded-2xl border border-[var(--color-border)] shadow-soft">
             <button 
                onClick={() => setViewMode('grid')}
                className={clsx(
                  "p-2.5 rounded-xl transition-all duration-300",
                  viewMode === 'grid' ? "bg-[var(--color-surface)] shadow-card text-primary" : "text-[var(--color-muted)] hover:text-primary"
                )}
             >
                <LayoutGrid className="w-4.5 h-4.5" />
             </button>
             <button 
                onClick={() => setViewMode('list')}
                className={clsx(
                  "p-2.5 rounded-xl transition-all duration-300",
                  viewMode === 'list' ? "bg-[var(--color-surface)] shadow-card text-primary" : "text-[var(--color-muted)] hover:text-primary"
                )}
             >
                <List className="w-4.5 h-4.5" />
             </button>
          </div>
          {isAdmin && (
            <Button onClick={() => navigate('/resources/new')} className="shadow-lg shadow-primary/20" leftIcon={<Plus className="w-4 h-4" />}>
              Add Asset
            </Button>
          )}
        </div>
      </div>

      {/* ── Precision Filter Strip ── */}
      <div className="grid gap-4 lg:grid-cols-4 items-end card-premium p-6 border-dashed">
        <div className="lg:col-span-2">
           <Input 
              label="Asset Selection"
              placeholder="Search by name, ID or tags..." 
              icon={Search}
              value={q}
              className="bg-[var(--color-surface-soft)]"
              onChange={(e) => { setPage(0); setQ(e.target.value); }}
           />
        </div>
        <Select 
           label="Operational Type"
           value={type}
           className="bg-[var(--color-surface-soft)]"
           onChange={(e) => { setPage(0); setType(e.target.value); }}
           options={[
              { value: '', label: 'All Categories' },
              { value: 'LECTURE_HALL', label: 'Lecture Halls' },
              { value: 'LAB', label: 'Laboratories' },
              { value: 'MEETING_ROOM', label: 'Meeting Rooms' },
              { value: 'SEMINAR_ROOM', label: 'Seminar Rooms' },
              { value: 'AUDITORIUM', label: 'Auditoriums' },
              { value: 'STUDY_ROOM', label: 'Study Rooms' },
              { value: 'EQUIPMENT', label: 'Equipment' },
           ]}
        />
        <Select 
           label="Locality Matrix"
           value={building}
           className="bg-[var(--color-surface-soft)]"
           onChange={(e) => { setPage(0); setBuilding(e.target.value); }}
           options={[
             { value: '', label: 'All Locations' },
             { value: 'ENGINEERING', label: 'Engineering Block' },
             { value: 'SCIENCE', label: 'Science Precinct' },
             { value: 'ARTS', label: 'Arts Building' },
           ]}
        />
      </div>

      {/* ── Content Orchestration ── */}
      {loading && !data ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
           {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
             <div key={i} className="h-72 bg-[var(--color-bg-alt)] border border-[var(--color-border)] animate-pulse rounded-[32px]" />
           ))}
        </div>
      ) : error ? (
        <div className="card-premium p-16 text-center border-error/20 bg-error/5 border-dashed">
           <Filter className="w-16 h-16 mx-auto mb-6 text-error opacity-20" />
           <h3 className="text-xl font-black text-error italic mb-2 tracking-tight">System Filter Error</h3>
           <p className="text-sm font-medium text-[var(--color-text-secondary)]">{error}</p>
           <Button variant="secondary" onClick={handleReset} className="mt-8">Flush Filters</Button>
        </div>
      ) : data?.content?.length ? (
        <>
          {viewMode === 'grid' ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
               {data.content.map(r => {
                 const Icon = TYPE_ICONS[r.type] || Monitor;
                 return (
                   <div 
                     key={r.id} 
                     className="card-premium group p-0 relative flex flex-col h-full overflow-hidden border-[var(--color-border)] hover:border-primary/20"
                     onClick={() => navigate(`/resources/${r.id}`)}
                   >
                     {/* Gloss Overlay */}
                     <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                     
                     <div className="relative h-44 bg-[var(--color-bg-alt)] flex items-center justify-center overflow-hidden border-b border-[var(--color-border)]">
                        {r.imageUrl ? (
                          <img
                            src={r.imageUrl}
                            alt={r.name}
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                        ) : (
                          <>
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]" />
                            <Icon className="w-16 h-16 text-[var(--color-muted)]/20 group-hover:text-primary transition-all group-hover:scale-110 duration-700 blur-[0.5px] group-hover:blur-0" />
                          </>
                        )}
                        
                        <div className="absolute top-4 right-4 flex flex-col gap-2 scale-90 group-hover:scale-100 transition-transform">
                           <Badge variant={STATUS_VARIANTS[r.status] || 'secondary'}>{r.status}</Badge>
                        </div>
                        
                        <div className="absolute bottom-4 left-4 flex gap-2">
                           <Badge variant="ghost" className="bg-white/90 dark:bg-slate-900 shadow-md backdrop-blur-md border-white/20">
                              {r.type.toLowerCase().replace('_', ' ')}
                           </Badge>
                        </div>
                        
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                           <div className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center shadow-xl shadow-primary/40 rotate-12 group-hover:rotate-0 transition-transform duration-500">
                              <ExternalLink className="w-5 h-5" />
                           </div>
                        </div>
                     </div>

                     <div className="p-6 flex flex-col flex-1 relative z-10">
                        <div className="flex items-start justify-between gap-4 mb-5">
                           <div>
                              <div className="flex items-center gap-1.5 mb-1">
                                 <Sparkles className="w-3 h-3 text-primary opacity-40 group-hover:opacity-100 transition-opacity" />
                                 <span className="text-[9px] font-black font-mono tracking-widest text-[var(--color-muted)] uppercase">{r.resourceCode}</span>
                              </div>
                              <h3 className="text-base font-black text-[var(--color-text)] tracking-tight leading-tight italic group-hover:text-primary transition-colors">{r.name}</h3>
                           </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4">
                           <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-xl bg-[var(--color-surface-soft)] flex items-center justify-center border border-[var(--color-border)] text-[var(--color-muted)] group-hover:text-indigo-400 transition-colors">
                                <Users className="w-4 h-4" />
                              </div>
                              <span className="text-[11px] font-black text-[var(--color-text)]">{r.capacity} Users</span>
                           </div>
                           <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-xl bg-[var(--color-surface-soft)] flex items-center justify-center border border-[var(--color-border)] text-[var(--color-muted)] group-hover:text-emerald-400 transition-colors">
                                <MapPin className="w-3.5 h-3.5" />
                              </div>
                              <span className="text-[11px] font-black text-[var(--color-text)] truncate">{r.building}</span>
                           </div>
                        </div>
                        <div className="mb-4 text-[10px] font-black text-[var(--color-muted)] uppercase tracking-widest">
                          Availability: {r.availableFrom && r.availableTo ? `${r.availableFrom} - ${r.availableTo}` : "Not Set"}
                        </div>

                        <div className="mt-auto pt-5 border-t border-[var(--color-divider)] flex items-center justify-between">
                            <span className="text-[9px] font-black text-[var(--color-muted)] uppercase tracking-widest">Modified: 2h ago</span>
                            <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-300" />
                        </div>
                     </div>
                   </div>
                 );
               })}
            </div>
          ) : (
            <Table 
              headers={['Resource Identity', 'Classification', 'Matrix Location', 'Operational Delta']}
              isLoading={loading}
              emptyMessage="No registry matches found."
            >
              {data.content.map(r => {
                const Icon = TYPE_ICONS[r.type] || Monitor;
                return (
                  <tr 
                    key={r.id} 
                    className="group"
                    onClick={() => navigate(`/resources/${r.id}`)}
                  >
                    <td className="px-6 py-5">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-[18px] bg-[var(--color-bg-alt)] flex items-center justify-center text-[var(--color-muted)] group-hover:scale-110 group-hover:rotate-12 group-hover:text-primary transition-all duration-500 border border-[var(--color-border)] group-hover:border-primary/20 shadow-soft group-hover:shadow-lg group-hover:shadow-primary/10">
                             <Icon className="w-5.5 h-5.5" />
                          </div>
                          <div>
                             <div className="text-sm font-black text-[var(--color-text)] tracking-tight italic">{r.name}</div>
                             <div className="text-[9px] font-black font-mono text-[var(--color-muted)] uppercase tracking-widest mt-0.5">{r.resourceCode}</div>
                          </div>
                       </div>
                    </td>
                    <td className="px-6 py-5">
                       <div className="flex flex-col gap-1.5">
                          <Badge variant="primary" className="w-fit">{r.type.replace('_', ' ')}</Badge>
                          <div className="flex items-center gap-1.5 text-[11px] font-black text-[var(--color-muted)] px-1">
                             <Users className="w-3.5 h-3.5 opacity-50" />
                             Fits {r.capacity} Capacity
                          </div>
                       </div>
                    </td>
                    <td className="px-6 py-5">
                       <div className="text-[12px] font-black text-[var(--color-text)] tracking-tight">{r.building}</div>
                       <div className="text-[10px] font-bold text-[var(--color-muted)] uppercase tracking-widest mt-0.5">Floor Level {r.floor}</div>
                       <div className="text-[10px] font-bold text-[var(--color-muted)] uppercase tracking-widest mt-0.5">
                         {r.availableFrom && r.availableTo ? `${r.availableFrom} - ${r.availableTo}` : "Availability Not Set"}
                       </div>
                    </td>
                    <td className="px-6 py-5">
                       <div className="flex items-center justify-end gap-3">
                          <StatusIndicator status={STATUS_VARIANTS[r.status]} label={r.status} />
                          <TableAction icon={ArrowRight} onClick={() => navigate(`/resources/${r.id}`)} />
                       </div>
                    </td>
                  </tr>
                );
              })}
            </Table>
          )}

          {/* ── SaaS Enterprise Pagination ── */}
          <div className="flex items-center justify-between pt-8 border-t border-[var(--color-divider)]">
             <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-muted)] italic">
                Registry Stream &bull; {data.number * data.size + 1}—{Math.min((data.number + 1) * data.size, data.totalElements)} of {data.totalElements} Active Nodes
             </div>
             <div className="flex gap-2">
                <Button 
                   variant="secondary" 
                   size="sm" 
                   disabled={data.first} 
                   onClick={() => setPage(p => p - 1)}
                   className="p-3 min-w-0 rounded-[14px]"
                >
                   <ChevronLeft className="w-4 h-4" />
                </Button>
                <div className="flex items-center px-4 bg-[var(--color-bg-alt)] border border-[var(--color-border)] rounded-[14px] text-[10px] font-black uppercase tracking-widest">
                  Page {data.number + 1} of {data.totalPages}
                </div>
                <Button 
                   variant="secondary" 
                   size="sm" 
                   disabled={data.last} 
                   onClick={() => setPage(p => p + 1)}
                   className="p-3 min-w-0 rounded-[14px]"
                >
                   <ChevronRight className="w-4 h-4" />
                </Button>
             </div>
          </div>
        </>
      ) : (
        <div className="py-24 text-center card-premium border-dashed border-[var(--color-border)] bg-[var(--color-bg-alt)]/20">
           <Layers className="w-16 h-16 mx-auto mb-6 text-[var(--color-muted)] opacity-20" />
           <h3 className="text-xl font-black text-[var(--color-text)] tracking-tight italic">Zero Infrastructure Match</h3>
           <p className="text-[var(--color-text-secondary)] font-medium max-w-sm mx-auto mt-2 italic opacity-70">The current locality matrix did not yield any active matches in our global registry.</p>
           <Button 
              variant="soft" 
              className="mt-8"
              onClick={handleReset}
           >
              Reset Global Network
           </Button>
        </div>
      )}
    </div>
  );
}
