import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const apiClient = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const res = await axios.post(`${API_URL}/api/auth/refresh`, { refreshToken });
        const newToken = res.data.data.accessToken;
        localStorage.setItem('accessToken', newToken);
        original.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(original);
      } catch {
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// API functions
export const authApi = {
  login: (email: string, password: string) => apiClient.post('/auth/login', { email, password }),
  logout: () => apiClient.post('/auth/logout'),
  me: () => apiClient.get('/auth/me'),
};

export const dashboardApi = {
  overview: () => apiClient.get('/dashboard/overview'),
  serviceHealth: () => apiClient.get('/dashboard/service-health'),
};

export const serversApi = {
  getAll: (params?: any) => apiClient.get('/servers', { params }),
  getById: (id: string) => apiClient.get(`/servers/${id}`),
  getMetrics: (id: string, params?: any) => apiClient.get(`/servers/${id}/metrics`, { params }),
  create: (data: any) => apiClient.post('/servers', data),
  update: (id: string, data: any) => apiClient.put(`/servers/${id}`, data),
  delete: (id: string) => apiClient.delete(`/servers/${id}`),
};

export const incidentsApi = {
  getAll: (params?: any) => apiClient.get('/incidents', { params }),
  getStats: () => apiClient.get('/incidents/stats'),
  getById: (id: string) => apiClient.get(`/incidents/${id}`),
  update: (id: string, data: any) => apiClient.put(`/incidents/${id}`, data),
  addTimeline: (id: string, message: string) => apiClient.post(`/incidents/${id}/timeline`, { message }),
};

export const alertsApi = {
  getAll: (params?: any) => apiClient.get('/alerts', { params }),
  getStats: () => apiClient.get('/alerts/stats'),
  acknowledge: (id: string) => apiClient.put(`/alerts/${id}/acknowledge`),
  resolve: (id: string) => apiClient.put(`/alerts/${id}/resolve`),
};

export const rulesApi = {
  getAll: () => apiClient.get('/rules'),
  create: (data: any) => apiClient.post('/rules', data),
  update: (id: string, data: any) => apiClient.put(`/rules/${id}`, data),
  delete: (id: string) => apiClient.delete(`/rules/${id}`),
};

export const metricsApi = {
  overview: () => apiClient.get('/metrics/overview'),
  getServer: (id: string) => apiClient.get(`/metrics/server/${id}`),
  getHistory: (id: string, hours?: number) => apiClient.get(`/metrics/server/${id}/history`, { params: { hours } }),
};

export const auditApi = {
  getAll: () => apiClient.get('/audit'),
};
