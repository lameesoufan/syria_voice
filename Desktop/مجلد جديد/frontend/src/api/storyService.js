import client from './client';

const STORIES_BASE = '/stories';
const PUBLIC_STORIES_BASE = '/public/stories';

/**
 * Get public approved stories
 */
export const fetchStories = async (params) => {
  const res = await client.get(PUBLIC_STORIES_BASE, { params });
  return res.data;
};

/**
 * Submit a new story. Accepts FormData for media or JS object for JSON payload.
 */
export const submitNewStory = async (payload, contentType = 'application/json', options = {}) => {
  const config = { ...options };
  // If payload is already FormData, send as-is
  if (payload instanceof FormData) {
    config.headers = { ...(config.headers || {}), 'Content-Type': 'multipart/form-data' };
    const res = await client.post(`${STORIES_BASE}`, payload, config);
    return res.data;
  }

  // Convert plain object payload to multipart/form-data per backend spec
  try {
    const formData = new FormData();
    // Append the story JSON as required by the backend
    formData.append('story', JSON.stringify(payload));
    // If caller provided a `file` field, append it
    if (payload.file) {
      formData.append('file', payload.file);
    }
    config.headers = { ...(config.headers || {}), 'Content-Type': 'multipart/form-data' };
    const res = await client.post(`${STORIES_BASE}`, formData, config);
    return res.data;
  } catch (err) {
    // Fallback: try to send JSON if FormData construction fails
    const res = await client.post(`${STORIES_BASE}`, payload, config);
    return res.data;
  }
};

export const updateStory = async (id, payload) => {
  if (payload instanceof FormData) {
    const res = await client.put(`${STORIES_BASE}/${id}`, payload, { headers: { 'Content-Type': 'multipart/form-data' } });
    return res.data;
  }
  const res = await client.put(`${STORIES_BASE}/${id}`, payload);
  return res.data;
};

export const deleteStory = async (id) => {
  const res = await client.delete(`${STORIES_BASE}/${id}`);
  return res.data;
};

export const getMyStories = async (publisherId) => {
  const res = await client.get(`/stories/my-stories/${publisherId}`);
  return res.data;
};

export const getApprovedStories = async () => {
  const res = await client.get(PUBLIC_STORIES_BASE);
  return res.data;
};

export const getStoryById = async (id) => {
  const res = await client.get(`${PUBLIC_STORIES_BASE}/${id}`);
  return res.data;
};
