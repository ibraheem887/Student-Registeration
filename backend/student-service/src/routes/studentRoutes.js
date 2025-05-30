const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const authMiddleware = require('../middleware/auth');

// Public routes
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Protected routes
router.get('/profile/:rollNumber', authMiddleware, studentController.getStudentProfile);
router.get('/courses/:rollNumber', authMiddleware, studentController.getStudentCourses);
router.post('/register-course', authMiddleware, studentController.registerCourse);
router.post('/drop-course', authMiddleware, studentController.dropCourse);

module.exports = router;
