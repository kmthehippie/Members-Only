const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require("express-session")
const passport = require("passport")
const mongoose = require("mongoose")
const MongoStore = require("connect-mongo")
const configurePassport = require("./passport-config")
require("dotenv").config()

//Set up Mongoose
mongoose.set("strictQuery", false)
const mongoDbUri = process.env.MONGODB_URI
main().catch((err)=> console.error(err))
async function main(){ await mongoose.connect(mongoDbUri)}

//Call configurePassport
configurePassport()

//Routers
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const messagesRouter = require('./routes/messages');

//App Initialize
const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');



//Session
app.use(session({
  secret: process.env.SESSION_SECRET, 
  store: MongoStore.create({
    mongoUrl: mongoDbUri,
    ttl: 14*24*60*60    
  }), 
  resave: false, 
  saveUninitialized: true}))
app.use(passport.session())

//App use
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));



//insert current user to be accessed in all pages rendered
app.use((req, res, next)=>{
  res.locals.currentUser = req.user;
  next()
})

//render views
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/messages', messagesRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
