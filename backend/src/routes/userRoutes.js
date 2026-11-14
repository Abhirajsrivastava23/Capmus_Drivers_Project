const express = require('express');
const router = express.Router();
const {
  getDriverProfile,
  registerVehicle,
  getMyVehicles,
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.get('/:id/driver-profile', getDriverProfile);
router.post('/vehicle', protect, registerVehicle);
router.get('/vehicle/my-vehicles', protect, getMyVehicles);

module.exports = router;
