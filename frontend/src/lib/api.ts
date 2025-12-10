import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Important for CORS cookies if we used them, but for JWT in header we'll add interceptor
});

// Add a request interceptor to attach JWT token
api.interceptors.request.use(
    (config) => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle 401s (optional)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Redirect to login if needed, or clear token
            if (typeof window !== 'undefined') {
                // localStorage.removeItem('token');
                // window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
