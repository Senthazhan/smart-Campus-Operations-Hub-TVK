import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { submitEbook } from '../api/ebooksApi';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { BookOpen, ArrowLeft, FileText } from 'lucide-react';

export function EBookSubmitPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function onSubmit(e) {
    e.preventDefault();
    if (!title.trim() || !file) {
      setError('Title and a PDF file are required.');
      return;
    }
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setError('Only PDF files are accepted.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await submitEbook({
        title: title.trim(),
        description: description.trim(),
        file,
      });
      navigate('/e-books', { replace: true });
    } catch (err) {
      setError(
        err?.response?.data?.error?.message ||
          'Submission failed. Try again.',
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-8 animate-fade-in-up pb-20 px-2">
      <Link
        to="/e-books"
        className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary hover:underline"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to library
      </Link>

      <div>
        <div className="flex items-center gap-2 mb-2 text-primary">
          <BookOpen className="w-5 h-5" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">
            User contribution
          </span>
        </div>
        <h2 className="text-3xl font-black text-[var(--color-text)] tracking-tight">
          Submit an e-book
        </h2>
        <p className="text-[var(--color-muted)] text-sm font-medium mt-2">
          Upload a PDF with a title and short description. An administrator will
          review and publish it to the library.
        </p>
      </div>

      <Card className="p-8 rounded-[2rem] border-[var(--color-border)]">
        {error && (
          <div className="mb-6 text-xs font-black uppercase tracking-widest text-error">
            {error}
          </div>
        )}
        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--color-muted)] mb-2">
              Title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full h-12 px-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-text)] text-sm font-medium focus:ring-2 focus:ring-primary/30 outline-none"
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
              className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-text)] text-sm font-medium focus:ring-2 focus:ring-primary/30 outline-none resize-none"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--color-muted)] mb-2">
              PDF file only
            </label>
            <label className="flex items-center gap-3 cursor-pointer rounded-xl border border-dashed border-[var(--color-border)] p-4 hover:border-primary/40 transition-colors">
              <FileText className="w-8 h-8 text-primary shrink-0" />
              <div className="min-w-0 text-left">
                <p className="text-xs font-bold text-[var(--color-text)] truncate">
                  {file ? file.name : 'Choose PDF…'}
                </p>
                <p className="text-[10px] text-[var(--color-muted)] font-medium mt-0.5">
                  Max size depends on server settings
                </p>
              </div>
              <input
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </label>
          </div>
          <Button
            type="submit"
            disabled={busy}
            className="w-full h-12 rounded-2xl font-black uppercase text-[10px] tracking-widest"
          >
            {busy ? 'Uploading…' : 'Submit for review'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
