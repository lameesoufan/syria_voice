import axios from 'axios';
import { BASE_URL, API_BASE_PATH, ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from './config';

const envBase = process.env.REACT_APP_BASE_URL || BASE_URL || '';
const envPath = process.env.REACT_APP_API_BASE_PATH || API_BASE_PATH || '';
const baseURL = `${envBase}${envPath}`;

const client = axios.create({
  baseURL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
  timeout: 60000,
  // إضافة withCredentials مرة أخرى لكن مع تكوين صحيح
  withCredentials: false, // تأكد من أنه false
});

// ⬅️ إضافة interceptor للـ request للـ logging
client.interceptors.request.use(
  (config) => {
    console.log('🚀 [REQUEST INTERCEPTOR] Starting request interception for:', config.url);
    console.log('🚀 API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      headers: config.headers,
      data: config.data
    });
    
    try {
      const token = localStorage.getItem(ACCESS_TOKEN_KEY);
      console.log('🔑 [REQUEST INTERCEPTOR] Token from localStorage:', token ? 'EXISTS' : 'NOT FOUND');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
        console.log('✅ [REQUEST INTERCEPTOR] Added Authorization header for request:', config.url);
        console.log('🔑 [REQUEST INTERCEPTOR] Token preview:', token.substring(0, 20) + '...');
      } else {
        console.log('❌ [REQUEST INTERCEPTOR] No token found for request:', config.url);
        console.log('🔍 [REQUEST INTERCEPTOR] Available localStorage keys:', Object.keys(localStorage));
      }
    } catch (e) {
      console.error('❌ [REQUEST INTERCEPTOR] Error getting token:', e);
    }
    
    console.log('🚀 [REQUEST INTERCEPTOR] Final config headers:', config.headers);
    return config;
  },
  (error) => {
    console.error('❌ [REQUEST INTERCEPTOR] Request interceptor error:', error);
    return Promise.reject(error);
  }
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

client.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem(ACCESS_TOKEN_KEY);
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
        console.log('✅ Added Authorization header for request:', config.url);
        console.log('Token exists:', !!token);
      } else {
        console.log('❌ No token found for request:', config.url);
      }
    } catch (e) {
      console.error('Error getting token:', e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

client.interceptors.response.use(
  (response) => {
    console.log('✅ [RESPONSE INTERCEPTOR] Success response for:', response.config.url);
    console.log('📊 [RESPONSE INTERCEPTOR] Response details:', {
      status: response.status,
      statusText: response.statusText,
      url: response.config.url,
      method: response.config.method?.toUpperCase(),
      headers: response.headers,
      data: response.data
    });
    return response;
  },
  async (error) => {
    console.error('❌ [RESPONSE INTERCEPTOR] Error response for:', error.config?.url);
    console.error('📊 [RESPONSE INTERCEPTOR] Error details:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      data: error.response?.data,
      headers: error.response?.headers
    });
    
    const originalRequest = error.config;
    if (!originalRequest) return Promise.reject(error);

    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return client(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      try {
        const refreshUrl = `${envBase}${envPath}/auth/refresh-token`;
        const resp = await axios.post(refreshUrl, { refreshToken });
        const newToken = resp?.data?.accessToken;
        const newRefresh = resp?.data?.refreshToken;
        if (newToken) {
          localStorage.setItem(ACCESS_TOKEN_KEY, newToken);
        }
        if (newRefresh) {
          localStorage.setItem(REFRESH_TOKEN_KEY, newRefresh);
        }
        processQueue(null, newToken);
        originalRequest.headers['Authorization'] = 'Bearer ' + newToken;
        return client(originalRequest);
      } catch (err) {
        processQueue(err, null);
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default client;
