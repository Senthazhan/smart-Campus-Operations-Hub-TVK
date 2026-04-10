import React, { useEffect, useMemo, useState } from 'react';
import { approveBooking, listBookings, rejectBooking } from '../api/bookingsApi';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { CardLoader } from '../components/common/PageLoader';
import { Spinner } from '../components/common/Spinner';
import { Toast } from '../components/common/Toast';
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  Calendar, 
  User, 
  Package, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Users
} from 'lucide-react';

const STATUS_VARIANTS = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'error',
  CANCELLED: 'neutral',
  EXPIRED: 'error',
};

export function AdminBookingsPage() {
  const [page, setPage] = useState(0);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [q, setQ] = useState('');
  const [status, setStatus] = useState('PENDING');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const [modal, setModal] = useState(null); // { id, action: 'approve'|'reject' }
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ open: false, title: '', message: '', variant: 'success' });

  const params = useMemo(() => {
    const p = { page, size: 7 };
    if (q) p.q = q;
    if (status) p.status = status;
    if (from) p.from = from;
    if (to) p.to = to;
    return p;
  }, [page, q, status, from, to]);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const d = await listBookings(params);
      setData(d);
    } catch (e) {
      setError(e?.response?.data?.error?.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, [params]);

  function openModal(id, action) {
    setModal({ id, action });
    setReason('');
  }

  async function submitDecision() {
    if (!modal) return;
    if (!reason.trim()) {
      setError('Reason is required for approve/reject actions');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (modal.action === 'approve') await approveBooking(modal.id, reason.trim());
      if (modal.action === 'reject') await rejectBooking(modal.id, reason.trim());
      setToast({
        open: true,
        title: modal.action === 'approve' ? 'Booking Approved' : 'Booking Rejected',
        message: modal.action === 'approve'
          ? 'The booking request was approved successfully.'
          : 'The booking request was rejected successfully.',
        variant: 'success',
      });
      setModal(null);
      await refresh();
    } catch (e) {
      setError(e?.response?.data?.error?.message || 'Failed to update booking');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-[var(--color-text)]">Manage Bookings</h2>
          <p className="text-[var(--color-text-secondary)] mt-1 font-medium">Review and process campus resource requests.</p>
        </div>
        <Button variant="secondary" onClick={refresh} disabled={loading} className="gap-2">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Registry
        </Button>
      </div>

      {error && (
        <Card className="bg-red-500/10 border-red-500/20 p-4 flex items-center gap-3">
           <AlertCircle className="w-4 h-4 text-red-500" />
           <p className="text-sm font-bold text-red-500">{error}</p>
        </Card>
      )}

      {/* Filter Bar */}
      <Card className="p-6 border-[var(--color-border)] bg-[var(--color-bg-alt)]/50">
         <div className="grid gap-4 md:grid-cols-4 items-end">
            <Input 
              label="Search Query" 
              value={q} 
              onChange={(e) => {
                setQ(e.target.value);
                setPage(0);
              }} 
              placeholder="Resource / User..." 
            />
            <Select
              label="Flow Status"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(0);
              }}
              options={[
                { value: 'PENDING', label: 'Pending First' },
                { value: '', label: 'All Statuses' },
                { value: 'PENDING', label: 'Pending' },
                { value: 'APPROVED', label: 'Approved' },
                { value: 'REJECTED', label: 'Rejected' },
                { value: 'CANCELLED', label: 'Cancelled' },
                { value: 'EXPIRED', label: 'Expired' },
              ]}
            />
            <Input
              label="From Date"
              type="date"
              value={from}
              onChange={(e) => {
                setFrom(e.target.value);
                setPage(0);
              }}
            />
            <Input
              label="To Date"
              type="date"
              value={to}
              onChange={(e) => {
                setTo(e.target.value);
                setPage(0);
              }}
            />
         </div>
      </Card>

      {/* Main Content Table */}
      <Card className="overflow-hidden border-[var(--color-border)]">
        {loading ? (
          <CardLoader text="Scanning Booking Registry..." />
        ) : data?.content?.length ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-alt)]/50 text-label-premium">
                    <th className="px-6 py-4">Resource Info</th>
                    <th className="px-6 py-4">Requester Details</th>
                    <th className="px-6 py-4">Schedule</th>
                    <th className="px-6 py-4">Status & Logic</th>
                    <th className="px-6 py-4 text-right">Administrative Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-divider)]">
                  {data.content.map((b) => (
                    <tr key={b.id} className="group hover:bg-[var(--color-surface-soft)] transition-all">
                      <td className="px-6 py-4">
                         <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 text-primary rounded-lg transition-colors group-hover:bg-primary/20">
                               <Package className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                               <div className="text-sm font-extrabold text-[var(--color-text)] truncate">{b.resourceName}</div>
                               <div className="text-[10px] font-bold text-[var(--color-muted)] uppercase tracking-tighter">{b.resourceCode}</div>
                            </div>
                         </div>
                      </td>
                      <td className="px-6 py-4">
                         <div className="flex items-center gap-3">
                            <div className="p-2 bg-[var(--color-bg-alt)] text-[var(--color-muted)] rounded-lg">
                               <User className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                               <div className="text-sm font-bold text-[var(--color-text-secondary)] truncate">{b.userEmail}</div>
                               <div className="flex items-center gap-1.5 mt-0.5">
                                  <Users className="w-3 h-3 text-[var(--color-muted)]/50" />
                                  <span className="text-[10px] font-bold text-[var(--color-muted)] uppercase">{b.expectedAttendees} Pax</span>
                               </div>
                            </div>
                         </div>
                      </td>
                      <td className="px-6 py-4">
                         <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--color-text)] underline decoration-primary/20 underline-offset-4 decoration-2">
                               <Calendar className="w-3 h-3 text-primary/60" />
                               {b.bookingDate}
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--color-muted)] uppercase">
                               <Clock className="w-3 h-3" />
                               {b.startTime} - {b.endTime}
                            </div>
                         </div>
                      </td>
                      <td className="px-6 py-4">
                         <Badge variant={STATUS_VARIANTS[b.status] || 'neutral'}>
                            {b.status}
                         </Badge>
                         {b.decisionReason && (
                           <div className="mt-2 text-[10px] font-bold text-[var(--color-text-secondary)] line-clamp-1 italic bg-[var(--color-bg-alt)] px-2.5 py-1 rounded-lg w-fit border border-[var(--color-border)]">
                              {b.decisionReason}
                           </div>
                         )}
                      </td>
                      <td className="px-6 py-4 text-right">
                         <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="secondary"
                              disabled={b.status !== 'PENDING'}
                              onClick={() => openModal(b.id, 'reject')}
                              className="h-8 px-3 text-[10px] font-bold uppercase tracking-widest border-red-500/20 text-red-500 hover:bg-red-500/10 disabled:opacity-30 disabled:hover:bg-transparent"
                            >
                                Reject
                            </Button>
                            <Button
                              size="sm"
                              disabled={b.status !== 'PENDING'}
                              onClick={() => openModal(b.id, 'approve')}
                              className="h-8 px-3 text-[10px] font-bold uppercase tracking-widest bg-emerald-600 hover:bg-emerald-700 disabled:opacity-30"
                            >
                                Approve
                            </Button>
                         </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="p-4 border-t border-[var(--color-divider)] bg-[var(--color-bg-alt)]/30 flex items-center justify-between">
               <div className="text-[10px] font-bold text-[var(--color-muted)] uppercase tracking-tight">
                  Showing {data.number * data.size + 1} - {Math.min((data.number + 1) * data.size, data.totalElements)} of {data.totalElements}
               </div>
               <div className="flex gap-2">
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    disabled={data.first} 
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    className="h-9 w-9 p-0 flex items-center justify-center rounded-xl"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    disabled={data.last} 
                    onClick={() => setPage(p => p + 1)}
                    className="h-9 w-9 p-0 flex items-center justify-center rounded-xl"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
               </div>
            </div>
          </>
        ) : (
          <div className="p-24 text-center">
             <div className="w-20 h-20 bg-[var(--color-bg-alt)] rounded-3xl flex items-center justify-center mx-auto mb-6 border border-[var(--color-border)]">
                <ShieldCheck className="w-8 h-8 text-[var(--color-muted)]" />
             </div>
             <h3 className="text-xl font-extrabold text-[var(--color-text)]">No matching requests</h3>
             <p className="text-[var(--color-text-secondary)] max-w-xs mx-auto mt-2 text-sm font-medium">Try clearing your filters or adjusting search parameters.</p>
             <Button
               variant="secondary"
               className="mt-8 px-8"
               onClick={() => {
                 setQ('');
                 setStatus('PENDING');
                 setFrom('');
                 setTo('');
                 setPage(0);
               }}
             >
               Reset All Filters
             </Button>
          </div>
        )}
      </Card>

      {/* Decision Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-bg)]/80 backdrop-blur-md p-4">
          <Card className="w-full max-w-[380px] p-0 shadow-premium animate-fade-in-up border-[var(--color-border)] rounded-2xl overflow-hidden bg-[var(--color-surface)]">
            <div className={`p-4 flex items-center gap-3 border-b border-[var(--color-divider)] ${modal.action === 'approve' ? 'bg-emerald-500/5' : 'bg-red-500/5'}`}>
               <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${modal.action === 'approve' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                  {modal.action === 'approve' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
               </div>
               <div>
                  <h3 className="text-base font-black text-[var(--color-text)] tracking-tight italic">
                    {modal.action === 'approve' ? 'Approve Protocol' : 'Reject Protocol'}
                  </h3>
                  <p className="text-[9px] font-black text-[var(--color-muted)] uppercase tracking-widest mt-0.5 opacity-60">Strategic Sanction</p>
               </div>
            </div>
            
            <div className="p-4 space-y-3 compact">
              <div className="space-y-1">
                 <label className="text-[9px] font-black text-[var(--color-muted)] uppercase tracking-widest ml-1">Justification</label>
                 <textarea
                   className="w-full h-16 rounded-xl bg-[var(--color-bg-alt)] border border-[var(--color-border)] p-3 text-sm font-medium outline-none transition-all focus:ring-8 focus:ring-primary/5 focus:border-primary placeholder:text-[var(--color-muted)] shadow-inner resize-none scrollbar-none"
                   value={reason}
                   onChange={(e) => setReason(e.target.value)}
                   placeholder="Enter administrative reasoning..."
                   required
                 />
              </div>
              
              <div className="flex gap-2 pt-3 border-t border-[var(--color-divider)]">
                <Button 
                   onClick={submitDecision} 
                   disabled={saving || !reason.trim()}
                   className={`flex-[2] h-10 text-[9px] uppercase font-black tracking-widest rounded-lg text-white shadow-premium ${modal.action === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}`}
                >
                  {saving ? <Spinner size="sm" /> : 'Confirm'}
                </Button>
                <Button variant="secondary" onClick={() => setModal(null)} disabled={saving} className="flex-1 h-10 text-[9px] uppercase font-black tracking-widest rounded-lg">Abort</Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      <Toast
        open={toast.open}
        title={toast.title}
        message={toast.message}
        variant={toast.variant}
        onClose={() => setToast((current) => ({ ...current, open: false }))}
      />
    </div>
  );
}

