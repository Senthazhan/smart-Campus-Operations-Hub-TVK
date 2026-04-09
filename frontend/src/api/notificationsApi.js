import { http } from './http';
// Notifications API
export async function listNotifications(params) {
  const res = await http.get('/notifications', { params });
  return res.data?.data;
}

export async function markNotificationRead(id) {
  const res = await http.patch(`/notifications/${id}/read`);
  return res.data?.data;
}

export async function markAllNotificationsRead() {
  const res = await http.patch('/notifications/read-all');
  return res.data?.data;
}

