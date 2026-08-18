const User = require('../models/User');
const { initializeEmployeeBalances } = require('../services/balanceService');
const logAudit = require('../utils/auditLogger');

const getEmployees = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search || '';
    const department = req.query.department;
    const role = req.query.role;
    const status = req.query.status;

    const query = { company: req.user.company._id };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } }
      ];
    }

    if (department) query.department = department;
    if (role) query.role = role;
    if (status) query.status = status;

    const total = await User.countDocuments(query);
    const employees = await User.find(query)
      .select('-password')
      .populate('department grade manager')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: employees,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    next(error);
  }
};

const getEmployeeById = async (req, res, next) => {
  try {
    const employee = await User.findOne({
      _id: req.params.id,
      company: req.user.company._id
    }).select('-password').populate('department grade manager');

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    res.status(200).json({ success: true, data: employee });
  } catch (error) {
    next(error);
  }
};

const createEmployee = async (req, res, next) => {
  try {
    const { employeeId, name, email, password, role, department, manager, grade, joiningDate, location, phone } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const employee = await User.create({
      company: req.user.company._id,
      employeeId,
      name,
      email,
      password: password || 'Password123!',
      role: role || 'employee',
      department: department || null,
      manager: manager || null,
      grade: grade || null,
      joiningDate: joiningDate || Date.now(),
      location: location || 'Headquarters',
      phone: phone || ''
    });

    await initializeEmployeeBalances(req.user.company._id, employee._id);

    await logAudit({
      company: req.user.company._id,
      action: 'EMPLOYEE_CREATED',
      performedBy: req.user._id,
      targetEntity: 'User',
      targetId: employee._id,
      details: `Created employee ${employee.name} (${employee.employeeId})`
    });

    const populated = await User.findById(employee._id).select('-password').populate('department grade manager');
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

const updateEmployee = async (req, res, next) => {
  try {
    const { name, email, role, department, manager, grade, joiningDate, location, phone } = req.body;

    const employee = await User.findOne({ _id: req.params.id, company: req.user.company._id });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    if (name) employee.name = name;
    if (email) employee.email = email.toLowerCase();
    if (role) employee.role = role;
    if (department !== undefined) employee.department = department || null;
    if (manager !== undefined) employee.manager = manager || null;
    if (grade !== undefined) employee.grade = grade || null;
    if (joiningDate) employee.joiningDate = joiningDate;
    if (location) employee.location = location;
    if (phone) employee.phone = phone;

    await employee.save();

    await logAudit({
      company: req.user.company._id,
      action: 'EMPLOYEE_UPDATED',
      performedBy: req.user._id,
      targetEntity: 'User',
      targetId: employee._id,
      details: `Updated details for employee ${employee.name}`
    });

    const updated = await User.findById(employee._id).select('-password').populate('department grade manager');
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

const updateEmployeeStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['active', 'inactive', 'terminated'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const employee = await User.findOne({ _id: req.params.id, company: req.user.company._id });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    employee.status = status;
    await employee.save();

    await logAudit({
      company: req.user.company._id,
      action: status === 'inactive' ? 'EMPLOYEE_DEACTIVATED' : 'EMPLOYEE_STATUS_CHANGED',
      performedBy: req.user._id,
      targetEntity: 'User',
      targetId: employee._id,
      details: `Changed employee status to ${status} for ${employee.name}`
    });

    res.status(200).json({ success: true, data: employee });
  } catch (error) {
    next(error);
  }
};

const deleteEmployee = async (req, res, next) => {
  try {
    const employee = await User.findOneAndDelete({ _id: req.params.id, company: req.user.company._id });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    await logAudit({
      company: req.user.company._id,
      action: 'EMPLOYEE_DELETED',
      performedBy: req.user._id,
      targetEntity: 'User',
      targetId: req.params.id,
      details: `Deleted employee ${employee.name}`
    });

    res.status(200).json({ success: true, message: 'Employee deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  updateEmployeeStatus,
  deleteEmployee
};
