const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Student Login
router.post('/student-login', authController.studentLogin);

// Admin Login
router.post('/admin-login', authController.adminLogin);

module.exports = router;