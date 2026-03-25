import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { listBookings, cancelBooking } from '../api/bookingsApi';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { StatusIndicator } from '../components/common/StatusIndicator';
import { ConfirmModal } from '../components/common/ConfirmModal';
import {
  Calendar,
  CalendarCheck,
  Clock,
  Users,
  Info,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  History,
  XCircle
} from 'lucide-react';
import { CardLoader } from '../components/common/PageLoader';

const STATUS_VARIANTS = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'danger',
  CANCELLED: 'neutral',
  COMPLETED: 'info',
};

export function MyBookingsPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [cancelModal, setCancelModal] = useState({ open: false, id: null });

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    listBookings({ page, size: 7 })
      .then((d) => {
        if (!alive) return;
        setData(d);
      })
      .catch((e) => {
        if (!alive) return;
        setError(e?.response?.data?.error?.message || 'Failed to load bookings');
      })
      .finally(() => {
        if (!alive) return;
        setLoading(false);
      });
    return () => { alive = false; };
  }, [page]);

  async function handleCancelConfirm() {
    const id = cancelModal.id;
    if (!id) return;
    
    setCancelModal({ open: false, id: null });
    setBusyId(id);
    setError(null);
    try {
      await cancelBooking(id);
      const d = await listBookings({ page, size: 10 });
      setData(d);
    } catch (e) {
      setError(e?.response?.data?.error?.message || 'Failed to cancel booking');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* SaaS Pipeline Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <CalendarCheck className="w-4 h-4 text-primary" />
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-muted)]">Reservation Pipeline</span>
          </div>
          <h2 className="text-3xl font-black tracking-tight text-[var(--color-text)]">My Bookings</h2>
          <p className="text-[var(--color-muted)] font-medium mt-1">Full audit trail and lifecycle management of your campus resource access.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={() => window.location.reload()} className="gap-2">
            <History className="w-4 h-4" />
            Refresh Log
          </Button>
          <Button onClick={() => navigate('/bookings/new')} className="gap-2 shadow-premium">
            <Calendar className="w-4 h-4" />
            New Reservation
          </Button>
        </div>
      </div>

      {error && (
        <Card className="bg-error/5 border-error/20 p-4 flex items-center gap-3">
          <div className="p-2 bg-error text-white rounded-lg shadow-lg shadow-error/20">
             <XCircle className="w-4 h-4" />
          </div>
          <p className="text-sm font-bold text-[var(--color-text)]">{error}</p>
        </Card>
      )}

      {/* Pipeline Content */}
      <Card className="p-0 overflow-hidden border-[var(--color-border)]">
        {loading && !data ? (
          <CardLoader text="Syncing Matrix Records..." />
        ) : data?.content?.length ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface)]/40">
                    <th className="px-6 py-4 text-[10px] font-black text-[var(--color-muted)] uppercase tracking-widest">Target Resource</th>
                    <th className="px-6 py-4 text-[10px] font-black text-[var(--color-muted)] uppercase tracking-widest">Time Allotment</th>
                    <th className="px-6 py-4 text-[10px] font-black text-[var(--color-muted)] uppercase tracking-widest">Context</th>
                    <th className="px-6 py-4 text-[10px] font-black text-[var(--color-muted)] uppercase tracking-widest">SLA Status</th>
                    <th className="px-6 py-4 text-[10px] font-black text-[var(--color-muted)] uppercase tracking-widest text-right">Operations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-divider)]">
                  {data.content.map((b) => (
                    <tr key={b.id} className="group hover:bg-[var(--color-surface-soft)] transition-all">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-xl bg-[var(--color-bg-alt)] flex items-center justify-center text-[var(--color-muted)] group-hover:text-primary transition-colors border border-[var(--color-border)]">
                              <Calendar className="w-5 h-5" />
                           </div>
                           <div>
                              <div className="text-sm font-black text-[var(--color-text)]">{b.resourceName}</div>
                              <div className="text-[10px] font-mono font-bold text-[var(--color-muted)]">{b.resourceCode}</div>
                           </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-text)]">
                            <Calendar className="w-3.5 h-3.5 text-primary" />
                            {b.bookingDate}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--color-muted)]">
                            <Clock className="w-3.5 h-3.5" />
                            {b.startTime} — {b.endTime}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-[200px]">
                           <div className="text-xs font-bold text-[var(--color-text)] truncate">{b.purpose}</div>
                           <div className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--color-muted)] mt-1">
                              <Users className="w-3 h-3" />
                              {b.expectedAttendees} Attendees
                           </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-2">
                           <StatusIndicator 
                              status={STATUS_VARIANTS[b.status] || 'secondary'} 
                              label={b.status} 
                           />
                           {b.status === 'REJECTED' && b.decisionReason && (
                              <div className="flex items-start gap-2 p-2 bg-error/5 border border-error/10 rounded-lg text-error max-w-[180px]">
                                 <Info className="w-3 h-3 shrink-0 mt-0.5" />
                                 <span className="text-[10px] font-bold leading-tight">{b.decisionReason}</span>
                              </div>
                           )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                           <Button 
                              variant="ghost" 
                              size="sm" 
                              className="p-2 min-w-0 rounded-lg text-[var(--color-muted)] hover:text-primary"
                              onClick={() => navigate(`/resources/${b.resourceId}`)}
                           >
                              <ArrowRight className="w-4 h-4" />
                           </Button>
                           {['PENDING', 'APPROVED'].includes(b.status) && (
                             <Button 
                               variant="secondary" 
                               size="sm" 
                               disabled={busyId === b.id} 
                               onClick={() => setCancelModal({ open: true, id: b.id })}
                               className="h-8 text-[10px] font-black uppercase tracking-widest border-[var(--color-border)] hover:text-error hover:border-error/20"
                             >
                               {busyId === b.id ? 'Processing...' : 'Abort Request'}
                             </Button>
                           )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Matrix */}
            <div className="p-4 border-t border-[var(--color-border)] bg-[var(--color-bg-alt)]/20 flex items-center justify-between">
               <div className="text-[10px] font-black uppercase tracking-widest text-[var(--color-muted)]">
                  Log Index {data.number + 1} of {data.totalPages || 1}
               </div>
               <div className="flex gap-2">
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    disabled={data.first} 
                    onClick={() => setPage(p => p - 1)}
                    className="h-8 w-8 p-0 rounded-lg"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    disabled={data.last} 
                    onClick={() => setPage(p => p + 1)}
                    className="h-8 w-8 p-0 rounded-lg"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
               </div>
            </div>
          </>
        ) : (
          <div className="p-32 text-center">
             <div className="w-20 h-20 bg-[var(--color-bg-alt)] rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-[var(--color-border)] shadow-soft">
                <Calendar className="w-8 h-8 text-[var(--color-muted)]" />
             </div>
             <h3 className="text-xl font-black text-[var(--color-text)]">Pipeline Empty</h3>
             <p className="text-[var(--color-muted)] max-w-xs mx-auto mt-2 font-medium">You haven't initiated any resource access protocols yet. All your future reservation logs will be indexed here.</p>
             <Link to="/bookings/new">
                <Button className="mt-8 px-8 shadow-premium font-black uppercase tracking-widest text-[10px] h-11 rounded-xl">Initialize First Request</Button>
             </Link>
          </div>
        )}
      </Card>

      <ConfirmModal
        isOpen={cancelModal.open}
        onClose={() => setCancelModal({ open: false, id: null })}
        onConfirm={handleCancelConfirm}
        title="Protocol Abort"
        message="Are you sure you want to nullify this reservation request? This action is logged permanently."
        confirmLabel="Decommission Request"
        variant="danger"
      />
    </div>
  );
}

