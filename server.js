require('dotenv').config();
const express = require('express');
const morgan = require('morgan');

//SERVER
const port = process.env.PORT ? process.env.PORT : '3000'
const app = express();

//MIDDLEWARE
app.use(morgan('dev'));

//ROUTES
app.get('/', (req, res) => {
  res.render('index.ejs')
});

app.listen(port,()=>{
    console.log(`Server running on port ${port}`)
})