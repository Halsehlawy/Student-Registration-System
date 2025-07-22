const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/user.js');

// Register view
router.get('/register', (req, res) => {
    res.render('auth/register.ejs');
});

// Register user to DB and create session
router.post('/register', async (req, res) => {
    try {
        const { username, password, confirmPassword, role } = req.body;
        // Check if username already exists
        const userInDatabase = await User.findOne({ username });
        if (userInDatabase) {
            return res.send('Username already taken.');
        }
        // Check that password and confirmPassword are the same
        if (password !== confirmPassword) {
            return res.send('Password and confirm password must match.');
        }
        // Password complexity: at least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
        const complexityRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
        if (!complexityRegex.test(password)) {
            return res.send(
                'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.'
            );
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = await User.create({
            username,
            password: hashedPassword,
            role
        });

        // Set session user
        req.session.user = {
            username: newUser.username,
            _id: newUser._id,
        };

        req.session.save(() => {
            res.redirect('/');
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error registering user');
    }
});

// Login view
router.get('/login', (req, res) => {
    res.render('auth/login.ejs');
});

// POST TO SIGN THE USER IN (CREATE SESSION)
router.post('/log-in', async (req, res) => {
    try {
        const { username, password } = req.body;
        const userInDatabase = await User.findOne({ username });
        if (!userInDatabase) {
            return res.send('Login failed. Please try again.');
        }
        const validPassword = await bcrypt.compare(password, userInDatabase.password);
        if (!validPassword) {
            return res.send('Login failed. Please try again.');
        }
        req.session.user = {
            username: userInDatabase.username,
            _id: userInDatabase._id,
        };
        req.session.save(() => {
            res.redirect('/');
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error logging in');
    }
});


// SIGN OUT VIEW
router.get('/log-out', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/')
    })
})

module.exports = router;

