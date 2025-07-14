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
    console.error('🚨 [claimsApi] API Error:', {
      status: error.response?.status,
      message: error.response?.data?.message,
      url: error.config?.url
    });
    
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
      if (key !== 'proofDocuments' && key !== 'additionalProofImages' && key !== 'additionalProofDescriptions') {
        formData.append(key, claimData[key]);
      }
    });
    
    // Add additional proof descriptions as JSON
    if (claimData.additionalProofDescriptions) {
      formData.append('additionalProofDescriptions', JSON.stringify(claimData.additionalProofDescriptions));
    }
    
    // Add files
    if (claimData.proofDocuments) {
      claimData.proofDocuments.forEach(file => {
        formData.append('proofDocuments', file);
      });
    }
    
    // Add additional proof images
    if (claimData.additionalProofImages) {
      claimData.additionalProofImages.forEach(file => {
        formData.append('additionalProofImages', file);
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
  getItemClaims: async (itemId) => api.get(`/claims/item/${itemId}`),

  // Get count of successful returns (public)
  getSuccessfulReturnsCount: async () => api.get('/claims/successful-returns-count')
};

export default claimsApi;