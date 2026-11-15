/**
 * NexusFlow Mock IoT Data Generator
 *
 * Generates realistic sensor readings and sends them through the ingestion API.
 * Supports configurable intervals and occasional abnormal readings.
 *
 * Usage: npm run generate
 *   or:  node src/scripts/mockGenerator.js [--interval 1000] [--abnormal-rate 0.15]
 */
const http = require('http');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const PORT = process.env.PORT || 5000;
const BASE_URL = `http://localhost:${PORT}`;

const devices = [
  { deviceId: 'TURBINE_01', field: 'temperature', base: 75, range: 10, unit: '°C' },
  { deviceId: 'TURBINE_02', field: 'pressure', base: 115, range: 15, unit: 'psi' },
  { deviceId: 'MOTOR_01', field: 'vibration', base: 12, range: 4, unit: 'mm/s' },
  { deviceId: 'MOTOR_02', field: 'temperature', base: 65, range: 12, unit: '°C' },
  { deviceId: 'PUMP_01', field: 'pressure', base: 3.5, range: 1.5, unit: 'bar' },
];

function generateReading(device, forceAbnormal = false) {
  const jitter = (Math.random() - 0.5) * device.range;
  let value = device.base + jitter;

  // Occasional abnormal spike (high value to trigger thresholds)
  if (forceAbnormal) {
    value = device.base + device.range * (1.5 + Math.random());
  }

  const reading = {
    deviceId: device.deviceId,
    timestamp: new Date().toISOString(),
    [device.field]: Math.round(value * 100) / 100,
  };

  // Add secondary sensor values for multi-field devices
  if (device.field === 'temperature') {
    reading.pressure = Math.round((110 + Math.random() * 20) * 100) / 100;
    reading.vibration = Math.round((10 + Math.random() * 5) * 100) / 100;
  }

  return reading;
}

function sendReading(reading) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(reading);
    const req = http.request(
      `${BASE_URL}/api/telemetry`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) },
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          if (res.statusCode === 201) {
            resolve(JSON.parse(body));
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${body}`));
          }
        });
      }
    );
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function run() {
  const args = process.argv.slice(2);
  const intervalIdx = args.indexOf('--interval');
  const abnormalIdx = args.indexOf('--abnormal-rate');
  const interval = intervalIdx !== -1 ? parseInt(args[intervalIdx + 1], 10) : 2000;
  const abnormalRate = abnormalIdx !== -1 ? parseFloat(args[abnormalIdx + 1]) : 0.15;

  console.log(`[MockGenerator] Sending to ${BASE_URL}/api/telemetry`);
  console.log(`[MockGenerator] Interval: ${interval}ms | Abnormal rate: ${(abnormalRate * 100).toFixed(0)}%`);
  console.log(`[MockGenerator] Devices: ${devices.map((d) => d.deviceId).join(', ')}`);
  console.log('[MockGenerator] Press Ctrl+C to stop\n');

  let count = 0;

  const timer = setInterval(async () => {
    // Pick a random device each tick
    const device = devices[count % devices.length];
    const isAbnormal = Math.random() < abnormalRate;
    const reading = generateReading(device, isAbnormal);

    try {
      await sendReading(reading);
      const flag = isAbnormal ? ' [ABNORMAL]' : '';
      console.log(
        `[${new Date().toISOString()}] ${device.deviceId} → ${device.field}: ${reading[device.field]} ${device.unit}${flag}`
      );
    } catch (err) {
      console.error(`[MockGenerator] Send failed: ${err.message}`);
    }

    count++;
  }, interval);

  process.on('SIGINT', () => {
    clearInterval(timer);
    console.log(`\n[MockGenerator] Stopped after ${count} readings`);
    process.exit(0);
  });
}

run();
