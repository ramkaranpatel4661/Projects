import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000, // Increased timeout to 30 seconds
  withCredentials: true,
})

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  verifyToken: () => api.get('/auth/verify'),
}

// Items API
export const itemsApi = {
  getItems: (filters) => {
    const params = new URLSearchParams()
    if (filters?.type) params.append('type', filters.type)
    if (filters?.category) params.append('category', filters.category)
    if (filters?.city) params.append('city', filters.city)
    if (filters?.search) params.append('search', filters.search)
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.limit) params.append('limit', filters.limit.toString())

    return api.get(`/items?${params.toString()}`)
  },

  getItem: (id) => api.get(`/items/${id}`),

  createItem: (data) => {
    const formData = new FormData()

    formData.append('title', data.title)
    formData.append('description', data.description)
    formData.append('category', data.category)
    formData.append('type', data.type)
    formData.append('location', JSON.stringify(data.location))

    if (data.dateFound) {
      formData.append('dateFound', data.dateFound)
    }
    if (data.dateLost) {
      formData.append('dateLost', data.dateLost)
    }
    if (data.contactInfo) {
      formData.append('contactInfo', JSON.stringify(data.contactInfo))
    }
    if (data.priority) {
      formData.append('priority', data.priority)
    }

    data.images.forEach((image) => {
      formData.append('images', image)
    })

    return api.post('/items', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  updateItem: (id, data) =>
    api.put(`/items/${id}`, data),

  deleteItem: (id) => api.delete(`/items/${id}`),

  getMyItems: () => api.get('/items/user/my-items'),
}

// Chat API - Updated for private messaging
export const chatApi = {
  // Get or create private chat between current user and item owner
  getOrCreateChat: (itemId) =>
    api.get(`/chat/${itemId}`),

  // Get all private chats for current user
  getMyChats: () => api.get('/chat/user/conversations'),

  // Get specific chat by ID (only if user is participant)
  getChat: (chatId) => api.get(`/chat/byid/${chatId}`),

  // Send message in private chat
  sendMessage: (itemId, content) =>
    api.post(`/chat/${itemId}`, { content }),

  // Mark messages as read in private chat
  markAsRead: (chatId) => api.put(`/chat/${chatId}/read`),

  // Clear private chat messages
  clearChat: (chatId) => api.delete(`/chat/${chatId}/messages`),
}

// Users API - Enhanced for messaging
export const usersApi = {
  getUser: (userId) => api.get(`/users/${userId}`),
  
  getUserItems: (userId, type, page = 1, limit = 12) => {
    const params = new URLSearchParams()
    if (type) params.append('type', type)
    params.append('page', page.toString())
    params.append('limit', limit.toString())

    return api.get(`/users/${userId}/items?${params.toString()}`)
  },

  // Start direct message with a user
  startDirectMessage: (userId) => api.post(`/users/${userId}/message`),

  // Search users for messaging
  searchUsers: (query, limit = 10) => {
    const params = new URLSearchParams()
    params.append('q', query)
    params.append('limit', limit.toString())
    
    return api.get(`/users/search?${params.toString()}`)
  }
}

export default api