const express = require('express');
const router = express.Router();
const {
  ingestTelemetry,
  ingestBatchTelemetry,
  getRecentTelemetry,
} = require('../controllers/telemetryController');

// Ingestion endpoints
router.post('/', ingestTelemetry);
router.post('/batch', ingestBatchTelemetry);

// Query endpoints
router.get('/', getRecentTelemetry);
router.get('/:deviceId', getRecentTelemetry);

module.exports = router;
