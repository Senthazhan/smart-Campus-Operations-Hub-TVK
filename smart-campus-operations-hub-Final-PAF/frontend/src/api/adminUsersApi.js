import { http } from './http';

export async function listUsers(params) {
  const res = await http.get('/admin/users', { params });
  return res.data?.data;
}

export async function updateUserRole(id, role) {
  const res = await http.patch(`/admin/users/${id}/role`, { role });
  return res.data?.data;
}

export async function toggleUserStatus(id) {
  const res = await http.patch(`/admin/users/${id}/status`);
  return res.data?.data;
}

export async function createUser(data) {
  const res = await http.post('/admin/users', data);
  return res.data?.data;
}

export async function updateUserProfile(id, data) {
  const res = await http.patch(`/admin/users/${id}`, data);
  return res.data?.data;
}

export async function deleteUser(id) {
  const res = await http.delete(`/admin/users/${id}`);
  return res.data?.data;
}

