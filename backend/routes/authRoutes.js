const express = require('express');
const { register, login, createStaff, getStaff } = require('../controllers/authController');
const { protect, admin } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/create-staff', protect, admin, createStaff);
router.get('/get-staff', protect, admin, getStaff);

module.exports = router;
