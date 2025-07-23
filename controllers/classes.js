const express = require('express');
const router = express.Router();
const Class = require('../models/class');
const Student = require('../models/student');
const Instructor = require('../models/instructor');

// Middleware to check if user is logged in
const isAuthenticated = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/auth/login');
    }
    next();
};

// GET - Show all classes
router.get('/', isAuthenticated, async (req, res) => {
    try {
        const classes = await Class.find({})
            .populate('instructor', 'name')
            .populate('students', 'name')
            .sort({ createdAt: -1 });
        res.render('management/classes/index.ejs', { classes });
    } catch (error) {
        console.error(error);
        res.render('management/classes/index.ejs', { classes: [] });
    }
});

// GET - Show new class form
router.get('/new', isAuthenticated, async (req, res) => {
    try {
        const instructors = await Instructor.find({}).sort({ name: 1 });
        const students = await Student.find({}).sort({ name: 1 });
        res.render('management/classes/new.ejs', { instructors, students });
    } catch (error) {
        console.error(error);
        res.render('management/classes/new.ejs', { instructors: [], students: [] });
    }
});

// GET - Show specific class details
router.get('/:id', isAuthenticated, async (req, res) => {
    try {
        const classItem = await Class.findById(req.params.id)
            .populate('instructor', 'name')  // Only populate name field
            .populate('students', 'name id'); // Only populate name and id fields
        
        if (!classItem) {
            return res.redirect('/classes');
        }
        res.render('management/classes/show.ejs', { classItem: classItem });
    } catch (error) {
        console.error(error);
        res.redirect('/classes');
    }
});

// POST - Create new class
router.post('/', isAuthenticated, async (req, res) => {
    try {
        const { id, name, subject, schedule, instructor, students, room, capacity, description } = req.body;
        
        // Handle students array (it might be a single value or array)
        let studentIds = [];
        if (students) {
            studentIds = Array.isArray(students) ? students : [students];
            // Filter out empty values
            studentIds = studentIds.filter(id => id && id.trim() !== '');
        }

        await Class.create({
            id: parseInt(id),
            name,
            subject,
            schedule,
            instructor,
            students: studentIds,
            room,
            capacity: parseInt(capacity),
            description
        });
        res.redirect('/classes');
    } catch (error) {
        console.error(error);
        res.redirect('/classes');
    }
});

// GET - Show edit form for specific class
router.get('/:id/edit', isAuthenticated, async (req, res) => {
    try {
        const classItem = await Class.findById(req.params.id).populate('students');
        const instructors = await Instructor.find({}).sort({ name: 1 });
        const students = await Student.find({}).sort({ name: 1 });
        res.render('management/classes/edit.ejs', { 
            classItem: classItem, 
            instructors, 
            students 
        });
    } catch (error) {
        console.error(error);
        res.redirect('/classes');
    }
});

// PUT - Update specific class
router.put('/:id', isAuthenticated, async (req, res) => {
    try {
        const { id, name, subject, schedule, instructor, students, room, capacity, description } = req.body;
        
        // Handle students array
        let studentIds = [];
        if (students) {
            studentIds = Array.isArray(students) ? students : [students];
            studentIds = studentIds.filter(id => id && id.trim() !== '');
        }

        await Class.findByIdAndUpdate(req.params.id, {
            id: parseInt(id),
            name,
            subject,
            schedule,
            instructor,
            students: studentIds,
            room,
            capacity: parseInt(capacity),
            description
        });
        res.redirect('/classes');
    } catch (error) {
        console.error(error);
        res.redirect('/classes');
    }
});

// DELETE - Delete specific class
router.delete('/:id', isAuthenticated, async (req, res) => {
    try {
        await Class.findByIdAndDelete(req.params.id);
        res.redirect('/classes');
    } catch (error) {
        console.error(error);
        res.redirect('/classes');
    }
});

module.exports = router;