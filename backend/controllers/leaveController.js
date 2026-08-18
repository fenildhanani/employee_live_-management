const LeaveRequest = require('../models/LeaveRequest');
const LeaveBalance = require('../models/LeaveBalance');
const LeaveApproval = require('../models/LeaveApproval');
const User = require('../models/User');
const { validateLeaveRequest, approveLeave, rejectLeave, cancelLeave } = require('../services/leaveService');
const { createNotification } = require('../services/notificationService');
const logAudit = require('../utils/auditLogger');

const getLeaves = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const status = req.query.status;
    const leaveType = req.query.leaveType;
    const employeeId = req.query.employee;

    const query = { company: req.user.company._id };

    if (req.user.role === 'employee') {
      query.employee = req.user._id;
    } else if (req.user.role === 'manager') {
      if (employeeId) {
        query.employee = employeeId;
      } else {
        const teamMembers = await User.find({ company: req.user.company._id, manager: req.user._id }).select('_id');
        const teamIds = teamMembers.map((m) => m._id);
        teamIds.push(req.user._id);
        query.employee = { $in: teamIds };
      }
    } else if (req.user.role === 'hr_admin' && employeeId) {
      query.employee = employeeId;
    }

    if (status) query.status = status;
    if (leaveType) query.leaveType = leaveType;

    const total = await LeaveRequest.countDocuments(query);
    const leaves = await LeaveRequest.find(query)
      .populate('employee', 'name employeeId email profileImage department')
      .populate({ path: 'employee', populate: { path: 'department', select: 'name' } })
      .populate('leaveType', 'name paid annualAllocation')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: leaves,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    next(error);
  }
};

const getLeaveById = async (req, res, next) => {
  try {
    const leave = await LeaveRequest.findOne({
      _id: req.params.id,
      company: req.user.company._id
    })
      .populate('employee leaveType')
      .populate({ path: 'employee', populate: { path: 'department grade manager', select: 'name' } });

    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    const approvals = await LeaveApproval.find({ leaveRequest: leave._id })
      .populate('approver', 'name email role')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: { leave, approvals } });
  } catch (error) {
    next(error);
  }
};

const createLeaveRequest = async (req, res, next) => {
  try {
    const { leaveType, startDate, endDate, startSession, endSession, reason } = req.body;
    const attachment = req.file ? `/uploads/${req.file.filename}` : req.body.attachment || '';

    const validation = await validateLeaveRequest({
      companyId: req.user.company._id,
      employee: req.user,
      leaveTypeId: leaveType,
      startDate,
      endDate,
      startSession,
      endSession
    });

    const leaveRequest = await LeaveRequest.create({
      company: req.user.company._id,
      employee: req.user._id,
      leaveType,
      startDate,
      endDate,
      startSession: startSession || 'Full Day',
      endSession: endSession || 'Full Day',
      totalDays: validation.totalDays,
      reason,
      attachment,
      status: 'pending'
    });

    if (req.user.manager) {
      await createNotification({
        company: req.user.company._id,
        user: req.user.manager,
        title: 'New Leave Request Pending Approval',
        message: `${req.user.name} submitted a ${validation.leaveType.name} request for ${validation.totalDays} day(s) from ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}.`,
        type: 'leave_request',
        referenceId: leaveRequest._id
      });
    }

    await logAudit({
      company: req.user.company._id,
      action: 'LEAVE_SUBMITTED',
      performedBy: req.user._id,
      targetEntity: 'LeaveRequest',
      targetId: leaveRequest._id,
      details: `Submitted ${validation.totalDays} day(s) ${validation.leaveType.name}`
    });

    const populated = await LeaveRequest.findById(leaveRequest._id).populate('employee leaveType');
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

const handleApprove = async (req, res, next) => {
  try {
    const { comment } = req.body;
    const leave = await approveLeave(req.params.id, req.user, comment || '');
    res.status(200).json({ success: true, data: leave });
  } catch (error) {
    next(error);
  }
};

const handleReject = async (req, res, next) => {
  try {
    const { comment } = req.body;
    const leave = await rejectLeave(req.params.id, req.user, comment);
    res.status(200).json({ success: true, data: leave });
  } catch (error) {
    next(error);
  }
};

const handleCancel = async (req, res, next) => {
  try {
    const { cancelReason } = req.body;
    const leave = await cancelLeave(req.params.id, req.user, cancelReason || '');
    res.status(200).json({ success: true, data: leave });
  } catch (error) {
    next(error);
  }
};

const getMyLeaveBalances = async (req, res, next) => {
  try {
    const year = parseInt(req.query.year, 10) || new Date().getFullYear();
    const balances = await LeaveBalance.find({
      company: req.user.company._id,
      employee: req.user._id,
      year: year
    }).populate('leaveType');

    res.status(200).json({ success: true, data: balances });
  } catch (error) {
    next(error);
  }
};

const getAllLeaveBalances = async (req, res, next) => {
  try {
    const year = parseInt(req.query.year, 10) || new Date().getFullYear();
    const employeeId = req.query.employee;

    const query = { company: req.user.company._id, year };
    if (employeeId) query.employee = employeeId;

    const balances = await LeaveBalance.find(query)
      .populate('employee', 'name employeeId email department')
      .populate({ path: 'employee', populate: { path: 'department', select: 'name' } })
      .populate('leaveType');

    res.status(200).json({ success: true, data: balances });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLeaves,
  getLeaveById,
  createLeaveRequest,
  handleApprove,
  handleReject,
  handleCancel,
  getMyLeaveBalances,
  getAllLeaveBalances
};
