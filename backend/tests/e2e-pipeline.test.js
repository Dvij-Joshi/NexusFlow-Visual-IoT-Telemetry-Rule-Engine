/**
 * Complete End-to-End Pipeline Integration Test
 *
 * Verifies:
 * 1. Device registration & status tracking
 * 2. Visual workflow compilation into reactive RxJS streams
 * 3. Topological execution order (Sensor -> MovingAverage -> Threshold -> Alert)
 * 4. High-velocity telemetry ingestion (single & batch) into MongoDB Time-Series
 * 5. Automatic device lastSeen and status update
 * 6. Real-time threshold evaluation & moving average smoothing
 * 7. Alert persistence into MongoDB with accurate triggerValue & severity
 * 8. Alert resolution lifecycle (PATCH /resolve)
 * 9. Telemetry aggregation statistics (avg, min, max)
 */
const request = require('supertest');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

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
const streamCompiler = require('../src/compiler/streamCompiler');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/devices', deviceRoutes);
app.use('/api/telemetry', telemetryRoutes);
app.use('/api/workflows', workflowRoutes);
app.use('/api/alerts', alertRoutes);
app.use(errorHandler);

const TEST_DEVICE_ID = 'E2E_TURBINE_99';
let createdWorkflowId;

beforeAll(async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI not set');
  await mongoose.connect(uri);

  // Clean any previous test data
  await Device.deleteMany({ deviceId: TEST_DEVICE_ID });
  await Telemetry.deleteMany({ deviceId: TEST_DEVICE_ID });
  await Workflow.deleteMany({ name: /^\[E2E\]/ });
  await Alert.deleteMany({ deviceId: TEST_DEVICE_ID });
});

afterAll(async () => {
  // Teardown active test pipeline
  if (createdWorkflowId) {
    streamCompiler.stopWorkflow(createdWorkflowId.toString());
  }
  await Device.deleteMany({ deviceId: TEST_DEVICE_ID });
  await Telemetry.deleteMany({ deviceId: TEST_DEVICE_ID });
  await Workflow.deleteMany({ name: /^\[E2E\]/ });
  await Alert.deleteMany({ deviceId: TEST_DEVICE_ID });
  await mongoose.disconnect();
});

describe('NexusFlow End-to-End Pipeline', () => {
  test('Step 1: Register an industrial IoT device', async () => {
    const res = await request(app)
      .post('/api/devices')
      .send({
        deviceId: TEST_DEVICE_ID,
        deviceName: 'E2E Test Gas Turbine',
        deviceType: 'temperature',
        location: 'Test Bay 4',
        unit: '°C',
        status: 'offline',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.deviceId).toBe(TEST_DEVICE_ID);
    expect(res.body.data.status).toBe('offline');
  });

  test('Step 2: Create visual workflow with out-of-order nodes (tests topological sort)', async () => {
    // Deliberately define nodes in reverse order: Alert, Threshold, MovingAverage, Sensor
    const workflowPayload = {
      name: '[E2E] Turbine Overheat Guard',
      description: 'Smoothed temperature threshold alert pipeline',
      isActive: true,
      nodes: [
        {
          id: 'alert_node_1',
          type: 'alert',
          position: { x: 260, y: 500 },
          data: {
            label: 'Emergency Overheat Alert',
            message: 'Turbine core temperature exceeded safe operating limit',
            severity: 'CRITICAL',
            value: 80,
          },
        },
        {
          id: 'threshold_node_1',
          type: 'threshold',
          position: { x: 260, y: 350 },
          data: {
            label: 'Temperature Threshold Guard',
            field: 'temperature',
            operator: '>',
            value: 80,
          },
        },
        {
          id: 'avg_node_1',
          type: 'movingAverage',
          position: { x: 260, y: 200 },
          data: {
            label: 'Rolling Average Filter',
            field: 'temperature',
            windowSize: 3,
            operation: 'SMA',
          },
        },
        {
          id: 'sensor_node_1',
          type: 'sensor',
          position: { x: 260, y: 50 },
          data: {
            label: 'Turbine Sensor Ingress',
            deviceId: TEST_DEVICE_ID,
            field: 'temperature',
          },
        },
      ],
      edges: [
        { source: 'sensor_node_1', target: 'avg_node_1' },
        { source: 'avg_node_1', target: 'threshold_node_1' },
        { source: 'threshold_node_1', target: 'alert_node_1' },
      ],
    };

    const res = await request(app).post('/api/workflows').send(workflowPayload);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    createdWorkflowId = res.body.data._id;

    // Verify pipeline is compiled and active in streamCompiler
    expect(streamCompiler.activePipelines.has(createdWorkflowId.toString())).toBe(true);
  });

  test('Step 3: Ingest normal telemetry (below threshold) — should NOT trigger alert', async () => {
    const res = await request(app).post('/api/telemetry').send({
      deviceId: TEST_DEVICE_ID,
      temperature: 74,
      pressure: 115,
      vibration: 11.2,
      timestamp: new Date().toISOString(),
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);

    // Wait for reactive stream execution
    await new Promise((r) => setTimeout(r, 400));

    // Verify device status was updated to online and lastSeen was set
    const dev = await Device.findOne({ deviceId: TEST_DEVICE_ID });
    expect(dev.status).toBe('online');
    expect(dev.lastSeen).not.toBeNull();

    // Verify NO alert was generated
    const alerts = await Alert.find({ deviceId: TEST_DEVICE_ID });
    expect(alerts.length).toBe(0);
  });

  test('Step 4: Ingest high telemetry (breaching threshold) — SHOULD trigger smoothed alert', async () => {
    // Send two more readings: 76 and 96
    // Moving average window of 3: (74 + 76 + 96) / 3 = 82 > 80 threshold
    await request(app).post('/api/telemetry').send({
      deviceId: TEST_DEVICE_ID,
      temperature: 76,
      pressure: 116,
      timestamp: new Date().toISOString(),
    });

    await request(app).post('/api/telemetry').send({
      deviceId: TEST_DEVICE_ID,
      temperature: 96,
      pressure: 120,
      timestamp: new Date().toISOString(),
    });

    // Wait for async reactive pipeline and DB persistence
    await new Promise((r) => setTimeout(r, 600));

    // Verify alert was created in MongoDB with valid numeric triggerValue
    const alerts = await Alert.find({ deviceId: TEST_DEVICE_ID }).sort({ createdAt: -1 });
    expect(alerts.length).toBeGreaterThan(0);

    const triggeredAlert = alerts[0];
    expect(triggeredAlert.deviceId).toBe(TEST_DEVICE_ID);
    expect(triggeredAlert.status).toBe('unresolved');
    expect(triggeredAlert.severity).toBe('critical');
    expect(triggeredAlert.thresholdValue).toBe(80);
    expect(typeof triggeredAlert.triggerValue).toBe('number');
    expect(triggeredAlert.triggerValue).toBeGreaterThan(80); // Calculated smoothed avg > 80
  });

  test('Step 5: Resolve the generated alert via API', async () => {
    const alerts = await Alert.find({ deviceId: TEST_DEVICE_ID, status: 'unresolved' });
    expect(alerts.length).toBeGreaterThan(0);
    const alertId = alerts[0].alertId;

    const res = await request(app).patch(`/api/alerts/${alertId}/resolve`);
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('resolved');
    expect(res.body.data.resolvedAt).toBeDefined();
  });

  test('Step 6: High-throughput batch telemetry ingestion (50 readings)', async () => {
    const batch = Array.from({ length: 50 }, (_, i) => ({
      deviceId: TEST_DEVICE_ID,
      temperature: 70 + (i % 20),
      pressure: 100 + (i % 15),
      vibration: 10 + (i % 5),
      timestamp: new Date(Date.now() - (50 - i) * 1000).toISOString(),
    }));

    const res = await request(app).post('/api/telemetry/batch').send({ batch });
    expect(res.status).toBe(201);
    expect(res.body.data.count).toBe(50);

    // Verify documents exist in Time-Series collection
    const count = await Telemetry.countDocuments({ deviceId: TEST_DEVICE_ID });
    expect(count).toBeGreaterThanOrEqual(53); // 3 singles + 50 batch
  });

  test('Step 7: Retrieve telemetry statistics aggregation (avg, min, max)', async () => {
    const res = await request(app).get(`/api/telemetry/${TEST_DEVICE_ID}/stats`);
    expect(res.status).toBe(200);
    expect(res.body.data._id).toBe(TEST_DEVICE_ID);
    expect(res.body.data.count).toBeGreaterThanOrEqual(53);
    expect(res.body.data.avgTemperature).toBeDefined();
    expect(res.body.data.minTemperature).toBeDefined();
    expect(res.body.data.maxTemperature).toBeDefined();
  });

  test('Step 8: Retrieve latest telemetry reading', async () => {
    const res = await request(app).get(`/api/telemetry/${TEST_DEVICE_ID}/latest`);
    expect(res.status).toBe(200);
    expect(res.body.data.deviceId).toBe(TEST_DEVICE_ID);
    expect(res.body.data.temperature).toBeDefined();
  });
});
