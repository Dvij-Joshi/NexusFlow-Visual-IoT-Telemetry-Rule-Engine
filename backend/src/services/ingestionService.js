const Telemetry = require('../models/Telemetry');
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
      temperature: data.temperature,
      pressure: data.pressure,
      vibration: data.vibration,
      humidity: data.humidity,
      additionalData: data.additionalData || {},
    };

    // 1. Save to MongoDB Time-Series Collection
    const saved = await Telemetry.create(reading);

    // 2. Broadcast via WebSockets for real-time live monitoring
    broadcastTelemetry(saved);

    // 3. Process through active compiled RxJS rule engine
    streamCompiler.processTelemetry(saved);

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
      temperature: item.temperature,
      pressure: item.pressure,
      vibration: item.vibration,
      humidity: item.humidity,
      additionalData: item.additionalData || {},
    }));

    // High throughput insert
    const savedDocs = await Telemetry.insertMany(prepared, { ordered: false });

    // Stream and broadcast in real-time
    prepared.forEach((reading) => {
      broadcastTelemetry(reading);
      streamCompiler.processTelemetry(reading);
    });

    return {
      count: savedDocs.length,
      status: 'success',
    };
  }
}

module.exports = new IngestionService();
