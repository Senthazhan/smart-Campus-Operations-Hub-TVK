import { http } from './http';

export async function getAdminAnalytics(days = 7) {
  const res = await http.get(`/analytics/admin?days=${days}`);
  return res.data?.data;
}

export async function getUserAnalytics() {
  const res = await http.get('/analytics/me');
  return res.data?.data;
}

