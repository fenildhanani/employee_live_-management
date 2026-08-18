const LeaveType = require('../models/LeaveType');
const logAudit = require('../utils/auditLogger');

const getLeaveTypes = async (req, res, next) => {
  try {
    const leaveTypes = await LeaveType.find({ company: req.user.company._id }).sort({ name: 1 });
    res.status(200).json({ success: true, data: leaveTypes });
  } catch (error) {
    next(error);
  }
};

const getLeaveTypeById = async (req, res, next) => {
  try {
    const leaveType = await LeaveType.findOne({ _id: req.params.id, company: req.user.company._id });
    if (!leaveType) {
      return res.status(404).json({ success: false, message: 'Leave type not found' });
    }
    res.status(200).json({ success: true, data: leaveType });
  } catch (error) {
    next(error);
  }
};

const createLeaveType = async (req, res, next) => {
  try {
    const {
      name,
      description,
      annualAllocation,
      paid,
      maxConsecutiveDays,
      minimumNoticeDays,
      carryForwardAllowed,
      maxCarryForward,
      requiresDocument
    } = req.body;

    const existing = await LeaveType.findOne({ company: req.user.company._id, name: { $regex: `^${name}$`, $options: 'i' } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Leave type with this name already exists' });
    }

    const leaveType = await LeaveType.create({
      company: req.user.company._id,
      name,
      description: description || '',
      annualAllocation: annualAllocation !== undefined ? annualAllocation : 12,
      paid: paid !== undefined ? paid : true,
      maxConsecutiveDays: maxConsecutiveDays || 14,
      minimumNoticeDays: minimumNoticeDays || 1,
      carryForwardAllowed: carryForwardAllowed || false,
      maxCarryForward: maxCarryForward || 0,
      requiresDocument: requiresDocument || false,
      status: 'active'
    });

    await logAudit({
      company: req.user.company._id,
      action: 'LEAVE_TYPE_CREATED',
      performedBy: req.user._id,
      targetEntity: 'LeaveType',
      targetId: leaveType._id,
      details: `Created leave type ${leaveType.name}`
    });

    res.status(201).json({ success: true, data: leaveType });
  } catch (error) {
    next(error);
  }
};

const updateLeaveType = async (req, res, next) => {
  try {
    const leaveType = await LeaveType.findOne({ _id: req.params.id, company: req.user.company._id });

    if (!leaveType) {
      return res.status(404).json({ success: false, message: 'Leave type not found' });
    }

    const fields = [
      'name',
      'description',
      'annualAllocation',
      'paid',
      'maxConsecutiveDays',
      'minimumNoticeDays',
      'carryForwardAllowed',
      'maxCarryForward',
      'requiresDocument',
      'status'
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        leaveType[field] = req.body[field];
      }
    });

    await leaveType.save();

    await logAudit({
      company: req.user.company._id,
      action: 'LEAVE_TYPE_UPDATED',
      performedBy: req.user._id,
      targetEntity: 'LeaveType',
      targetId: leaveType._id,
      details: `Updated leave type ${leaveType.name}`
    });

    res.status(200).json({ success: true, data: leaveType });
  } catch (error) {
    next(error);
  }
};

const deleteLeaveType = async (req, res, next) => {
  try {
    const leaveType = await LeaveType.findOneAndDelete({ _id: req.params.id, company: req.user.company._id });
    if (!leaveType) {
      return res.status(404).json({ success: false, message: 'Leave type not found' });
    }

    await logAudit({
      company: req.user.company._id,
      action: 'LEAVE_TYPE_DELETED',
      performedBy: req.user._id,
      targetEntity: 'LeaveType',
      targetId: req.params.id,
      details: `Deleted leave type ${leaveType.name}`
    });

    res.status(200).json({ success: true, message: 'Leave type deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLeaveTypes,
  getLeaveTypeById,
  createLeaveType,
  updateLeaveType,
  deleteLeaveType
};
