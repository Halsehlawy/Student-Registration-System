const express = require('express');
const router = express.Router();
const Class = require('../models/class');
const Student = require('../models/student');
const Instructor = require('../models/instructor');

const { isAuthenticated, canModify } = require('../middleware/auth');

// GET - Show all classes (everyone can view)
router.get('/', isAuthenticated, async (req, res) => {
    try {
        const classes = await Class.find({})
            .populate('instructor', 'name')
            .populate('students', 'name')
            .sort({ id: 1 });
        res.render('management/classes/index.ejs', { 
            classes,
            userRole: req.session.user.role
        });
    } catch (error) {
        console.error(error);
        res.render('management/classes/index.ejs', { 
            classes: [],
            userRole: req.session.user.role
        });
    }
});

// GET - Show new class form (ADMIN ONLY)
router.get('/new', isAuthenticated, canModify, async (req, res) => {
    try {
        const instructors = await Instructor.find({}).sort({ name: 1 });
        res.render('management/classes/new.ejs', { instructors });
    } catch (error) {
        console.error(error);
        res.redirect('/classes');
    }
});

// POST - Create new class (ADMIN ONLY)
router.post('/', isAuthenticated, canModify, async (req, res) => {
    try {
        const classData = new Class(req.body);
        await classData.save();
        res.redirect('/classes');
    } catch (error) {
        console.error(error);
        res.redirect('/classes/new');
    }
});

// GET - Show class details (everyone can view)
router.get('/:id', isAuthenticated, async (req, res) => {
    try {
        const classItem = await Class.findById(req.params.id)
            .populate('instructor', 'name')
            .populate('students', 'name id image');
        if (!classItem) {
            return res.redirect('/classes');
        }
        res.render('management/classes/show.ejs', { 
            classItem,
            userRole: req.session.user.role
        });
    } catch (error) {
        console.error(error);
        res.redirect('/classes');
    }
});

// GET - Show edit form (ADMIN ONLY)
router.get('/:id/edit', isAuthenticated, canModify, async (req, res) => {
    try {
        const classItem = await Class.findById(req.params.id)
            .populate('instructor')
            .populate('students');
        const instructors = await Instructor.find({}).sort({ name: 1 });
        const students = await Student.find({}).sort({ name: 1 });
        
        if (!classItem) {
            return res.redirect('/classes');
        }
        res.render('management/classes/edit.ejs', { 
            classItem, 
            instructors, 
            students 
        });
    } catch (error) {
        console.error(error);
        res.redirect('/classes');
    }
});

// PUT - Update class (ADMIN ONLY)
router.put('/:id', isAuthenticated, canModify, async (req, res) => {
    try {
        await Class.findByIdAndUpdate(req.params.id, req.body);
        res.redirect(`/classes/${req.params.id}`);
    } catch (error) {
        console.error(error);
        res.redirect(`/classes/${req.params.id}/edit`);
    }
});

// DELETE - Delete class (ADMIN ONLY)
router.delete('/:id', isAuthenticated, canModify, async (req, res) => {
    try {
        await Class.findByIdAndDelete(req.params.id);
        res.redirect('/classes');
    } catch (error) {
        console.error(error);
        res.redirect('/classes');
    }
});

module.exports = router;