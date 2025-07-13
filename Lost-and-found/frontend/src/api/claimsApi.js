import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
});

// Attach the token to every request if available
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

const claimsApi = {
  // Submit a new claim
  submitClaim: async (claimData) => {
    const formData = new FormData();
    
    // Add text fields
    Object.keys(claimData).forEach(key => {
      if (key !== 'proofDocuments') {
        formData.append(key, claimData[key]);
      }
    });
    
    // Add files
    if (claimData.proofDocuments) {
      claimData.proofDocuments.forEach(file => {
        formData.append('proofDocuments', file);
      });
    }
    
    return api.post('/claims', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Get current user's claims
  getMyClaims: async () => api.get('/claims/my-claims'),

  // Get claims pending review for current user's items
  getPendingReviews: async () => api.get('/claims/pending-review'),

  // Get specific claim details
  getClaim: async (claimId) => api.get(`/claims/${claimId}`),

  // Review a claim (approve/reject)
  reviewClaim: async (claimId, decision, notes) => 
    api.put(`/claims/${claimId}/review`, { decision, notes }),

  // Complete handover
  completeHandover: async (claimId, location, notes) =>
    api.put(`/claims/${claimId}/complete-handover`, { location, notes }),

  // Get all claims for a specific item
  getItemClaims: async (itemId) => api.get(`/claims/item/${itemId}`)
};

export default claimsApi;