const LeaveRequest = require('../models/LeaveRequest');

const generatePayrollDeductionsPayload = async (companyId, month, year) => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  const unpaidLeaves = await LeaveRequest.find({
    company: companyId,
    status: 'approved',
    startDate: { $gte: startDate, $lte: endDate }
  }).populate('employee leaveType');

  const deductions = unpaidLeaves
    .filter((lr) => lr.leaveType && !lr.leaveType.paid)
    .map((lr) => ({
      employeeId: lr.employee.employeeId,
      employeeName: lr.employee.name,
      unpaidLeaveDays: lr.totalDays,
      leaveType: lr.leaveType.name,
      period: `${year}-${month}`
    }));

  return deductions;
};

const exportToPayrollSystem = async (companyId, month, year, apiEndpoint) => {
  const payload = await generatePayrollDeductionsPayload(companyId, month, year);
  console.log(`[Payroll API Integration] Sending payload to ${apiEndpoint || 'External Payroll Engine'}:`, payload);
  return { success: true, recordsProcessed: payload.length, data: payload };
};

module.exports = {
  generatePayrollDeductionsPayload,
  exportToPayrollSystem
};
