import client from './client';

const ADMIN_BASE = '/admin/stories';

export const getPendingStories = async () => {
  const res = await client.get(`${ADMIN_BASE}/pending`);
  return res.data;
};

export const approveStory = async (id) => {
  const res = await client.put(`${ADMIN_BASE}/${id}/approve`);
  return res.data;
};

export const rejectStory = async (id, message) => {
  // backend schema returns Story; message optional
  const res = await client.put(`${ADMIN_BASE}/${id}/reject`, message ? { message } : null);
  return res.data;
};

export const requestModification = async (id, note) => {
  // request body schema shows a string
  const res = await client.put(`${ADMIN_BASE}/${id}/request-modification`, note);
  return res.data;
};
