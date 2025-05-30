const Student = require('../models/Student');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

exports.getStudentProfile = async (req, res) => {
  try {
    const { rollNumber } = req.params;
    
    // Find student by roll number
    const student = await Student.findOne({ rollNumber }).select('-password');
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    res.json(student);
  } catch (error) {
    console.error('Error fetching student profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getStudentCourses = async (req, res) => {
  try {
    const { rollNumber } = req.params;
    
    // Find student by roll number
    const student = await Student.findOne({ rollNumber });
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Find enrollments for this student
    const enrollments = await Enrollment.find({ student: student._id });
    
    // Get course IDs from enrollments
    const courseIds = enrollments.map(enrollment => enrollment.course);
    
    // Find courses by IDs
    const courses = await Course.find({ _id: { $in: courseIds } });
    
    res.json(courses);
  } catch (error) {
    console.error('Error fetching student courses:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.registerCourse = async (req, res) => {
  try {
    const { rollNumber, courseId } = req.body;
    
    // Find student by roll number
    const student = await Student.findOne({ rollNumber });
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Find course by ID
    const course = await Course.findById(courseId);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Check if course has available seats
    if (course.seats <= 0) {
      return res.status(400).json({ message: 'No seats available for this course' });
    }
    
    // Check if student is already enrolled in this course
    const existingEnrollment = await Enrollment.findOne({
      student: student._id,
      course: courseId
    });
    
    if (existingEnrollment) {
      return res.status(400).json({ message: 'Already registered for this course' });
    }
    
    // Create new enrollment
    const enrollment = new Enrollment({
      student: student._id,
      course: courseId
    });
    
    await enrollment.save();
    
    // Decrease available seats
    course.seats -= 1;
    await course.save();
    
    res.status(201).json({ message: 'Successfully registered for course' });
  } catch (error) {
    console.error('Error registering for course:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.dropCourse = async (req, res) => {
  try {
    const { rollNumber, courseId } = req.body;
    
    // Find student by roll number
    const student = await Student.findOne({ rollNumber });
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Find course by ID
    const course = await Course.findById(courseId);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Find and delete enrollment
    const enrollment = await Enrollment.findOneAndDelete({
      student: student._id,
      course: courseId
    });
    
    if (!enrollment) {
      return res.status(400).json({ message: 'Not registered for this course' });
    }
    
    // Increase available seats
    course.seats += 1;
    await course.save();
    
    res.json({ message: 'Successfully dropped course' });
  } catch (error) {
    console.error('Error dropping course:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

