const express = require('express');
const router = express.Router();
const {
  triggerSOS,
  updateTripLocation,
  getTripLocation,
  getSharedTrip,
  submitReport,
  getEmergencyContacts,
  addEmergencyContact,
  deleteEmergencyContact,
} = require('../controllers/safetyController');
const { protect } = require('../middleware/auth');

router.post('/sos', protect, triggerSOS);
router.post('/trip-location', protect, updateTripLocation);
router.get('/trip-location/:rideId', getTripLocation);
router.get('/share-trip/:shareToken', getSharedTrip);
router.post('/report', protect, submitReport);

router.get('/emergency-contacts', protect, getEmergencyContacts);
router.post('/emergency-contacts', protect, addEmergencyContact);
router.delete('/emergency-contacts/:id', protect, deleteEmergencyContact);

module.exports = router;
