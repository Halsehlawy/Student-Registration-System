const express = require('express');
const router = express.Router();
const Instructor = require('../models/instructor');
const Class = require('../models/class'); // Assuming Class model is in models/class.js
const { isAuthenticated, canModify } = require('../middleware/auth');

// GET - Show all instructors (everyone can view)
router.get('/', isAuthenticated, async (req, res) => {
    try {
        const instructors = await Instructor.find({})
            .populate('user', 'username role')
            .sort({ id: 1 });
        res.render('management/instructors/index.ejs', { 
            instructors,
            userRole: req.session.user.role
        });
    } catch (error) {
        console.error(error);
        res.render('management/instructors/index.ejs', { 
            instructors: [],
            userRole: req.session.user.role
        });
    }
});

// GET - Show new instructor form (ADMIN ONLY)
router.get('/new', isAuthenticated, canModify, (req, res) => {
    res.render('management/instructors/new.ejs');
});

// POST - Create new instructor (ADMIN ONLY)
router.post('/', isAuthenticated, canModify, async (req, res) => {
    try {
        const instructor = new Instructor(req.body);
        await instructor.save();
        res.redirect('/instructors');
    } catch (error) {
        console.error(error);
        res.redirect('/instructors/new');
    }
});

// GET - Show instructor details (everyone can view)
router.get('/:id', isAuthenticated, async (req, res) => {
    try {
        const instructor = await Instructor.findById(req.params.id)
            .populate('user', 'username role');
        
        if (!instructor) {
            return res.redirect('/instructors');
        }
        
        // Get classes taught by this instructor
        const teachingClasses = await Class.find({ instructor: instructor._id })
            .populate('students', 'name')
            .sort({ name: 1 });
        
        res.render('management/instructors/show.ejs', { 
            instructor,
            teachingClasses,
            userRole: req.session.user.role
        });
    } catch (error) {
        console.error(error);
        res.redirect('/instructors');
    }
});

// GET - Show edit form (ADMIN ONLY)
router.get('/:id/edit', isAuthenticated, canModify, async (req, res) => {
    try {
        const instructor = await Instructor.findById(req.params.id);
        if (!instructor) {
            return res.redirect('/instructors');
        }
        res.render('management/instructors/edit.ejs', { instructor });
    } catch (error) {
        console.error(error);
        res.redirect('/instructors');
    }
});

// PUT - Update instructor (ADMIN ONLY)
router.put('/:id', isAuthenticated, canModify, async (req, res) => {
    try {
        await Instructor.findByIdAndUpdate(req.params.id, req.body);
        res.redirect(`/instructors/${req.params.id}`);
    } catch (error) {
        console.error(error);
        res.redirect(`/instructors/${req.params.id}/edit`);
    }
});

// DELETE - Delete instructor (ADMIN ONLY)
router.delete('/:id', isAuthenticated, canModify, async (req, res) => {
    try {
        await Instructor.findByIdAndDelete(req.params.id);
        res.redirect('/instructors');
    } catch (error) {
        console.error(error);
        res.redirect('/instructors');
    }
});

module.exports = router;