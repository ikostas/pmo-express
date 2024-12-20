'use strict';
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const logger = require('morgan');
const db  = require('./models');
const session = require('express-session');
const flash = require('express-flash');

async function test_connection() {
  try {
    await db.sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

test_connection(); 

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const app = express();
app.use(flash());

app.use(session({
  secret: process.env.TOKEN_SECRET,
  resave: false,
  saveUninitialized: true
}));


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
if (app.get('env') === 'development') {
  app.locals.pretty = true;
}

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'uploads')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

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
