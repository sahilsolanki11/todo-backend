// routes/todoRoutes.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Todo = require('../models/Todo');

// Middleware to check token
const auth = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.id;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

// Get all todos for logged-in user
router.get('/', auth, async (req, res) => {
    try {
        const todos = await Todo.find({ userId: req.user });
        res.json(todos);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add new todo
router.post('/', auth, async (req, res) => {
    try {
        const { task } = req.body;
        const newTodo = await Todo.create({ userId: req.user, task });
        res.status(201).json(newTodo);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update todo (only user's own todo)
router.put('/:id', auth, async (req, res) => {
    try {
        const { task, completed } = req.body;
        const updatedTodo = await Todo.findOneAndUpdate(
            { _id: req.params.id, userId: req.user },
            { task, completed },
            { new: true }
        );
        if (!updatedTodo) return res.status(404).json({ message: 'Todo not found' });
        res.json(updatedTodo);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Delete todo (only user's own todo)
router.delete('/:id', auth, async (req, res) => {
    try {
        const deletedTodo = await Todo.findOneAndDelete({ _id: req.params.id, userId: req.user });
        if (!deletedTodo) return res.status(404).json({ message: 'Todo not found' });
        res.json({ message: 'Todo deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
