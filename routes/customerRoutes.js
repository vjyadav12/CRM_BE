const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
const { auth, authorize } = require('../middleware/auth');

// Get all customers
router.get('/', auth, async (req, res) => {
    try {
        const customers = await Customer.find()
            .populate('assignedTo', 'name email')
            .sort({ createdAt: -1 });
        res.json(customers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get single customer
router.get('/:id', auth, async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id)
            .populate('assignedTo', 'name email');
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }
        res.json(customer);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create new customer
router.post('/', auth, authorize('admin', 'manager'), async (req, res) => {
    try {
        const customer = new Customer({
            ...req.body,
            assignedTo: req.body.assignedTo || req.user._id
        });
        await customer.save();
        res.status(201).json(customer);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update customer
router.patch('/:id', auth, authorize('admin', 'manager'), async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        Object.keys(req.body).forEach(update => {
            customer[update] = req.body[update];
        });

        await customer.save();
        res.json(customer);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete customer
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
    try {
        const customer = await Customer.findByIdAndDelete(req.params.id);
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }
        res.json({ message: 'Customer deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 