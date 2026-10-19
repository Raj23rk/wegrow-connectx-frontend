const API_BASE = '/api';

export const getToken = () => localStorage.getItem('connectx_token');
export const setToken = (token) => localStorage.setItem('connectx_token', token);
export const removeToken = () => localStorage.removeItem('connectx_token');

const request = async (endpoint, options = {}) => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'API request failed');
    }
    return data;
  } catch (error) {
    console.warn(`[API] Error on ${endpoint}:`, error.message);
    throw error;
  }
};

export const api = {
  // Auth
  login: (email, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (userData) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  getMe: () => request('/auth/me'),
  getDemoAccounts: () => request('/auth/demo-accounts'),
  updatePassword: (currentPassword, newPassword) => request('/auth/update-password', { method: 'POST', body: JSON.stringify({ currentPassword, newPassword }) }),

  // Users & Presence
  getUsers: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/users${q ? `?${q}` : ''}`);
  },
  getUser: (id) => request(`/users/${id}`),
  updateProfile: (profileData) => request('/users/profile', { method: 'PUT', body: JSON.stringify(profileData) }),
  updateStatus: (status, statusMessage) => request('/users/status', { method: 'PUT', body: JSON.stringify({ status, statusMessage }) }),

  // Brands & Channels
  getBrands: () => request('/brands'),
  getChannels: (brandId) => request(`/channels${brandId ? `?brandId=${brandId}` : ''}`),
  createChannel: (channelData) => request('/channels', { method: 'POST', body: JSON.stringify(channelData) }),
  getChannelMessages: (channelId) => request(`/channels/${channelId}/messages`),

  // Messages
  sendMessage: (msgData) => request('/messages', { method: 'POST', body: JSON.stringify(msgData) }),
  toggleReaction: (messageId, emoji) => request(`/messages/${messageId}/reaction`, { method: 'PUT', body: JSON.stringify({ emoji }) }),
  deleteMessage: (messageId) => request(`/messages/${messageId}`, { method: 'DELETE' }),

  // Chats
  getChats: () => request('/chats'),
  createChat: (participantIds, name, type) => request('/chats', { method: 'POST', body: JSON.stringify({ participantIds, name, type }) }),
  getChatMessages: (chatId) => request(`/chats/${chatId}/messages`),
  sendChatMessage: (chatId, text, attachments) => request(`/chats/${chatId}/messages`, { method: 'POST', body: JSON.stringify({ text, attachments }) }),

  // Calendar
  getCalendarEvents: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/calendar${q ? `?${q}` : ''}`);
  },
  createEvent: (eventData) => request('/calendar', { method: 'POST', body: JSON.stringify(eventData) }),
  rsvpEvent: (id, status) => request(`/calendar/${id}/rsvp`, { method: 'PUT', body: JSON.stringify({ status }) }),
  deleteEvent: (id) => request(`/calendar/${id}`, { method: 'DELETE' }),

  // Files
  getFiles: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/files${q ? `?${q}` : ''}`);
  },
  uploadFile: async (formData) => {
    const token = getToken();
    const res = await fetch(`${API_BASE}/files/upload`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: formData
    });
    return res.json();
  },

  // Activities
  getActivities: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/activity${q ? `?${q}` : ''}`);
  },
  markActivityRead: (id) => request(`/activity/${id}/read`, { method: 'PUT' }),
  markAllActivitiesRead: () => request('/activity/read-all', { method: 'PUT' }),

  // Admin
  getAdminUsers: () => request('/admin/users'),
  createAdminUser: (userData) => request('/admin/users', { method: 'POST', body: JSON.stringify(userData) }),
  updateAdminUser: (id, userData) => request(`/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(userData) }),
  resetAdminPassword: (id, newPassword) => request(`/admin/users/${id}/reset-password`, { method: 'POST', body: JSON.stringify({ newPassword }) }),
  deleteAdminUser: (id) => request(`/admin/users/${id}`, { method: 'DELETE' }),
  getAdminStats: () => request('/admin/stats')
};
