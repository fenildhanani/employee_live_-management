const LeaveRequest = require('../models/LeaveRequest');
const LeaveBalance = require('../models/LeaveBalance');
const User = require('../models/User');
const Attendance = require('../models/Attendance');

const getDashboardAnalytics = async (req, res, next) => {
  try {
    const companyId = req.user.company._id;
    const year = parseInt(req.query.year, 10) || new Date().getFullYear();

    const totalEmployees = await User.countDocuments({ company: companyId, status: 'active' });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const onLeaveTodayCount = await LeaveRequest.countDocuments({
      company: companyId,
      status: 'approved',
      startDate: { $lte: today },
      endDate: { $gte: today }
    });

    const pendingRequestsCount = await LeaveRequest.countDocuments({
      company: companyId,
      status: 'pending'
    });

    const balances = await LeaveBalance.find({ company: companyId, year });
    let totalAllocated = 0;
    let totalUsed = 0;
    balances.forEach((b) => {
      totalAllocated += b.allocatedDays + b.carryForwardDays + b.compOffDays;
      totalUsed += b.usedDays;
    });

    const leaveUtilizationRate = totalAllocated > 0 ? parseFloat(((totalUsed / totalAllocated) * 100).toFixed(1)) : 0;
    const teamAvailabilityRate = totalEmployees > 0 ? parseFloat((((totalEmployees - onLeaveTodayCount) / totalEmployees) * 100).toFixed(1)) : 100;

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const workingDaysInMonth = 22; // Average working days
    const totalPossibleWorkingDays = totalEmployees * workingDaysInMonth;
    const totalAbsentDays = await Attendance.countDocuments({
      company: companyId,
      status: 'absent',
      attendanceDate: { $gte: startOfMonth, $lte: endOfMonth }
    });

    const absenteeismRate = totalPossibleWorkingDays > 0 ? parseFloat(((totalAbsentDays / totalPossibleWorkingDays) * 100).toFixed(1)) : 0;

    // Monthly leave trend
    const monthlyTrend = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    let maxLeaveDaysMonth = 'N/A';
    let maxLeaveDaysCount = -1;

    for (let m = 0; m < 12; m++) {
      const mStart = new Date(year, m, 1);
      const mEnd = new Date(year, m + 1, 0, 23, 59, 59);

      const mLeaves = await LeaveRequest.find({
        company: companyId,
        status: 'approved',
        startDate: { $gte: mStart, $lte: mEnd }
      });

      const monthDays = mLeaves.reduce((acc, l) => acc + l.totalDays, 0);
      monthlyTrend.push({ month: monthNames[m], leaveDays: monthDays });

      if (monthDays > maxLeaveDaysCount) {
        maxLeaveDaysCount = monthDays;
        maxLeaveDaysMonth = monthNames[m];
      }
    }

    res.status(200).json({
      success: true,
      data: {
        totalEmployees,
        onLeaveTodayCount,
        pendingRequestsCount,
        leaveUtilizationRate,
        teamAvailabilityRate,
        absenteeismRate,
        peakAbsenceMonth: maxLeaveDaysMonth,
        monthlyTrend
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardAnalytics };
