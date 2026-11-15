const Device = require('../models/Device');

/**
 * Register a new device
 */
const createDevice = async (req, res) => {
  try {
    const { deviceId, deviceName, deviceType, location, unit, status } = req.body;

    if (!deviceId || !deviceName) {
      return res.status(400).json({
        success: false,
        error: 'deviceId and deviceName are required',
      });
    }

    const existing = await Device.findOne({ deviceId });
    if (existing) {
      return res.status(409).json({
        success: false,
        error: `Device with deviceId "${deviceId}" already exists`,
      });
    }

    const device = await Device.create({
      deviceId,
      deviceName,
      deviceType,
      location,
      unit,
      status,
    });

    return res.status(201).json({
      success: true,
      message: 'Device registered successfully',
      data: device,
    });
  } catch (error) {
    console.error('[DeviceController] Create Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get all devices
 */
const getAllDevices = async (req, res) => {
  try {
    const { status, deviceType } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (deviceType) filter.deviceType = deviceType;

    const devices = await Device.find(filter).sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      count: devices.length,
      data: devices,
    });
  } catch (error) {
    console.error('[DeviceController] Get All Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get device by deviceId
 */
const getDeviceById = async (req, res) => {
  try {
    const device = await Device.findOne({ deviceId: req.params.deviceId });
    if (!device) {
      return res.status(404).json({
        success: false,
        error: 'Device not found',
      });
    }
    return res.status(200).json({ success: true, data: device });
  } catch (error) {
    console.error('[DeviceController] Get Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Update device
 */
const updateDevice = async (req, res) => {
  try {
    const { deviceName, deviceType, location, unit, status } = req.body;

    const device = await Device.findOneAndUpdate(
      { deviceId: req.params.deviceId },
      { deviceName, deviceType, location, unit, status },
      { new: true, runValidators: true }
    );

    if (!device) {
      return res.status(404).json({ success: false, error: 'Device not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Device updated successfully',
      data: device,
    });
  } catch (error) {
    console.error('[DeviceController] Update Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Delete device
 */
const deleteDevice = async (req, res) => {
  try {
    const device = await Device.findOneAndDelete({ deviceId: req.params.deviceId });
    if (!device) {
      return res.status(404).json({ success: false, error: 'Device not found' });
    }

    return res.status(200).json({
      success: true,
      message: `Device "${device.deviceId}" deleted successfully`,
    });
  } catch (error) {
    console.error('[DeviceController] Delete Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  createDevice,
  getAllDevices,
  getDeviceById,
  updateDevice,
  deleteDevice,
};
