const express = require('express');
const router = express.Router();
const Attendance = require('../models/attendance');
const Class = require('../models/class');
const Student = require('../models/student');
const User = require('../models/user');

// Middleware to check if user is logged in
const isAuthenticated = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/auth/login');
    }
    next();
};

// Middleware to check if user can access a specific class
const canAccessClass = async (req, res, next) => {
    try {
        const classId = req.params.classId;
        const user = req.session.user;
        
        // Admin can access all classes
        if (user.role === 'admin') {
            return next();
        }
        
        // Instructors can only access their own classes
        if (user.role === 'instructor') {
            // Get the user's linked instructor
            const currentUser = await User.findById(user.id).populate('linkedInstructor');
            
            if (!currentUser.linkedInstructor) {
                return res.status(403).render('error', { 
                    message: 'Access denied: No instructor profile linked to your account' 
                });
            }
            
            // Check if this class belongs to the instructor
            const classItem = await Class.findById(classId);
            if (!classItem || classItem.instructor.toString() !== currentUser.linkedInstructor._id.toString()) {
                return res.status(403).render('error', { 
                    message: 'Access denied: You can only manage attendance for your own classes' 
                });
            }
        }
        
        next();
    } catch (error) {
        console.error(error);
        res.status(500).render('error', { message: 'Server error' });
    }
};

// GET - Show attendance dashboard (filtered by user role)
router.get('/', isAuthenticated, async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        let classFilter = {};
        
        // If user is an instructor, only show their classes
        if (req.session.user.role === 'instructor') {
            const currentUser = await User.findById(req.session.user.id).populate('linkedInstructor');
            
            if (!currentUser.linkedInstructor) {
                return res.render('management/attendance/index.ejs', { 
                    classes: [], 
                    todayAttendance: [],
                    today: today.toISOString().split('T')[0],
                    message: 'No instructor profile linked to your account'
                });
            }
            
            classFilter.instructor = currentUser.linkedInstructor._id;
        }
        
        const classes = await Class.find(classFilter)
            .populate('instructor', 'name')
            .populate('students', 'name')
            .sort({ name: 1 });
            
        // Get today's attendance records for accessible classes
        const classIds = classes.map(c => c._id);
        const todayAttendance = await Attendance.find({ 
            date: today,
            class: { $in: classIds }
        })
            .populate('class', 'name')
            .populate('records.student', 'name');
            
        res.render('management/attendance/index.ejs', { 
            classes, 
            todayAttendance,
            today: today.toISOString().split('T')[0],
            userRole: req.session.user.role
        });
    } catch (error) {
        console.error(error);
        res.render('management/attendance/index.ejs', { 
            classes: [], 
            todayAttendance: [],
            today: new Date().toISOString().split('T')[0],
            userRole: req.session.user.role
        });
    }
});

// GET - Take attendance for a specific class (with access control)
router.get('/take/:classId', isAuthenticated, canAccessClass, async (req, res) => {
    try {
        const date = req.query.date || new Date().toISOString().split('T')[0];
        const selectedDate = new Date(date);
        selectedDate.setHours(0, 0, 0, 0);
        
        const classItem = await Class.findById(req.params.classId)
            .populate('instructor', 'name')
            .populate('students', 'name id image');
            
        if (!classItem) {
            return res.redirect('/attendance');
        }
        
        // Check if attendance already exists for this date
        let attendance = await Attendance.findOne({ 
            class: req.params.classId, 
            date: selectedDate 
        }).populate('records.student', 'name id image');
        
        // If no attendance record exists, create template with all students marked absent
        if (!attendance) {
            const records = classItem.students.map(student => ({
                student: student._id,
                status: 'absent',
                notes: ''
            }));
            
            attendance = {
                class: classItem._id,
                date: selectedDate,
                records: records.map(record => ({
                    ...record,
                    student: classItem.students.find(s => s._id.toString() === record.student.toString())
                }))
            };
        }
        
        res.render('management/attendance/take.ejs', { 
            classItem, 
            attendance, 
            date: date,
            isExisting: !!attendance._id,
            userRole: req.session.user.role
        });
    } catch (error) {
        console.error(error);
        res.redirect('/attendance');
    }
});

// POST - Save attendance (with access control)
router.post('/save/:classId', isAuthenticated, canAccessClass, async (req, res) => {
    try {
        const { date, records } = req.body;
        const selectedDate = new Date(date);
        selectedDate.setHours(0, 0, 0, 0);
        
        // Parse records from form data
        const attendanceRecords = [];
        if (records) {
            Object.keys(records).forEach(studentId => {
                attendanceRecords.push({
                    student: studentId,
                    status: records[studentId].status || 'absent',
                    notes: records[studentId].notes || ''
                });
            });
        }
        
        // Update or create attendance record
        await Attendance.findOneAndUpdate(
            { class: req.params.classId, date: selectedDate },
            { 
                class: req.params.classId,
                date: selectedDate,
                records: attendanceRecords 
            },
            { upsert: true, new: true }
        );
        
        res.redirect(`/attendance/take/${req.params.classId}?date=${date}`);
    } catch (error) {
        console.error(error);
        res.redirect('/attendance');
    }
});

// GET - View attendance history for a class (with access control)
router.get('/history/:classId', isAuthenticated, canAccessClass, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const skip = (page - 1) * limit;
        
        const classItem = await Class.findById(req.params.classId)
            .populate('instructor', 'name')
            .populate('students', 'name');
            
        if (!classItem) {
            return res.redirect('/attendance');
        }
        
        const totalRecords = await Attendance.countDocuments({ class: req.params.classId });
        const attendanceHistory = await Attendance.find({ class: req.params.classId })
            .populate('records.student', 'name')
            .sort({ date: -1 })
            .skip(skip)
            .limit(limit);
            
        const totalPages = Math.ceil(totalRecords / limit);
        
        res.render('management/attendance/history.ejs', { 
            classItem, 
            attendanceHistory,
            currentPage: page,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
            userRole: req.session.user.role
        });
    } catch (error) {
        console.error(error);
        res.redirect('/attendance');
    }
});

// GET - Attendance statistics
router.get('/stats/:classId', isAuthenticated, async (req, res) => {
    try {
        const classItem = await Class.findById(req.params.classId)
            .populate('instructor', 'name')
            .populate('students', 'name id image'); // Make sure to include 'image'
            
        if (!classItem) {
            return res.redirect('/attendance');
        }
        
        // Get all attendance records for this class
        const attendanceRecords = await Attendance.find({ class: req.params.classId })
            .populate('records.student', 'name id image') // Make sure to include 'image' here too
            .sort({ date: -1 });
            
        // Calculate statistics
        const stats = classItem.students.map(student => {
            const studentRecords = attendanceRecords.flatMap(record => 
                record.records.filter(r => r.student && r.student._id.toString() === student._id.toString())
            );
            
            const total = studentRecords.length;
            const present = studentRecords.filter(r => r.status === 'present').length;
            const late = studentRecords.filter(r => r.status === 'late').length;
            const excused = studentRecords.filter(r => r.status === 'excused').length;
            const absent = studentRecords.filter(r => r.status === 'absent').length;
            
            return {
                student,
                total,
                present,
                late,
                excused,
                absent,
                attendanceRate: total > 0 ? ((present + late) / total * 100).toFixed(1) : '0'
            };
        });
        
        res.render('management/attendance/stats.ejs', { 
            classItem, 
            stats,
            totalDays: attendanceRecords.length
        });
    } catch (error) {
        console.error(error);
        res.redirect('/attendance');
    }
});

module.exports = router;