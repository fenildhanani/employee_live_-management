const Grade = require('../models/Grade');
const logAudit = require('../utils/auditLogger');

const getGrades = async (req, res, next) => {
  try {
    const grades = await Grade.find({ company: req.user.company._id }).sort({ name: 1 });
    res.status(200).json({ success: true, data: grades });
  } catch (error) {
    next(error);
  }
};

const createGrade = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const existing = await Grade.findOne({ company: req.user.company._id, name: { $regex: `^${name}$`, $options: 'i' } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Grade name already exists' });
    }

    const grade = await Grade.create({
      company: req.user.company._id,
      name,
      description: description || ''
    });

    await logAudit({
      company: req.user.company._id,
      action: 'GRADE_CREATED',
      performedBy: req.user._id,
      targetEntity: 'Grade',
      targetId: grade._id,
      details: `Created grade ${grade.name}`
    });

    res.status(201).json({ success: true, data: grade });
  } catch (error) {
    next(error);
  }
};

const updateGrade = async (req, res, next) => {
  try {
    const { name, description, status } = req.body;
    const grade = await Grade.findOne({ _id: req.params.id, company: req.user.company._id });

    if (!grade) {
      return res.status(404).json({ success: false, message: 'Grade not found' });
    }

    if (name) grade.name = name;
    if (description !== undefined) grade.description = description;
    if (status) grade.status = status;

    await grade.save();

    await logAudit({
      company: req.user.company._id,
      action: 'GRADE_UPDATED',
      performedBy: req.user._id,
      targetEntity: 'Grade',
      targetId: grade._id,
      details: `Updated grade ${grade.name}`
    });

    res.status(200).json({ success: true, data: grade });
  } catch (error) {
    next(error);
  }
};

const deleteGrade = async (req, res, next) => {
  try {
    const grade = await Grade.findOneAndDelete({ _id: req.params.id, company: req.user.company._id });
    if (!grade) {
      return res.status(404).json({ success: false, message: 'Grade not found' });
    }

    await logAudit({
      company: req.user.company._id,
      action: 'GRADE_DELETED',
      performedBy: req.user._id,
      targetEntity: 'Grade',
      targetId: req.params.id,
      details: `Deleted grade ${grade.name}`
    });

    res.status(200).json({ success: true, message: 'Grade deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getGrades,
  createGrade,
  updateGrade,
  deleteGrade
};
