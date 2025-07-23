const express = require('express');
const router = express.Router();
const Student = require('../models/student');

// Middleware to check if user is logged in
const isAuthenticated = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/auth/login');
    }
    next();
};

// GET - Show all students
router.get('/', isAuthenticated, async (req, res) => {
    try {
        const students = await Student.find({}).sort({ createdAt: -1 });
        res.render('management/students/index.ejs', { students });
    } catch (error) {
        console.error(error);
        res.render('management/students/index.ejs', { students: [] });
    }
});

// GET - Show new student form
router.get('/new', isAuthenticated, (req, res) => {
    res.render('management/students/new.ejs');
});

// GET - Show specific student details
router.get('/:id', isAuthenticated, async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.redirect('/students');
        }
        res.render('management/students/show.ejs', { student });
    } catch (error) {
        console.error(error);
        res.redirect('/students');
    }
});

// POST - Create new student
router.post('/', isAuthenticated, async (req, res) => {
    try {
        const { id, name, image, parent_contact, address } = req.body;
        await Student.create({
            id: parseInt(id),
            name,
            image,
            parent_contact,
            address
        });
        res.redirect('/students');
    } catch (error) {
        console.error(error);
        res.redirect('/students');
    }
});

// GET - Show edit form for specific student
router.get('/:id/edit', isAuthenticated, async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        res.render('management/students/edit.ejs', { student });
    } catch (error) {
        console.error(error);
        res.redirect('/students');
    }
});

// PUT - Update specific student
router.put('/:id', isAuthenticated, async (req, res) => {
    try {
        const { id, name, image, parent_contact, address } = req.body;
        await Student.findByIdAndUpdate(req.params.id, {
            id: parseInt(id),
            name,
            image,
            parent_contact,
            address
        });
        res.redirect('/students');
    } catch (error) {
        console.error(error);
        res.redirect('/students');
    }
});

// DELETE - Delete specific student
router.delete('/:id', isAuthenticated, async (req, res) => {
    try {
        await Student.findByIdAndDelete(req.params.id);
        res.redirect('/students');
    } catch (error) {
        console.error(error);
        res.redirect('/students');
    }
});

module.exports = router;