var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var FileStore = require('session-file-store')(session);
var passport = require('passport');
var authenticate = require('./authenticate');
var config = require('./config');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var dishRouter = require('./routes/dishRouter');
var promoRouter = require('./routes/promoRouter');
var leaderRouter = require('./routes/leaderRouter');
var uploadRouter = require('./routes/uploadRouter');
var favoriteRouter = require('./routes/favoriteRouter');

const mongoose = require('mongoose');

const url = config.mongoUrl;
const connect = mongoose.connect(url);

connect.then((db) => {
  console.log('--> Connected correctly to server');
}, (err) => {
  console.log('--> Error while trying to connect to db');
  console.log(err);
});

var app = express();

// Need to setup all http to go to https
app.all('*', (req, res, next) => {
  if (req.secure) {
    return next();
  } else {
    res.redirect(307, 'https://' + req.hostname + ':' + app.get('secPort') + req.url);
  }
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


// We are using signed cookies
//app.use(cookieParser('12345-67890-09876-54321'));

// Sets  up the Express session middleware
// app.use(session( {
//   name: 'session-id',
//   secret: '12345-67890-09876-54321',
//   saveUninitialized: false,
//   resave: false,
//   store: new FileStore()
//  }));


//app.use(passport.session());

// app.use(function(req, res, next) {
//   res.setHeader('WWW-Authenticate', 'Basic');
//   return res.status(401).send({
//     message: "Unauthorized!"
//   });
// });

// Authorization middleware being added here
// function auth (req, res, next) {

//   if (!req.user) {   
//     var err = new Error('You are not authenticated!');
//     err.status = 403;       
//     return next(err);
//   } else {
//       next(); // authorized
//   }
  
// } 
 
// app.use(auth);

app.use(passport.initialize());
// Need access to home and /users (for registration, logging in and logout)
// Without the need for authorization
app.use('/', indexRouter);
app.use('/users', usersRouter);

// Enables us to serve static page from public folder
app.use(express.static(path.join(__dirname, 'public')));


app.use('/dishes', dishRouter);
app.use('/promotions', promoRouter);
app.use('/leaders', leaderRouter);
app.use('/imageUpload', uploadRouter);
app.use('/favorites', favoriteRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
