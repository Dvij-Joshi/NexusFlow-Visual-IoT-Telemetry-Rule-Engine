const { broadcastAlert } = require('../sockets/socketServer');
const Alert = require('../models/Alert');

class AlertService {
  /**
   * Trigger an alert based on a rule evaluation
   * @param {Object} alertPayload
   */
  async triggerAlert(alertPayload) {
    const alertId = `alert_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Ensure triggerValue is a valid number, extracting from reading if needed
    let triggerValue = alertPayload.triggerValue;
    if (typeof triggerValue !== 'number') {
      if (typeof alertPayload.reading === 'number') {
        triggerValue = alertPayload.reading;
      } else if (alertPayload.reading && typeof alertPayload.reading === 'object') {
        // If reading is a telemetry object, extract the sensor numeric reading
        triggerValue =
          alertPayload.reading.temperature ??
          alertPayload.reading.pressure ??
          alertPayload.reading.vibration ??
          alertPayload.reading.humidity ??
          null;
      } else {
        triggerValue = null;
      }
    }
    if (triggerValue !== null && typeof triggerValue === 'number' && isNaN(triggerValue)) {
      triggerValue = null;
    }

    // Ensure thresholdValue is a valid number
    let thresholdValue = alertPayload.thresholdValue ?? alertPayload.threshold ?? null;
    if (thresholdValue !== null && typeof thresholdValue !== 'number') {
      thresholdValue = Number(thresholdValue);
      if (isNaN(thresholdValue)) thresholdValue = null;
    }

    // Normalize severity to lowercase valid enum
    const rawSeverity = (alertPayload.severity || 'medium').toLowerCase();
    const validSeverities = ['low', 'medium', 'high', 'critical', 'warning', 'info'];
    const severity = validSeverities.includes(rawSeverity) ? rawSeverity : 'medium';

    const alertData = {
      alertId,
      workflowId: alertPayload.workflowId || null,
      deviceId: alertPayload.deviceId || 'UNKNOWN',
      alertType: alertPayload.alertType || 'threshold',
      message: alertPayload.message || 'Alert condition triggered',
      triggerValue,
      thresholdValue,
      severity,
      status: 'unresolved',
    };

    console.warn(`[AlertService] ALERT TRIGGERED for Device ${alertData.deviceId}: ${alertData.message}`);

    // Persist to database
    try {
      await Alert.create(alertData);
    } catch (err) {
      console.error('[AlertService] Failed to persist alert:', err.message);
    }

    // Broadcast over WebSocket to connected dashboard clients
    broadcastAlert({
      id: alertId,
      timestamp: new Date().toISOString(),
      ...alertData,
      reading: alertPayload.reading || null,
      threshold: thresholdValue,
    });

    // Mock webhook / SMS notification
    if (alertPayload.webhookUrl) {
      this.sendOutboundWebhook(alertPayload.webhookUrl, alertData);
    }

    return alertData;
  }

  /**
   * Mock outbound webhook sender
   */
  async sendOutboundWebhook(url, data) {
    try {
      console.log(`[AlertService] Dispatching outbound webhook to ${url}`);
      // In production, use fetch / axios to POST payload
    } catch (err) {
      console.error(`[AlertService] Outbound webhook dispatch failed: ${err.message}`);
    }
  }
}

module.exports = new AlertService();
