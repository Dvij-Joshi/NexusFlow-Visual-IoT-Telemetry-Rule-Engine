const mongoose = require('mongoose');

const telemetrySchema = new mongoose.Schema(
  {
    timestamp: {
      type: Date,
      default: Date.now,
      required: true,
    },
    metadata: {
      deviceId: {
        type: String,
        required: true,
      },
      sensorType: {
        type: String,
        default: 'generic',
      },
    },
    deviceId: {
      type: String,
      required: true,
      index: true,
    },
    temperature: {
      type: Number,
    },
    pressure: {
      type: Number,
    },
    vibration: {
      type: Number,
    },
    humidity: {
      type: Number,
    },
    additionalData: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timeseries: {
      timeField: 'timestamp',
      metaField: 'metadata',
      granularity: 'seconds',
    },
  }
);

// Pre-save middleware to ensure metadata.deviceId matches deviceId
telemetrySchema.pre('validate', function (next) {
  if (this.deviceId && (!this.metadata || !this.metadata.deviceId)) {
    this.metadata = this.metadata || {};
    this.metadata.deviceId = this.deviceId;
  }
  next();
});

const Telemetry = mongoose.model('Telemetry', telemetrySchema);

module.exports = Telemetry;
