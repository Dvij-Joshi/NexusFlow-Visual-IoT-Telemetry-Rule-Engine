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

/**
 * Get latest telemetry reading for a device
 */
const getLatestTelemetry = async (req, res) => {
  try {
    const { deviceId } = req.params;
    if (!deviceId) {
      return res.status(400).json({ success: false, error: 'deviceId is required' });
    }

    const reading = await Telemetry.findOne({ deviceId }).sort({ timestamp: -1 });
    if (!reading) {
      return res.status(404).json({
        success: false,
        error: `No telemetry found for device "${deviceId}"`,
      });
    }

    return res.status(200).json({ success: true, data: reading });
  } catch (error) {
    console.error('[TelemetryController] Latest Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get historical telemetry with date-range filtering
 */
const getTelemetryHistory = async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { start, end, limit = 200, page = 1 } = req.query;

    if (!deviceId) {
      return res.status(400).json({ success: false, error: 'deviceId is required' });
    }

    const filter = { deviceId };
    if (start || end) {
      filter.timestamp = {};
      if (start) filter.timestamp.$gte = new Date(start);
      if (end) filter.timestamp.$lte = new Date(end);
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await Telemetry.countDocuments(filter);
    const readings = await Telemetry.find(filter)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    return res.status(200).json({
      success: true,
      count: readings.length,
      total,
      page: parseInt(page, 10),
      pages: Math.ceil(total / parseInt(limit, 10)),
      data: readings,
    });
  } catch (error) {
    console.error('[TelemetryController] History Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get basic statistics (avg, min, max) for a device
 */
const getTelemetryStats = async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { start, end } = req.query;

    if (!deviceId) {
      return res.status(400).json({ success: false, error: 'deviceId is required' });
    }

    const match = { deviceId };
    if (start || end) {
      match.timestamp = {};
      if (start) match.timestamp.$gte = new Date(start);
      if (end) match.timestamp.$lte = new Date(end);
    }

    const stats = await Telemetry.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$deviceId',
          count: { $sum: 1 },
          avgTemperature: { $avg: '$temperature' },
          minTemperature: { $min: '$temperature' },
          maxTemperature: { $max: '$temperature' },
          avgPressure: { $avg: '$pressure' },
          minPressure: { $min: '$pressure' },
          maxPressure: { $max: '$pressure' },
          avgVibration: { $avg: '$vibration' },
          minVibration: { $min: '$vibration' },
          maxVibration: { $max: '$vibration' },
          firstReading: { $min: '$timestamp' },
          lastReading: { $max: '$timestamp' },
        },
      },
    ]);

    if (!stats.length) {
      return res.status(404).json({
        success: false,
        error: `No telemetry found for device "${deviceId}"`,
      });
    }

    return res.status(200).json({ success: true, data: stats[0] });
  } catch (error) {
    console.error('[TelemetryController] Stats Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  ingestTelemetry,
  ingestBatchTelemetry,
  getRecentTelemetry,
  getLatestTelemetry,
  getTelemetryHistory,
  getTelemetryStats,
};
