const Department = require('../models/Department');
const logAudit = require('../utils/auditLogger');

const getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find({ company: req.user.company._id }).sort({ name: 1 });
    res.status(200).json({ success: true, data: departments });
  } catch (error) {
    next(error);
  }
};

const getDepartmentById = async (req, res, next) => {
  try {
    const department = await Department.findOne({ _id: req.params.id, company: req.user.company._id });
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }
    res.status(200).json({ success: true, data: department });
  } catch (error) {
    next(error);
  }
};

const createDepartment = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const existing = await Department.findOne({ company: req.user.company._id, name: { $regex: `^${name}$`, $options: 'i' } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Department name already exists' });
    }

    const department = await Department.create({
      company: req.user.company._id,
      name,
      description: description || ''
    });

    await logAudit({
      company: req.user.company._id,
      action: 'DEPARTMENT_CREATED',
      performedBy: req.user._id,
      targetEntity: 'Department',
      targetId: department._id,
      details: `Created department ${department.name}`
    });

    res.status(201).json({ success: true, data: department });
  } catch (error) {
    next(error);
  }
};

const updateDepartment = async (req, res, next) => {
  try {
    const { name, description, status } = req.body;
    const department = await Department.findOne({ _id: req.params.id, company: req.user.company._id });

    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    if (name) department.name = name;
    if (description !== undefined) department.description = description;
    if (status) department.status = status;

    await department.save();

    await logAudit({
      company: req.user.company._id,
      action: 'DEPARTMENT_UPDATED',
      performedBy: req.user._id,
      targetEntity: 'Department',
      targetId: department._id,
      details: `Updated department ${department.name}`
    });

    res.status(200).json({ success: true, data: department });
  } catch (error) {
    next(error);
  }
};

const deleteDepartment = async (req, res, next) => {
  try {
    const department = await Department.findOneAndDelete({ _id: req.params.id, company: req.user.company._id });
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    await logAudit({
      company: req.user.company._id,
      action: 'DEPARTMENT_DELETED',
      performedBy: req.user._id,
      targetEntity: 'Department',
      targetId: req.params.id,
      details: `Deleted department ${department.name}`
    });

    res.status(200).json({ success: true, message: 'Department deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment
};
