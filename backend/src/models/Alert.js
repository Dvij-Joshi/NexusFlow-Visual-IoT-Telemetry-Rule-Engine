const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema(
  {
    alertId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    workflowId: {
      type: String,
      default: null,
      index: true,
    },
    deviceId: {
      type: String,
      required: [true, 'deviceId is required'],
      index: true,
    },
    alertType: {
      type: String,
      default: 'threshold',
    },
    message: {
      type: String,
      required: [true, 'Alert message is required'],
    },
    triggerValue: {
      type: Number,
      default: null,
    },
    thresholdValue: {
      type: Number,
      default: null,
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical', 'warning', 'info'],
      default: 'medium',
      index: true,
    },
    status: {
      type: String,
      enum: ['unresolved', 'resolved'],
      default: 'unresolved',
      index: true,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for common query: recent unresolved alerts for a device
alertSchema.index({ deviceId: 1, status: 1, createdAt: -1 });

const Alert = mongoose.model('Alert', alertSchema);

module.exports = Alert;
