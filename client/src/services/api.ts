const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5001/api';

function getAuthHeaders(isMultipart = false): Record<string, string> {
  const token = localStorage.getItem('zw_token');
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
}

async function request<T>(endpoint: string, options: RequestInit = {}, isMultipart = false): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    ...getAuthHeaders(isMultipart),
    ...(options.headers as Record<string, string> || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data.data !== undefined ? data.data : data;
}

export const api = {
  // Authentication
  login: (credentials: { email: string; password: string }) =>
    request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  register: (payload: any) =>
    request<{ token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getMe: () => request<any>('/auth/me'),

  // Products
  getProducts: (params: { category?: string; minDiscount?: number; maxPrice?: number; search?: string; locality?: string } = {}) => {
    const query = new URLSearchParams();
    if (params.category && params.category !== 'All') query.append('category', params.category);
    if (params.minDiscount) query.append('minDiscount', params.minDiscount.toString());
    if (params.maxPrice) query.append('maxPrice', params.maxPrice.toString());
    if (params.search) query.append('search', params.search);
    if (params.locality) query.append('locality', params.locality);
    const qs = query.toString();
    return request<any[]>(`/products${qs ? `?${qs}` : ''}`);
  },

  getProductById: (id: number) => request<any>(`/products/${id}`),

  createProduct: (formData: FormData | any) => {
    const isForm = formData instanceof FormData;
    return request<any>('/products', {
      method: 'POST',
      body: isForm ? formData : JSON.stringify(formData),
    }, isForm);
  },

  updateProduct: (id: number, formData: FormData | any) => {
    const isForm = formData instanceof FormData;
    return request<any>(`/products/${id}`, {
      method: 'PUT',
      body: isForm ? formData : JSON.stringify(formData),
    }, isForm);
  },

  deleteProduct: (id: number) => request<any>(`/products/${id}`, { method: 'DELETE' }),

  getMyProducts: () => request<any[]>('/products/seller/my-products'),

  // Reservations
  createReservation: (payload: { product_id: number; quantity: number; notes?: string }) =>
    request<any>('/reservations', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getMyReservations: () => request<any[]>('/reservations/my-reservations'),

  getSellerReservations: () => request<any[]>('/reservations/seller'),

  cancelReservation: (id: number) =>
    request<any>(`/reservations/${id}/cancel`, { method: 'PATCH' }),

  updateReservationStatus: (id: number, status: string) =>
    request<any>(`/reservations/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  // Donations
  getDonations: (params: { status?: string; category?: string; sellerId?: number; ngoId?: number } = {}) => {
    const query = new URLSearchParams();
    if (params.status) query.append('status', params.status);
    if (params.category) query.append('category', params.category);
    if (params.sellerId) query.append('sellerId', params.sellerId.toString());
    if (params.ngoId) query.append('ngoId', params.ngoId.toString());
    const qs = query.toString();
    return request<any[]>(`/donations${qs ? `?${qs}` : ''}`);
  },

  createDonation: (payload: any) =>
    request<any>('/donations', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  requestDonation: (id: number, notes?: string) =>
    request<any>(`/donations/${id}/request`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    }),

  updateDonationStatus: (id: number, status: string) =>
    request<any>(`/donations/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  // AI Assistant
  analyzeListing: (payload: { description: string; original_price?: number; category?: string; image_base64?: string }) =>
    request<any>('/ai/analyze-listing', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  checkListingQuality: (productData: any) =>
    request<any>('/ai/check-listing', {
      method: 'POST',
      body: JSON.stringify(productData),
    }),

  // Dashboards & Impact
  getGlobalImpact: () => request<any>('/dashboard/impact'),
  getSellerDashboard: () => request<any>('/dashboard/seller'),
  getCustomerDashboard: () => request<any>('/dashboard/customer'),
  getNgoDashboard: () => request<any>('/dashboard/ngo'),

  // Notifications
  getNotifications: () => request<any[]>('/user/notifications'),
  markNotificationRead: (id: number) => request<any>(`/user/notifications/${id}/read`, { method: 'PATCH' }),
  markAllNotificationsRead: () => request<any>('/user/notifications/mark-all-read', { method: 'POST' }),
};
