const mongoose = require('mongoose');

const holidaySchema = new mongoose.Schema(
  {
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    name: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    location: { type: String, default: 'All' },
    holidayType: { type: String, enum: ['National', 'Regional', 'Company', 'Optional'], default: 'National' },
    description: { type: String, default: '' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Holiday', holidaySchema);
