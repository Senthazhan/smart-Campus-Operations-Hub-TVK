import { http } from './http';

export async function listEbooks(params) {
  const res = await http.get('/ebooks', { params });
  return res.data?.data;
}

export async function createEbookAdmin({ title, description, file }) {
  const fd = new FormData();
  fd.append('title', title);
  if (description) fd.append('description', description);
  fd.append('file', file);
  const res = await http.post('/ebooks', fd);
  return res.data?.data;
}

export async function reportEbook(id, reason) {
  const res = await http.post(`/ebooks/${id}/reports`, { reason });
  return res.data?.data;
}

export async function listEbookReports(params) {
  const res = await http.get('/ebooks/reports', { params });
  return res.data?.data;
}

export async function submitEbook({ title, description, file }) {
  const fd = new FormData();
  fd.append('title', title);
  if (description) fd.append('description', description);
  fd.append('file', file);
  const res = await http.post('/ebooks/submissions', fd);
  return res.data?.data;
}

export async function myEbookSubmissions() {
  const res = await http.get('/ebooks/submissions/me');
  return res.data?.data;
}

export async function pendingEbookSubmissions(params) {
  const res = await http.get('/ebooks/submissions/pending', { params });
  return res.data?.data;
}

export async function acceptEbookSubmission(submissionId) {
  const res = await http.post(`/ebooks/submissions/${submissionId}/accept`);
  return res.data?.data;
}

export async function rejectEbookSubmission(submissionId) {
  const res = await http.post(`/ebooks/submissions/${submissionId}/reject`);
  return res.data?.data;
}

export async function deleteMyEbookSubmission(submissionId) {
  const id = encodeURIComponent(submissionId);
  await http.delete(`/ebooks/submissions/me/${id}`);
}

export async function deleteMyPublishedEbook(ebookId) {
  await http.delete(`/ebooks/${encodeURIComponent(ebookId)}`);
}

export async function deleteEbookAdmin(ebookId) {
  await http.delete(`/ebooks/admin/${encodeURIComponent(ebookId)}`);
}

export async function flagEbookAdmin(ebookId, note) {
  await http.post(
    `/ebooks/${encodeURIComponent(ebookId)}/admin-flag`,
    note ? { note } : {},
  );
}

export async function listEbookAdminFlags(params) {
  const res = await http.get('/ebooks/admin/flags', { params });
  return res.data?.data;
}

/** Opens save dialog in browser; uses same auth as axios. */
export async function downloadEbookFile(id) {
  const token = localStorage.getItem('token');
  const base = import.meta.env.VITE_API_BASE_URL || '/api/v1';
  const url = `${base.replace(/\/$/, '')}/ebooks/${id}/download`;
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) {
    const err = new Error('Download failed');
    err.status = res.status;
    throw err;
  }
  const blob = await res.blob();
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'ebook.pdf';
  a.click();
  URL.revokeObjectURL(a.href);
}
