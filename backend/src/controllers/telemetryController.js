const ingestionService = require('../services/ingestionService');
const Telemetry = require('../models/Telemetry');

/**
 * Handle single telemetry ingestion
 */
const ingestTelemetry = async (req, res) => {
  try {
    const { deviceId } = req.body;
    if (!deviceId) {
      return res.status(400).json({ error: 'deviceId is required' });
    }

    const result = await ingestionService.ingestSingle(req.body);
    return res.status(201).json({
      success: true,
      message: 'Telemetry ingested successfully',
      data: result,
    });
  } catch (error) {
    console.error('[TelemetryController] Ingest Error:', error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Handle high-throughput batch telemetry ingestion
 */
const ingestBatchTelemetry = async (req, res) => {
  try {
    const { batch } = req.body;
    if (!batch || !Array.isArray(batch)) {
      return res.status(400).json({ error: 'batch array is required' });
    }

    const result = await ingestionService.ingestBatch(batch);
    return res.status(201).json({
      success: true,
      message: `Batch of ${result.count} readings ingested successfully`,
      data: result,
    });
  } catch (error) {
    console.error('[TelemetryController] Batch Ingest Error:', error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Get recent telemetry readings (optionally filtered by deviceId)
 */
const getRecentTelemetry = async (req, res) => {
  try {
    const { deviceId } = req.params;
    const limit = parseInt(req.query.limit, 10) || 50;

    const query = deviceId ? { deviceId } : {};
    const readings = await Telemetry.find(query)
      .sort({ timestamp: -1 })
      .limit(limit);

    return res.status(200).json({
      success: true,
      count: readings.length,
      data: readings,
    });
  } catch (error) {
    console.error('[TelemetryController] Get Error:', error);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  ingestTelemetry,
  ingestBatchTelemetry,
  getRecentTelemetry,
};
