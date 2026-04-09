import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { listBookings, cancelBooking } from '../api/bookingsApi';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { StatusIndicator } from '../components/common/StatusIndicator';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { Select } from '../components/common/Select';
import {
  Calendar,
  CalendarCheck,
  Clock,
  Users,
  Info,
  Pencil,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  History,
  XCircle,
  QrCode,
  Download,
  X
} from 'lucide-react';
import { CardLoader } from '../components/common/PageLoader';

const STATUS_VARIANTS = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'danger',
  CANCELLED: 'neutral',
  COMPLETED: 'info',
};

function compareBookings(a, b, chronology) {
  const direction = chronology === 'oldest' ? 1 : -1;
  const dateCompare = String(a.bookingDate || '').localeCompare(String(b.bookingDate || ''));
  if (dateCompare !== 0) return dateCompare * direction;

  const timeCompare = String(a.startTime || '').localeCompare(String(b.startTime || ''));
  if (timeCompare !== 0) return timeCompare * direction;

  return String(a.id || '').localeCompare(String(b.id || '')) * direction;
}

function sortBookingContent(content, chronology) {
  return [...(content || [])].sort((a, b) => compareBookings(a, b, chronology));
}

function buildBookingQrPayload(booking) {
  return [
    'SMART CAMPUS OPERATIONS HUB',
    'BOOKING PASS',
    '',
    `Resource: ${booking.resourceName}`,
    `Code: ${booking.resourceCode}`,
    `Date: ${booking.bookingDate}`,
    `Time: ${booking.startTime} - ${booking.endTime}`,
    `Purpose: ${booking.purpose}`,
    `Attendees: ${booking.expectedAttendees}`,
    `Status: ${booking.status}`,
    '',
    `Booking ID: ${booking.id}`,
  ].join('\n');
}

function buildBookingQrUrl(booking) {
  const payload = encodeURIComponent(buildBookingQrPayload(booking));
  return `https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=12&data=${payload}`;
}

const PAGE_SIZE = 7;

export function MyBookingsPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [chronology, setChronology] = useState('latest');
  const [visibility, setVisibility] = useState('active');
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [cancelModal, setCancelModal] = useState({ open: false, id: null });
  const [qrBooking, setQrBooking] = useState(null);
  const bookingsCacheRef = useRef(new Map());

  const filteredBookings = useMemo(() => {
    if (visibility === 'cancelled') {
      return allBookings.filter((booking) => booking.status === 'CANCELLED');
    }
    if (visibility === 'all') {
      return allBookings;
    }
    return allBookings.filter((booking) => booking.status !== 'CANCELLED');
  }, [allBookings, visibility]);

  const totalPages = Math.max(1, Math.ceil(filteredBookings.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const visibleBookings = useMemo(() => {
    const startIndex = safePage * PAGE_SIZE;
    return filteredBookings.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredBookings, safePage]);

  useEffect(() => {
    if (page !== safePage) {
      setPage(safePage);
    }
  }, [page, safePage]);

  useEffect(() => {
    let alive = true;
    setError(null);
    const cacheKey = chronology;
    const cachedBookings = bookingsCacheRef.current.get(cacheKey);

    if (cachedBookings) {
      setAllBookings(cachedBookings);
      setLoading(false);
      return () => {
        alive = false;
      };
    }

    setLoading(true);
    listBookings({ page: 0, size: 200, chronology })
      .then((d) => {
        if (!alive) return;
        const nextBookings = d?.content || [];
        bookingsCacheRef.current.set(cacheKey, nextBookings);
        setAllBookings(nextBookings);
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
  }, [chronology]);

  async function handleCancelConfirm() {
    const id = cancelModal.id;
    if (!id) return;
    
    setCancelModal({ open: false, id: null });
    setBusyId(id);
    setError(null);
    try {
      const updatedBooking = await cancelBooking(id);
      bookingsCacheRef.current.clear();
      setAllBookings((current) =>
        current.map((booking) => (booking.id === id ? { ...booking, ...updatedBooking } : booking)),
      );
    } catch (e) {
      setError(e?.response?.data?.error?.message || 'Failed to cancel booking');
    } finally {
      setBusyId(null);
    }
  }

  function handleDownloadQr() {
    if (!qrBooking) return;
    const link = document.createElement('a');
    link.href = buildBookingQrUrl(qrBooking);
    link.download = `${qrBooking.resourceCode || 'booking'}-${qrBooking.bookingDate}.png`;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.click();
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* SaaS Pipeline Header */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
             <CalendarCheck className="w-4 h-4 text-primary" />
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-muted)]">Reservation Pipeline</span>
          </div>
          <h2 className="text-3xl font-black tracking-tight text-[var(--color-text)]">My Bookings</h2>
          <p className="text-[var(--color-muted)] font-medium mt-1">Full audit trail and lifecycle management of your campus resource access.</p>
        </div>
        <div className="flex flex-col lg:flex-row lg:items-end gap-3 xl:flex-shrink-0">
          <div className="w-full lg:w-60">
            <Select
              label="Sort Order"
              value={chronology}
              onChange={(e) => {
                const nextChronology = e.target.value;
                setChronology(nextChronology);
                setPage(0);
                setAllBookings((current) => sortBookingContent(current, nextChronology));
              }}
              options={[
                { value: 'latest', label: 'Latest to Oldest' },
                { value: 'oldest', label: 'Oldest to Latest' },
              ]}
            />
          </div>
          <div className="w-full lg:w-56">
            <Select
              label="Booking View"
              value={visibility}
              onChange={(e) => {
                setVisibility(e.target.value);
                setPage(0);
              }}
              options={[
                { value: 'active', label: 'Hide Cancelled' },
                { value: 'all', label: 'Show All' },
                { value: 'cancelled', label: 'Cancelled Only' },
              ]}
            />
          </div>
          <Button
            variant="secondary"
            onClick={() => window.location.reload()}
            className="gap-2 h-12 px-5 whitespace-nowrap"
          >
            <History className="w-4 h-4" />
            Refresh Log
          </Button>
          <Button
            onClick={() => navigate('/bookings/new')}
            className="gap-2 shadow-premium h-12 px-6 whitespace-nowrap"
          >
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
        {loading && !allBookings.length ? (
          <CardLoader text="Syncing Matrix Records..." />
        ) : visibleBookings.length ? (
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
                  {visibleBookings.map((b) => (
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
                           {b.status === 'PENDING' && (
                             <Button
                               variant="soft"
                               size="sm"
                               className="h-8 text-[10px] font-black uppercase tracking-widest"
                               onClick={() => navigate(`/bookings/${b.id}/edit`)}
                             >
                               <Pencil className="w-3.5 h-3.5" />
                               Edit
                             </Button>
                           )}
                           {b.status === 'APPROVED' && (
                             <Button
                               variant="soft"
                               size="sm"
                               className="h-8 text-[10px] font-black uppercase tracking-widest"
                               onClick={() => setQrBooking(b)}
                             >
                               <QrCode className="w-3.5 h-3.5" />
                               View QR
                             </Button>
                           )}
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
                  Log Index {safePage + 1} of {totalPages}
               </div>
               <div className="flex gap-2">
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    disabled={safePage === 0} 
                    onClick={() => setPage(p => p - 1)}
                    className="h-8 w-8 p-0 rounded-lg"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    disabled={safePage >= totalPages - 1} 
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

      {qrBooking && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 animate-fade-in">
          <div
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
            onClick={() => setQrBooking(null)}
          />

          <Card className="relative w-full max-w-xl p-0 overflow-hidden shadow-2xl border-[var(--color-border)] bg-[var(--color-surface)]">
            <div className="px-6 py-5 border-b border-[var(--color-border)] bg-[var(--color-surface)]/60 flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center">
                <QrCode className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-lg font-black text-[var(--color-text)]">Approved Booking QR</h3>
                <p className="text-xs font-medium text-[var(--color-muted)] mt-1">
                  Show or download this QR for your approved reservation.
                </p>
              </div>
              <button
                onClick={() => setQrBooking(null)}
                className="ml-auto p-2 rounded-lg hover:bg-[var(--color-bg-alt)] text-[var(--color-muted)] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 grid md:grid-cols-[260px_1fr] gap-6 items-start">
              <div className="bg-white rounded-2xl p-4 border border-[var(--color-border)] shadow-soft">
                <img
                  src={buildBookingQrUrl(qrBooking)}
                  alt={`QR code for booking ${qrBooking.id}`}
                  className="w-full h-auto rounded-xl"
                />
              </div>

              <div className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-[var(--color-muted)] font-semibold">Resource</span>
                    <span className="text-[var(--color-text)] font-bold text-right">
                      {qrBooking.resourceName} ({qrBooking.resourceCode})
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-[var(--color-muted)] font-semibold">Date</span>
                    <span className="text-[var(--color-text)] font-bold text-right">{qrBooking.bookingDate}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-[var(--color-muted)] font-semibold">Time</span>
                    <span className="text-[var(--color-text)] font-bold text-right">
                      {qrBooking.startTime} - {qrBooking.endTime}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-[var(--color-muted)] font-semibold">Purpose</span>
                    <span className="text-[var(--color-text)] font-bold text-right">{qrBooking.purpose}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-[var(--color-muted)] font-semibold">Attendees</span>
                    <span className="text-[var(--color-text)] font-bold text-right">{qrBooking.expectedAttendees}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-[var(--color-muted)] font-semibold">Status</span>
                    <span className="text-emerald-400 font-black text-right">{qrBooking.status}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-[var(--color-border)] flex flex-col sm:flex-row gap-3">
                  <Button onClick={handleDownloadQr} className="gap-2">
                    <Download className="w-4 h-4" />
                    Download QR
                  </Button>
                  <Button variant="secondary" onClick={() => setQrBooking(null)}>
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

