import axios from 'axios';
import { getLocalStorageData } from '../Utilities/Helpers';
import STORAGE_KEYS from '../Utilities/Storage';
import { USER_API_BASE_URL } from '@env';

// User API base URL (different from Main API)
const userApi = axios.create({
  baseURL: USER_API_BASE_URL,
});
// Request interceptor to add auth token
userApi.interceptors.request.use(
  async config => {
    const token = await getLocalStorageData(STORAGE_KEYS.AUTH0_TOKEN);
    // const token =
    //   await `eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Ik16SXhPVVZDUVVNM1FUQkRNMFJGTURnM01UVkVSREpETVRoRk56YzFPVFUxTmtORVFqQkJSQSJ9.eyJodHRwczovL21lZHNjaG9vbGNvYWNoLmNvbS9yb2xlcyI6W10sImh0dHBzOi8vbWVkc2Nob29sY29hY2guY29tL2VtYWlsIjoiZ2FicnVAeW9wbWFpbC5jb20iLCJodHRwczovL21lZHNjaG9vbGNvYWNoLmNvbS9uYW1lIjoiZ2FicnVAeW9wbWFpbC5jb20iLCJpc3MiOiJodHRwczovL2F1dGgubWVkc2Nob29sY29hY2guY29tLyIsInN1YiI6ImF1dGgwfFR1dG9yaW5nUG9ydGFsfDkzOTA2IiwiYXVkIjpbImh0dHBzOi8vYXV0aC5tZWRzY2hvb2xjb2FjaC5jb20iLCJodHRwczovL2Rldi1qeWRsanVwbS5hdXRoMC5jb20vdXNlcmluZm8iXSwiaWF0IjoxNzY0OTA5MjIyLCJleHAiOjE3NjQ5OTU2MjIsInNjb3BlIjoib3BlbmlkIHByb2ZpbGUgZW1haWwiLCJhenAiOiJOSmpWbUdsYWEzV0djMVJyMUN1akZjdFBzWEF1VkZRTyIsInBlcm1pc3Npb25zIjpbXX0.Qlh_gaVVTQVZCcaQD3NNdCdi8_EbuuWnuL1rYWICN7Dm6_hesCOa_flWEdko2QoLZkEn71Me3KXXmi3QDkNdu0ZQpW2BuSErsa4ZCTaUN0_nHnPcLiZC95A9g0Rqpv22gr44jQtHw7cB5zw3vQ1y04eAifPH6dUbSBdK7GUz1dCSKY8q-DXqLBcImjHHP8guO7VeLRHaU2VAG2tfwyxEyLPKL0riUw7mD10FRajuZX90W-QkZ0JBEUtEMCRfZ7sQS-TY5ua7deyQwb72DTlYewEVymdeH6AGXT6uW84_Rw9H_Smlj6PdErFa2QNieTTb0nxsoOlw4LKi5shUV_pGxg`;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  error => Promise.reject(error),
);

// Response interceptor for error handling
userApi.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      return Promise.reject({
        ...error.response.data,
        status: error.response.status,
      });
    }
    return Promise.reject({
      success: false,
      message: 'Something went wrong',
    });
  },
);
// GET request helper
export const fetchUserApiData = <T>(
  endpoint: string,
  params?: any,
  headers?: any,
) => userApi.get<T>(endpoint, { params, headers });
// PUT request helper
export const putUserApiData = <T>(
  endpoint: string,
  data?: any,
  headers?: any,
) => userApi.put<T>(endpoint, data, { headers });
// POST request helper
export const postUserApiData = <T>(
  endpoint: string,
  data?: any,
  headers?: any,
) => userApi.post<T>(endpoint, data, { headers });
export default userApi;
