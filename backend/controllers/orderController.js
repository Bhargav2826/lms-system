const Order = require('../models/Order');

const createOrder = async (req, res) => {
    try {
        console.log('Incoming Order Request:', req.body);
        const { items, totalPrice, pickupDate, address, mobileNumber, customerName, isBulk, discountAmount, orderType, billingStatus } = req.body;

        const order = await Order.create({
            customer: req.user.id,
            items,
            totalPrice,
            pickupDate,
            address,
            mobileNumber,
            customerName,
            isBulk,
            discountAmount,
            orderType,
            billingStatus
        });
        res.status(201).json(order);
    } catch (error) {
        console.error('Order Creation Error Detalles:', error);
        res.status(400).json({
            message: error.message,
            details: error.errors // This will contain specific validation errors if any
        });
    }
};

const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ customer: req.user.id })
            .populate('items.service')
            .sort('-createdAt');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('customer', 'name email')
            .populate('items.service')
            .populate('assignedStaff', 'name')
            .sort('-createdAt');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateOrderStatus = async (req, res) => {
    try {
        const { status, assignedStaff } = req.body;
        const updateData = {};
        if (status) updateData.status = status;
        if (assignedStaff) updateData.assignedStaff = assignedStaff;

        const order = await Order.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!order) return res.status(404).json({ message: 'Order not found' });
        res.json(order);
    } catch (error) {
        console.error('Order Creation Error Detalles:', JSON.stringify(error, null, 2));
        console.error('Order Creation Error Message:', error.message);
        res.status(400).json({ message: error.message });
    }
};

const generateBill = async (req, res) => {
    try {
        const { weight, totalPrice } = req.body;
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { weight, totalPrice, billingStatus: 'Billed', assignedStaff: req.user.id },
            { new: true }
        );
        if (!order) return res.status(404).json({ message: 'Order not found' });
        res.json(order);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const assignOrder = async (req, res) => {
    try {
        const { assignedStaff } = req.body;
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { assignedStaff },
            { new: true }
        ).populate('assignedStaff', 'name');

        if (!order) return res.status(404).json({ message: 'Order not found' });
        res.json(order);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = { createOrder, getMyOrders, getAllOrders, updateOrderStatus, assignOrder, generateBill };
