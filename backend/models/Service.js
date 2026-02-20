const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String
    },
    pricePerUnit: {
        type: Number,
        required: true
    },
    unit: {
        type: String,
        enum: ['kg', 'piece'],
        default: 'piece'
    },
    category: {
        type: String,
        enum: ['Wash & Fold', 'Ironing', 'Dry Clean', 'Premium Wash'],
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);
