import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getProducts = async () => {
  const response = await api.get('/products');
  return response.data;
};

export const getProductById = async (id: number) => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

export const scrapeProduct = async (url: string) => {
  const response = await api.post('/products/scrape', { url });
  return response.data;
};

export const subscribeToProduct = async (
  productId: number,
  email: string,
  targetPrice?: number   // optional — if provided, only notify when price drops below this
) => {
  const body: { email: string; targetPrice?: number } = { email }
  if (targetPrice !== undefined) {
    body.targetPrice = targetPrice
  }
  const response = await api.post(`/products/${productId}/subscribe`, body);
  return response.data;
};

export const unsubscribe = async (token: string) => {
  // Call the backend unsubscribe endpoint with the user's unique token
  const response = await api.get(`/unsubscribe/${token}`);
  return response.data;
};

export default api;