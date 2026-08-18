const CompOff = require('../models/CompOff');
const LeaveBalance = require('../models/LeaveBalance');
const LeaveType = require('../models/LeaveType');
const User = require('../models/User');
const { createNotification } = require('../services/notificationService');
const logAudit = require('../utils/auditLogger');

const getCompOffs = async (req, res, next) => {
  try {
    const query = { company: req.user.company._id };

    if (req.user.role === 'employee') {
      query.employee = req.user._id;
    } else if (req.user.role === 'manager') {
      const team = await User.find({ company: req.user.company._id, manager: req.user._id }).select('_id');
      const teamIds = team.map((t) => t._id);
      teamIds.push(req.user._id);
      query.employee = { $in: teamIds };
    }

    const compOffs = await CompOff.find(query)
      .populate('employee', 'name employeeId department')
      .populate({ path: 'employee', populate: { path: 'department', select: 'name' } })
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: compOffs });
  } catch (error) {
    next(error);
  }
};

const applyCompOff = async (req, res, next) => {
  try {
    const { workDate, reason, earnedDays } = req.body;

    const expiryDate = new Date(workDate);
    expiryDate.setDate(expiryDate.getDate() + 90); // 90 days validity

    const compOff = await CompOff.create({
      company: req.user.company._id,
      employee: req.user._id,
      workDate,
      reason,
      earnedDays: earnedDays || 1,
      expiryDate,
      status: 'pending'
    });

    if (req.user.manager) {
      await createNotification({
        company: req.user.company._id,
        user: req.user.manager,
        title: 'Comp-Off Request Pending',
        message: `${req.user.name} requested Comp-Off for work on ${new Date(workDate).toLocaleDateString()}.`,
        type: 'comp_off',
        referenceId: compOff._id
      });
    }

    await logAudit({
      company: req.user.company._id,
      action: 'COMP_OFF_REQUESTED',
      performedBy: req.user._id,
      targetEntity: 'CompOff',
      targetId: compOff._id,
      details: `Requested ${earnedDays || 1} day(s) comp-off for ${new Date(workDate).toLocaleDateString()}`
    });

    res.status(201).json({ success: true, data: compOff });
  } catch (error) {
    next(error);
  }
};

const approveCompOff = async (req, res, next) => {
  try {
    const compOff = await CompOff.findOne({ _id: req.params.id, company: req.user.company._id }).populate('employee');
    if (!compOff) {
      return res.status(404).json({ success: false, message: 'Comp-Off request not found' });
    }

    if (compOff.status !== 'pending') {
      return res.status(400).json({ success: false, message: `Request is already ${compOff.status}` });
    }

    compOff.status = 'approved';
    compOff.approvedBy = req.user._id;
    await compOff.save();

    let compOffType = await LeaveType.findOne({ company: req.user.company._id, name: { $regex: 'Comp-Off', $options: 'i' } });
    if (!compOffType) {
      compOffType = await LeaveType.findOne({ company: req.user.company._id, status: 'active' });
    }

    if (compOffType) {
      const year = new Date(compOff.workDate).getFullYear();
      await LeaveBalance.findOneAndUpdate(
        {
          company: req.user.company._id,
          employee: compOff.employee._id,
          leaveType: compOffType._id,
          year: year
        },
        {
          $inc: { compOffDays: compOff.earnedDays, remainingDays: compOff.earnedDays }
        },
        { upsert: true, new: true }
      );
    }

    await createNotification({
      company: req.user.company._id,
      user: compOff.employee._id,
      title: 'Comp-Off Approved',
      message: `Your Comp-Off request for ${new Date(compOff.workDate).toLocaleDateString()} has been approved.`,
      type: 'comp_off',
      referenceId: compOff._id
    });

    await logAudit({
      company: req.user.company._id,
      action: 'COMP_OFF_APPROVED',
      performedBy: req.user._id,
      targetEntity: 'CompOff',
      targetId: compOff._id,
      details: `Approved comp-off for ${compOff.employee.name}`
    });

    res.status(200).json({ success: true, data: compOff });
  } catch (error) {
    next(error);
  }
};

const rejectCompOff = async (req, res, next) => {
  try {
    const compOff = await CompOff.findOne({ _id: req.params.id, company: req.user.company._id }).populate('employee');
    if (!compOff) {
      return res.status(404).json({ success: false, message: 'Comp-Off request not found' });
    }

    compOff.status = 'rejected';
    compOff.approvedBy = req.user._id;
    await compOff.save();

    await createNotification({
      company: req.user.company._id,
      user: compOff.employee._id,
      title: 'Comp-Off Rejected',
      message: `Your Comp-Off request for ${new Date(compOff.workDate).toLocaleDateString()} was rejected.`,
      type: 'comp_off',
      referenceId: compOff._id
    });

    res.status(200).json({ success: true, data: compOff });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCompOffs,
  applyCompOff,
  approveCompOff,
  rejectCompOff
};
