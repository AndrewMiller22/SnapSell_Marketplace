import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL || '';
const tokenConfig = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

export const submitQuestion = (listingId, form, token) =>
  axios
    .post(`${BASE}/api/questions/listings/${listingId}`, form, token ? tokenConfig(token) : {})
    .then((response) => response.data);

export const fetchSellerQuestions = (token) =>
  axios.get(`${BASE}/api/questions/seller`, tokenConfig(token)).then((response) => response.data);

export const answerQuestion = (questionId, answer, token) =>
  axios.patch(`${BASE}/api/questions/${questionId}/answer`, { answer }, tokenConfig(token))
    .then((response) => response.data);
