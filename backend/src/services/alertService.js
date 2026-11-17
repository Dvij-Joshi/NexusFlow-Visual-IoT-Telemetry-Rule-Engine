const { broadcastAlert } = require('../sockets/socketServer');
const Alert = require('../models/Alert');

/**
 * AlertService — central alert lifecycle manager for NexusFlow rule engine.
 *
 * Responsibilities:
 *  - Normalize and validate incoming alert payloads from the rule engine
 *  - Persist triggered alerts to MongoDB via the Alert model
 *  - Broadcast real-time alert events to dashboard clients over WebSocket
 *  - Dispatch outbound webhook notifications (production: use axios/fetch)
 *
 * @module AlertService
 */
class AlertService {
  /**
   * Trigger an alert based on a rule evaluation result.
   *
   * Normalizes triggerValue and thresholdValue to safe numerics, validates
   * severity against the allowed enum, persists to DB, and broadcasts over WS.
   *
   * @param {Object} alertPayload - Raw payload from the rule engine
   * @param {string} alertPayload.workflowId - Workflow that triggered the alert
   * @param {string} alertPayload.deviceId   - Source IoT device identifier
   * @param {string} alertPayload.alertType  - Alert category (e.g. 'threshold')
   * @param {string} alertPayload.message    - Human-readable alert description
   * @param {number|Object} alertPayload.reading       - Raw sensor reading
   * @param {number} [alertPayload.triggerValue]       - Evaluated numeric value
   * @param {number} [alertPayload.thresholdValue]     - Configured threshold
   * @param {string} [alertPayload.severity='medium']  - Alert severity level
   * @param {string} [alertPayload.webhookUrl]         - Optional outbound webhook
   * @returns {Promise<Object>} The persisted alert data object
   */
  async triggerAlert(alertPayload) {
    const alertId = `alert_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // --- Normalize triggerValue to a safe numeric or null ---
    let triggerValue = alertPayload.triggerValue;
    if (typeof triggerValue !== 'number') {
      if (typeof alertPayload.reading === 'number') {
        triggerValue = alertPayload.reading;
      } else if (alertPayload.reading && typeof alertPayload.reading === 'object') {
        // Extract the first available numeric sensor field from a telemetry object
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

    // --- Normalize thresholdValue to a safe numeric or null ---
    let thresholdValue = alertPayload.thresholdValue ?? alertPayload.threshold ?? null;
    if (thresholdValue !== null && typeof thresholdValue !== 'number') {
      thresholdValue = Number(thresholdValue);
      if (isNaN(thresholdValue)) thresholdValue = null;
    }

    // --- Validate severity against allowed enum values ---
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

    console.warn(`[AlertService] ALERT TRIGGERED — Device: ${alertData.deviceId} | Severity: ${severity.toUpperCase()} | ${alertData.message}`);

    // --- Persist to MongoDB (non-blocking — log error but do not throw) ---
    try {
      await Alert.create(alertData);
    } catch (err) {
      console.error('[AlertService] Failed to persist alert to database:', err.message);
    }

    // --- Broadcast real-time event to all connected dashboard clients ---
    broadcastAlert({
      id: alertId,
      timestamp: new Date().toISOString(),
      ...alertData,
      reading: alertPayload.reading || null,
      threshold: thresholdValue,
    });

    // --- Dispatch outbound webhook if configured ---
    if (alertPayload.webhookUrl) {
      this.sendOutboundWebhook(alertPayload.webhookUrl, alertData);
    }

    return alertData;
  }

  /**
   * Dispatch an outbound webhook notification.
   *
   * In production replace the console.log stub with an axios/fetch POST call.
   *
   * @param {string} url  - Destination webhook URL
   * @param {Object} data - Alert payload to send as request body
   * @returns {Promise<void>}
   */
  async sendOutboundWebhook(url, data) {
    try {
      console.log(`[AlertService] Dispatching outbound webhook → ${url}`);
      // Production: await axios.post(url, data, { timeout: 5000 });
    } catch (err) {
      console.error(`[AlertService] Outbound webhook dispatch failed: ${err.message}`);
    }
  }
}

module.exports = new AlertService();
