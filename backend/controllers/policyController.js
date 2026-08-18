const LeavePolicy = require('../models/LeavePolicy');
const logAudit = require('../utils/auditLogger');

const getPolicies = async (req, res, next) => {
  try {
    const policies = await LeavePolicy.find({ company: req.user.company._id })
      .populate('leaveType department grade')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: policies });
  } catch (error) {
    next(error);
  }
};

const createPolicy = async (req, res, next) => {
  try {
    const {
      leaveType,
      department,
      grade,
      location,
      allocation,
      maxConsecutiveDays,
      minimumNoticeDays,
      carryForwardAllowed,
      maxCarryForward
    } = req.body;

    const policy = await LeavePolicy.create({
      company: req.user.company._id,
      leaveType,
      department: department || null,
      grade: grade || null,
      location: location || '',
      allocation,
      maxConsecutiveDays: maxConsecutiveDays || 14,
      minimumNoticeDays: minimumNoticeDays || 1,
      carryForwardAllowed: carryForwardAllowed || false,
      maxCarryForward: maxCarryForward || 0,
      status: 'active'
    });

    await logAudit({
      company: req.user.company._id,
      action: 'LEAVE_POLICY_CREATED',
      performedBy: req.user._id,
      targetEntity: 'LeavePolicy',
      targetId: policy._id,
      details: `Created leave policy for type ${leaveType}`
    });

    const populated = await LeavePolicy.findById(policy._id).populate('leaveType department grade');
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

const updatePolicy = async (req, res, next) => {
  try {
    const policy = await LeavePolicy.findOne({ _id: req.params.id, company: req.user.company._id });

    if (!policy) {
      return res.status(404).json({ success: false, message: 'Policy not found' });
    }

    const fields = [
      'department',
      'grade',
      'location',
      'allocation',
      'maxConsecutiveDays',
      'minimumNoticeDays',
      'carryForwardAllowed',
      'maxCarryForward',
      'status'
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        policy[field] = req.body[field];
      }
    });

    await policy.save();

    await logAudit({
      company: req.user.company._id,
      action: 'LEAVE_POLICY_UPDATED',
      performedBy: req.user._id,
      targetEntity: 'LeavePolicy',
      targetId: policy._id,
      details: `Updated policy ${policy._id}`
    });

    const populated = await LeavePolicy.findById(policy._id).populate('leaveType department grade');
    res.status(200).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

const deletePolicy = async (req, res, next) => {
  try {
    const policy = await LeavePolicy.findOneAndDelete({ _id: req.params.id, company: req.user.company._id });
    if (!policy) {
      return res.status(404).json({ success: false, message: 'Policy not found' });
    }

    await logAudit({
      company: req.user.company._id,
      action: 'LEAVE_POLICY_DELETED',
      performedBy: req.user._id,
      targetEntity: 'LeavePolicy',
      targetId: req.params.id,
      details: `Deleted policy ${policy._id}`
    });

    res.status(200).json({ success: true, message: 'Policy deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPolicies,
  createPolicy,
  updatePolicy,
  deletePolicy
};
