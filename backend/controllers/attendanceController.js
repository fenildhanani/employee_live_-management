const Attendance = require('../models/Attendance');
const User = require('../models/User');

const getAttendance = async (req, res, next) => {
  try {
    const { startDate, endDate, employee, department, status } = req.query;
    const query = { company: req.user.company._id };

    if (req.user.role === 'employee') {
      query.employee = req.user._id;
    } else if (employee) {
      query.employee = employee;
    } else if (req.user.role === 'manager') {
      const team = await User.find({ company: req.user.company._id, manager: req.user._id }).select('_id');
      const teamIds = team.map((t) => t._id);
      teamIds.push(req.user._id);
      query.employee = { $in: teamIds };
    }

    if (startDate && endDate) {
      query.attendanceDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    if (status) query.status = status;

    const records = await Attendance.find(query)
      .populate('employee', 'name employeeId department')
      .populate({ path: 'employee', populate: { path: 'department', select: 'name' } })
      .sort({ attendanceDate: -1 });

    res.status(200).json({ success: true, data: records });
  } catch (error) {
    next(error);
  }
};

const clockIn = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let record = await Attendance.findOne({
      company: req.user.company._id,
      employee: req.user._id,
      attendanceDate: today
    });

    if (record && record.checkIn) {
      return res.status(400).json({ success: false, message: 'Already clocked in for today' });
    }

    if (!record) {
      record = new Attendance({
        company: req.user.company._id,
        employee: req.user._id,
        attendanceDate: today
      });
    }

    record.checkIn = new Date();
    record.status = 'present';
    record.source = 'system';
    await record.save();

    res.status(200).json({ success: true, data: record, message: 'Clocked in successfully' });
  } catch (error) {
    next(error);
  }
};

const clockOut = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const record = await Attendance.findOne({
      company: req.user.company._id,
      employee: req.user._id,
      attendanceDate: today
    });

    if (!record || !record.checkIn) {
      return res.status(400).json({ success: false, message: 'Must clock in before clocking out' });
    }

    record.checkOut = new Date();
    const diffMs = record.checkOut.getTime() - record.checkIn.getTime();
    record.workingHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));
    await record.save();

    res.status(200).json({ success: true, data: record, message: 'Clocked out successfully' });
  } catch (error) {
    next(error);
  }
};

const updateAttendanceRecord = async (req, res, next) => {
  try {
    const { status, checkIn, checkOut } = req.body;
    const record = await Attendance.findOne({ _id: req.params.id, company: req.user.company._id });

    if (!record) {
      return res.status(404).json({ success: false, message: 'Attendance record not found' });
    }

    if (status) record.status = status;
    if (checkIn) record.checkIn = new Date(checkIn);
    if (checkOut) record.checkOut = new Date(checkOut);
    if (record.checkIn && record.checkOut) {
      const diff = record.checkOut.getTime() - record.checkIn.getTime();
      record.workingHours = parseFloat((diff / (1000 * 60 * 60)).toFixed(2));
    }
    record.source = 'manual';

    await record.save();

    res.status(200).json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAttendance,
  clockIn,
  clockOut,
  updateAttendanceRecord
};
