const express = require('express');
const router = express.Router();

// Middleware to check if user is logged in
const isAuthenticated = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/auth/login');
    }
    next();
};

// GET - Show all classes
router.get('/', isAuthenticated, (req, res) => {
    res.render('management/classes.ejs');
});

// POST - Create new class
router.post('/', isAuthenticated, (req, res) => {
    // TODO: Add class creation logic
    res.redirect('/classes');
});

// GET - Show edit form for specific class
router.get('/:id/edit', isAuthenticated, (req, res) => {
    // TODO: Get class by ID and show edit form
    res.render('management/edit-class.ejs');
});

// PUT - Update specific class
router.put('/:id', isAuthenticated, (req, res) => {
    // TODO: Update class logic
    res.redirect('/classes');
});

// DELETE - Delete specific class
router.delete('/:id', isAuthenticated, (req, res) => {
    // TODO: Delete class logic
    res.redirect('/classes');
});

module.exports = router;