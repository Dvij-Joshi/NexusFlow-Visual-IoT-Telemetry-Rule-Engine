/**
 * NexusFlow Database Seed Script
 *
 * Seeds sample devices, a workflow, and initial alerts.
 * Safe to run repeatedly — skips existing devices by deviceId.
 *
 * Usage: npm run seed
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const Device = require('../models/Device');
const Workflow = require('../models/Workflow');
const Alert = require('../models/Alert');

const sampleDevices = [
  {
    deviceId: 'TURBINE_01',
    deviceName: 'Main Turbine Temperature Sensor',
    deviceType: 'temperature',
    location: 'Factory Floor A - Section 1',
    unit: '°C',
    status: 'online',
  },
  {
    deviceId: 'TURBINE_02',
    deviceName: 'Main Turbine Pressure Sensor',
    deviceType: 'pressure',
    location: 'Factory Floor A - Section 1',
    unit: 'psi',
    status: 'online',
  },
  {
    deviceId: 'MOTOR_01',
    deviceName: 'Assembly Line Motor Vibration Sensor',
    deviceType: 'vibration',
    location: 'Factory Floor B - Assembly Line 2',
    unit: 'mm/s',
    status: 'online',
  },
  {
    deviceId: 'MOTOR_02',
    deviceName: 'Conveyor Motor Temperature Sensor',
    deviceType: 'temperature',
    location: 'Factory Floor B - Assembly Line 3',
    unit: '°C',
    status: 'offline',
  },
  {
    deviceId: 'PUMP_01',
    deviceName: 'Cooling Pump Pressure Sensor',
    deviceType: 'pressure',
    location: 'Utility Room C',
    unit: 'bar',
    status: 'maintenance',
  },
];

const sampleWorkflow = {
  name: 'Turbine Temperature Monitor',
  description: 'Alert when turbine average temperature exceeds 80°C',
  isActive: true,
  nodes: [
    {
      id: 'sensor-1',
      type: 'sensor',
      position: { x: 250, y: 0 },
      data: { label: 'Turbine Temperature Sensor', deviceId: 'TURBINE_01', channel: 'temperature' },
    },
    {
      id: 'transform-1',
      type: 'transform',
      position: { x: 250, y: 150 },
      data: { label: 'Moving Average', operation: 'SMA', windowSize: 5 },
    },
    {
      id: 'threshold-1',
      type: 'threshold',
      position: { x: 250, y: 300 },
      data: { label: 'Temperature Check', field: 'temperature', operator: '>', value: 80 },
    },
    {
      id: 'alert-1',
      type: 'alert',
      position: { x: 250, y: 450 },
      data: { label: 'Overheat Alert', channel: 'WebSocket + Dashboard', severity: 'CRITICAL' },
    },
  ],
  edges: [
    { id: 'e-s1-t1', source: 'sensor-1', target: 'transform-1', animated: true },
    { id: 'e-t1-th1', source: 'transform-1', target: 'threshold-1', animated: true },
    { id: 'e-th1-a1', source: 'threshold-1', target: 'alert-1', animated: true },
  ],
};

const sampleAlerts = [
  {
    alertId: 'seed_alert_001',
    workflowId: null,
    deviceId: 'TURBINE_01',
    alertType: 'temperature_threshold',
    message: 'Turbine temperature exceeded 80°C',
    triggerValue: 85,
    thresholdValue: 80,
    severity: 'high',
    status: 'resolved',
    resolvedAt: new Date(),
  },
  {
    alertId: 'seed_alert_002',
    workflowId: null,
    deviceId: 'MOTOR_01',
    alertType: 'vibration_threshold',
    message: 'Motor vibration exceeded safe level',
    triggerValue: 18.5,
    thresholdValue: 15,
    severity: 'critical',
    status: 'unresolved',
  },
];

async function seed() {
  try {
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      console.error('MONGODB_URI is not set. Create a .env file from .env.example');
      process.exit(1);
    }

    await mongoose.connect(mongoURI);
    console.log('[Seed] Connected to MongoDB');

    // Seed devices (upsert to avoid duplicates)
    let deviceCount = 0;
    for (const device of sampleDevices) {
      const result = await Device.findOneAndUpdate(
        { deviceId: device.deviceId },
        { $setOnInsert: device },
        { upsert: true, new: true, rawResult: true }
      );
      if (result.lastErrorObject?.updatedExisting === false) deviceCount++;
    }
    console.log(`[Seed] Devices: ${deviceCount} created, ${sampleDevices.length - deviceCount} already existed`);

    // Seed workflow (skip if one with the same name exists)
    const existingWf = await Workflow.findOne({ name: sampleWorkflow.name });
    if (!existingWf) {
      await Workflow.create(sampleWorkflow);
      console.log('[Seed] Workflow: created "Turbine Temperature Monitor"');
    } else {
      console.log('[Seed] Workflow: "Turbine Temperature Monitor" already exists, skipped');
    }

    // Seed alerts (upsert by alertId)
    let alertCount = 0;
    for (const alert of sampleAlerts) {
      const result = await Alert.findOneAndUpdate(
        { alertId: alert.alertId },
        { $setOnInsert: alert },
        { upsert: true, new: true, rawResult: true }
      );
      if (result.lastErrorObject?.updatedExisting === false) alertCount++;
    }
    console.log(`[Seed] Alerts: ${alertCount} created, ${sampleAlerts.length - alertCount} already existed`);

    console.log('[Seed] Database seeding complete');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('[Seed] Error:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seed();
