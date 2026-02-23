const express = require('express');
const { createOrder, getMyOrders, getAllOrders, updateOrderStatus, assignOrder, generateBill, updateInspection } = require('../controllers/orderController');
const { protect, admin, adminOrStaff } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Multer Storage Config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage });

router.post('/', protect, createOrder);
router.get('/myorders', protect, getMyOrders);
router.get('/all', protect, adminOrStaff, getAllOrders);
router.put('/:id/status', protect, updateOrderStatus);
router.put('/:id/assign', protect, admin, assignOrder);
router.put('/:id/generate-bill', protect, generateBill);
router.put('/:id/inspection', protect, adminOrStaff, upload.array('photos', 5), updateInspection);

module.exports = router;
