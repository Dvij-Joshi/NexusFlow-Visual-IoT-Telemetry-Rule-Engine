const express = require('express');
const router = express.Router();
const {
  getAlerts,
  getAlertById,
  resolveAlert,
} = require('../controllers/alertController');

router.get('/', getAlerts);
router.get('/:alertId', getAlertById);
router.patch('/:alertId/resolve', resolveAlert);

module.exports = router;
