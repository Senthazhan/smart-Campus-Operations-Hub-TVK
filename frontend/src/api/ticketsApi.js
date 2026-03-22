import { http } from "./http";

export async function createTicket(body) {
  // For FormData, don't set Content-Type header - let the browser set it as multipart/form-data
  const config =
    body instanceof FormData
      ? {
          headers: { "Content-Type": undefined },
        }
      : {};
  const res = await http.post("/tickets", body, config);
  return res.data?.data;
}

export async function listTickets(params) {
  const res = await http.get("/tickets", { params });
  return res.data?.data;
}

export async function getTicket(id) {
  const res = await http.get(`/tickets/${id}`);
  return res.data?.data;
}

export async function updateTicketStatus(id, body) {
  const res = await http.patch(`/tickets/${id}/status`, body);
  return res.data?.data;
}

export async function assignTechnician(id, technicianUserId) {
  const res = await http.patch(`/tickets/${id}/assign-technician`, {
    technicianUserId,
  });
  return res.data?.data;
}

export async function uploadTicketAttachments(id, files) {
  const fd = new FormData();
  for (const f of files) fd.append("files", f);
  const res = await http.post(`/tickets/${id}/attachments`, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data?.data;
}

export async function addTicketComment(id, body) {
  const res = await http.post(`/tickets/${id}/comments`, body);
  return res.data?.data;
}

export async function updateComment(commentId, body) {
  const res = await http.put(`/comments/${commentId}`, body);
  return res.data?.data;
}

export async function deleteComment(commentId) {
  await http.delete(`/comments/${commentId}`);
}
