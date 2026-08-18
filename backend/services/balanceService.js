const LeaveBalance = require('../models/LeaveBalance');
const LeaveType = require('../models/LeaveType');
const User = require('../models/User');
const { getApplicablePolicy } = require('./leaveService');

const initializeEmployeeBalances = async (companyId, employeeId, year = new Date().getFullYear()) => {
  const employee = await User.findById(employeeId);
  if (!employee) return;

  const leaveTypes = await LeaveType.find({ company: companyId, status: 'active' });

  for (const lt of leaveTypes) {
    const existing = await LeaveBalance.findOne({
      company: companyId,
      employee: employeeId,
      leaveType: lt._id,
      year: year
    });

    if (!existing) {
      const policy = await getApplicablePolicy(companyId, lt._id, employee.department, employee.grade);
      const allocated = policy ? policy.allocation : lt.annualAllocation;

      await LeaveBalance.create({
        company: companyId,
        employee: employeeId,
        leaveType: lt._id,
        year: year,
        allocatedDays: allocated,
        carryForwardDays: 0,
        compOffDays: 0,
        usedDays: 0,
        pendingDays: 0,
        remainingDays: allocated
      });
    }
  }
};

const processCarryForwardForYear = async (companyId, targetYear) => {
  const prevYear = targetYear - 1;
  const employees = await User.find({ company: companyId, status: 'active' });
  const leaveTypes = await LeaveType.find({ company: companyId, status: 'active' });

  for (const emp of employees) {
    for (const lt of leaveTypes) {
      const policy = await getApplicablePolicy(companyId, lt._id, emp.department, emp.grade);
      const isCarryAllowed = policy ? policy.carryForwardAllowed : lt.carryForwardAllowed;
      const maxCarry = policy ? policy.maxCarryForward : lt.maxCarryForward;

      let carryForward = 0;
      if (isCarryAllowed && maxCarry > 0) {
        const prevBal = await LeaveBalance.findOne({
          company: companyId,
          employee: emp._id,
          leaveType: lt._id,
          year: prevYear
        });

        if (prevBal && prevBal.remainingDays > 0) {
          carryForward = Math.min(prevBal.remainingDays, maxCarry);
        }
      }

      const allocated = policy ? policy.allocation : lt.annualAllocation;

      await LeaveBalance.findOneAndUpdate(
        {
          company: companyId,
          employee: emp._id,
          leaveType: lt._id,
          year: targetYear
        },
        {
          allocatedDays: allocated,
          carryForwardDays: carryForward,
          remainingDays: allocated + carryForward
        },
        { upsert: true, new: true }
      );
    }
  }
};

module.exports = {
  initializeEmployeeBalances,
  processCarryForwardForYear
};
