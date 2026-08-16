import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL || '';

export const fetchListingHistory = (listingId, token) =>
  axios.get(`${BASE}/api/history/listings/${listingId}`, {
    headers: { Authorization: `Bearer ${token}` },
  }).then((response) => response.data);
