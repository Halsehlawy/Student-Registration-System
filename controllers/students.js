const express = require('express');
const router = express.Router();
const Student = require('../models/student');
const { isAuthenticated, canModify } = require('../middleware/auth');

// GET - Show all students (everyone can view)
router.get('/', isAuthenticated, async (req, res) => {
    try {
        const students = await Student.find({}).sort({ id: 1 });
        res.render('management/students/index.ejs', { 
            students,
            userRole: req.session.user.role
        });
    } catch (error) {
        console.error(error);
        res.render('management/students/index.ejs', { 
            students: [],
            userRole: req.session.user.role
        });
    }
});

// GET - Show new student form (ADMIN ONLY)
router.get('/new', isAuthenticated, canModify, (req, res) => {
    res.render('management/students/new.ejs');
});

// POST - Create new student (ADMIN ONLY)
router.post('/', isAuthenticated, canModify, async (req, res) => {
    try {
        const student = new Student(req.body);
        await student.save();
        res.redirect('/students');
    } catch (error) {
        console.error(error);
        res.redirect('/students/new');
    }
});

// GET - Show student details (everyone can view)
router.get('/:id', isAuthenticated, async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.redirect('/students');
        }
        res.render('management/students/show.ejs', { 
            student,
            userRole: req.session.user.role
        });
    } catch (error) {
        console.error(error);
        res.redirect('/students');
    }
});

// GET - Show edit form (ADMIN ONLY)
router.get('/:id/edit', isAuthenticated, canModify, async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.redirect('/students');
        }
        res.render('management/students/edit.ejs', { student });
    } catch (error) {
        console.error(error);
        res.redirect('/students');
    }
});

// PUT - Update student (ADMIN ONLY)
router.put('/:id', isAuthenticated, canModify, async (req, res) => {
    try {
        await Student.findByIdAndUpdate(req.params.id, req.body);
        res.redirect(`/students/${req.params.id}`);
    } catch (error) {
        console.error(error);
        res.redirect(`/students/${req.params.id}/edit`);
    }
});

// DELETE - Delete student (ADMIN ONLY)
router.delete('/:id', isAuthenticated, canModify, async (req, res) => {
    try {
        await Student.findByIdAndDelete(req.params.id);
        res.redirect('/students');
    } catch (error) {
        console.error(error);
        res.redirect('/students');
    }
});

module.exports = router;