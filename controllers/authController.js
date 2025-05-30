const Student = require('../models/Student');
const Admin = require('../models/Admin');
const { generateToken } = require('../config/auth');

exports.studentLogin = async (req, res) => {
  const { rollNumber } = req.body;

  try {
    const student = await Student.findOne({ rollNumber });

    if (student) {
      // Generate a token for the student
      const token = generateToken(student._id, 'student');
      
      res.json({
        success: true,
        token,
        student: {
          _id: student._id,
          name: student.name,
          rollNumber: student.rollNumber,
        },
      });
    } else {
      res.status(404).json({ success: false, message: 'Roll number not found' });
    }
  } catch (error) {
    console.error('Error during student login:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.adminLogin = async (req, res) => {
  const { username, password } = req.body;

  try {
    const admin = await Admin.findOne({ username, password });

    if (admin) {
      // Generate a token for the admin
      const token = generateToken(admin._id, 'admin');
      res.json({ success: true, token });
    } else {
      res.status(401).json({ success: false, message: 'Invalid username or password' });
    }
  } catch (error) {
    console.error('Error during admin login:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
