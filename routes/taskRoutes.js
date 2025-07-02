const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const { auth, authorize } = require('../middleware/auth');

// Get all tasks
router.get('/', auth, async (req, res) => {
    try {
        const tasks = await Task.find()
            .populate('project', 'name')
            .populate('assignedTo', 'name email')
            .populate('comments.author', 'name')
            .sort({ createdAt: -1 });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get tasks by project
router.get('/project/:projectId', auth, async (req, res) => {
    try {
        const tasks = await Task.find({ project: req.params.projectId })
            .populate('project', 'name')
            .populate('assignedTo', 'name email')
            .populate('comments.author', 'name')
            .sort({ createdAt: -1 });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get single task
router.get('/:id', auth, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id)
            .populate('project', 'name')
            .populate('assignedTo', 'name email')
            .populate('comments.author', 'name');
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        res.json(task);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create new task
router.post('/', auth, authorize('admin', 'manager'), async (req, res) => {
    try {
        const task = new Task({
            ...req.body,
            assignedTo: req.body.assignedTo || req.user._id
        });
        await task.save();
        res.status(201).json(task);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update task
router.patch('/:id', auth, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Only admin, manager, or assigned user can update task
        if (!['admin', 'manager'].includes(req.user.role) && 
            task.assignedTo.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this task' });
        }

        Object.keys(req.body).forEach(update => {
            task[update] = req.body[update];
        });

        await task.save();
        res.json(task);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Add comment to task
router.post('/:id/comments', auth, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        // Only the assigned user can add a comment
        if (task.assignedTo.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Only the assigned user can comment on this task' });
        }
        task.comments.push({
            text: req.body.text,
            author: req.user._id
        });
        await task.save();
        res.status(201).json(task);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete task
router.delete('/:id', auth, authorize('admin', 'manager'), async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 