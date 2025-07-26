const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const router = express.Router();

// GET - Show login form
router.get('/login', (req, res) => {
    const error = req.session.error;
    req.session.error = null; // Clear error after displaying
    res.render('auth/login.ejs', { error });
});

// POST - Handle login
router.post('/login', async (req, res) => {
    try {
        // Trim whitespace from input
        const username = req.body.username?.trim();
        const password = req.body.password?.trim();
        
        // Validate input
        if (!username || !password) {
            req.session.error = 'Please provide both username and password';
            return res.redirect('/auth/login');
        }
        
        // Check if user exists
        const user = await User.findOne({ username });
        if (!user) {
            req.session.error = 'No account found with this username';
            return res.redirect('/auth/login');
        }

        // Check password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            req.session.error = 'Invalid password. Please try again.';
            return res.redirect('/auth/login');
        }

        // Successful login
        req.session.user = {
            id: user._id,
            username: user.username,
            role: user.role
        };

        req.session.success = `Welcome back, ${user.username}!`;
        res.redirect('/');
    } catch (error) {
        console.error('Login error:', error);
        req.session.error = 'Something went wrong. Please try again.';
        res.redirect('/auth/login');
    }
});

// GET - Show register form
router.get('/register', (req, res) => {
    const error = req.session.error;
    req.session.error = null;
    res.render('auth/register.ejs', { error });
});

// POST - Handle registration
router.post('/register', async (req, res) => {
    try {
        // Trim whitespace from input
        const username = req.body.username?.trim();
        const password = req.body.password?.trim();
        const role = req.body.role?.trim() || 'student';

        // Validate input
        if (!username || !password) {
            req.session.error = 'Please provide both username and password';
            return res.redirect('/auth/register');
        }

        // Validate username length
        if (username.length < 3) {
            req.session.error = 'Username must be at least 3 characters long';
            return res.redirect('/auth/register');
        }

        // Validate password length
        if (password.length < 6) {
            req.session.error = 'Password must be at least 6 characters long';
            return res.redirect('/auth/register');
        }

        // Check for spaces in username
        if (username.includes(' ')) {
            req.session.error = 'Username cannot contain spaces';
            return res.redirect('/auth/register');
        }

        // Check if username already exists (case-insensitive)
        const existingUser = await User.findOne({ 
            username: { $regex: new RegExp(`^${username}$`, 'i') }
        });
        if (existingUser) {
            req.session.error = 'Username already exists. Please choose a different one.';
            return res.redirect('/auth/register');
        }

        // Hash password and create user
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            username: username.toLowerCase(), // Store in lowercase
            password: hashedPassword,
            role: role
        });

        req.session.user = {
            id: newUser._id,
            username: newUser.username,
            role: newUser.role
        };

        req.session.success = `Account created successfully! Welcome, ${newUser.username}!`;
        res.redirect('/');
    } catch (error) {
        console.error('Registration error:', error);
        req.session.error = 'Failed to create account. Please try again.';
        res.redirect('/auth/register');
    }
});

// POST - Handle logout
router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/auth/login');
    });
});

module.exports = router;

