import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  createEbookAdmin,
  listEbookReports,
  listEbookAdminFlags,
  pendingEbookSubmissions,
  acceptEbookSubmission,
  rejectEbookSubmission,
} from '../api/ebooksApi';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import {
  BookOpen,
  ArrowLeft,
  FileText,
  Flag,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export function AdminEBooksPage() {
  const [tab, setTab] = useState('upload');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [uploadBusy, setUploadBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const [err, setErr] = useState(null);

  const [repPage, setRepPage] = useState(0);
  const [reports, setReports] = useState(null);
  const [flagPage, setFlagPage] = useState(0);
  const [flags, setFlags] = useState(null);
  const [subPage, setSubPage] = useState(0);
  const [subs, setSubs] = useState(null);
  const [actionBusy, setActionBusy] = useState(null);

  async function loadReports() {
    try {
      const d = await listEbookReports({ page: repPage, size: 15 });
      setReports(d);
    } catch (e) {
      setErr(e?.response?.data?.error?.message || 'Failed to load reports.');
    }
  }

  async function loadSubs() {
    try {
      const d = await pendingEbookSubmissions({ page: subPage, size: 15 });
      setSubs(d);
    } catch (e) {
      setErr(e?.response?.data?.error?.message || 'Failed to load submissions.');
    }
  }

  async function loadFlags() {
    try {
      const d = await listEbookAdminFlags({ page: flagPage, size: 15 });
      setFlags(d);
    } catch (e) {
      setErr(e?.response?.data?.error?.message || 'Failed to load flags.');
    }
  }

  useEffect(() => {
    if (tab === 'reports') loadReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, repPage]);

  useEffect(() => {
    if (tab === 'flags') loadFlags();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, flagPage]);

  useEffect(() => {
    if (tab === 'review') loadSubs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, subPage]);

  async function onUpload(e) {
    e.preventDefault();
    if (!title.trim() || !file) {
      setErr('Title and PDF are required.');
      return;
    }
    setUploadBusy(true);
    setErr(null);
    setMsg(null);
    try {
      await createEbookAdmin({
        title: title.trim(),
        description: description.trim(),
        file,
      });
      setMsg('E-book published.');
      setTitle('');
      setDescription('');
      setFile(null);
    } catch (e) {
      setErr(e?.response?.data?.error?.message || 'Upload failed.');
    } finally {
      setUploadBusy(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in-up pb-20 px-2">
      <Link
        to="/e-books"
        className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary hover:underline"
      >
        <ArrowLeft className="w-4 h-4" />
        Public library
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary mb-2">
            <BookOpen className="w-5 h-5" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">
              Administration
            </span>
          </div>
          <h2 className="text-3xl font-black text-[var(--color-text)] tracking-tight">
            e-Books console
          </h2>
        </div>
        <div className="flex gap-2 flex-wrap">
          {['upload', 'reports', 'flags', 'review'].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setTab(t);
                setErr(null);
              }}
              className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${
                tab === t
                  ? 'bg-primary text-white border-primary shadow-premium'
                  : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-muted)]'
              }`}
            >
              {t === 'upload'
                ? 'Upload'
                : t === 'reports'
                  ? 'User reports'
                  : t === 'flags'
                    ? 'Admin flags'
                    : 'Review queue'}
            </button>
          ))}
        </div>
      </div>

      {err && (
        <Card className="p-4 rounded-2xl border-error/30 bg-error/5 text-error text-xs font-black uppercase tracking-widest">
          {err}
        </Card>
      )}
      {msg && (
        <Card className="p-4 rounded-2xl border-success/30 bg-success/5 text-success text-xs font-black uppercase tracking-widest">
          {msg}
        </Card>
      )}

      {tab === 'upload' && (
        <Card className="p-8 rounded-[2rem] border-[var(--color-border)] max-w-xl">
          <h3 className="text-sm font-black uppercase tracking-widest text-[var(--color-text)] mb-6">
            Publish PDF
          </h3>
          <form onSubmit={onUpload} className="space-y-5">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--color-muted)] mb-2">
                Title
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full h-12 px-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] text-sm"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--color-muted)] mb-2">
                Short description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] text-sm resize-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--color-muted)] mb-2">
                PDF
              </label>
              <label className="flex items-center gap-3 cursor-pointer rounded-xl border border-dashed border-[var(--color-border)] p-4">
                <FileText className="w-8 h-8 text-primary" />
                <span className="text-xs font-bold truncate">
                  {file ? file.name : 'Select PDF…'}
                </span>
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
              </label>
            </div>
            <p className="text-[10px] text-[var(--color-muted)] font-medium">
              Upload date is set automatically when you publish.
            </p>
            <Button
              type="submit"
              disabled={uploadBusy}
              className="h-12 rounded-2xl font-black uppercase text-[10px] tracking-widest"
            >
              {uploadBusy ? 'Publishing…' : 'Publish e-book'}
            </Button>
          </form>
        </Card>
      )}

      {tab === 'reports' && (
        <div className="space-y-4">
          {reports?.content?.length ? (
            reports.content.map((r) => (
              <Card
                key={r.id}
                className="p-6 rounded-[2rem] border-[var(--color-border)] flex gap-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-error/10 text-error flex items-center justify-center shrink-0">
                  <Flag className="w-6 h-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-black text-[var(--color-text)]">
                      {r.ebookTitle}
                    </span>
                    <Badge className="text-[8px] font-black uppercase">
                      Book report
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-[var(--color-muted)] font-medium leading-relaxed">
                    {r.reason}
                  </p>
                  <p className="mt-3 text-[9px] font-black text-[var(--color-muted)] uppercase tracking-widest opacity-60">
                    Reporter: {r.reporterUserId} ·{' '}
                    {r.createdAt
                      ? new Date(r.createdAt).toLocaleString()
                      : ''}
                  </p>
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-12 text-center rounded-[2rem] border-dashed text-[var(--color-muted)] text-xs font-black uppercase tracking-widest">
              No reports yet.
            </Card>
          )}
          {reports && reports.totalPages > 1 && (
            <div className="flex justify-end gap-2">
              <Button
                variant="secondary"
                disabled={reports.first}
                onClick={() => setRepPage((p) => Math.max(0, p - 1))}
                className="h-10 w-10 p-0 rounded-xl"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button
                variant="secondary"
                disabled={reports.last}
                onClick={() => setRepPage((p) => p + 1)}
                className="h-10 w-10 p-0 rounded-xl"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          )}
        </div>
      )}

      {tab === 'flags' && (
        <div className="space-y-4">
          {flags?.content?.length ? (
            flags.content.map((f) => (
              <Card
                key={f.id}
                className="p-6 rounded-[2rem] border-[var(--color-border)] flex gap-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-warning/10 text-warning flex items-center justify-center shrink-0">
                  <Flag className="w-6 h-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-black text-[var(--color-text)]">
                      {f.ebookTitle}
                    </span>
                    <Badge variant="warning" className="text-[8px] font-black uppercase">
                      Admin flag
                    </Badge>
                  </div>
                  {f.note ? (
                    <p className="mt-2 text-sm text-[var(--color-muted)] font-medium leading-relaxed">
                      {f.note}
                    </p>
                  ) : (
                    <p className="mt-2 text-xs text-[var(--color-muted)] italic">
                      No note
                    </p>
                  )}
                  <p className="mt-3 text-[9px] font-black text-[var(--color-muted)] uppercase tracking-widest opacity-60">
                    Admin: {f.flaggedBy} ·{' '}
                    {f.createdAt
                      ? new Date(f.createdAt).toLocaleString()
                      : ''}
                  </p>
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-12 text-center rounded-[2rem] border-dashed text-[var(--color-muted)] text-xs font-black uppercase tracking-widest">
              No admin flags yet.
            </Card>
          )}
          {flags && flags.totalPages > 1 && (
            <div className="flex justify-end gap-2">
              <Button
                variant="secondary"
                disabled={flags.first}
                onClick={() => setFlagPage((p) => Math.max(0, p - 1))}
                className="h-10 w-10 p-0 rounded-xl"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button
                variant="secondary"
                disabled={flags.last}
                onClick={() => setFlagPage((p) => p + 1)}
                className="h-10 w-10 p-0 rounded-xl"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          )}
        </div>
      )}

      {tab === 'review' && (
        <div className="space-y-4">
          {subs?.content?.length ? (
            subs.content.map((s) => (
              <Card
                key={s.id}
                className="p-6 rounded-[2rem] border-[var(--color-border)]"
              >
                <h4 className="text-sm font-black text-[var(--color-text)] uppercase tracking-wide">
                  {s.title}
                </h4>
                <p className="mt-2 text-xs text-[var(--color-muted)] font-medium">
                  {s.description || '—'}
                </p>
                <p className="mt-2 text-[9px] font-black text-[var(--color-muted)] uppercase tracking-widest">
                  Submitted {s.submittedAt ? new Date(s.submittedAt).toLocaleString() : ''}{' '}
                  · User {s.submittedBy}
                </p>
                <div className="mt-4 flex gap-2">
                  <Button
                    size="sm"
                    disabled={actionBusy === `a-${s.id}`}
                    onClick={async () => {
                      setActionBusy(`a-${s.id}`);
                      setErr(null);
                      try {
                        await acceptEbookSubmission(s.id);
                        await loadSubs();
                      } catch (e) {
                        setErr(
                          e?.response?.data?.error?.message ||
                            'Accept failed.',
                        );
                      } finally {
                        setActionBusy(null);
                      }
                    }}
                    className="gap-1.5 text-[9px] font-black uppercase tracking-widest"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={actionBusy === `r-${s.id}`}
                    onClick={async () => {
                      setActionBusy(`r-${s.id}`);
                      setErr(null);
                      try {
                        await rejectEbookSubmission(s.id);
                        await loadSubs();
                      } catch (e) {
                        setErr(
                          e?.response?.data?.error?.message ||
                            'Reject failed.',
                        );
                      } finally {
                        setActionBusy(null);
                      }
                    }}
                    className="gap-1.5 text-[9px] font-black uppercase tracking-widest text-error border-error/20"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </Button>
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-12 text-center rounded-[2rem] border-dashed text-[var(--color-muted)] text-xs font-black uppercase tracking-widest">
              No pending submissions.
            </Card>
          )}
          {subs && subs.totalPages > 1 && (
            <div className="flex justify-end gap-2">
              <Button
                variant="secondary"
                disabled={subs.first}
                onClick={() => setSubPage((p) => Math.max(0, p - 1))}
                className="h-10 w-10 p-0 rounded-xl"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button
                variant="secondary"
                disabled={subs.last}
                onClick={() => setSubPage((p) => p + 1)}
                className="h-10 w-10 p-0 rounded-xl"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
