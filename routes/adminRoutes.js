const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Course Management
router.post('/courses', adminController.addCourse); // Add a new course
router.put('/courses/:courseCode', adminController.updateCourse); // Update a course by courseCode
router.delete('/courses/:courseCode', adminController.deleteCourse); // Delete a course by courseCode

// Seat Management
router.put('/courses/:courseCode/seats', adminController.adjustSeats); // Adjust seats for a course by courseCode
router.get('/student-registrations', adminController.getStudentRegistrations);

// Student Management
router.post('/courses/:courseCode/override/:rollNumber', adminController.overrideRegistration); // Override registration for a student by courseCode and rollNumber

// Reports
router.get('/reports', adminController.generateReports); // Generate reports

module.exports = router;

