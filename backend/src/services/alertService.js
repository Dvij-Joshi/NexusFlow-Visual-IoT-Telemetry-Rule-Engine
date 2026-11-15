const { broadcastAlert } = require('../sockets/socketServer');
const Alert = require('../models/Alert');

class AlertService {
  /**
   * Trigger an alert based on a rule evaluation
   * @param {Object} alertPayload
   */
  async triggerAlert(alertPayload) {
    const alertId = `alert_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const alertData = {
      alertId,
      workflowId: alertPayload.workflowId || null,
      deviceId: alertPayload.deviceId || 'UNKNOWN',
      alertType: alertPayload.alertType || 'threshold',
      message: alertPayload.message || 'Alert condition triggered',
      triggerValue: alertPayload.triggerValue ?? alertPayload.reading ?? null,
      thresholdValue: alertPayload.thresholdValue ?? alertPayload.threshold ?? null,
      severity: (alertPayload.severity || 'medium').toLowerCase(),
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
      threshold: alertPayload.threshold || null,
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
