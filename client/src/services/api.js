/**
 * API service for making HTTP requests
 * Configures and exports a pre-configured axios instance
 */
import axios from 'axios';

const API_URL = '/api';

// Create a pre-configured axios instance
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important for sending cookies with cross-origin requests
  headers: {
    'Accept': 'application/json'
  }
});

// Request interceptor for handling errors or adding auth tokens
api.interceptors.request.use(
  (config) => {
    // You can add additional request handling here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle authentication errors (401)
    if (error.response && error.response.status === 401) {
      console.error('Authentication error:', error.response.data);
      // Could redirect to login page or dispatch an action to clear auth state
    }
    return Promise.reject(error);
  }
);

export default api; 