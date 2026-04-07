import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  addTicketComment,
  deleteComment,
  getTicket,
  assignTechnician,
  updateComment,
  updateTicketStatus,
} from '../api/ticketsApi';
import { StatusActionModal } from '../components/tickets/StatusActionModal';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { StatusIndicator } from '../components/common/StatusIndicator';
import { Skeleton } from '../components/common/Skeleton';
import { listUsers } from '../api/adminUsersApi';
import {
  ArrowLeft,
  MessageSquare,
  Paperclip,
  User,
  Clock,
  Calendar,
  MapPin,
  PhoneCall,
  Trash2,
  Edit3,
  Send,
  MoreVertical,
  Download,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Zap,
  UserPlus,
  History,
  LifeBuoy
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const PRIORITY_THEMES = {
  LOW: { badge: 'neutral', icon: 'bg-slate-400' },
  MEDIUM: { badge: 'warning', icon: 'bg-amber-400' },
  HIGH: { badge: 'danger', icon: 'bg-orange-500' },
  URGENT: { badge: 'danger', icon: 'bg-red-600' },
  CRITICAL: { badge: 'danger', icon: 'bg-red-700' },
};

const STATUS_INDICATORS = {
  OPEN: 'warning',
  IN_PROGRESS: 'info',
  RESOLVED: 'success',
  CLOSED: 'neutral',
  REJECTED: 'danger',
};

import { ConfirmModal } from '../components/common/ConfirmModal';

export function TicketDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: me } = useAuth();
  const isAdmin = me?.role?.name === 'ADMIN' || me?.role === 'ADMIN';
  const isTechnician = me?.role?.name === 'TECHNICIAN' || me?.role === 'TECHNICIAN';

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [commentBody, setCommentBody] = useState('');
  const [editing, setEditing] = useState(null); // { id, body }
  const [busy, setBusy] = useState(false);
  const [deleteCommentModal, setDeleteCommentModal] = useState({ open: false, id: null });

  const canChangeStatus = useMemo(() => isAdmin || isTechnician, [isAdmin, isTechnician]);
  const [techs, setTechs] = useState([]);
  const [selectedTechId, setSelectedTechId] = useState('');

  const [modal, setModal] = useState({ open: false, type: null }); // type: 'RESOLVED' or 'REJECTED'

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const d = await getTicket(id);
      setData(d);
      if (d.assignedTechnicianId) setSelectedTechId(String(d.assignedTechnicianId));
    } catch (e) {
      setError(e?.response?.data?.error?.message || 'Failed to sync ticket context');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, [id]);

  useEffect(() => {
    if (!isAdmin) return;
    let alive = true;
    listUsers({ role: 'TECHNICIAN' })
      .then((d) => {
        if (!alive) return;
        setTechs(d?.content || []);
      })
      .catch(() => {
        if (!alive) return;
        setTechs([]);
      });
    return () => { alive = false; };
  }, [isAdmin]);

  async function onStatus(next, metadata = {}) {
    if (next === 'REJECTED' && !metadata.rejectionReason) {
      setModal({ open: true, type: 'REJECTED' });
      return;
    }

    if (next === 'RESOLVED' && !metadata.resolutionNotes) {
      setModal({ open: true, type: 'RESOLVED' });
      return;
    }

    setBusy(true);
    setError(null);
    try {
      await updateTicketStatus(id, { status: next, ...metadata });
      setModal({ open: false, type: null });
      await refresh();
    } catch (e) {
      setError(e?.response?.data?.error?.message || 'Protocol transition failed');
    } finally {
      setBusy(false);
    }
  }

  if (loading && !data) {
    return (
       <div className="space-y-8 animate-pulse">
          <Skeleton className="h-8 w-48 rounded-lg" />
          <div className="flex justify-between items-end">
             <div className="space-y-4 flex-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-3/4" />
             </div>
             <div className="flex gap-2">
                <Skeleton className="h-10 w-24 rounded-xl" />
                <Skeleton className="h-10 w-24 rounded-xl" />
             </div>
          </div>
          <div className="grid lg:grid-cols-12 gap-8">
             <div className="lg:col-span-8 space-y-8">
                <Skeleton className="h-64 w-full rounded-3xl" />
                <Skeleton className="h-96 w-full rounded-3xl" />
             </div>
             <div className="lg:col-span-4 space-y-6">
                <Skeleton className="h-48 w-full rounded-3xl" />
                <Skeleton className="h-64 w-full rounded-3xl" />
             </div>
          </div>
       </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* SaaS Context Navigation */}
      <button
        onClick={() => navigate('/tickets')}
        className="group flex items-center gap-2 text-[var(--color-muted)] hover:text-primary font-black text-[10px] uppercase tracking-[0.2em] transition-all"
      >
         <div className="w-8 h-8 rounded-lg border border-[var(--color-border)] flex items-center justify-center group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all">
            <ArrowLeft className="w-4 h-4" />
         </div>
         Return to Operations Queue
      </button>

      {/* Hero Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="space-y-4 flex-1 min-w-0">
           <div className="flex items-center gap-3">
              <div className="px-3 py-1 bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg text-[10px] font-mono font-black tracking-widest text-primary shadow-sm">
                 #{data?.ticketNumber}
              </div>
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-border)]" />
              <span className="text-[10px] font-black text-[var(--color-muted)] uppercase tracking-[0.2em]">{data?.category}</span>
           </div>
           <h2 className="text-4xl font-black tracking-tight text-[var(--color-text)] leading-[1.1]">{data?.title}</h2>
            
            {data?.slaStatus && data?.status !== 'CLOSED' && (
              <div className="flex items-center gap-4 pt-2">
                 <div className={`px-4 py-2 rounded-xl border flex items-center gap-2 shadow-sm ${
                   data.slaStatus === 'OVERDUE' ? 'bg-error/5 border-error/20 text-error' :
                   data.slaStatus.startsWith('RESOLVED') ? 'bg-success/5 border-success/20 text-success' :
                   'bg-primary/5 border-primary/20 text-primary'
                 }`}>
                    <Clock className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      {data.slaStatus.replace('_', ' ')}
                    </span>
                    {data.targetResolutionTime && data.status !== 'RESOLVED' && data.status !== 'CLOSED' && (
                       <span className="text-[10px] font-bold opacity-60">
                         Target: {new Date(data.targetResolutionTime).toLocaleString()}
                       </span>
                    )}
                 </div>
              </div>
            )}
        </div>

        {canChangeStatus && (
            <div className="flex gap-2 p-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-soft">
              {data?.status === 'OPEN' && (isAdmin || isTechnician) && (
                <Button size="sm" variant="secondary" disabled={busy} onClick={() => onStatus('IN_PROGRESS')} className="h-10 rounded-xl px-4 text-[10px] uppercase font-black tracking-widest bg-transparent border-none hover:bg-warning/10 hover:text-warning">Start Work</Button>
              )}
              {data?.status === 'IN_PROGRESS' && (isAdmin || isTechnician) && (
                <Button size="sm" variant="secondary" disabled={busy} onClick={() => onStatus('RESOLVED')} className="h-10 rounded-xl px-4 text-[10px] uppercase font-black tracking-widest bg-transparent border-none hover:bg-success/10 hover:text-success">Resolve</Button>
              )}
              {isAdmin && data?.status === 'RESOLVED' && (
                <Button size="sm" variant="secondary" disabled={busy} onClick={() => onStatus('CLOSED')} className="h-10 rounded-xl px-4 text-[10px] uppercase font-black tracking-widest bg-transparent border-none hover:bg-[var(--color-background)]">Close Ticket</Button>
              )}
              {isAdmin && (data?.status === 'OPEN' || data?.status === 'IN_PROGRESS') && (
                <Button size="sm" variant="secondary" disabled={busy} onClick={() => onStatus('REJECTED')} className="h-10 rounded-xl px-4 text-[10px] uppercase font-black tracking-widest bg-transparent border-none hover:bg-error/10 hover:text-error">Reject</Button>
              )}
            </div>
        )}
      </div>

      {error && (
        <Card className="bg-error/5 border-error/20 p-4 flex items-center gap-3">
          <div className="p-2 bg-error text-white rounded-lg shadow-lg shadow-error/20">
             <AlertCircle className="w-4 h-4" />
          </div>
          <p className="text-sm font-bold text-[var(--color-text)]">{error}</p>
        </Card>
      )}

      <div className="grid lg:grid-cols-12 gap-8 items-start pb-20">
        {/* Support Stream (Left) */}
        <div className="lg:col-span-8 space-y-10">
            <Card className="p-0 overflow-hidden border-[var(--color-border)] shadow-soft relative rounded-[2.5rem]">
              <div className="p-10 space-y-8 relative z-10">
                 <div className="flex items-center justify-between">
                    <div className="text-[10px] font-black text-primary uppercase tracking-[0.3em] flex items-center gap-2">
                       <Zap className="w-3 h-3 fill-primary" />
                       Incident Scope
                    </div>
                    <div className="flex items-center gap-2">
                       <div className={`w-2 h-2 rounded-full ${PRIORITY_THEMES[data?.priority]?.icon || 'bg-slate-400'}`} />
                       <span className="text-[10px] font-black text-[var(--color-text)] uppercase tracking-widest">{data?.priority} Priority</span>
                    </div>
                 </div>
                 <p className="text-xl font-medium text-[var(--color-text)] leading-relaxed whitespace-pre-wrap">{data?.description}</p>
                 
                 {(data?.resolutionNotes || data?.rejectionReason) && (
                   <div className="mt-8 p-6 bg-[var(--color-background)]/50 rounded-3xl border border-[var(--color-border)] space-y-4">
                      {data.resolutionNotes && (
                        <div>
                          <div className="text-[9px] font-black text-success uppercase tracking-widest mb-1 flex items-center gap-2">
                             <ShieldCheck className="w-3 h-3" />
                             Resolution Protocol Finalized
                          </div>
                          <p className="text-sm font-bold text-[var(--color-text)]">{data.resolutionNotes}</p>
                        </div>
                      )}
                      {data.rejectionReason && (
                        <div>
                          <div className="text-[9px] font-black text-error uppercase tracking-widest mb-1 flex items-center gap-2">
                             <AlertCircle className="w-3 h-3" />
                             Administrative Rejection Reason
                          </div>
                          <p className="text-sm font-bold text-[var(--color-text)]">{data.rejectionReason}</p>
                        </div>
                      )}
                   </div>
                 )}
              </div>

              {data?.attachments?.length > 0 && (
                <div className="p-10 pt-0 bg-[var(--color-background)]/30 border-t border-[var(--color-border)]">
                   <div className="flex items-center gap-3 mb-8 mt-10">
                      <div className="w-10 h-10 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] flex items-center justify-center text-primary shadow-sm">
                         <Paperclip className="w-4 h-4" />
                      </div>
                      <div>
                         <h3 className="text-sm font-black text-[var(--color-text)] uppercase tracking-widest">Evidence Material</h3>
                         <p className="text-[10px] font-bold text-[var(--color-muted)] mt-0.5">Physical state documentation and visual context.</p>
                      </div>
                   </div>
                   <div className="grid sm:grid-cols-2 gap-6">
                      {data.attachments.map((a) => (
                        <div key={a.id} className="group relative overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-primary/40 transition-all hover:shadow-premium">
                           <div className="aspect-[4/3] bg-[var(--color-background)] overflow-hidden relative">
                              <img
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                src={`/api/v1/tickets/${a.ticketId}/attachments/${a.id}/content?token=${localStorage.getItem('token')}`}
                                alt={a.originalFileName}
                              />
                              <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/20 backdrop-blur-0 group-hover:backdrop-blur-sm transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                                 <a
                                   href={`/api/v1/tickets/${a.ticketId}/attachments/${a.id}/download?token=${localStorage.getItem('token')}`}
                                   className="w-12 h-12 bg-white rounded-full shadow-2xl flex items-center justify-center transform translate-y-4 group-hover:translate-y-0 transition-all duration-300"
                                 >
                                    <Download className="w-5 h-5 text-primary" />
                                 </a>
                              </div>
                           </div>
                           <div className="p-5 flex items-center justify-between">
                              <div className="min-w-0">
                                 <div className="text-[10px] font-black text-[var(--color-text)] truncate uppercase tracking-wider">{a.originalFileName}</div>
                                 <div className="text-[9px] font-bold text-[var(--color-muted)] uppercase mt-1">{(a.sizeBytes / 1024).toFixed(0)} KB • {a.contentType.split('/')[1]}</div>
                              </div>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
              )}
            </Card>

            {/* Interaction Layer */}
            <div className="space-y-8">
               <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-3">
                     <div className="p-2 bg-primary/10 rounded-lg">
                        <MessageSquare className="w-4 h-4 text-primary" />
                     </div>
                     <h3 className="text-sm font-black text-[var(--color-text)] uppercase tracking-[0.2em]">Activity Stream</h3>
                  </div>
                  <div className="text-[10px] font-black text-[var(--color-muted)] uppercase tracking-widest">
                     {data?.comments?.length || 0} Total Interactions
                  </div>
               </div>

               <div className="space-y-6">
                  {data?.comments?.length > 0 ? (
                    data.comments.map((c) => (
                      <div key={c.id} className="group flex gap-5 animate-fade-in-left">
                         <div className="shrink-0 w-12 h-12 rounded-2xl bg-[var(--color-background)] border border-[var(--color-border)] flex items-center justify-center text-primary font-black shadow-sm group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all">
                            {c.authorEmail.charAt(0).toUpperCase()}
                         </div>
                         <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between">
                               <div className="flex items-center gap-3">
                                  <span className="text-[10px] font-black text-[var(--color-text)] uppercase tracking-wider">{c.authorEmail.split('@')[0]}</span>
                                  <span className="w-1 h-1 rounded-full bg-[var(--color-border)]" />
                                  <span className="text-[9px] font-bold text-[var(--color-muted)] uppercase tracking-widest">{c.createdAt}</span>
                               </div>
                               {(isAdmin || c.authorId === me?.id) && (
                                 <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => setEditing({ id: c.id, body: c.body })} className="p-1.5 hover:bg-[var(--color-background)] rounded-lg text-[var(--color-muted)] hover:text-primary transition-colors">
                                       <Edit3 className="w-3.5 h-3.5" />
                                    </button>
                                    <button onClick={() => setDeleteCommentModal({ open: true, id: c.id })} className="p-1.5 hover:bg-error/10 rounded-lg text-[var(--color-muted)] hover:text-error transition-colors">
                                       <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                 </div>
                               )}
                            </div>
                            <Card className="p-5 bg-[var(--color-surface)]/60 border-[var(--color-border)] text-[var(--color-text)] leading-relaxed rounded-3xl rounded-tl-sm shadow-soft">
                               <p className="text-sm font-medium">{c.body}</p>
                            </Card>
                         </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-16 text-center bg-[var(--color-background)]/20 rounded-[2.5rem] border-2 border-dashed border-[var(--color-border)]">
                       <LifeBuoy className="w-10 h-10 text-[var(--color-muted)] mx-auto mb-4 opacity-20" />
                       <p className="text-[10px] font-black text-[var(--color-muted)] uppercase tracking-[0.3em]">Operational Silence</p>
                    </div>
                  )}

                  {/* Operational Chat Input */}
                  {data?.status !== 'CLOSED' && data?.status !== 'REJECTED' ? (
                    <div className="flex gap-5 pt-10">
                       <div className="shrink-0 w-12 h-12 rounded-3xl bg-primary shadow-premium flex items-center justify-center text-white font-black ring-4 ring-primary/10">
                          {me?.email?.charAt(0).toUpperCase() || '?'}
                       </div>
                       <div className="flex-1 relative">
                          <textarea
                            className="w-full rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-5 text-sm font-medium outline-none transition-all focus:ring-8 focus:ring-primary/5 focus:border-primary placeholder:text-[var(--color-muted)] min-h-[140px] shadow-sm"
                            value={commentBody}
                            onChange={(e) => setCommentBody(e.target.value)}
                            placeholder="Broadcast an update or internal directive..."
                          />
                          <div className="absolute bottom-5 right-5 flex items-center gap-3">
                             <Button
                                disabled={busy || !commentBody.trim()}
                                onClick={async () => {
                                 setBusy(true);
                                 try {
                                   await addTicketComment(id, { body: commentBody.trim() });
                                   setCommentBody('');
                                   await refresh();
                                 } finally { setBusy(false); }
                               }}
                               className="rounded-2xl h-11 px-6 gap-2 shadow-premium font-black uppercase tracking widest text-[10px]"
                             >
                                <Send className="w-4 h-4" />
                                Commit Update
                             </Button>
                          </div>
                       </div>
                    </div>
                  ) : (
                    <div className="p-8 text-center bg-[var(--color-background)]/5 border-2 border-dashed border-[var(--color-border)] rounded-[2.5rem] mt-10">
                       <p className="text-[10px] font-black text-[var(--color-muted)] uppercase tracking-widest opacity-40">Operational Protocol Finalized. Communication Channel Offline.</p>
                    </div>
                  )}
               </div>
            </div>
        </div>

        {/* Support Command Panel (Right) */}
        <div className="lg:col-span-4 space-y-8">
           {/* Protocol Status */}
           <Card className="p-8 border-[var(--color-border)] shadow-premium bg-slate-900 text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-48 h-48 bg-primary/20 rounded-full blur-[80px] -mr-24 -mt-24 group-hover:bg-primary/30 transition-all duration-1000" />
              <div className="relative z-10 space-y-8">
                 <div>
                    <div className="text-[10px] font-black text-slate-400 uppercase mb-4 tracking-[0.2em] flex items-center gap-2">
                       <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                       Operational Status
                    </div>
                    <div className="flex flex-col items-center justify-center p-8 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-md">
                       <StatusIndicator status={STATUS_INDICATORS[data?.status] || 'neutral'} size="lg" />
                       <div className="text-2xl font-black mt-4 tracking-tighter uppercase">{data?.status.replace('_', ' ')}</div>
                       <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Protocol Lifecycle</p>
                    </div>
                 </div>
              </div>
           </Card>

           {/* Deployment Details */}
           <Card className="p-8 border-[var(--color-border)] shadow-soft bg-[var(--color-surface)]">
              <div className="space-y-6 divide-y divide-[var(--color-border)]">
                 <div className="pb-6">
                    <div className="flex items-center gap-3 text-[var(--color-muted)] mb-3">
                       <User className="w-4 h-4" />
                       <span className="text-[10px] font-black uppercase tracking-widest">Origin Reporter</span>
                    </div>
                    <div className="text-sm font-black text-[var(--color-text)] ml-7 leading-tight">{data?.createdByEmail}</div>
                    <div className="text-[10px] font-bold text-[var(--color-muted)] ml-7 mt-1.5 uppercase tracking-wider">{data?.preferredContact}</div>
                 </div>

                 <div className="py-6 border-[var(--color-border)]">
                    <div className="flex items-center gap-3 text-[var(--color-muted)] mb-3">
                       <MapPin className="w-4 h-4" />
                       <span className="text-[10px] font-black uppercase tracking-widest">Mission Coordinates</span>
                    </div>
                    <div className="text-sm font-black text-[var(--color-text)] ml-7 leading-tight">{data?.locationText || 'Global Infrastructure'}</div>
                 </div>

                 <div className="py-6 border-[var(--color-border)]">
                    <div className="flex items-center gap-3 text-[var(--color-muted)] mb-4">
                       <History className="w-4 h-4" />
                       <span className="text-[10px] font-black uppercase tracking-widest">Incident Timeline</span>
                    </div>
                    <div className="ml-7 space-y-4">
                       {[
                         { label: 'Commissioned', date: data?.createdAt },
                         { label: 'Last Signal', date: data?.updatedAt },
                         { label: 'Resolution', date: data?.closedAt, highlight: true }
                       ].map((item, i) => item.date && (
                         <div key={i} className={`flex justify-between items-center text-[10px] font-black uppercase tracking-widest ${item.highlight ? 'text-success' : 'text-[var(--color-muted)]'}`}>
                            <span>{item.label}</span>
                            <span className="text-[var(--color-text)]">{new Date(item.date).toLocaleDateString()}</span>
                         </div>
                       ))}
                    </div>
                 </div>

                 <div className="pt-6 border-[var(--color-border)]">
                    <div className="flex items-center gap-3 text-[var(--color-muted)] mb-3">
                       <Zap className="w-4 h-4" />
                       <span className="text-[10px] font-black uppercase tracking-widest">Active Specialist</span>
                    </div>
                    {data?.assignedTechnicianEmail ? (
                       <div className="flex items-center gap-3 ml-7 mt-2">
                          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-xs">
                             {data.assignedTechnicianEmail.charAt(0).toUpperCase()}
                          </div>
                          <div className="text-sm font-black text-[var(--color-text)]">{data.assignedTechnicianEmail.split('@')[0]}</div>
                       </div>
                    ) : (
                       <div className="text-sm font-black text-warning ml-7 italic animate-pulse">Awaiting Dispatch...</div>
                    )}
                 </div>
              </div>
           </Card>

           {/* Administrative Dispatcher Controls */}
           {isAdmin && (
             <Card className="p-8 border-primary/20 bg-primary/5 border-dashed rounded-[2rem] shadow-premium">
                <div className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                   <UserPlus className="w-4 h-4" />
                   Dispatcher Override
                </div>
                <div className="space-y-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-[var(--color-muted)] uppercase tracking-widest">Target Specialist</label>
                      <select
                        value={selectedTechId}
                        onChange={(e) => setSelectedTechId(e.target.value)}
                        className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl px-5 py-3 text-sm font-bold text-[var(--color-text)] outline-none focus:ring-8 focus:ring-primary/5 focus:border-primary transition-all shadow-sm appearance-none"
                      >
                        <option value="">Pooling Queue</option>
                        {techs.map((t) => (
                           <option key={t.id} value={String(t.id)}>{t.fullName || t.email}</option>
                        ))}
                      </select>
                   </div>
                   <Button
                     className="w-full h-14 rounded-2xl shadow-premium font-black uppercase tracking-widest text-[10px]"
                     disabled={busy || !selectedTechId}
                     onClick={async () => {
                       setBusy(true);
                       try { await assignTechnician(id, { technicianUserId: selectedTechId }); await refresh(); } finally { setBusy(false); }
                     }}
                   >
                     Delegate Operation
                   </Button>
                </div>
             </Card>
           )}
        </div>
      </div>

      {/* Persistence Layer Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4">
          <Card className="w-full max-w-[420px] p-0 shadow-premium bg-[var(--color-surface)] animate-fade-in-up border-[var(--color-border)] rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[var(--color-border)] bg-[var(--color-bg-alt)]/30">
               <h3 className="text-base font-black text-[var(--color-text)] tracking-tight italic">Modify Protocol Update</h3>
               <p className="text-[9px] font-black text-[var(--color-muted)] uppercase tracking-widest mt-0.5 opacity-60">ID: {editing.id}</p>
            </div>
            <div className="p-4 space-y-3 compact">
               <div className="space-y-1">
                  <label className="text-[9px] font-black text-[var(--color-muted)] uppercase tracking-widest ml-1">Directive Content</label>
                  <textarea
                    className="w-full h-24 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] p-4 text-sm font-medium outline-none transition-all focus:ring-8 focus:ring-primary/5 focus:border-primary placeholder:text-[var(--color-muted)] shadow-inner resize-none scrollbar-none"
                    value={editing.body}
                    onChange={(e) => setEditing(x => ({ ...x, body: e.target.value }))}
                  />
               </div>
               <div className="flex gap-2 pt-3 border-t border-[var(--color-border)]">
                 <Button
                   disabled={busy || !editing.body.trim()}
                   onClick={async () => {
                     setBusy(true);
                     try { await updateComment(editing.id, { body: editing.body }); setEditing(null); await refresh(); } finally { setBusy(false); }
                   }}
                   className="flex-[2] h-10 text-[9px] font-black uppercase tracking-widest rounded-lg shadow-premium text-white"
                 >
                   Commit Changes
                 </Button>
                 <Button variant="secondary" onClick={() => setEditing(null)} disabled={busy} className="flex-1 h-10 text-[9px] font-black uppercase tracking-widest rounded-lg">Abort</Button>
               </div>
            </div>
          </Card>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteCommentModal.open}
        onClose={() => setDeleteCommentModal({ open: false, id: null })}
        onConfirm={async () => {
          const id = deleteCommentModal.id;
          setDeleteCommentModal({ open: false, id: null });
          setBusy(true);
          try { await deleteComment(id); await refresh(); } finally { setBusy(false); }
        }}
        title="Interaction Purge"
        message="Permanently redact this update from the incident stream?"
        confirmLabel="Purge Content"
      />

      {/* SLA & Status Action Modals */}
      <StatusActionModal
        isOpen={modal.open && modal.type === 'REJECTED'}
        onClose={() => setModal({ open: false, type: null })}
        onConfirm={(reason) => onStatus('REJECTED', { rejectionReason: reason })}
        title="Reject Operational Ticket"
        description="Provide a formal administrative reason for rejecting this incident report."
        label="Rejection Reason"
        placeholder="Document the protocol violation or reason for non-action..."
        confirmLabel="Reject Ticket"
        variant="danger"
        busy={busy}
      />

      <StatusActionModal
        isOpen={modal.open && modal.type === 'RESOLVED'}
        onClose={() => setModal({ open: false, type: null })}
        onConfirm={(notes) => onStatus('RESOLVED', { resolutionNotes: notes })}
        title="Finalize Resolution Protocol"
        description="Document the technical findings and actions taken to resolve this incident."
        label="Resolution Notes"
        placeholder="Describe actions taken, parts replaced, or technical findings..."
        confirmLabel="Resolve Ticket"
        variant="success"
        busy={busy}
      />
    </div>
  );
}

