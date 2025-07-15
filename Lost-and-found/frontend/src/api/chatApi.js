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
    console.error('🚨 [chatApi] API Error:', {
      status: error.response?.status,
      message: error.response?.data?.message,
      url: error.config?.url,
      data: error.response?.data
    });
    
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
  getOrCreateChat: async (itemId) => {
    console.log('🔄 [chatApi] Getting/creating chat for item:', itemId);
    try {
      const response = await api.get(`/chat/${itemId}`);
      console.log('✅ [chatApi] Chat retrieved/created:', response.data);
      return response;
    } catch (error) {
      console.error('❌ [chatApi] Failed to get/create chat:', error);
      throw error;
    }
  },

  // Get full chat object with messages by chat ID (only if user is participant)
  getChat: async (chatId) => {
    console.log('🔄 [chatApi] Getting chat by ID:', chatId);
    try {
      const response = await api.get(`/chat/byid/${chatId}`);
      console.log('✅ [chatApi] Chat retrieved:', response.data);
      return response;
    } catch (error) {
      console.error('❌ [chatApi] Failed to get chat:', error);
      throw error;
    }
  },

  // Send message in a private chat
  sendMessage: async (itemId, content) => {
    console.log('📤 [chatApi] Sending message:', { itemId, content });
    try {
      const response = await api.post(`/chat/${itemId}`, { content });
      console.log('✅ [chatApi] Message sent:', response.data);
      return response;
    } catch (error) {
      console.error('❌ [chatApi] Failed to send message:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  // Mark messages in chat as read (only for participants)
  markAsRead: async (chatId) => api.put(`/chat/${chatId}/read`),

  // Clear all messages in a private chat (only for participants)
  clearChat: async (chatId) => api.delete(`/chat/${chatId}/messages`),

  // Edit a message (only by sender)
  editMessage: async (chatId, messageId, content) => 
    api.put(`/chat/${chatId}/messages/${messageId}`, { content }),

  // Delete a message (only by sender)
  deleteMessage: async (chatId, messageId) => 
    api.delete(`/chat/${chatId}/messages/${messageId}`)
};

export default chatApi;