const express = require('express');
const router = express.Router();
const {
  getOverview,
  getStudents,
  verifyStudentId,
  getVehicles,
  verifyVehicle,
  getRides,
  getBookings,
  getReports,
  updateReportStatus,
  toggleUserBlock,
  getReviews,
  moderateReview,
  getAuditLogs,
} = require('../controllers/adminController');
const { protect, requireAdmin } = require('../middleware/auth');

// Protect all admin routes with JWT + Admin role verification
router.use(protect, requireAdmin);

router.get('/overview', getOverview);
router.get('/students', getStudents);
router.put('/students/:id/verify', verifyStudentId);

router.get('/vehicles', getVehicles);
router.put('/vehicles/:id/verify', verifyVehicle);

router.get('/rides', getRides);
router.get('/bookings', getBookings);

router.get('/reports', getReports);
router.put('/reports/:id/status', updateReportStatus);
router.put('/users/:id/block', toggleUserBlock);

router.get('/reviews', getReviews);
router.put('/reviews/:id/moderate', moderateReview);

router.get('/audit-logs', getAuditLogs);

module.exports = router;
