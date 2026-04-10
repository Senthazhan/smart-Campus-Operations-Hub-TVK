import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  listEbooks,
  downloadEbookFile,
  reportEbook,
  myEbookSubmissions,
  deleteMyEbookSubmission,
  deleteMyPublishedEbook,
  deleteEbookAdmin,
  flagEbookAdmin,
} from '../api/ebooksApi';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { CardLoader } from '../components/common/PageLoader';
import { Badge } from '../components/common/Badge';
import { useAuth } from '../context/AuthContext';
import {
  BookOpen,
  Search,
  Download,
  Flag,
  ChevronLeft,
  ChevronRight,
  Library,
  X,
  Trash2,
  ChevronDown,
} from 'lucide-react';

function normStatus(s) {
  if (s == null) return '';
  return String(s).toUpperCase();
}

function submissionId(row) {
  return row?.id ?? row?.submissionId ?? '';
}

export function EBooksPage() {
  const { user } = useAuth();
  const isAdmin = user?.role?.name === 'ADMIN' || user?.role === 'ADMIN';
  const [q, setQ] = useState('');
  const [page, setPage] = useState(0);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportFor, setReportFor] = useState(null);
  const [reportReason, setReportReason] = useState('');
  const [reportBusy, setReportBusy] = useState(false);
  const [flagFor, setFlagFor] = useState(null);
  const [flagNote, setFlagNote] = useState('');
  const [flagBusy, setFlagBusy] = useState(false);
  const [adminDelBusy, setAdminDelBusy] = useState(null);
  const [dlBusy, setDlBusy] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyBusy, setHistoryBusy] = useState(null);

  async function loadHistory() {
    if (isAdmin) return;
    setHistoryLoading(true);
    try {
      const list = await myEbookSubmissions();
      setHistory(Array.isArray(list) ? list : []);
    } catch {
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  }

  useEffect(() => {
    loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  async function refresh(pageIndex = page, searchQuery = q) {
    setLoading(true);
    setError(null);
    try {
      const d = await listEbooks({
        q: (searchQuery && String(searchQuery).trim()) || undefined,
        page: pageIndex,
        size: 12,
      });
      setData(d);
    } catch (e) {
      setError(
        e?.response?.data?.error?.message ||
          'Unable to load the digital library.',
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh(page, q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  function handleSearch(e) {
    e.preventDefault();
    const query = q.trim();
    if (page === 0) {
      void refresh(0, query);
    } else {
      setPage(0);
    }
  }

  async function submitReport() {
    if (!reportFor || !reportReason.trim()) return;
    setReportBusy(true);
    setError(null);
    try {
      await reportEbook(reportFor.id, reportReason.trim());
      setReportFor(null);
      setReportReason('');
    } catch (e) {
      setError(
        e?.response?.data?.error?.message || 'Could not submit report.',
      );
    } finally {
      setReportBusy(false);
    }
  }

  async function submitFlag() {
    if (!flagFor) return;
    setFlagBusy(true);
    setError(null);
    try {
      await flagEbookAdmin(flagFor.id, flagNote.trim());
      setFlagFor(null);
      setFlagNote('');
    } catch (e) {
      setError(
        e?.response?.data?.error?.message || 'Could not save flag.',
      );
    } finally {
      setFlagBusy(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in-up pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
        <div className="space-y-2">
          <div className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-2 flex items-center gap-2">
            <Library className="w-4 h-4" />
            Digital library
          </div>
          <h2 className="text-4xl font-black tracking-tight text-[var(--color-text)]">
            e-Books Library
          </h2>
          <p className="text-[var(--color-muted)] font-medium max-w-lg">
            {isAdmin
              ? 'Search the catalogue, download PDFs, flag titles for follow-up, or remove any book.'
              : 'Search and download campus PDFs. Report issues if something looks wrong.'}
          </p>
        </div>
        {isAdmin && (
          <Link to="/admin/e-books">
            <Button className="h-12 px-6 gap-2 rounded-2xl shadow-premium font-black uppercase text-[10px] tracking-widest">
              <BookOpen className="w-4 h-4" />
              Admin console
            </Button>
          </Link>
        )}
      </div>

      <form
        onSubmit={handleSearch}
        className="flex flex-col sm:flex-row gap-3 px-2"
      >
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted)]" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by title or description…"
            className="w-full h-12 pl-11 pr-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] text-sm font-medium focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
          />
        </div>
        <Button
          type="submit"
          className="h-12 px-8 rounded-2xl font-black uppercase text-[10px] tracking-widest shrink-0"
        >
          Search
        </Button>
      </form>

      {error && (
        <Card className="mx-2 bg-error/5 border-error/20 p-6 rounded-3xl text-error text-xs font-black uppercase tracking-widest">
          {error}
        </Card>
      )}

      <section className="px-2 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[var(--color-text)]">
            Available books
          </h3>
          {data != null && !loading && (
            <span className="text-[10px] font-bold text-[var(--color-muted)] uppercase tracking-widest">
              {data.totalElements ?? data.content?.length ?? 0} title
              {(data.totalElements ?? data.content?.length) === 1 ? '' : 's'}
            </span>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {loading && !data ? (
            <div className="col-span-full">
              <CardLoader text="Loading titles…" />
            </div>
          ) : data?.content?.length ? (
            data.content.map((b) => (
              <Card
                key={b.id}
                className="p-6 rounded-[2rem] border-[var(--color-border)] bg-[var(--color-surface)] shadow-soft"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <BookOpen className="w-7 h-7" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-black uppercase tracking-wide text-[var(--color-text)] line-clamp-2">
                      {b.title}
                    </h3>
                    <p className="mt-2 text-xs text-[var(--color-muted)] font-medium leading-relaxed line-clamp-3">
                      {b.description || 'No description.'}
                    </p>
                    <p className="mt-3 text-[9px] font-black text-[var(--color-muted)] uppercase tracking-widest opacity-60">
                      Added{' '}
                      {b.uploadedAt
                        ? new Date(b.uploadedAt).toLocaleDateString()
                        : '—'}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        disabled={dlBusy === b.id}
                        onClick={async () => {
                          setDlBusy(b.id);
                          try {
                            await downloadEbookFile(b.id);
                          } catch {
                            setError('Download failed.');
                          } finally {
                            setDlBusy(null);
                          }
                        }}
                        className="h-9 px-4 text-[9px] font-black uppercase tracking-widest gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" />
                        {dlBusy === b.id ? '…' : 'Download PDF'}
                      </Button>
                      {isAdmin ? (
                        <>
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              setFlagFor(b);
                              setFlagNote('');
                            }}
                            className="h-9 px-4 text-[9px] font-black uppercase tracking-widest gap-1.5 border-warning/30 text-warning hover:bg-warning/5"
                          >
                            <Flag className="w-3.5 h-3.5" />
                            Flag
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            disabled={adminDelBusy === b.id}
                            onClick={async () => {
                              if (
                                !window.confirm(
                                  'Permanently delete this e-book from the library for everyone?',
                                )
                              )
                                return;
                              setAdminDelBusy(b.id);
                              setError(null);
                              try {
                                await deleteEbookAdmin(b.id);
                                await refresh(page, q);
                              } catch (e) {
                                setError(
                                  e?.response?.data?.error?.message ||
                                    'Could not delete.',
                                );
                              } finally {
                                setAdminDelBusy(null);
                              }
                            }}
                            className="h-9 px-4 text-[9px] font-black uppercase tracking-widest gap-1.5 border-error/25 text-error hover:bg-error/5"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
                          </Button>
                        </>
                      ) : (
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            setReportFor(b);
                            setReportReason('');
                          }}
                          className="h-9 px-4 text-[9px] font-black uppercase tracking-widest gap-1.5 border-error/20 text-error hover:bg-error/5"
                        >
                          <Flag className="w-3.5 h-3.5" />
                          Report
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card className="col-span-full py-16 text-center rounded-[2.5rem] border-dashed border-[var(--color-border)]">
              <BookOpen className="w-10 h-10 mx-auto text-[var(--color-muted)] opacity-30 mb-4" />
              <p className="text-sm font-black text-[var(--color-muted)] uppercase tracking-widest">
                No e-books match your search.
              </p>
            </Card>
          )}
        </div>

        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <p className="text-[10px] font-black text-[var(--color-muted)] uppercase tracking-widest">
              Page {data.number + 1} of {data.totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                disabled={data.first}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="h-11 w-11 p-0 rounded-2xl"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button
                type="button"
                variant="secondary"
                disabled={data.last}
                onClick={() => setPage((p) => p + 1)}
                className="h-11 w-11 p-0 rounded-2xl"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        )}
      </section>

      {!isAdmin && (
        <details className="mx-2 group border border-[var(--color-border)] rounded-2xl bg-[var(--color-surface)]/40 overflow-hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)]/60 transition-colors">
            <span>My submissions</span>
            <span className="flex items-center gap-2 shrink-0">
              {historyLoading ? (
                <span className="opacity-60">…</span>
              ) : (
                <span className="opacity-80">{history.length}</span>
              )}
              <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
            </span>
          </summary>
          <div className="px-4 pb-4 pt-0 border-t border-[var(--color-border)]/60">
            <p className="pt-3 text-[11px] text-[var(--color-muted)] font-medium leading-relaxed">
              Track PDFs you sent for review, cancel a pending upload, or remove
              a rejected row.{' '}
              <Link
                to="/e-books/submit"
                className="text-primary font-bold hover:underline"
              >
                Submit a PDF for review
              </Link>
            </p>
            {historyLoading ? (
              <p className="mt-3 text-xs text-[var(--color-muted)]">
                Loading…
              </p>
            ) : history.length === 0 ? (
              <p className="mt-3 text-xs text-[var(--color-muted)] font-medium">
                Nothing here yet.
              </p>
            ) : (
              <ul className="mt-4 space-y-4">
                {history.map((row) => {
                  const st = normStatus(row.status);
                  const sid = submissionId(row);
                  const badgeVariant =
                    st === 'PENDING'
                      ? 'warning'
                      : st === 'REJECTED'
                        ? 'error'
                        : 'success';
                  const statusLabel =
                    st === 'PENDING'
                      ? 'Pending review'
                      : st === 'REJECTED'
                        ? 'Rejected'
                        : 'Live in library';
                  return (
                    <li
                      key={sid || row.title}
                      className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 pb-4 border-b border-[var(--color-border)] last:border-0 last:pb-0"
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-black text-[var(--color-text)]">
                            {row.title}
                          </span>
                          <Badge variant={badgeVariant}>{statusLabel}</Badge>
                        </div>
                        {row.description ? (
                          <p className="mt-1 text-xs text-[var(--color-muted)] font-medium line-clamp-2">
                            {row.description}
                          </p>
                        ) : null}
                        <p className="mt-2 text-[9px] font-black text-[var(--color-muted)] uppercase tracking-widest opacity-70">
                          Sent{' '}
                          {row.submittedAt
                            ? new Date(row.submittedAt).toLocaleString()
                            : '—'}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2 shrink-0">
                        {st === 'PENDING' && sid && (
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            disabled={historyBusy === sid}
                            onClick={async () => {
                              if (
                                !window.confirm(
                                  'Cancel this submission? The PDF will be removed.',
                                )
                              )
                                return;
                              setHistoryBusy(sid);
                              setError(null);
                              try {
                                await deleteMyEbookSubmission(sid);
                                await loadHistory();
                                await refresh(page, q);
                              } catch (e) {
                                setError(
                                  e?.response?.data?.error?.message ||
                                    'Could not cancel.',
                                );
                              } finally {
                                setHistoryBusy(null);
                              }
                            }}
                            className="h-9 px-3 text-[9px] font-black uppercase tracking-widest gap-1.5"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Cancel pending
                          </Button>
                        )}
                        {st === 'REJECTED' && sid && (
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            disabled={historyBusy === sid}
                            onClick={async () => {
                              if (
                                !window.confirm(
                                  'Remove this rejected entry from your history?',
                                )
                              )
                                return;
                              setHistoryBusy(sid);
                              setError(null);
                              try {
                                await deleteMyEbookSubmission(sid);
                                await loadHistory();
                              } catch (e) {
                                setError(
                                  e?.response?.data?.error?.message ||
                                    'Could not remove.',
                                );
                              } finally {
                                setHistoryBusy(null);
                              }
                            }}
                            className="h-9 px-3 text-[9px] font-black uppercase tracking-widest gap-1.5"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Remove
                          </Button>
                        )}
                        {st === 'ACCEPTED' && row.publishedEbookId && (
                          <>
                            <Button
                              type="button"
                              size="sm"
                              variant="secondary"
                              disabled={
                                historyBusy === `dl-${row.publishedEbookId}`
                              }
                              onClick={async () => {
                                setHistoryBusy(`dl-${row.publishedEbookId}`);
                                try {
                                  await downloadEbookFile(row.publishedEbookId);
                                } catch {
                                  setError('Download failed.');
                                } finally {
                                  setHistoryBusy(null);
                                }
                              }}
                              className="h-9 px-3 text-[9px] font-black uppercase tracking-widest gap-1.5"
                            >
                              <Download className="w-3.5 h-3.5" />
                              Download
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="secondary"
                              disabled={
                                historyBusy === `rm-${row.publishedEbookId}`
                              }
                              onClick={async () => {
                                if (
                                  !window.confirm(
                                    'Remove this title from the public library? This cannot be undone.',
                                  )
                                )
                                  return;
                                setHistoryBusy(`rm-${row.publishedEbookId}`);
                                setError(null);
                                try {
                                  await deleteMyPublishedEbook(
                                    row.publishedEbookId,
                                  );
                                  await loadHistory();
                                  await refresh(page, q);
                                } catch (e) {
                                  setError(
                                    e?.response?.data?.error?.message ||
                                      'Could not remove from library.',
                                  );
                                } finally {
                                  setHistoryBusy(null);
                                }
                              }}
                              className="h-9 px-3 text-[9px] font-black uppercase tracking-widest gap-1.5 border-error/25 text-error hover:bg-error/5"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Remove from library
                            </Button>
                          </>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </details>
      )}

      {reportFor && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-md p-8 rounded-[2rem] border-[var(--color-border)] shadow-premium relative">
            <button
              type="button"
              className="absolute top-4 right-4 p-2 rounded-xl hover:bg-[var(--color-background)] text-[var(--color-muted)]"
              onClick={() => setReportFor(null)}
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
            <h4 className="text-sm font-black uppercase tracking-widest text-[var(--color-text)] pr-10">
              Report: {reportFor.title}
            </h4>
            <p className="text-xs text-[var(--color-muted)] mt-2 font-medium">
              Describe the issue. Administrators will review your report.
            </p>
            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              rows={4}
              className="mt-4 w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-4 text-sm text-[var(--color-text)] focus:ring-2 focus:ring-primary/30 outline-none resize-none"
              placeholder="Reason…"
            />
            <div className="mt-6 flex gap-3 justify-end">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setReportFor(null)}
                className="rounded-xl text-[10px] font-black uppercase tracking-widest"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={submitReport}
                disabled={!reportReason.trim() || reportBusy}
                className="rounded-xl text-[10px] font-black uppercase tracking-widest"
              >
                {reportBusy ? 'Sending…' : 'Submit report'}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {flagFor && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-md p-8 rounded-[2rem] border-[var(--color-border)] shadow-premium relative">
            <button
              type="button"
              className="absolute top-4 right-4 p-2 rounded-xl hover:bg-[var(--color-background)] text-[var(--color-muted)]"
              onClick={() => setFlagFor(null)}
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
            <h4 className="text-sm font-black uppercase tracking-widest text-[var(--color-text)] pr-10">
              Flag: {flagFor.title}
            </h4>
            <p className="text-xs text-[var(--color-muted)] mt-2 font-medium">
              Optional note appears in the admin console (Flags tab). You can
              flag without a note.
            </p>
            <textarea
              value={flagNote}
              onChange={(e) => setFlagNote(e.target.value)}
              rows={3}
              className="mt-4 w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-4 text-sm text-[var(--color-text)] focus:ring-2 focus:ring-primary/30 outline-none resize-none"
              placeholder="Note (optional)…"
            />
            <div className="mt-6 flex gap-3 justify-end">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setFlagFor(null)}
                className="rounded-xl text-[10px] font-black uppercase tracking-widest"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={submitFlag}
                disabled={flagBusy}
                className="rounded-xl text-[10px] font-black uppercase tracking-widest"
              >
                {flagBusy ? 'Saving…' : 'Save flag'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
