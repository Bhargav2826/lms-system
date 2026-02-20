const express = require('express');
const { createOrder, getMyOrders, getAllOrders, updateOrderStatus, assignOrder, generateBill } = require('../controllers/orderController');
const { protect, admin, adminOrStaff } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', protect, createOrder);
router.get('/myorders', protect, getMyOrders);
router.get('/all', protect, adminOrStaff, getAllOrders);
router.put('/:id/status', protect, updateOrderStatus); // Shared between Staff and Admin
router.put('/:id/assign', protect, admin, assignOrder);
router.put('/:id/generate-bill', protect, generateBill);

module.exports = router;
