const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const getHeaders = (includeAuth = true) => {
  const headers = { 'Content-Type': 'application/json' };
  if (includeAuth) {
    const token = localStorage.getItem('nyumba_token');
    if (token) headers['Authorization'] = `Token ${token}`;
  }
  return headers;
};

const getFormHeaders = () => {
  const headers = {};
  const token = localStorage.getItem('nyumba_token');
  if (token) headers['Authorization'] = `Token ${token}`;
  return headers;
};

const handleResponse = async (res) => {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw { status: res.status, data };
  return data;
};

// ── AUTH ──────────────────────────────────────────────
export const authAPI = {
  register: (data) =>
    fetch(`${BASE_URL}/auth/register/`, { method: 'POST', headers: getHeaders(false), body: JSON.stringify(data) }).then(handleResponse),

  login: (data) =>
    fetch(`${BASE_URL}/auth/login/`, { method: 'POST', headers: getHeaders(false), body: JSON.stringify(data) }).then(handleResponse),

  logout: () =>
    fetch(`${BASE_URL}/auth/logout/`, { method: 'POST', headers: getHeaders() }).then(handleResponse),

  me: () =>
    fetch(`${BASE_URL}/auth/me/`, { headers: getHeaders() }).then(handleResponse),
};

// ── HOUSES ────────────────────────────────────────────
export const housesAPI = {
  list: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${BASE_URL}/houses/?${query}`, { headers: getHeaders(false) }).then(handleResponse);
  },

  detail: (id) =>
    fetch(`${BASE_URL}/houses/${id}/`, { headers: getHeaders(false) }).then(handleResponse),

  create: (data) =>
    fetch(`${BASE_URL}/houses/`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse),

  update: (id, data) =>
    fetch(`${BASE_URL}/houses/${id}/`, { method: 'PATCH', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse),

  delete: (id) =>
    fetch(`${BASE_URL}/houses/${id}/`, { method: 'DELETE', headers: getHeaders() }).then(handleResponse),

  myListings: () =>
    fetch(`${BASE_URL}/houses/my_listings/`, { headers: getHeaders() }).then(handleResponse),

  featured: () =>
    fetch(`${BASE_URL}/houses/featured/`, { headers: getHeaders(false) }).then(handleResponse),

  categories: () =>
    fetch(`${BASE_URL}/houses/categories/`, { headers: getHeaders(false) }).then(handleResponse),

  stats: () =>
    fetch(`${BASE_URL}/houses/stats/`, { headers: getHeaders(false) }).then(handleResponse),

  uploadImages: (id, formData) =>
    fetch(`${BASE_URL}/houses/${id}/upload_images/`, { method: 'POST', headers: getFormHeaders(), body: formData }).then(handleResponse),

  uploadVideo: (id, formData) =>
    fetch(`${BASE_URL}/houses/${id}/upload_video/`, { method: 'POST', headers: getFormHeaders(), body: formData }).then(handleResponse),
};

// ── LANDLORDS ─────────────────────────────────────────
export const landlordAPI = {
  list: () =>
    fetch(`${BASE_URL}/landlords/`, { headers: getHeaders(false) }).then(handleResponse),

  detail: (id) =>
    fetch(`${BASE_URL}/landlords/${id}/`, { headers: getHeaders(false) }).then(handleResponse),

  myProfile: () =>
    fetch(`${BASE_URL}/landlords/my_profile/`, { headers: getHeaders() }).then(handleResponse),

  updateProfile: (data) =>
    fetch(`${BASE_URL}/landlords/update_profile/`, { method: 'PATCH', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse),

  houses: (id) =>
    fetch(`${BASE_URL}/landlords/${id}/houses/`, { headers: getHeaders(false) }).then(handleResponse),
};

// ── REVIEWS ───────────────────────────────────────────
export const reviewsAPI = {
  forLandlord: (landlordId) =>
    fetch(`${BASE_URL}/reviews/?landlord_id=${landlordId}`, { headers: getHeaders(false) }).then(handleResponse),

  create: (data) =>
    fetch(`${BASE_URL}/reviews/`, { method: 'POST', headers: getHeaders(false), body: JSON.stringify(data) }).then(handleResponse),
};

// ── BOOKINGS ──────────────────────────────────────────
export const bookingsAPI = {
  create: (data) =>
    fetch(`${BASE_URL}/bookings/`, { method: 'POST', headers: getHeaders(false), body: JSON.stringify(data) }).then(handleResponse),

  initiateMpesa: (data) =>
    fetch(`${BASE_URL}/bookings/initiate_mpesa/`, { method: 'POST', headers: getHeaders(false), body: JSON.stringify(data) }).then(handleResponse),

  landlordBookings: () =>
    fetch(`${BASE_URL}/bookings/landlord_bookings/`, { headers: getHeaders() }).then(handleResponse),
};

// ── CHAT ──────────────────────────────────────────────
export const chatAPI = {
  createRoom: (data) =>
    fetch(`${BASE_URL}/chats/`, { method: 'POST', headers: getHeaders(false), body: JSON.stringify(data) }).then(handleResponse),

  getRoom: (id) =>
    fetch(`${BASE_URL}/chats/${id}/`, { headers: getHeaders(false) }).then(handleResponse),

  landlordChats: () =>
    fetch(`${BASE_URL}/chats/`, { headers: getHeaders() }).then(handleResponse),

  sendMessage: (roomId, data) =>
    fetch(`${BASE_URL}/chats/${roomId}/send_message/`, { method: 'POST', headers: getHeaders(false), body: JSON.stringify(data) }).then(handleResponse),

  markRead: (roomId) =>
    fetch(`${BASE_URL}/chats/${roomId}/mark_read/`, { method: 'POST', headers: getHeaders() }).then(handleResponse),
};

// ── NOTIFICATIONS ─────────────────────────────────────
export const notificationsAPI = {
  list: () =>
    fetch(`${BASE_URL}/notifications/`, { headers: getHeaders() }).then(handleResponse),

  unreadCount: () =>
    fetch(`${BASE_URL}/notifications/unread_count/`, { headers: getHeaders() }).then(handleResponse),

  markAllRead: () =>
    fetch(`${BASE_URL}/notifications/mark_all_read/`, { method: 'POST', headers: getHeaders() }).then(handleResponse),

  markRead: (id) =>
    fetch(`${BASE_URL}/notifications/${id}/mark_read/`, { method: 'PATCH', headers: getHeaders() }).then(handleResponse),
};