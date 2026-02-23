const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [{
        service: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Service',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            default: 1
        },
        itemName: String // e.g., "Shirt", "Pant"
    }],
    totalPrice: {
        type: Number,
        default: 0
    },
    orderType: {
        type: String,
        enum: ['Standard', 'Bulk-Weighted'],
        default: 'Standard'
    },
    billingStatus: {
        type: String,
        enum: ['Pending', 'Billed'],
        default: 'Billed'
    },
    weight: {
        type: Number, // Only for Bulk-Weighted
        default: 0
    },
    isBulk: {
        type: Boolean,
        default: false
    },
    discountAmount: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['Pending', 'Confirmed', 'Processing', 'Ready for Pickup', 'Delivered', 'Cancelled'],
        default: 'Pending'
    },
    pickupDate: {
        type: Date,
        required: true
    },
    deliveryDate: {
        type: Date
    },
    address: {
        street: String,
        city: String,
        zipCode: String
    },
    customerName: {
        type: String,
        required: true
    },
    mobileNumber: {
        type: String,
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['Unpaid', 'Paid'],
        default: 'Unpaid'
    },
    assignedStaff: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    orderId: {
        type: String,
        unique: true
    },
    inspectionPhotos: [String],
    inspectionNotes: String
}, { timestamps: true });

// Generate a readable sequential Order ID before saving
orderSchema.pre('save', async function () {
    if (!this.orderId) {
        const lastOrder = await mongoose.model('Order').findOne({}, {}, { sort: { 'createdAt': -1 } });
        let newCount = 1;

        if (lastOrder && lastOrder.orderId && lastOrder.orderId.startsWith('MSL-')) {
            const lastIdParts = lastOrder.orderId.split('-');
            const lastNum = parseInt(lastIdParts[1]);
            if (!isNaN(lastNum)) {
                newCount = lastNum + 1;
            }
        }

        // Pad with zeros to keep length consistent (e.g., MSL-001)
        const paddedNum = newCount.toString().padStart(3, '0');
        this.orderId = `MSL-${paddedNum}`;
    }
});

module.exports = mongoose.model('Order', orderSchema);
