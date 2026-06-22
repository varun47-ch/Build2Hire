import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add token to requests
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

// API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout')  
}

//  PROJECT API 
export const projectAPI = {
  getAll: (params) => api.get('/projects', { params }),
  getById: (id) => api.get(`/projects/${id}`),
  getMyProjects: () => api.get('/projects/my-projects'),  
  getTeam: (id) => api.get(`/projects/${id}/team`),  
  getJoinRequests: (id) => api.get(`/projects/${id}/join-requests`),  
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.patch(`/projects/${id}`, data),
  updateStatus: (id, data) => api.patch(`/projects/${id}/status`, data), 
  delete: (id) => api.delete(`/projects/${id}`)
}

// JOIN REQUEST API
export const joinRequestAPI = {
  create: (projectId, data) => api.post(`/projects/${projectId}/join-requests`, data),
  getMyRequests: () => api.get('/my-requests'),
  getProjectRequests: (projectId) => api.get(`/projects/${projectId}/join-requests`),
  updateRequest: (projectId, requestId, data) => api.patch(`/projects/${projectId}/join-requests/${requestId}`, data),
  accept: (projectId, requestId) => api.patch(`/projects/${projectId}/join-requests/${requestId}`, { status: 'approved' }),
  reject: (projectId, requestId) => api.patch(`/projects/${projectId}/join-requests/${requestId}`, { status: 'rejected' })
}

//PROFILE API 
export const profileAPI = {
  getProfile: () => api.get('/profile/me'), 
  updateProfile: (data) => api.patch('/profile/me', data), 
  getUserProfile: (id) => api.get(`/profile/${id}`)  
}

//COMPANY API
export const companyAPI = {
  createCompany: (data) => api.post('/companies', data), 
  getMyCompany: () => api.get('/companies/profile'),  
  getAllCompanies: (params = {}) => api.get('/companies', { params }), 
  getCompanyById: (id) => api.get(`/companies/${id}`)  
}

//ADMIN API
export const adminAPI = {
  getAllUsers: (params = {}) => api.get('/users', { params }),
  getUserById: (id) => api.get(`/users/${id}`),
  updateUserStatus: (id, data) => api.patch(`/users/${id}/status`, data),
  getAllCompanies: (params = {}) => api.get('/companies', { params }),
  getCompanyById: (id) => api.get(`/companies/${id}`),
  updateCompanyStatus: (id, data) => api.patch(`/companies/${id}`, data) 
}

// HR API
export const hrAPI = {
  contactProject: (projectId, message) => api.post(`/projects/${projectId}/contact`, { message })
}

//CONTACT API
export const contactAPI = {
  contactProject: (projectId, message) => api.post(`/projects/${projectId}/contact`, { message }),
  contactStudent: (studentId, message) => api.post(`/students/${studentId}/contact`, { message })
}

export default api