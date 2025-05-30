const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  courseCode: { type: String, required: true, unique: true },
  courseName: { type: String, required: true },
  department: { type: String, required: true },
  schedule: {
    days: [{ type: String }],
    startTime: { type: String },
    endTime: { type: String },
  },
  seats: { type: Number, required: true },
  prerequisites: [{ type: String }],
});

module.exports = mongoose.model('Course', courseSchema);