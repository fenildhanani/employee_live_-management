const LeaveRequest = require('../models/LeaveRequest');
const LeaveBalance = require('../models/LeaveBalance');
const LeavePolicy = require('../models/LeavePolicy');
const LeaveType = require('../models/LeaveType');
const Holiday = require('../models/Holiday');
const LeaveApproval = require('../models/LeaveApproval');
const Attendance = require('../models/Attendance');
const Company = require('../models/Company');
const { calculateWorkingDays } = require('../utils/dateUtils');
const logAudit = require('../utils/auditLogger');
const { createNotification } = require('./notificationService');

const getApplicablePolicy = async (companyId, leaveTypeId, departmentId, gradeId) => {
  let policy = await LeavePolicy.findOne({
    company: companyId,
    leaveType: leaveTypeId,
    department: departmentId,
    grade: gradeId,
    status: 'active'
  });

  if (!policy) {
    policy = await LeavePolicy.findOne({
      company: companyId,
      leaveType: leaveTypeId,
      department: departmentId,
      status: 'active'
    });
  }

  if (!policy) {
    policy = await LeavePolicy.findOne({
      company: companyId,
      leaveType: leaveTypeId,
      grade: gradeId,
      status: 'active'
    });
  }

  if (!policy) {
    policy = await LeavePolicy.findOne({
      company: companyId,
      leaveType: leaveTypeId,
      status: 'active'
    });
  }

  return policy;
};

const checkLeaveConflict = async (employeeId, startDate, endDate, excludeRequestId = null) => {
  const query = {
    employee: employeeId,
    status: { $in: ['pending', 'approved'] },
    $or: [
      { startDate: { $lte: endDate }, endDate: { $gte: startDate } }
    ]
  };

  if (excludeRequestId) {
    query._id = { $ne: excludeRequestId };
  }

  const conflicting = await LeaveRequest.findOne(query);
  return !!conflicting;
};

const validateLeaveRequest = async ({ companyId, employee, leaveTypeId, startDate, endDate, startSession, endSession }) => {
  const company = await Company.findById(companyId);
  const weeklyOffs = company ? company.weeklyOffs : ['Saturday', 'Sunday'];

  const holidays = await Holiday.find({
    company: companyId,
    date: { $gte: new Date(startDate), $lte: new Date(endDate) }
  });

  const totalDays = calculateWorkingDays(startDate, endDate, startSession, endSession, holidays, weeklyOffs);

  if (totalDays <= 0) {
    throw new Error('Selected date range contains no working days (only weekends or holidays)');
  }

  const leaveType = await LeaveType.findOne({ _id: leaveTypeId, company: companyId });
  if (!leaveType || leaveType.status !== 'active') {
    throw new Error('Invalid or inactive leave type selected');
  }

  const policy = await getApplicablePolicy(companyId, leaveTypeId, employee.department, employee.grade);
  const maxConsecutive = policy ? policy.maxConsecutiveDays : leaveType.maxConsecutiveDays;

  if (maxConsecutive && totalDays > maxConsecutive) {
    throw new Error(`Leave exceeds maximum consecutive days allowed (${maxConsecutive} days)`);
  }

  const noticeDays = policy ? policy.minimumNoticeDays : leaveType.minimumNoticeDays;
  if (noticeDays > 0) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const diffTime = start.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < noticeDays) {
      throw new Error(`This leave type requires at least ${noticeDays} day(s) advance notice`);
    }
  }

  const currentYear = new Date(startDate).getFullYear();
  let balance = await LeaveBalance.findOne({
    company: companyId,
    employee: employee._id,
    leaveType: leaveTypeId,
    year: currentYear
  });

  if (!balance) {
    const defaultAlloc = policy ? policy.allocation : leaveType.annualAllocation;
    balance = await LeaveBalance.create({
      company: companyId,
      employee: employee._id,
      leaveType: leaveTypeId,
      year: currentYear,
      allocatedDays: defaultAlloc,
      remainingDays: defaultAlloc
    });
  }

  if (balance.remainingDays < totalDays) {
    throw new Error(`Insufficient leave balance. Required: ${totalDays} day(s), Available: ${balance.remainingDays} day(s)`);
  }

  const isConflict = await checkLeaveConflict(employee._id, startDate, endDate);
  if (isConflict) {
    throw new Error('You already have a pending or approved leave request overlapping with this date range');
  }

  return { totalDays, leaveType, policy, balance };
};

const approveLeave = async (leaveRequestId, approverUser, comment = '') => {
  const leaveRequest = await LeaveRequest.findById(leaveRequestId).populate('employee leaveType');
  if (!leaveRequest) throw new Error('Leave request not found');

  if (leaveRequest.status !== 'pending') {
    throw new Error(`Cannot approve leave request with status: ${leaveRequest.status}`);
  }

  if (leaveRequest.employee._id.toString() === approverUser._id.toString()) {
    throw new Error('Employee cannot approve their own leave request');
  }

  if (approverUser.role === 'manager' && leaveRequest.employee.manager && leaveRequest.employee.manager.toString() !== approverUser._id.toString()) {
    throw new Error('Manager can only approve leave requests for their own team members');
  }

  leaveRequest.status = 'approved';
  await leaveRequest.save();

  await LeaveApproval.create({
    leaveRequest: leaveRequest._id,
    approver: approverUser._id,
    action: 'approved',
    comment: comment,
    actionDate: new Date()
  });

  const year = new Date(leaveRequest.startDate).getFullYear();
  const balance = await LeaveBalance.findOne({
    company: leaveRequest.company,
    employee: leaveRequest.employee._id,
    leaveType: leaveRequest.leaveType._id,
    year: year
  });

  if (balance) {
    balance.usedDays += leaveRequest.totalDays;
    await balance.save();
  }

  let curr = new Date(leaveRequest.startDate);
  const end = new Date(leaveRequest.endDate);
  while (curr <= end) {
    await Attendance.findOneAndUpdate(
      {
        company: leaveRequest.company,
        employee: leaveRequest.employee._id,
        attendanceDate: new Date(curr.setHours(0, 0, 0, 0))
      },
      {
        status: leaveRequest.totalDays < 1 ? 'half_day' : 'leave',
        source: 'leave_module'
      },
      { upsert: true, new: true }
    );
    curr.setDate(curr.getDate() + 1);
  }

  await createNotification({
    company: leaveRequest.company,
    user: leaveRequest.employee._id,
    title: 'Leave Request Approved',
    message: `Your ${leaveRequest.leaveType.name} request for ${leaveRequest.totalDays} day(s) starting ${new Date(leaveRequest.startDate).toLocaleDateString()} has been approved.`,
    type: 'leave_approval',
    referenceId: leaveRequest._id
  });

  await logAudit({
    company: leaveRequest.company,
    action: 'LEAVE_APPROVED',
    performedBy: approverUser._id,
    targetEntity: 'LeaveRequest',
    targetId: leaveRequest._id,
    details: `Approved ${leaveRequest.totalDays} days of ${leaveRequest.leaveType.name} for employee ${leaveRequest.employee.name}`
  });

  return leaveRequest;
};

const rejectLeave = async (leaveRequestId, approverUser, comment) => {
  if (!comment || comment.trim() === '') {
    throw new Error('Rejection reason (comment) is required');
  }

  const leaveRequest = await LeaveRequest.findById(leaveRequestId).populate('employee leaveType');
  if (!leaveRequest) throw new Error('Leave request not found');

  if (leaveRequest.status !== 'pending') {
    throw new Error(`Cannot reject leave request with status: ${leaveRequest.status}`);
  }

  if (approverUser.role === 'manager' && leaveRequest.employee.manager && leaveRequest.employee.manager.toString() !== approverUser._id.toString()) {
    throw new Error('Manager can only reject leave requests for their own team members');
  }

  leaveRequest.status = 'rejected';
  await leaveRequest.save();

  await LeaveApproval.create({
    leaveRequest: leaveRequest._id,
    approver: approverUser._id,
    action: 'rejected',
    comment: comment,
    actionDate: new Date()
  });

  await createNotification({
    company: leaveRequest.company,
    user: leaveRequest.employee._id,
    title: 'Leave Request Rejected',
    message: `Your ${leaveRequest.leaveType.name} request starting ${new Date(leaveRequest.startDate).toLocaleDateString()} was rejected. Reason: ${comment}`,
    type: 'leave_rejection',
    referenceId: leaveRequest._id
  });

  await logAudit({
    company: leaveRequest.company,
    action: 'LEAVE_REJECTED',
    performedBy: approverUser._id,
    targetEntity: 'LeaveRequest',
    targetId: leaveRequest._id,
    details: `Rejected leave request for employee ${leaveRequest.employee.name}. Reason: ${comment}`
  });

  return leaveRequest;
};

const cancelLeave = async (leaveRequestId, user, cancelReason = '') => {
  const leaveRequest = await LeaveRequest.findById(leaveRequestId).populate('employee leaveType');
  if (!leaveRequest) throw new Error('Leave request not found');

  if (user.role === 'employee' && leaveRequest.employee._id.toString() !== user._id.toString()) {
    throw new Error('Not authorized to cancel this leave request');
  }

  const prevStatus = leaveRequest.status;
  if (!['pending', 'approved'].includes(prevStatus)) {
    throw new Error(`Cannot cancel leave request with status: ${prevStatus}`);
  }

  leaveRequest.status = 'cancelled';
  leaveRequest.cancelReason = cancelReason;
  await leaveRequest.save();

  if (prevStatus === 'approved') {
    const year = new Date(leaveRequest.startDate).getFullYear();
    const balance = await LeaveBalance.findOne({
      company: leaveRequest.company,
      employee: leaveRequest.employee._id,
      leaveType: leaveRequest.leaveType._id,
      year: year
    });

    if (balance) {
      balance.usedDays = Math.max(0, balance.usedDays - leaveRequest.totalDays);
      await balance.save();
    }

    let curr = new Date(leaveRequest.startDate);
    const end = new Date(leaveRequest.endDate);
    while (curr <= end) {
      await Attendance.findOneAndDelete({
        company: leaveRequest.company,
        employee: leaveRequest.employee._id,
        attendanceDate: new Date(curr.setHours(0, 0, 0, 0)),
        source: 'leave_module'
      });
      curr.setDate(curr.getDate() + 1);
    }
  }

  if (leaveRequest.employee.manager) {
    await createNotification({
      company: leaveRequest.company,
      user: leaveRequest.employee.manager,
      title: 'Leave Request Cancelled',
      message: `${leaveRequest.employee.name} cancelled their ${leaveRequest.leaveType.name} request for ${leaveRequest.totalDays} day(s).`,
      type: 'leave_cancellation',
      referenceId: leaveRequest._id
    });
  }

  await logAudit({
    company: leaveRequest.company,
    action: 'LEAVE_CANCELLED',
    performedBy: user._id,
    targetEntity: 'LeaveRequest',
    targetId: leaveRequest._id,
    details: `Cancelled leave request for employee ${leaveRequest.employee.name}`
  });

  return leaveRequest;
};

module.exports = {
  getApplicablePolicy,
  checkLeaveConflict,
  validateLeaveRequest,
  approveLeave,
  rejectLeave,
  cancelLeave
};
