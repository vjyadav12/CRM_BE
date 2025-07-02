const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');

// Get all users (accessible by admin and managers)
router.get('/', auth, authorize('admin', 'manager'), async (req, res) => {
    try {
        const users = await User.find({}, '-password')
            .sort({ name: 1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get managers (for project assignment)
router.get('/managers', auth, async (req, res) => {
    try {
        const managers = await User.find(
            { role: { $in: ['manager', 'admin'] } },
            '-password'
        ).sort({ name: 1 });
        res.json(managers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get employees (for team member assignment)
router.get('/employees', auth, async (req, res) => {
    try {
        const employees = await User.find(
            { role: 'employee' },
            '-password'
        ).sort({ name: 1 });
        res.json(employees);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 