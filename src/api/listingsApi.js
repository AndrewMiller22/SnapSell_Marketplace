

import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: `${BASE}/api`,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('snapsell_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/**
 * Fetch listings with optional filters.
 * @param {{ search?: string, category?: string, status?: string }} params
 */
export const fetchListings = (params = {}) =>
  api.get('/listings', { params }).then((r) => r.data);

/**
 * Fetch a single listing by id.
 * @param {string} id
 */
export const fetchListingById = (id) =>
  api.get(`/listings/${id}`).then((r) => r.data);

/** Create a listing for the authenticated user. */
export const createListing = (body) =>
  api.post('/listings', body).then((r) => r.data);

/** Update a listing owned by the authenticated user. */
export const updateListing = (id, body) =>
  api.put(`/listings/${id}`, body).then((r) => r.data);
