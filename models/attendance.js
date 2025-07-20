const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const attendanceSchema = new Schema({
  student: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  lecture: { type: Schema.Types.ObjectId, ref: 'Lecture', required: true },
  present: { type: Boolean, required: true },
  // Optionally, add a timestamp or notes
}, { timestamps: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);
module.exports = Attendance;