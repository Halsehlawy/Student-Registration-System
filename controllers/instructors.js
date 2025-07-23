const express = require('express');
const router = express.Router();
const Instructor = require('../models/instructor');

// Middleware to check if user is logged in
const isAuthenticated = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/auth/login');
    }
    next();
};

// GET - Show all instructors
router.get('/', isAuthenticated, async (req, res) => {
    try {
        const instructors = await Instructor.find({}).sort({ createdAt: -1 });
        res.render('management/instructors/index.ejs', { instructors });
    } catch (error) {
        console.error(error);
        res.render('management/instructors/index.ejs', { instructors: [] });
    }
});

// GET - Show new instructor form
router.get('/new', isAuthenticated, (req, res) => {
    res.render('management/instructors/new.ejs');
});

// GET - Show specific instructor details
router.get('/:id', isAuthenticated, async (req, res) => {
    try {
        const instructor = await Instructor.findById(req.params.id);
        if (!instructor) {
            return res.redirect('/instructors');
        }
        res.render('management/instructors/show.ejs', { instructor });
    } catch (error) {
        console.error(error);
        res.redirect('/instructors');
    }
});

// POST - Create new instructor
router.post('/', isAuthenticated, async (req, res) => {
    try {
        const { id, name, image, contact, address } = req.body;
        await Instructor.create({
            id: parseInt(id),
            name,
            image,
            contact,
            address
        });
        res.redirect('/instructors');
    } catch (error) {
        console.error(error);
        res.redirect('/instructors');
    }
});

// GET - Show edit form for specific instructor
router.get('/:id/edit', isAuthenticated, async (req, res) => {
    try {
        const instructor = await Instructor.findById(req.params.id);
        res.render('management/instructors/edit.ejs', { instructor });
    } catch (error) {
        console.error(error);
        res.redirect('/instructors');
    }
});

// PUT - Update specific instructor
router.put('/:id', isAuthenticated, async (req, res) => {
    try {
        const { id, name, image, contact, address } = req.body;
        await Instructor.findByIdAndUpdate(req.params.id, {
            id: parseInt(id),
            name,
            image,
            contact,
            address
        });
        res.redirect('/instructors');
    } catch (error) {
        console.error(error);
        res.redirect('/instructors');
    }
});

// DELETE - Delete specific instructor
router.delete('/:id', isAuthenticated, async (req, res) => {
    try {
        await Instructor.findByIdAndDelete(req.params.id);
        res.redirect('/instructors');
    } catch (error) {
        console.error(error);
        res.redirect('/instructors');
    }
});

module.exports = router;