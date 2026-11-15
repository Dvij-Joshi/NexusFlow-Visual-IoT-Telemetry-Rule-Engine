const Telemetry = require('../models/Telemetry');
const Device = require('../models/Device');
const { broadcastTelemetry } = require('../sockets/socketServer');
const streamCompiler = require('../compiler/streamCompiler');

class IngestionService {
  /**
   * Ingest a single telemetry reading
   * @param {Object} data
   */
  async ingestSingle(data) {
    const reading = {
      timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
      deviceId: data.deviceId,
      metadata: {
        deviceId: data.deviceId,
        sensorType: data.sensorType || 'sensor',
      },
      temperature: data.temperature !== undefined ? Number(data.temperature) : undefined,
      pressure: data.pressure !== undefined ? Number(data.pressure) : undefined,
      vibration: data.vibration !== undefined ? Number(data.vibration) : undefined,
      humidity: data.humidity !== undefined ? Number(data.humidity) : undefined,
      additionalData: data.additionalData || {},
    };

    // 1. Save to MongoDB Time-Series Collection
    const saved = await Telemetry.create(reading);
    const plainDoc = saved && typeof saved.toObject === 'function' ? saved.toObject() : reading;
    // Ensure top-level deviceId is present on plainDoc
    plainDoc.deviceId = plainDoc.deviceId || reading.deviceId;

    // 2. Update device lastSeen & status (fire-and-forget for speed)
    Device.findOneAndUpdate(
      { deviceId: data.deviceId },
      { lastSeen: new Date(), status: 'online' }
    ).catch(() => {});

    // 3. Broadcast via WebSockets for real-time live monitoring
    broadcastTelemetry(plainDoc);

    // 4. Process through active compiled RxJS rule engine
    streamCompiler.processTelemetry(plainDoc);

    return saved;
  }

  /**
   * Ingest a batch of telemetry readings (optimized for high throughput)
   * @param {Array<Object>} batch
   */
  async ingestBatch(batch) {
    if (!Array.isArray(batch) || batch.length === 0) {
      throw new Error('Batch must be a non-empty array of telemetry readings');
    }

    const prepared = batch.map((item) => ({
      timestamp: item.timestamp ? new Date(item.timestamp) : new Date(),
      deviceId: item.deviceId,
      metadata: {
        deviceId: item.deviceId,
        sensorType: item.sensorType || 'sensor',
      },
      temperature: item.temperature !== undefined ? Number(item.temperature) : undefined,
      pressure: item.pressure !== undefined ? Number(item.pressure) : undefined,
      vibration: item.vibration !== undefined ? Number(item.vibration) : undefined,
      humidity: item.humidity !== undefined ? Number(item.humidity) : undefined,
      additionalData: item.additionalData || {},
    }));

    // High throughput insert
    const savedDocs = await Telemetry.insertMany(prepared, { ordered: false });

    // Update lastSeen for all unique devices in the batch (fire-and-forget)
    const uniqueDeviceIds = [...new Set(batch.map((item) => item.deviceId))];
    uniqueDeviceIds.forEach((id) => {
      Device.findOneAndUpdate(
        { deviceId: id },
        { lastSeen: new Date(), status: 'online' }
      ).catch(() => {});
    });

    // Stream and broadcast in real-time using plain objects with deviceId preserved
    savedDocs.forEach((doc, idx) => {
      const plain = doc && typeof doc.toObject === 'function' ? doc.toObject() : prepared[idx];
      plain.deviceId = plain.deviceId || prepared[idx].deviceId;
      broadcastTelemetry(plain);
      streamCompiler.processTelemetry(plain);
    });

    return {
      count: savedDocs.length,
      status: 'success',
    };
  }
}

module.exports = new IngestionService();
