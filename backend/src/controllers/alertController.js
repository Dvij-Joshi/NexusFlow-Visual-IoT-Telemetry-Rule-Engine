const Alert = require('../models/Alert');

/**
 * Get alerts with filtering and pagination
 */
const getAlerts = async (req, res) => {
  try {
    const { deviceId, workflowId, severity, status, limit = 50, page = 1 } = req.query;
    const filter = {};
    if (deviceId) filter.deviceId = deviceId;
    if (workflowId) filter.workflowId = workflowId;
    if (severity) filter.severity = severity;
    if (status) filter.status = status;

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await Alert.countDocuments(filter);
    const alerts = await Alert.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    return res.status(200).json({
      success: true,
      count: alerts.length,
      total,
      page: parseInt(page, 10),
      pages: Math.ceil(total / parseInt(limit, 10)),
      data: alerts,
    });
  } catch (error) {
    console.error('[AlertController] Get Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get single alert by alertId
 */
const getAlertById = async (req, res) => {
  try {
    const alert = await Alert.findOne({ alertId: req.params.alertId });
    if (!alert) {
      return res.status(404).json({ success: false, error: 'Alert not found' });
    }
    return res.status(200).json({ success: true, data: alert });
  } catch (error) {
    console.error('[AlertController] Get By ID Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Mark alert as resolved
 */
const resolveAlert = async (req, res) => {
  try {
    const alert = await Alert.findOneAndUpdate(
      { alertId: req.params.alertId },
      { status: 'resolved', resolvedAt: new Date() },
      { new: true }
    );

    if (!alert) {
      return res.status(404).json({ success: false, error: 'Alert not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Alert resolved',
      data: alert,
    });
  } catch (error) {
    console.error('[AlertController] Resolve Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { getAlerts, getAlertById, resolveAlert };
