const express = require('express');
const { getDashboardStats, exportData } = require('../controllers/analyticsController');
const { protect, admin } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/stats', protect, admin, getDashboardStats);
router.get('/export', protect, admin, exportData);

module.exports = router;
