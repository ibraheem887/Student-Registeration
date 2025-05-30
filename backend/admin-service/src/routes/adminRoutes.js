const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/auth');

// Public routes
router.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

// Protected routes
router.get('/courses', authMiddleware, adminController.getAllCourses);
router.post('/courses', authMiddleware, adminController.createCourse);
router.put('/courses/:id', authMiddleware, adminController.updateCourse);
router.delete('/courses/:id', authMiddleware, adminController.deleteCourse);

router.get('/students', authMiddleware, adminController.getAllStudents);
router.post('/students', authMiddleware, adminController.createStudent);
router.put('/students/:id', authMiddleware, adminController.updateStudent);
router.delete('/students/:id', authMiddleware, adminController.deleteStudent);

module.exports = router;
