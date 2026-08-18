const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    employeeId: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['employee', 'manager', 'hr_admin'], default: 'employee' },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
    manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    grade: { type: mongoose.Schema.Types.ObjectId, ref: 'Grade' },
    joiningDate: { type: Date, default: Date.now },
    location: { type: String, default: 'Headquarters' },
    phone: { type: String, default: '' },
    profileImage: { type: String, default: '' },
    status: { type: String, enum: ['active', 'inactive', 'terminated'], default: 'active' }
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
