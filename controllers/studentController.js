const Course = require('../models/Course');
const Student = require('../models/Student');

// Get all courses with optional filters
exports.getCourses = async (req, res) => {
  try {
    const { department, seats, prerequisites, time } = req.query;

    // Build the filter object
    const filter = {};
    if (department) filter.department = department;
    if (seats) filter.seats = { $gte: parseInt(seats) }; // Filter by minimum seats
    if (prerequisites) filter.prerequisites = { $in: prerequisites.split(',') }; // Filter by prerequisites
    if (time) {
      const [startTime, endTime] = time.split(' - ');
      filter['schedule.startTime'] = startTime;
      filter['schedule.endTime'] = endTime;
    }

    // Fetch courses based on filters
    const courses = await Course.find(filter);
    res.json(courses);
  } catch (err) {
    console.error('Error fetching courses:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};


// controllers/studentController.js

exports.registerCourse = async (req, res) => {
  const { courseCode, rollNumber } = req.body; // Extract courseCode and rollNumber from the request body
  console.log(courseCode, rollNumber);
  try {
    // Validate courseCode and rollNumbermm
    if (!courseCode || typeof courseCode !== 'string') {
      return res.status(400).json({ message: 'Invalid course code.' });
    }
    if (!rollNumber || typeof rollNumber !== 'string') {
      return res.status(400).json({ message: 'Invalid roll number.' });
    }

    // Find the student by rollNumber
    const student = await Student.findOne({ rollNumber });
    if (!student) {
      return res.status(404).json({ message: 'Student not found.' });
    }

    // Find the course by courseCode
    const course = await Course.findOne({ courseCode });
    if (!course) {
      return res.status(404).json({ message: 'Course not found.' });
    }

    // Check if the course has available seats
    if (course.seats <= 0) {
      return res.status(400).json({ message: 'No seats available.' });
    }

    // Initialize student.courses if it's undefined
    if (!student.courses) {
      student.courses = [];
    }

    // Check if the student is already enrolled in the course
    if (student.courses.includes(course.courseCode)) {
      return res.status(400).json({ message: 'You are already enrolled in this course.' });
    }

    // Register for the course
    student.courses.push(course.courseCode); // Use courseCode instead of _id
    course.seats -= 1;
    await student.save();
    await course.save();

    res.json({ message: 'Course registered successfully.' });
  } catch (err) {
    console.error('Error registering for course:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};
exports.getEnrolledCourses = async (req, res) => {
  const studentId = req.userId; // Extracted from auth middleware

  try {
    // Fetch the student document
    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({ message: 'Student not found.' });
    }

    // Fetch the actual course documents using the course codes in student.courses
    const courses = await Course.find({ courseCode: { $in: student.courses } });

    // Return the enrolled courses
    res.json(courses);
  } catch (err) {
    console.error('Error fetching enrolled courses:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Drop a course
exports.dropCourse = async (req, res) => {
  const { courseCode, rollNumber } = req.body;

  console.log('Dropping course with code:', courseCode);
  console.log('Student rollNumber:', rollNumber);

  try {
    // Step 1: Find the student and remove the course from their `courses` array
    const student = await Student.findOneAndUpdate(
      { rollNumber },
      { $pull: { courses: courseCode } }, // Remove the course from the student's `courses` array
      { new: true }
    );

    if (!student) {
      return res.status(404).json({ message: 'Student not found.' });
    }

    // Step 2: Find the course and increment the seats
    const course = await Course.findOneAndUpdate(
      { courseCode },
      { $inc: { seats: 1 } }, // Increment the seats by 1
      { new: true }
    );

    if (!course) {
      return res.status(404).json({ message: 'Course not found.' });
    }

    // Step 3: Send a success response
    res.json({ message: 'Course dropped successfully.' });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};