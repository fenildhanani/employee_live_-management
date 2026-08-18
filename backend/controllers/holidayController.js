const Holiday = require('../models/Holiday');
const logAudit = require('../utils/auditLogger');

const getHolidays = async (req, res, next) => {
  try {
    const year = parseInt(req.query.year, 10) || new Date().getFullYear();
    const location = req.query.location;
    const holidayType = req.query.holidayType;

    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59);

    const query = {
      company: req.user.company._id,
      date: { $gte: startDate, $lte: endDate }
    };

    if (location && location !== 'All') {
      query.location = { $in: [location, 'All'] };
    }
    if (holidayType) query.holidayType = holidayType;

    const holidays = await Holiday.find(query).sort({ date: 1 });
    res.status(200).json({ success: true, data: holidays });
  } catch (error) {
    next(error);
  }
};

const createHoliday = async (req, res, next) => {
  try {
    const { name, date, location, holidayType, description } = req.body;

    const holiday = await Holiday.create({
      company: req.user.company._id,
      name,
      date,
      location: location || 'All',
      holidayType: holidayType || 'National',
      description: description || ''
    });

    await logAudit({
      company: req.user.company._id,
      action: 'HOLIDAY_CREATED',
      performedBy: req.user._id,
      targetEntity: 'Holiday',
      targetId: holiday._id,
      details: `Created holiday ${holiday.name} on ${new Date(holiday.date).toLocaleDateString()}`
    });

    res.status(201).json({ success: true, data: holiday });
  } catch (error) {
    next(error);
  }
};

const updateHoliday = async (req, res, next) => {
  try {
    const holiday = await Holiday.findOne({ _id: req.params.id, company: req.user.company._id });
    if (!holiday) {
      return res.status(404).json({ success: false, message: 'Holiday not found' });
    }

    const fields = ['name', 'date', 'location', 'holidayType', 'description'];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) holiday[f] = req.body[f];
    });

    await holiday.save();

    await logAudit({
      company: req.user.company._id,
      action: 'HOLIDAY_UPDATED',
      performedBy: req.user._id,
      targetEntity: 'Holiday',
      targetId: holiday._id,
      details: `Updated holiday ${holiday.name}`
    });

    res.status(200).json({ success: true, data: holiday });
  } catch (error) {
    next(error);
  }
};

const deleteHoliday = async (req, res, next) => {
  try {
    const holiday = await Holiday.findOneAndDelete({ _id: req.params.id, company: req.user.company._id });
    if (!holiday) {
      return res.status(404).json({ success: false, message: 'Holiday not found' });
    }

    await logAudit({
      company: req.user.company._id,
      action: 'HOLIDAY_DELETED',
      performedBy: req.user._id,
      targetEntity: 'Holiday',
      targetId: req.params.id,
      details: `Deleted holiday ${holiday.name}`
    });

    res.status(200).json({ success: true, message: 'Holiday deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getHolidays,
  createHoliday,
  updateHoliday,
  deleteHoliday
};
