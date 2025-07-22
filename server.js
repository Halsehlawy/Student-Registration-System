require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const methodOverride = require('method-override');
const session = require('express-session')
const path = require('path');
const MongoStore = require('connect-mongo');
const mongoose = require('mongoose');


//SERVER
const port = process.env.PORT ? process.env.PORT : '3000'
const app = express();

//MIDDLEWARE
app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({ extended: true }));

//ROUTES
app.get('/', (req, res) => {
  res.render('index.ejs')
});

app.listen(port,()=>{
    console.log(`Server running on port ${port}`)
})