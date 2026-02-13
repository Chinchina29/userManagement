
const userRoutes = require('./routes/userRoute.js');
const adminRoute = require('./routes/adminRoute.js');
const express = require("express");
const app = express();
const dotenv=require('dotenv');
const connectDB=require('./config/db.js')
app.set('views ', './views');
const session = require('express-session');
const path = require('path');
const expresslayout = require('express-ejs-layouts');
const nocache = require('nocache');

dotenv.config()
connectDB();


app.use('/admin', nocache());

const userSession = session({
  name: 'user.ash',
  secret: 'user-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: false 
  }
});

const adminSession = session({
  name: 'admin.ash',
  secret: 'admin-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 2 * 60 * 60 * 1000,
    httpOnly: true,
    secure: false
  }
});

app.use(expresslayout);



app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }))


app.use('/', userSession, userRoutes);


app.use('/admin', adminSession, adminRoute);

const PORT=process.env.PORT;


app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});


