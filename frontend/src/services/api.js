import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getWorkflows = () => api.get('/workflows');
export const getWorkflowById = (id) => api.get(`/workflows/${id}`);
export const createWorkflow = (data) => api.post('/workflows', data);
export const updateWorkflow = (id, data) => api.put(`/workflows/${id}`, data);
export const deleteWorkflow = (id) => api.delete(`/workflows/${id}`);

export const ingestTelemetry = (data) => api.post('/telemetry', data);
export const ingestBatchTelemetry = (batch) => api.post('/telemetry/batch', { batch });
export const getRecentTelemetry = (deviceId, limit = 50) =>
  api.get(deviceId ? `/telemetry/${deviceId}?limit=${limit}` : `/telemetry?limit=${limit}`);

export default api;
