const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const router = express.Router();

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

        // Set session user - FIX: Make consistent with login
        req.session.user = {
            id: newUser._id,        // Use 'id' consistently
            username: newUser.username,
            role: newUser.role      // Add role to session
        };

        req.session.save(() => {
            res.redirect('/');
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error registering user');
    }
});

// GET - Show login form
router.get('/login', (req, res) => {
    if (req.session.user) {
        return res.redirect('/');
    }
    res.render('auth/login.ejs', { error: null });
});

// POST - Process login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        console.log('Login attempt:', username); // Debug log
        
        const user = await User.findOne({ username });
        
        if (!user) {
            console.log('User not found:', username); // Debug log
            return res.render('auth/login.ejs', { 
                error: 'Invalid username or password' 
            });
        }
        
        console.log('User found, checking password...'); // Debug log
        
        // Use bcrypt.compare directly instead of user.comparePassword
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
            console.log('Password mismatch'); // Debug log
            return res.render('auth/login.ejs', { 
                error: 'Invalid username or password' 
            });
        }
        
        console.log('Login successful for:', username); // Debug log
        
        // Store user in session
        req.session.user = {
            id: user._id,
            username: user.username,
            role: user.role
        };
        
        res.redirect('/');
    } catch (error) {
        console.error('Login error:', error);
        res.render('auth/login.ejs', { 
            error: 'An error occurred during login' 
        });
    }
});

// GET - Logout (for direct navigation)
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
        }
        res.redirect('/auth/login');
    });
});

// POST - Logout (for form submission)
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
        }
        res.redirect('/auth/login');
    });
});

module.exports = router;

