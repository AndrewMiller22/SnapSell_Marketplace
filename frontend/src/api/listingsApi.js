

import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: `${BASE}/api`,
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
