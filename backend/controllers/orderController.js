const Order = require('../models/Order');
const { sendSMS } = require('../utils/messagingService');

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

        // Send confirmation SMS
        await sendSMS(mobileNumber, `Hi ${customerName}, your Cocoon Order #${order.orderId} has been placed successfully. Track it on your dashboard!`);

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

        // Real-time Notification
        if (req.io) {
            req.io.to(order.customer.toString()).emit('orderUpdate', {
                orderId: order.orderId,
                status: status,
                message: `Order #${order.orderId} updated to ${status}`
            });
        }

        // Send status update SMS
        await sendSMS(order.mobileNumber, `Order #${order.orderId} Update: Your laundry is now '${status}'.`);

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

        // Real-time Notification
        if (req.io) {
            req.io.to(order.customer.toString()).emit('billingUpdate', {
                orderId: order.orderId,
                totalPrice,
                message: `Bill generated for #${order.orderId}: Rs. ${totalPrice}`
            });
        }

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

const updateInspection = async (req, res) => {
    try {
        const { notes } = req.body;
        const photoPaths = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            {
                inspectionNotes: notes,
                $push: { inspectionPhotos: { $each: photoPaths } }
            },
            { new: true }
        );

        if (!order) return res.status(404).json({ message: 'Order not found' });
        res.json(order);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = { createOrder, getMyOrders, getAllOrders, updateOrderStatus, assignOrder, generateBill, updateInspection };
