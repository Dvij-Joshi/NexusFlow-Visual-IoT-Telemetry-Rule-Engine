const { broadcastAlert } = require('../sockets/socketServer');

class AlertService {
  /**
   * Trigger an alert based on a rule evaluation
   * @param {Object} alertPayload
   */
  async triggerAlert(alertPayload) {
    const alert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date().toISOString(),
      ruleId: alertPayload.ruleId || 'manual',
      workflowId: alertPayload.workflowId || null,
      deviceId: alertPayload.deviceId || 'UNKNOWN',
      severity: alertPayload.severity || 'WARNING',
      message: alertPayload.message || 'Alert condition triggered',
      reading: alertPayload.reading || null,
      threshold: alertPayload.threshold || null,
    };

    console.warn(`[AlertService] 🔥 ALERT TRIGGERED for Device ${alert.deviceId}: ${alert.message}`);

    // Broadcast over WebSocket to connected dashboard clients
    broadcastAlert(alert);

    // Mock webhook / SMS notification
    if (alertPayload.webhookUrl) {
      this.sendOutboundWebhook(alertPayload.webhookUrl, alert);
    }

    return alert;
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
