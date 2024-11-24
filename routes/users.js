'use strict';
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');

router.get('/register', userController.showRegisterPage);
router.post('/register', userController.register);
router.get('/login', userController.showLoginPage);
router.post('/login', userController.login);
router.delete('/logout', userController.logout);

module.exports = router;
