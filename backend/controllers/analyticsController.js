const Order = require('../models/Order');
const User = require('../models/User');
const XLSX = require('xlsx');

const getDashboardStats = async (req, res) => {
    try {
        const totalOrders = await Order.countDocuments();
        const pendingOrders = await Order.countDocuments({ status: { $ne: 'Delivered' } });
        const completedOrders = await Order.countDocuments({ status: 'Delivered' });

        const revenueData = await Order.aggregate([
            { $match: { status: 'Delivered' } },
            { $group: { _id: null, total: { $sum: '$totalPrice' } } }
        ]);

        const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

        const staffCount = await User.countDocuments({ role: 'staff' });
        const customerCount = await User.countDocuments({ role: 'customer' });

        // Get recent order activity for graphs (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const dailyOrders = await Order.aggregate([
            { $match: { createdAt: { $gte: sevenDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 },
                    earnings: { $sum: "$totalPrice" }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        res.json({
            totalOrders,
            pendingOrders,
            completedOrders,
            totalRevenue,
            staffCount,
            customerCount,
            dailyOrders
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const exportData = async (req, res) => {
    try {
        const orders = await Order.find().populate('customer', 'name email').populate('assignedStaff', 'name');

        const data = orders.map(order => ({
            'Order ID': order.orderId,
            'Customer Name': order.customerName,
            'Account Email': order.customer?.email,
            'Mobile': order.mobileNumber,
            'Address': `${order.address?.street}, ${order.address?.city} (${order.address?.zipCode})`,
            'Status': order.status,
            'Billing': order.billingStatus,
            'Total Price (₹)': order.totalPrice,
            'Weight (kg)': order.weight,
            'Order Type': order.orderType,
            'Pickup Date': new Date(order.pickupDate).toLocaleString(),
            'Assigned Staff': order.assignedStaff?.name || 'Unassigned',
            'Created At': new Date(order.createdAt).toLocaleString()
        }));

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, 'Orders');

        const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=LMS_Order_Report.xlsx');
        res.send(buffer);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getDashboardStats, exportData };
