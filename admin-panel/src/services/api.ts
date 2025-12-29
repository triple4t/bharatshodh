import axios, { AxiosInstance } from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle response errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't redirect on 401 for login endpoint - let the login page handle the error
    const isLoginEndpoint = error.config?.url?.includes('/admin/login');
    
    if (error.response?.status === 401 && !isLoginEndpoint) {
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const adminApi = {
  // Auth
  login: (username: string, password: string) =>
    apiClient.post('/admin/login', { username, password }),
  register: (username: string, password: string, email: string) =>
    apiClient.post('/admin/register', { username, password, email }),
  getProfile: () => apiClient.get('/admin/me'),

  // Stats
  getStats: () => apiClient.get('/admin/stats'),

  // Users
  getAllUsers: (status?: string, search?: string) => {
    const params = new URLSearchParams()
    if (status) params.append('status', status)
    if (search) params.append('search', search)
    return apiClient.get(`/admin/users?${params.toString()}`)
  },
  getUserDetail: (userId: string) => apiClient.get(`/admin/users/${userId}`),
  approveUser: (userId: string) => apiClient.post(`/admin/users/${userId}/approve`),
  rejectUser: (userId: string, reason?: string) => {
    const params = new URLSearchParams()
    if (reason) params.append('reason', reason)
    return apiClient.post(`/admin/users/${userId}/reject?${params.toString()}`)
  },
  deleteUser: (userId: string) => apiClient.delete(`/admin/users/${userId}`),
  toggleUserStatus: (userId: string, newStatus: string) =>
    apiClient.put(`/admin/users/${userId}/toggle-status?new_status=${newStatus}`),

  // Admins
  getAllAdmins: () => apiClient.post('/admin/admins'),
  deleteAdmin: (adminId: string) => apiClient.delete(`/admin/admins/${adminId}`),

  // Documents
  uploadDocument: async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return apiClient.post('/admin/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  getDocuments: () => apiClient.get('/admin/documents'),
  deleteDocument: (docId: string) => apiClient.delete(`/admin/documents/${docId}`),
}

export default apiClient
