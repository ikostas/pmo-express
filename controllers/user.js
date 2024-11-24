'use strict';
const db  = require('../models');
const bcrypt = require('bcrypt');

const isAuthenticated = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
};

module.exports = {
  showRegisterPage: (req, res) => {
    res.render('register', { title: 'Register' });
  },
  register: async (req, res) => {
    try {
      const formData = req.body;
      formData.password = await bcrypt.hash(formData.password, 10);
      const userExists = await db.User.findOne({where: { username: formData.username }});
      if (userExists) {
        req.flash('error', 'Username exists, choose a different username');
        res.status(201).redirect('/users/register');
        return;
      }
      const emailExists = await db.User.findOne({where: { email: formData.email }});
      if (emailExists) {
        req.flash('error', 'Email exists, recover the password');
        res.status(201).redirect('/users/register');
        return;
      }
      const user = await db.User.create(formData);
      req.flash('success', 'Registration successful!');
      res.status(201).redirect('/');
    } catch (error) {
      req.flash('error', error);
      res.status(201).redirect('/');
    }
  },
  showLoginPage: (req, res) => {
    res.render('login', { title: 'Login' });
  },
  login: async (req, res) => {
    try {
      const formData = req.body;
      const user = await db.User.findOne({where: { username: formData.username }});
      if (user && await bcrypt.compare(formData.password, user.password)) {
        req.session.user = { id: user.id, username: user.username };
        req.flash('success', 'Login successful!');
        res.status(201).redirect('/pmo');
      } else {
        req.flash('error', 'Invalid username or password');
        res.status(201).redirect('/users/login');
      }
   } catch (error) {
       req.flash('error', error);
       res.status(201).redirect('/users/login');
     }
  },
  logout: (req, res) => {
      req.session.destroy();
      res.status(201).redirect('/users/login');
  }
}
