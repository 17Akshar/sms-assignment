import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const api = axios.create({ baseURL });

// Normalizes error responses from the backend into a single readable message
export function extractErrorMessage(err) {
  const data = err?.response?.data;
  if (!data) return err?.message || 'Something went wrong. Please try again.';
  if (data.details?.length) return data.details.map((d) => d.message).join(', ');
  return data.error || 'Something went wrong. Please try again.';
}

export const StudentsAPI = {
  list: (params) => api.get('/students', { params }).then((r) => r.data),
  get: (id) => api.get(`/students/${id}`).then((r) => r.data),
  create: (formData) =>
    api.post('/students', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data),
  update: (id, formData) =>
    api.put(`/students/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data),
  remove: (id) => api.delete(`/students/${id}`).then((r) => r.data),
  analytics: () => api.get('/students/meta/analytics').then((r) => r.data),
};
