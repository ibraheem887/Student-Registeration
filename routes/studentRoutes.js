const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const studentController = require('../controllers/studentController');

// Get all courses
router.get('/courses', authMiddleware, studentController.getCourses);

// Register for a course
router.post('/register-course', authMiddleware, studentController.registerCourse);

// Get enrolled courses
router.get('/enrolled-courses', authMiddleware, studentController.getEnrolledCourses);
// Drop a course
router.post('/drop-course', authMiddleware, studentController.dropCourse);
module.exports = router;


