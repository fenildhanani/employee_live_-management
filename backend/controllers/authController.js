const User = require('../models/User');
const Company = require('../models/Company');
const generateToken = require('../utils/generateToken');
const { initializeEmployeeBalances } = require('../services/balanceService');
const logAudit = require('../utils/auditLogger');

const registerCompanyAndAdmin = async (req, res, next) => {
  try {
    const { companyName, companyEmail, adminName, adminEmail, adminPassword } = req.body;

    let company = await Company.findOne({ email: companyEmail.toLowerCase() });
    if (company) {
      return res.status(400).json({ success: false, message: 'Company with this email already exists' });
    }

    let userExists = await User.findOne({ email: adminEmail.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    company = await Company.create({
      name: companyName,
      email: companyEmail
    });

    const adminUser = await User.create({
      company: company._id,
      employeeId: 'ADM-001',
      name: adminName,
      email: adminEmail,
      password: adminPassword,
      role: 'hr_admin',
      status: 'active'
    });

    const token = generateToken(adminUser._id, adminUser.role, company._id);

    await logAudit({
      company: company._id,
      action: 'COMPANY_REGISTERED',
      performedBy: adminUser._id,
      details: `Registered company ${company.name} and initial HR Admin`
    });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: adminUser._id,
        employeeId: adminUser.employeeId,
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role,
        company: company._id
      }
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).populate('company department grade manager');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ success: false, message: 'Your account is inactive. Please contact HR.' });
    }

    const token = generateToken(user._id, user.role, user.company._id);

    await logAudit({
      company: user.company._id,
      action: 'USER_LOGIN',
      performedBy: user._id,
      details: `User ${user.email} logged in`
    });

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        employeeId: user.employeeId,
        name: user.name,
        email: user.email,
        role: user.role,
        company: user.company,
        department: user.department,
        manager: user.manager,
        grade: user.grade,
        joiningDate: user.joiningDate,
        location: user.location,
        phone: user.phone,
        profileImage: user.profileImage
      }
    });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password').populate('company department grade manager');
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    if (req.user) {
      await logAudit({
        company: req.user.company,
        action: 'USER_LOGOUT',
        performedBy: req.user._id,
        details: `User ${req.user.email} logged out`
      });
    }
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerCompanyAndAdmin,
  login,
  getMe,
  logout
};
