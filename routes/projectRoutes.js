const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const { auth, authorize } = require('../middleware/auth');

// Get all projects
router.get('/', auth, async (req, res) => {
    try {
        const projects = await Project.find()
            .populate('client', 'name company')
            .populate('projectManager', 'name email')
            .populate('teamMembers', 'name email')
            .sort({ createdAt: -1 });
        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get single project
router.get('/:id', auth, async (req, res) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate('client', 'name company')
            .populate('projectManager', 'name email')
            .populate('teamMembers', 'name email');
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        res.json(project);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create new project
router.post('/', auth, authorize('admin', 'manager'), async (req, res) => {
    try {
        const project = new Project({
            ...req.body,
            projectManager: req.body.projectManager || req.user._id
        });
        await project.save();
        res.status(201).json(project);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update project
router.patch('/:id', auth, authorize('admin', 'manager'), async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        Object.keys(req.body).forEach(update => {
            project[update] = req.body[update];
        });

        await project.save();
        res.json(project);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete project
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
    try {
        const project = await Project.findByIdAndDelete(req.params.id);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        res.json({ message: 'Project deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 