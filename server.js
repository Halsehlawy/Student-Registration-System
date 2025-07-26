require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const methodOverride = require('method-override');
const session = require('express-session');
const path = require('path');
const MongoStore = require('connect-mongo');
const mongoose = require('mongoose');

try {
    const authController = require('./controllers/auth');
    
    //SERVER
    const port = process.env.PORT || 3000;
    const app = express();

    // Debug environment variables
    console.log('Environment check:');
    console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);
    console.log('SESSION_SECRET exists:', !!process.env.SESSION_SECRET);
    console.log('PORT:', port);

    //DATABASE
    mongoose.connect(process.env.MONGODB_URI)
    mongoose.connection.on('connected', () => {
        console.log(`Connected to MongoDB ${mongoose.connection.name}`);
    });
    
    mongoose.connection.on('error', (err) => {
        console.error('MongoDB connection error:', err);
    });

    // VIEW ENGINE
    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, 'views'));

    // MIDDLEWARE
    app.use(morgan('dev'));
    app.use(express.static(path.join(__dirname, 'public')))
    app.use(express.urlencoded({ extended: true }));
    app.use(methodOverride('_method'));

    //SESSION - Only create MongoStore if MONGODB_URI exists
    const sessionConfig = {
        secret: process.env.SESSION_SECRET || 'fallback-secret',
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 1000 * 60 * 60 * 24 * 14 // 14 days
        }
    };

    if (process.env.MONGODB_URI) {
        sessionConfig.store = MongoStore.create({ 
            mongoUrl: process.env.MONGODB_URI
        });
    }

    app.use(session(sessionConfig));

    // MIDDLEWARE
    app.use((req, res, next) => {
        res.locals.user = req.session.user;
        next();
    });

    //ROUTES
    app.use('/auth', authController);
    app.use('/students', require('./controllers/students'));
    app.use('/instructors', require('./controllers/instructors'));
    app.use('/classes', require('./controllers/classes'));
    app.use('/attendance', require('./controllers/attendance'));

    app.get('/', (req, res) => {
        res.render('index.ejs')
    });

    // 404 Handler - Must be after all other routes
    app.use('*', (req, res) => {
        res.status(404).render('errors/404.ejs');
    });

    // Error Handler
    app.use((err, req, res, next) => {
        console.error(err.stack);
        res.status(500).render('errors/500.ejs');
    });

    app.listen(port, () => {
        console.log(`✅ Server running on port ${port}`)
    });

} catch (error) {
    console.error('❌ Server startup error:', error);
    process.exit(1);
}