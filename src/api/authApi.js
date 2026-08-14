/*
 * SnapSell Marketplace – Frontend
 * File: src/api/authApi.js
 * Description: Axios wrappers for the user auth endpoints added by Person 1.
 */

import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL || '';

const api = axios.create({ baseURL: `${BASE}/api` });

/** Attach the stored JWT to every request when present. */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('snapsell_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// POST /api/users/register
export const registerUser = (body) =>
  api.post('/users/register', body).then((r) => r.data);

// POST /api/users/login
export const loginUser = (body) =>
  api.post('/users/login', body).then((r) => r.data);

// POST /api/users/logout  (requires token)
export const logoutUser = () =>
  api.post('/users/logout').then((r) => r.data);

// GET /api/users/profile  (requires token)
export const getUserProfile = () =>
  api.get('/users/profile').then((r) => r.data);

// PUT /api/users/profile  (requires token)
export const updateUserProfile = (body) =>
  api.put('/users/profile', body).then((r) => r.data);
