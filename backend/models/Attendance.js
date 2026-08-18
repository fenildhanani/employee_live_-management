const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    attendanceDate: { type: Date, required: true },
    checkIn: { type: Date, default: null },
    checkOut: { type: Date, default: null },
    workingHours: { type: Number, default: 0 },
    status: { type: String, enum: ['present', 'absent', 'half_day', 'leave', 'holiday', 'weekend'], default: 'present' },
    source: { type: String, enum: ['system', 'manual', 'leave_module', 'comp_off'], default: 'system' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Attendance', attendanceSchema);
