import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  listNotifications,
  getNotificationSummary,
  markAllNotificationsRead,
  markNotificationRead
} from '../api/notificationsApi';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Link } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  Clock,
  Inbox,
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  MailOpen,
  Filter,
  ShieldCheck,
  Zap,
  BookOpen,
  ArrowRight
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { CardLoader } from '../components/common/PageLoader';

export function NotificationsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [data, setData] = useState(null);
  const [summary, setSummary] = useState({ total: 0, unread: 0, read: 0 });
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);

  async function refresh(customPage = page, customFilter = filter) {
    setLoading(true);
    setError(null);

    try {
      const read =
        customFilter === 'UNREAD'
          ? false
          : customFilter === 'READ'
            ? true
            : undefined;

      const [notificationsData, summaryData] = await Promise.all([
        listNotifications({ page: customPage, size: 10, read }),
        getNotificationSummary()
      ]);

      setData(notificationsData);
      setSummary(summaryData || { total: 0, unread: 0, read: 0 });
    } catch (e) {
      setError(e?.response?.data?.error?.message || 'Failed to sync with alert dispatcher.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh(page, filter);
  }, [page, filter]);

  const getNoticeConfig = (type) => {
    switch (type) {
      case 'BOOKING_APPROVED':
      case 'TICKET_RESOLVED':
        return { icon: CheckCircle2, color: 'text-success', bg: 'bg-success/5', border: 'border-success/20' };
      case 'BOOKING_REJECTED':
      case 'TICKET_REJECTED':
        return { icon: AlertCircle, color: 'text-error', bg: 'bg-error/5', border: 'border-error/20' };
      default:
        return { icon: Zap, color: 'text-primary', bg: 'bg-primary/5', border: 'border-primary/20' };
    }
  };

  const handleNoticeClick = (n) => {
    if (!n.entityId) return;

    if (n.entityType === 'TICKET') {
      navigate(`/tickets/${n.entityId}`);
    } else if (n.entityType === 'BOOKING') {
      if (user?.role?.name === 'ADMIN') {
        navigate('/admin/bookings');
      } else {
        navigate('/my-bookings');
      }
    }
  };

  const filterButtons = [
    { key: 'ALL', label: `All (${summary.total || 0})` },
    { key: 'UNREAD', label: `Unread (${summary.unread || 0})` },
    { key: 'READ', label: `Read (${summary.read || 0})` }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-fade-in-up pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
        <div className="space-y-2">
          <div className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-2 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            Intelligence Center
          </div>
          <h2 className="text-4xl font-black tracking-tight text-[var(--color-text)]">System Alerts</h2>
          <p className="text-[var(--color-muted)] font-medium max-w-lg">
            Manage real-time operational signals and deployment updates across the campus ecosystem.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={() => refresh()}
            disabled={loading}
            className="h-12 px-6 gap-2 rounded-2xl border-[var(--color-border)] text-[var(--color-text)] font-bold text-[10px] uppercase tracking-widest"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Sync
          </Button>

          <Button
            className="h-12 px-8 gap-2 rounded-2xl shadow-premium font-black uppercase tracking-[0.2em] text-[10px]"
            onClick={async () => {
              setError(null);
              try {
                setBusyId('all');
                await markAllNotificationsRead();
                setPage(0);
                await refresh(0, filter);
              } catch (e) {
                setError(e?.response?.data?.error?.message || 'Failed to reset protocols.');
              } finally {
                setBusyId(null);
              }
            }}
            disabled={busyId === 'all'}
          >
            <CheckCheck className="w-4 h-4" />
            {busyId === 'all' ? 'Processing...' : 'Clear Channel'}
          </Button>
        </div>
      </div>

      {error && (
        <Card className="bg-error/5 border-error/20 p-6 rounded-3xl flex items-center gap-4 text-error text-xs font-black uppercase tracking-widest animate-shake">
          <AlertCircle className="w-5 h-5" />
          {error}
        </Card>
      )}

      <Card className="mx-2 overflow-hidden border-primary/25 rounded-[2.5rem] shadow-premium bg-gradient-to-br from-primary/[0.07] to-transparent">
        <div className="p-8 md:p-10 flex flex-col md:flex-row md:items-center gap-8">
          <div className="w-20 h-20 rounded-[1.75rem] bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/30 shrink-0">
            <BookOpen className="w-10 h-10" />
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            <div className="text-[10px] font-black text-primary uppercase tracking-[0.35em]">
              Digital library
            </div>
            <h3 className="text-xl md:text-2xl font-black tracking-tight text-[var(--color-text)]">
              e-Books
            </h3>
            <p className="text-sm text-[var(--color-muted)] font-medium leading-relaxed max-w-xl">
              Search and download PDFs, report concerns, or submit materials for admin review. The library is its own section (sidebar → e-Books); this is just a quick link from the alert center.
            </p>
          </div>
          <Link
            to="/e-books"
            className="inline-flex items-center justify-center gap-2 h-14 px-8 rounded-2xl bg-primary text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-premium hover:opacity-95 transition-opacity shrink-0"
          >
            Open e-Books
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </Card>

      <div className="flex items-center gap-4 px-2 pb-2 overflow-x-auto no-scrollbar">
        {filterButtons.map((item) => (
          <button
            key={item.key}
            onClick={() => {
              setPage(0);
              setFilter(item.key);
            }}
            className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${
              filter === item.key
                ? 'bg-primary border-primary text-white shadow-premium'
                : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-muted)] hover:border-slate-400'
            }`}
          >
            {item.label}
          </button>
        ))}

        <button className="ml-auto p-2.5 rounded-xl border border-[var(--color-border)] text-[var(--color-muted)] hover:text-primary transition-colors">
          <Filter className="w-4 h-4" />
        </button>
      </div>

      <div className="grid gap-6">
        {loading && !data ? (
          <div className="col-span-full">
            <CardLoader text="Scanning Signal Streams..." />
          </div>
        ) : data?.content?.length ? (
          <>
            <div className="space-y-4">
              {data.content.map((n) => {
                const config = getNoticeConfig(n.type);
                const Icon = config.icon;

                return (
                  <Card
                    key={n.id}
                    className={`group transition-all duration-500 overflow-hidden border-[var(--color-border)] rounded-[2rem] shadow-soft hover:shadow-premium hover:-translate-y-1 ${
                      !n.read ? 'bg-[var(--color-surface)] border-primary/20' : 'bg-[var(--color-surface)] opacity-80'
                    }`}
                  >
                    {!n.read && (
                      <div className="absolute top-0 right-0 p-4">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                      </div>
                    )}

                    <div className="p-8 flex items-start gap-8">
                      <div className={`flex-shrink-0 w-16 h-16 rounded-[1.5rem] flex items-center justify-center transition-all duration-700 shadow-inner border-2 ${!n.read ? 'bg-primary border-primary text-white shadow-premium' : 'bg-[var(--color-background)] border-[var(--color-border)] text-[var(--color-muted)]'}`}>
                        {!n.read ? <Icon className="w-8 h-8" /> : <MailOpen className="w-8 h-8 opacity-40" />}
                      </div>

                      <div className="flex-1 min-w-0 py-1">
                        <div className="flex items-start justify-between gap-6">
                          <div className="space-y-1">
                            <div className="flex items-center gap-3">
                              <h3 className={`text-sm font-black uppercase tracking-widest ${!n.read ? 'text-[var(--color-text)]' : 'text-[var(--color-muted)]'}`}>
                                {n.title}
                              </h3>
                              {!n.read && (
                                <Badge className="bg-primary/10 text-primary border-0 text-[8px] font-black uppercase tracking-widest px-2">
                                  New Signal
                                </Badge>
                              )}
                            </div>

                            <p className={`mt-3 text-[13px] leading-relaxed max-w-2xl ${!n.read ? 'text-[var(--color-muted)] font-bold' : 'text-[var(--color-muted)] font-medium opacity-60'}`}>
                              {n.message}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            {n.entityId && (
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => handleNoticeClick(n)}
                                className="h-10 px-6 text-[9px] font-black uppercase tracking-widest border-[var(--color-border)] bg-[var(--color-background)] hover:border-primary transition-all shadow-sm shrink-0"
                              >
                                View Detail
                              </Button>
                            )}

                            {!n.read && (
                              <Button
                                size="sm"
                                variant="secondary"
                                disabled={busyId === n.id}
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  setBusyId(n.id);
                                  try {
                                    await markNotificationRead(n.id);
                                    await refresh(page, filter);
                                  } finally {
                                    setBusyId(null);
                                  }
                                }}
                                className="h-10 px-6 text-[9px] font-black uppercase tracking-widest border-[var(--color-border)] bg-[var(--color-background)] hover:border-primary transition-all shadow-sm shrink-0"
                              >
                                {busyId === n.id ? 'Processing...' : 'Acknowledge'}
                              </Button>
                            )}
                          </div>
                        </div>

                        <div className="mt-6 flex items-center gap-4 text-[9px] font-black text-[var(--color-muted)] uppercase tracking-[0.25em] opacity-40">
                          <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5" />
                            {new Date(n.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} — {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          <div className="w-1 h-1 rounded-full bg-[var(--color-border)]" />
                          <div className="flex items-center gap-1.5">
                            ID: SV-{n.id.substring(0, 6)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            <div className="flex items-center justify-between px-2 pt-6">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <p className="text-[10px] font-black text-[var(--color-muted)] uppercase tracking-widest">
                  Stream Page <span className="text-primary">{data.number + 1}</span> of {data.totalPages || 1}
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  disabled={data.first}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  className="h-12 w-12 p-0 rounded-2xl bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text)] shadow-soft"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <Button
                  variant="secondary"
                  disabled={data.last}
                  onClick={() => setPage((p) => p + 1)}
                  className="h-12 w-12 p-0 rounded-2xl bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text)] shadow-soft"
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <Card className="py-32 text-center border-dashed border-[var(--color-border)] bg-[var(--color-background)]/50 rounded-[3rem] animate-fade-in-up">
            <div className="w-24 h-24 bg-[var(--color-surface)] rounded-[2.5rem] shadow-premium border border-[var(--color-border)] flex items-center justify-center mx-auto mb-8 relative">
              <div className="absolute inset-x-0 -bottom-4 bg-primary/20 blur-2xl h-8 rounded-full" />
              <Inbox className="w-10 h-10 text-[var(--color-muted)] opacity-30" />
            </div>
            <h3 className="text-2xl font-black text-[var(--color-text)] tracking-tight uppercase">Signal Sequence Clear</h3>
            <p className="text-[var(--color-muted)] max-w-xs mx-auto mt-3 text-xs font-bold uppercase tracking-widest opacity-60 leading-relaxed">
              No active alerts detected in the current stream buffer. Dispatching heartbeat sync...
            </p>
            <Button
              variant="secondary"
              className="mt-10 h-12 px-8 rounded-2xl border-[var(--color-border)] font-black uppercase text-[10px] tracking-widest"
              onClick={() => refresh()}
            >
              Manual Trigger
            </Button>
          </Card>
        )}
      </div>

      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-10 rounded-[2.5rem] shadow-soft flex flex-col md:flex-row items-center gap-10">
        <div className="flex -space-x-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="w-14 h-14 rounded-2xl border-4 border-[var(--color-surface)] bg-primary/10 flex items-center justify-center text-primary shadow-lg">
              <Bell className="w-6 h-6" />
            </div>
          ))}
        </div>
        <div className="flex-1 text-center md:text-left">
          <h4 className="text-[11px] font-black text-[var(--color-text)] uppercase tracking-[0.3em]">Protocol Awareness</h4>
          <p className="text-[var(--color-muted)] text-[12px] font-bold mt-2 leading-relaxed uppercase tracking-wider">
            Signals are prioritized based on operational impact. Critical alerts (Red) require immediate intervention, while system updates (Blue) are provided for context only.
          </p>
        </div>
      </div>
    </div>
  );
}