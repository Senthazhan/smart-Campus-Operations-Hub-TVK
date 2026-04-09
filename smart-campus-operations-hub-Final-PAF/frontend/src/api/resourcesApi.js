import { http } from './http';

export async function listResources(params) {
  const res = await http.get('/resources', { params });
  return res.data?.data;
}

export async function getResource(id) {
  const res = await http.get(`/resources/${id}`);
  return res.data?.data;
}

export async function createResource(data) {
  const res = await http.post('/resources', data);
  return res.data?.data;
}

export async function updateResource(id, data) {
  const res = await http.put(`/resources/${id}`, data);
  return res.data?.data;
}

export async function deleteResource(id) {
  await http.delete(`/resources/${id}`);
}

export async function uploadResourceImage(id, file) {
  const fd = new FormData();
  fd.append('file', file);
  const res = await http.post(`/resources/${id}/image`, fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data?.data;
}


