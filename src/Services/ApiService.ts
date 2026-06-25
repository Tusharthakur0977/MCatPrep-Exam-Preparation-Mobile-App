import axios from 'axios';
import { getLocalStorageData } from '../Utilities/Helpers';
import STORAGE_KEYS from '../Utilities/Storage';
import { API_BASE_URL } from '@env';

type ApiResponse<T> = {
  data: T;
  message: string;
  success: boolean;
};

// Create the Axios instance
const api = axios.create({
  // baseURL: 'https://7765afd3570d.ngrok-free.app/api/',
  baseURL: API_BASE_URL,
  // baseURL: 'https://api.medschoolcoach.com/',
  // timeout: 10000,
});

// Request interceptor to add auth token dynamically
api.interceptors.request.use(
  async config => {
    const token = await getLocalStorageData(STORAGE_KEYS.AUTH0_TOKEN);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  error => Promise.reject(error),
);

// Response interceptor for error handling
api.interceptors.response.use(
  response => response,
  error => {
    // 1. Check if the error is due to request cancellation (Axios specific check)
    if (axios.isCancel(error)) {
      console.log('Request was aborted by AbortController');
      // Return a unique, silent rejection for the component to handle
      return Promise.reject({
        success: false,
        message: 'Request Aborted', // Unique message
        isCancelled: true, // Unique flag for client-side check
      });
    }

    if (error.response) {
      // Extract API error response
      console.error('API Error:', error.response);
      return Promise.reject({
        ...error.response.data,
        status: error.response.status,
      }); // Reject with only response data
    } else {
      // Handle network or unexpected errors (excluding cancellation now)
      console.error('Network/Unexpected Error:', error.message);
      return Promise.reject({
        success: false,
        message: 'Something went wrong',
      });
    }
  },
);

// API methods with optional headers and signal support
export const fetchData = <T>(
  endpoint: string,
  params?: any,
  headers?: any,
  signal?: AbortSignal,
) => api.get<T>(endpoint, { params, headers, signal });

export const postData = <T>(
  endpoint: string,
  data?: any,
  headers?: any,
  signal?: AbortSignal,
) => api.post<T>(endpoint, data, { headers, signal });

export const postFormData = <T>(
  endpoint: string,
  data: FormData,
  signal?: AbortSignal,
) =>
  api.post<T>(endpoint, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    signal,
  });

export const patchData = <T>(
  endpoint: string,
  data?: any,
  headers?: any,
  signal?: AbortSignal,
) => api.patch<T>(endpoint, data, { headers, signal });

export const putData = <T>(
  endpoint: string,
  data: any,
  headers?: any,
  signal?: AbortSignal,
) => api.put<T>(endpoint, data, { headers, signal });

export const putFormData = <T>(
  endpoint: string,
  data: FormData,
  signal?: AbortSignal,
) =>
  api.put<T>(endpoint, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    signal,
  });

export const deleteData = <T>(
  endpoint: string,
  data?: any,
  headers?: any,
  signal?: AbortSignal,
) => api.delete<T>(endpoint, { data, signal });

export default api;
