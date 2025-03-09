'use strict';
module.exports = {
  homePage: (req, res, next) => {
    res.render('index', { title: 'Project Managment Thing', user: req.session.user });
  }
}
