import { http } from './http';

export async function createBooking(body) {
  try {
    const res = await http.post('/bookings', body);
    return res.data?.data;
  } catch (error) {
    const message =
      error?.response?.data?.error?.message ||
      error?.response?.data?.message ||
      error?.message ||
      'Failed to create booking';
    throw new Error(message);
  }
}

export async function listBookings(params) {
  const res = await http.get('/bookings', { params });
  return res.data?.data;
}

export async function getBooking(id) {
  const res = await http.get(`/bookings/${id}`);
  return res.data?.data;
}

export async function approveBooking(id, reason) {
  const res = await http.patch(`/bookings/${id}/approve`, { reason });
  return res.data?.data;
}

export async function rejectBooking(id, reason) {
  const res = await http.patch(`/bookings/${id}/reject`, { reason });
  return res.data?.data;
}

export async function cancelBooking(id) {
  const res = await http.patch(`/bookings/${id}/cancel`);
  return res.data?.data;
}

