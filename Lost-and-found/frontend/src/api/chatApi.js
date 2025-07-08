import axios from 'axios';

// 🌐 Create axios instance with base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
});

// 🔐 Attach the token to every request if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const chatApi = {
  // Get all private chats for the current user
  getMyChats: async () => api.get('/chat/user/conversations'),

  // Get or create a private chat between current user and item owner
  getOrCreateChat: async (itemId) => api.get(`/chat/${itemId}`),

  // Get full chat object with messages by chat ID (only if user is participant)
  getChat: async (chatId) => api.get(`/chat/byid/${chatId}`),

  // Send message in a private chat
  sendMessage: async (itemId, content) => api.post(`/chat/${itemId}`, { content }),

  // Mark messages in chat as read (only for participants)
  markAsRead: async (chatId) => api.put(`/chat/${chatId}/read`),

  // Clear all messages in a private chat (only for participants)
  clearChat: async (chatId) => api.delete(`/chat/${chatId}/messages`)
};

export default chatApi;