const express = require('express');
const router = express.Router();
const {
  createDevice,
  getAllDevices,
  getDeviceById,
  updateDevice,
  deleteDevice,
} = require('../controllers/deviceController');

router.post('/', createDevice);
router.get('/', getAllDevices);
router.get('/:deviceId', getDeviceById);
router.put('/:deviceId', updateDevice);
router.delete('/:deviceId', deleteDevice);

module.exports = router;
