import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, 
  withCredentials: true 
});

// Interceptor to attach token to every request
api.interceptors.request.use(
  (config) => {
    // FIXED: Changed 'authToken' to 'token' to match AuthContext
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;