const jwt = require('jsonwebtoken');
const Student = require('../models/Student');

const authMiddleware = async (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Token is required.' });
  }

  try {
    const decoded = jwt.verify(token, '18808b9225fdc06332515698e792fa90fe33464119fcc6da4ce8f8785c8b41be');
    const student = await Student.findById(decoded.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found.' });
    }

    req.userId = decoded.id; // Attach student ID to the request object
    next();
  } catch (err) {
    res.status(400).json({ message: 'Invalid token.' });
  }
};

module.exports = authMiddleware;
