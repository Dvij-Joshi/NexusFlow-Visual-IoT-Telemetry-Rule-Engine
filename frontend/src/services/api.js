import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// System Health
export const getHealth = () => api.get('/health');

// Device Management APIs
export const getDevices = (params) => api.get('/devices', { params });
export const getDeviceById = (deviceId) => api.get(`/devices/${deviceId}`);
export const createDevice = (data) => api.post('/devices', data);
export const updateDevice = (deviceId, data) => api.put(`/devices/${deviceId}`, data);
export const deleteDevice = (deviceId) => api.delete(`/devices/${deviceId}`);

// Telemetry Ingestion & Retrieval APIs
export const ingestTelemetry = (data) => api.post('/telemetry', data);
export const ingestBatchTelemetry = (batch) => api.post('/telemetry/batch', { batch });
export const getRecentTelemetry = (deviceId, limit = 50) =>
  api.get(deviceId ? `/telemetry/${deviceId}?limit=${limit}` : `/telemetry?limit=${limit}`);
export const getLatestTelemetry = (deviceId) => api.get(`/telemetry/${deviceId}/latest`);
export const getTelemetryHistory = (deviceId, params) => api.get(`/telemetry/${deviceId}/history`, { params });
export const getTelemetryStats = (deviceId, params) => api.get(`/telemetry/${deviceId}/stats`, { params });

// Workflow APIs
export const getWorkflows = () => api.get('/workflows');
export const getWorkflowById = (id) => api.get(`/workflows/${id}`);
export const createWorkflow = (data) => api.post('/workflows', data);
export const updateWorkflow = (id, data) => api.put(`/workflows/${id}`, data);
export const deleteWorkflow = (id) => api.delete(`/workflows/${id}`);

// Alert APIs
export const getAlerts = (params) => api.get('/alerts', { params });
export const getAlertById = (alertId) => api.get(`/alerts/${alertId}`);
export const resolveAlert = (alertId) => api.patch(`/alerts/${alertId}/resolve`);

export default api;
