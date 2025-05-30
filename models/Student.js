const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  rollNumber: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  courses: [{ type: String , ref: 'Course' }],
});

module.exports = mongoose.model('Student', studentSchema);