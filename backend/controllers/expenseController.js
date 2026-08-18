const ExpenseClaim = require('../models/ExpenseClaim');
const User = require('../models/User');
const { createNotification } = require('../services/notificationService');
const logAudit = require('../utils/auditLogger');

const getExpenses = async (req, res, next) => {
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

    const expenses = await ExpenseClaim.find(query)
      .populate('employee', 'name employeeId department')
      .populate({ path: 'employee', populate: { path: 'department', select: 'name' } })
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: expenses });
  } catch (error) {
    next(error);
  }
};

const createExpense = async (req, res, next) => {
  try {
    const { category, amount, expenseDate, description } = req.body;
    const receipt = req.file ? `/uploads/${req.file.filename}` : req.body.receipt || '';

    const expense = await ExpenseClaim.create({
      company: req.user.company._id,
      employee: req.user._id,
      category,
      amount: parseFloat(amount),
      expenseDate,
      description: description || '',
      receipt,
      status: 'pending'
    });

    if (req.user.manager) {
      await createNotification({
        company: req.user.company._id,
        user: req.user.manager,
        title: 'New Expense Claim Submitted',
        message: `${req.user.name} submitted an expense claim of $${amount} for ${category}.`,
        type: 'expense',
        referenceId: expense._id
      });
    }

    await logAudit({
      company: req.user.company._id,
      action: 'EXPENSE_SUBMITTED',
      performedBy: req.user._id,
      targetEntity: 'ExpenseClaim',
      targetId: expense._id,
      details: `Submitted expense claim of $${amount} (${category})`
    });

    res.status(201).json({ success: true, data: expense });
  } catch (error) {
    next(error);
  }
};

const updateExpenseStatus = async (req, res, next) => {
  try {
    const { status } = req.body; // approved, rejected, paid
    if (!['approved', 'rejected', 'paid'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const expense = await ExpenseClaim.findOne({ _id: req.params.id, company: req.user.company._id }).populate('employee');
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense claim not found' });
    }

    expense.status = status;
    expense.approvedBy = req.user._id;
    expense.approvedAt = new Date();
    await expense.save();

    await createNotification({
      company: req.user.company._id,
      user: expense.employee._id,
      title: `Expense Claim ${status.toUpperCase()}`,
      message: `Your expense claim of $${expense.amount} for ${expense.category} status updated to: ${status}.`,
      type: 'expense',
      referenceId: expense._id
    });

    await logAudit({
      company: req.user.company._id,
      action: `EXPENSE_${status.toUpperCase()}`,
      performedBy: req.user._id,
      targetEntity: 'ExpenseClaim',
      targetId: expense._id,
      details: `Updated expense claim status to ${status} for ${expense.employee.name}`
    });

    res.status(200).json({ success: true, data: expense });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getExpenses,
  createExpense,
  updateExpenseStatus
};
