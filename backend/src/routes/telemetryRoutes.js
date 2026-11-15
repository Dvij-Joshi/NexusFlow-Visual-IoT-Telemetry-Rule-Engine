const express = require('express');
const router = express.Router();
const {
  ingestTelemetry,
  ingestBatchTelemetry,
  getRecentTelemetry,
  getLatestTelemetry,
  getTelemetryHistory,
  getTelemetryStats,
} = require('../controllers/telemetryController');

// Ingestion endpoints
router.post('/', ingestTelemetry);
router.post('/ingest', ingestTelemetry);
router.post('/batch', ingestBatchTelemetry);

// Query endpoints
router.get('/', getRecentTelemetry);
router.get('/:deviceId', getRecentTelemetry);
router.get('/:deviceId/latest', getLatestTelemetry);
router.get('/:deviceId/history', getTelemetryHistory);
router.get('/:deviceId/stats', getTelemetryStats);

module.exports = router;
