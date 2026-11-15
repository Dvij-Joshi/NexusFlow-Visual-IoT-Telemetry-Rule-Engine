/**
 * NexusFlow API Integration Tests
 *
 * Tests the complete database architecture: Devices, Telemetry, Workflows, Alerts.
 * Requires a running MongoDB instance (uses the MONGODB_URI from .env).
 */
const request = require('supertest');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Import app without starting the server
const express = require('express');
const cors = require('cors');

const deviceRoutes = require('../src/routes/deviceRoutes');
const telemetryRoutes = require('../src/routes/telemetryRoutes');
const workflowRoutes = require('../src/routes/workflowRoutes');
const alertRoutes = require('../src/routes/alertRoutes');
const errorHandler = require('../src/middleware/errorHandler');

const Device = require('../src/models/Device');
const Telemetry = require('../src/models/Telemetry');
const Workflow = require('../src/models/Workflow');
const Alert = require('../src/models/Alert');

// Build a test app (no server.listen, no socket.io)
const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/devices', deviceRoutes);
app.use('/api/telemetry', telemetryRoutes);
app.use('/api/workflows', workflowRoutes);
app.use('/api/alerts', alertRoutes);
app.use(errorHandler);

beforeAll(async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI not set');
  await mongoose.connect(uri);
});

afterAll(async () => {
  // Clean up test data
  await Device.deleteMany({ deviceId: /^TEST_/ });
  await Workflow.deleteMany({ name: /^\[TEST\]/ });
  await Alert.deleteMany({ alertId: /^test_/ });
  await Telemetry.deleteMany({ deviceId: /^TEST_/ });
  await mongoose.disconnect();
});

// ─── DEVICE TESTS ───────────────────────────────────────────────

describe('Device API', () => {
  const testDevice = {
    deviceId: 'TEST_DEVICE_01',
    deviceName: 'Test Temperature Sensor',
    deviceType: 'temperature',
    location: 'Test Lab',
    unit: '°C',
  };

  test('POST /api/devices — register device', async () => {
    // Clean first
    await Device.deleteMany({ deviceId: testDevice.deviceId });

    const res = await request(app).post('/api/devices').send(testDevice);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.deviceId).toBe('TEST_DEVICE_01');
  });

  test('POST /api/devices — reject duplicate deviceId', async () => {
    const res = await request(app).post('/api/devices').send(testDevice);
    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  test('POST /api/devices — reject missing fields', async () => {
    const res = await request(app).post('/api/devices').send({ deviceId: 'TEST_NO_NAME' });
    expect(res.status).toBe(400);
  });

  test('GET /api/devices — retrieve all devices', async () => {
    const res = await request(app).get('/api/devices');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('GET /api/devices/:deviceId — retrieve specific device', async () => {
    const res = await request(app).get('/api/devices/TEST_DEVICE_01');
    expect(res.status).toBe(200);
    expect(res.body.data.deviceId).toBe('TEST_DEVICE_01');
  });

  test('GET /api/devices/:deviceId — 404 for non-existent', async () => {
    const res = await request(app).get('/api/devices/DOES_NOT_EXIST');
    expect(res.status).toBe(404);
  });

  test('PUT /api/devices/:deviceId — update device', async () => {
    const res = await request(app)
      .put('/api/devices/TEST_DEVICE_01')
      .send({ location: 'Updated Lab', status: 'maintenance' });
    expect(res.status).toBe(200);
    expect(res.body.data.location).toBe('Updated Lab');
    expect(res.body.data.status).toBe('maintenance');
  });
});

// ─── TELEMETRY TESTS ────────────────────────────────────────────

describe('Telemetry API', () => {
  test('POST /api/telemetry — ingest single reading', async () => {
    const res = await request(app).post('/api/telemetry').send({
      deviceId: 'TEST_DEVICE_01',
      temperature: 78.5,
      pressure: 112,
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  test('POST /api/telemetry — reject missing deviceId', async () => {
    const res = await request(app).post('/api/telemetry').send({ temperature: 80 });
    expect(res.status).toBe(400);
  });

  test('POST /api/telemetry/ingest — alternate ingest endpoint', async () => {
    const res = await request(app).post('/api/telemetry/ingest').send({
      deviceId: 'TEST_DEVICE_01',
      temperature: 82,
    });
    expect(res.status).toBe(201);
  });

  test('POST /api/telemetry/batch — batch ingest', async () => {
    const batch = [
      { deviceId: 'TEST_DEVICE_01', temperature: 79, pressure: 113 },
      { deviceId: 'TEST_DEVICE_01', temperature: 81, pressure: 115 },
      { deviceId: 'TEST_DEVICE_01', temperature: 83, pressure: 118 },
    ];
    const res = await request(app).post('/api/telemetry/batch').send({ batch });
    expect(res.status).toBe(201);
    expect(res.body.data.count).toBe(3);
  });

  test('GET /api/telemetry/:deviceId — retrieve by device', async () => {
    const res = await request(app).get('/api/telemetry/TEST_DEVICE_01');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  test('GET /api/telemetry/:deviceId/latest — latest reading', async () => {
    const res = await request(app).get('/api/telemetry/TEST_DEVICE_01/latest');
    expect(res.status).toBe(200);
    expect(res.body.data.deviceId).toBe('TEST_DEVICE_01');
  });

  test('GET /api/telemetry/:deviceId/history — date-range query', async () => {
    const res = await request(app)
      .get('/api/telemetry/TEST_DEVICE_01/history')
      .query({ start: '2020-01-01', limit: 10 });
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.total).toBeDefined();
  });

  test('GET /api/telemetry/:deviceId/stats — aggregation', async () => {
    const res = await request(app).get('/api/telemetry/TEST_DEVICE_01/stats');
    expect(res.status).toBe(200);
    expect(res.body.data.avgTemperature).toBeDefined();
    expect(res.body.data.count).toBeGreaterThan(0);
  });

  test('GET /api/telemetry/NONEXISTENT/latest — 404', async () => {
    const res = await request(app).get('/api/telemetry/NONEXISTENT_DEVICE_XYZ/latest');
    expect(res.status).toBe(404);
  });
});

// ─── WORKFLOW TESTS ─────────────────────────────────────────────

describe('Workflow API', () => {
  let createdWorkflowId;

  const testWorkflow = {
    name: '[TEST] Pressure Monitor',
    description: 'Test workflow',
    nodes: [
      { id: 'sensor-1', type: 'sensor', position: { x: 0, y: 0 }, data: { deviceId: 'TEST_DEVICE_01' } },
      { id: 'threshold-1', type: 'threshold', position: { x: 0, y: 150 }, data: { operator: '>', value: 100 } },
    ],
    edges: [{ source: 'sensor-1', target: 'threshold-1' }],
    isActive: false,
  };

  test('POST /api/workflows — create workflow', async () => {
    const res = await request(app).post('/api/workflows').send(testWorkflow);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    createdWorkflowId = res.body.data._id;
  });

  test('POST /api/workflows — reject missing name', async () => {
    const res = await request(app).post('/api/workflows').send({ nodes: [] });
    expect(res.status).toBe(400);
  });

  test('GET /api/workflows — retrieve all', async () => {
    const res = await request(app).get('/api/workflows');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  test('GET /api/workflows/:id — retrieve by id', async () => {
    const res = await request(app).get(`/api/workflows/${createdWorkflowId}`);
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('[TEST] Pressure Monitor');
  });

  test('PUT /api/workflows/:id — update workflow', async () => {
    const res = await request(app)
      .put(`/api/workflows/${createdWorkflowId}`)
      .send({ description: 'Updated description', isActive: false });
    expect(res.status).toBe(200);
    expect(res.body.data.description).toBe('Updated description');
  });

  test('DELETE /api/workflows/:id — delete workflow', async () => {
    const res = await request(app).delete(`/api/workflows/${createdWorkflowId}`);
    expect(res.status).toBe(200);
  });
});

// ─── ALERT TESTS ────────────────────────────────────────────────

describe('Alert API', () => {
  const testAlertId = 'test_alert_integration_001';

  beforeAll(async () => {
    await Alert.deleteMany({ alertId: testAlertId });
    await Alert.create({
      alertId: testAlertId,
      deviceId: 'TEST_DEVICE_01',
      alertType: 'temperature_threshold',
      message: 'Test alert',
      triggerValue: 85,
      thresholdValue: 80,
      severity: 'high',
      status: 'unresolved',
    });
  });

  test('GET /api/alerts — retrieve alerts', async () => {
    const res = await request(app).get('/api/alerts');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  test('GET /api/alerts?deviceId= — filter by device', async () => {
    const res = await request(app).get('/api/alerts').query({ deviceId: 'TEST_DEVICE_01' });
    expect(res.status).toBe(200);
    expect(res.body.data.every((a) => a.deviceId === 'TEST_DEVICE_01')).toBe(true);
  });

  test('GET /api/alerts?severity= — filter by severity', async () => {
    const res = await request(app).get('/api/alerts').query({ severity: 'high' });
    expect(res.status).toBe(200);
    expect(res.body.data.every((a) => a.severity === 'high')).toBe(true);
  });

  test('GET /api/alerts/:alertId — retrieve specific alert', async () => {
    const res = await request(app).get(`/api/alerts/${testAlertId}`);
    expect(res.status).toBe(200);
    expect(res.body.data.alertId).toBe(testAlertId);
  });

  test('PATCH /api/alerts/:alertId/resolve — resolve alert', async () => {
    const res = await request(app).patch(`/api/alerts/${testAlertId}/resolve`);
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('resolved');
    expect(res.body.data.resolvedAt).toBeDefined();
  });

  test('GET /api/alerts/:alertId — 404 for non-existent', async () => {
    const res = await request(app).get('/api/alerts/does_not_exist');
    expect(res.status).toBe(404);
  });
});
