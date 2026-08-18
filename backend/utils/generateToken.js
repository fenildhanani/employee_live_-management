const jwt = require('jsonwebtoken');

const generateToken = (id, role, companyId) => {
  return jwt.sign(
    { id, role, company: companyId },
    process.env.JWT_SECRET || 'fallback_secret',
    { expiresIn: '30d' }
  );
};

module.exports = generateToken;
