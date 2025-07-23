require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const methodOverride = require('method-override');
const session = require('express-session')
const path = require('path');
const MongoStore = require('connect-mongo');
const mongoose = require('mongoose');

const authController = require('./controllers/auth');
//SERVER
const port = process.env.PORT ? process.env.PORT : '3000'
const app = express();

//DATABASE
mongoose.connect(process.env.MONGODB_URI)
mongoose.connection.on('connected', () => {
    console.log(`Connected to MongoDB ${mongoose.connection.name}`);
});

// MIDDLEWARE
app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
//SESSION
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 14 // 14 days
    }
}));
//ROUTES
app.use('/auth', authController)
app.get('/', (req, res) => {
  res.render('index.ejs')
});


app.listen(port,()=>{
    console.log(`Server running on port ${port}`)
})