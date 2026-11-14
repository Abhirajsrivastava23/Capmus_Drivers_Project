const express = require('express');
const router = express.Router();
const { getRideMessages, sendMessage } = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

router.get('/ride/:rideId', protect, getRideMessages);
router.post('/send', protect, sendMessage);

module.exports = router;
