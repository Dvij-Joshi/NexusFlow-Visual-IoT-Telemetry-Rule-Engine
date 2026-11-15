const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema(
  {
    deviceId: {
      type: String,
      required: [true, 'deviceId is required'],
      unique: true,
      trim: true,
      index: true,
    },
    deviceName: {
      type: String,
      required: [true, 'deviceName is required'],
      trim: true,
    },
    deviceType: {
      type: String,
      required: [true, 'deviceType is required'],
      enum: ['temperature', 'pressure', 'vibration', 'humidity', 'multi'],
      default: 'temperature',
    },
    location: {
      type: String,
      default: '',
      trim: true,
    },
    unit: {
      type: String,
      default: '°C',
      trim: true,
    },
    status: {
      type: String,
      enum: ['online', 'offline', 'maintenance'],
      default: 'offline',
    },
    lastSeen: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Device = mongoose.model('Device', deviceSchema);

module.exports = Device;
