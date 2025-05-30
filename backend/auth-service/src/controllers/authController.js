const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Student = require('../models/Student');
const Admin = require('../models/Admin');

exports.studentLogin = async (req, res) => {
  try {
    const { rollNumber, password } = req.body;
    
    // Find student by roll number
    const student = await Student.findOne({ rollNumber });
    if (!student) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Verify password
    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Create JWT token
    const payload = {
      id: student._id,
      rollNumber: student.rollNumber,
      name: student.name,
      role: 'student'
    };
    
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || '18808b9225fdc06332515698e792fa90fe33464119fcc6da4ce8f8785c8b41be',
      { expiresIn: '24h' }
    );
    
    // Return token and user info
    res.json({
      token,
      user: {
        id: student._id,
        name: student.name,
        rollNumber: student.rollNumber,
        email: student.email,
        role: 'student'
      }
    });
  } catch (error) {
    console.error('Error in student login:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Find admin by username
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Verify password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Create JWT token
    const payload = {
      id: admin._id,
      username: admin.username,
      name: admin.name,
      role: 'admin'
    };
    
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || '18808b9225fdc06332515698e792fa90fe33464119fcc6da4ce8f8785c8b41be',
      { expiresIn: '24h' }
    );
    
    // Return token and user info
    res.json({
      token,
      user: {
        id: admin._id,
        name: admin.name,
        username: admin.username,
        email: admin.email,
        role: 'admin'
      }
    });
  } catch (error) {
    console.error('Error in admin login:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
