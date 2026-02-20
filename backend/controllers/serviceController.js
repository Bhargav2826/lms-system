const Service = require('../models/Service');

const getServices = async (req, res) => {
    try {
        const services = await Service.find({ isActive: true });
        res.json(services);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createService = async (req, res) => {
    try {
        console.log('Creating Service with body:', req.body);
        const { name, description, pricePerUnit, unit, category } = req.body;
        const service = await Service.create({
            name,
            description,
            pricePerUnit,
            unit,
            category
        });
        res.status(201).json(service);
    } catch (error) {
        console.error('Service Creation Error:', error);
        res.status(400).json({ message: error.message });
    }
};

const updateService = async (req, res) => {
    try {
        const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!service) return res.status(404).json({ message: 'Service not found' });
        res.json(service);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteService = async (req, res) => {
    try {
        const service = await Service.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
        if (!service) return res.status(404).json({ message: 'Service not found' });
        res.json({ message: 'Service deactivated successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = { getServices, createService, updateService, deleteService };
