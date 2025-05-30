const Course = require('../models/Course');
const Student = require('../models/Student');

// Add a new course
exports.addCourse = async (req, res) => {
  const { courseCode, courseName, department, schedule, seats, prerequisites } = req.body;

  try {
    // Check if courseCode already exists
    const existingCourse = await Course.findOne({ courseCode });
    if (existingCourse) {
      return res.status(400).json({ message: 'Course code already exists.' });
    }

    const newCourse = new Course({
      courseCode,
      courseName,
      department,
      schedule: {
        days: schedule.days,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
      },
      seats,
      prerequisites,
    });
    await newCourse.save();
    res.status(201).json({ message: 'Course added successfully.', course: newCourse });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// Delete a course by courseCode
exports.deleteCourse = async (req, res) => {
  const { courseCode } = req.params;

  try {
    // Find and delete the course by courseCode
    const course = await Course.findOneAndDelete({ courseCode });
    if (!course) {
      return res.status(404).json({ message: 'Course not found.' });
    }
    res.json({ message: 'Course deleted successfully.', course });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// Update a course by courseCode
exports.updateCourse = async (req, res) => {
  const { courseCode } = req.params;
  const updates = req.body;

  // Check if updates object is empty
  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ message: 'No updates provided.' });
  }

  // Validate updates object
  const allowedUpdates = [
    'courseName',
    'department',
    'days',
    'startTime',
    'endTime',
    'seats',
    'prerequisites',
  ]; // Fields that can be updated
  const isValidUpdate = Object.keys(updates).every(key => allowedUpdates.includes(key));

  if (!isValidUpdate) {
    return res.status(400).json({ message: 'Invalid update fields.' });
  }

  // Validate seats if provided
  if (updates.seats !== undefined && isNaN(updates.seats)) {
    return res.status(400).json({ message: 'Seats must be a valid number.' });
  }

  // Validate days and prerequisites if provided
  if (updates.days !== undefined && !Array.isArray(updates.days)) {
    return res.status(400).json({ message: 'Days must be an array.' });
  }
  if (updates.prerequisites !== undefined && !Array.isArray(updates.prerequisites)) {
    return res.status(400).json({ message: 'Prerequisites must be an array.' });
  }

  try {
    // Find and update the course by courseCode
    const course = await Course.findOneAndUpdate({ courseCode }, updates, { new: true, runValidators: true });

    if (!course) {
      return res.status(404).json({ message: 'Course not found.' });
    }

    res.json({ message: 'Course updated successfully.', course });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};
// Adjust seats for a course by courseCode
exports.adjustSeats = async (req, res) => {
  const { courseCode } = req.params;
  const { seats } = req.body;

  // Check if seats is a valid number
  if (typeof seats !== 'number' || seats < 0) {
    return res.status(400).json({ message: 'Invalid seats value.' });
  }

  try {
    // Find and update the course by courseCode
    const course = await Course.findOneAndUpdate({ courseCode }, { seats }, { new: true, runValidators: true });
    if (!course) return res.status(404).json({ message: 'Course not found.' });
    res.json({ message: 'Seats adjusted successfully.', course });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// Override student registration by courseCode and rollNumber
exports.overrideRegistration = async (req, res) => {
  const { courseCode, rollNumber } = req.params;

  try {
    // Validate inputs
    if (!courseCode || !rollNumber) {
      return res.status(400).json({ message: 'Course code and roll number are required.' });
    }

    // Find the course by courseCode
    const course = await Course.findOne({ courseCode });
    if (!course) {
      return res.status(404).json({ message: 'Course not found.' });
    }

    // Find the student by rollNumber
    const student = await Student.findOne({ rollNumber });
    if (!student) {
      return res.status(404).json({ message: 'Student not found.' });
    }

    // Check if student is already enrolled in the course
    if (student.courses.includes(course.courseCode)) {
      return res.status(400).json({ message: 'Student is already enrolled in this course.' });
    }

    // Check if course has available seats
    if (course.seats <= 0) {
      return res.status(400).json({ message: 'No available seats in this course.' });
    }

    // Add the course ObjectId to the student's list of enrolled courses
    student.courses.push(course.courseCode);
    await student.save();

    // Decrement the course seats
    course.seats -= 1;
    await course.save();

    res.json({ message: 'Student added to course successfully.', course, student });
  } catch (err) {
    console.error('Error in overrideRegistration:', err);
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// Generate reports
exports.generateReports = async (req, res) => {
  const { courseCode } = req.query;

  try {
    // Fetch students enrolled in the course
    const studentsInCourse = await Student.find({ enrolledCourses: courseCode });

    // Fetch courses with available seats
    const coursesWithSeats = await Course.find({ seats: { $gt: 0 } });

    // Fetch students without prerequisites for the course
    const course = await Course.findOne({ courseCode });
    if (!course) {
      return res.status(404).json({ message: 'Course not found.' });
    }

    const studentsWithoutPrerequisites = await Student.find({
      $and: [
        { enrolledCourses: courseCode },
        { completedCourses: { $nin: course.prerequisites } },
      ],
    });

    res.json({
      studentsInCourse,
      coursesWithSeats,
      studentsWithoutPrerequisites,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};
// Backend route to fetch student registrations
exports.getStudentRegistrations = async (req, res) => {
  try {
    // Fetch all students with their enrolled courses
    const students = await Student.find({}).populate('courses', ' courseCode');

    // Format the data for the frontend
    const registrations = students.map(student => ({
      name: student.name,
      rollNumber: student.rollNumber,
      courses: student.courses.map(course => ({
       
        courseCode: course.courseCode
      })),
    }));

    res.json(registrations);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};
exports.dropCourse = async (req, res) => {
  const { courseCode, rollNumber } = req.body;

  try {
    // Find the student and remove the course from their enrolledCourses
    const student = await Student.findOneAndUpdate(
      { rollNumber },
      { $pull: { enrolledCourses: courseCode } },
      { new: true }
    );

    if (!student) {
      return res.status(404).json({ message: 'Student not found.' });
    }

    // Increment the seats for the course
    const course = await Course.findOneAndUpdate(
      { courseCode },
      { $inc: { seats: 1 } },
      { new: true }
    );

    if (!course) {
      return res.status(404).json({ message: 'Course not found.' });
    }

    res.json({ message: 'Course dropped successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};