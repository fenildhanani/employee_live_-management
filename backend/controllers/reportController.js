const LeaveRequest = require('../models/LeaveRequest');
const Attendance = require('../models/Attendance');
const CompOff = require('../models/CompOff');
const ExpenseClaim = require('../models/ExpenseClaim');
const User = require('../models/User');

const getLeaveReport = async (req, res, next) => {
  try {
    const { startDate, endDate, department, status, format } = req.query;
    const query = { company: req.user.company._id };

    if (startDate && endDate) {
      query.startDate = { $gte: new Date(startDate) };
      query.endDate = { $lte: new Date(endDate) };
    }
    if (status) query.status = status;

    let leaves = await LeaveRequest.find(query)
      .populate('employee', 'name employeeId department')
      .populate({ path: 'employee', populate: { path: 'department', select: 'name' } })
      .populate('leaveType', 'name paid')
      .sort({ startDate: -1 });

    if (department) {
      leaves = leaves.filter((l) => l.employee && l.employee.department && l.employee.department._id.toString() === department);
    }

    if (format === 'csv') {
      let csv = 'Employee ID,Employee Name,Department,Leave Type,Start Date,End Date,Total Days,Status,Reason\n';
      leaves.forEach((l) => {
        const empId = l.employee ? l.employee.employeeId : '';
        const empName = l.employee ? l.employee.name : '';
        const deptName = l.employee && l.employee.department ? l.employee.department.name : '';
        const ltName = l.leaveType ? l.leaveType.name : '';
        const sDate = new Date(l.startDate).toLocaleDateString();
        const eDate = new Date(l.endDate).toLocaleDateString();
        csv += `"${empId}","${empName}","${deptName}","${ltName}","${sDate}","${eDate}",${l.totalDays},"${l.status}","${l.reason.replace(/"/g, '""')}"\n`;
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="leave_report.csv"');
      return res.status(200).send(csv);
    }

    res.status(200).json({ success: true, data: leaves });
  } catch (error) {
    next(error);
  }
};

const getExpenseReport = async (req, res, next) => {
  try {
    const { startDate, endDate, status, format } = req.query;
    const query = { company: req.user.company._id };

    if (startDate && endDate) {
      query.expenseDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    if (status) query.status = status;

    const expenses = await ExpenseClaim.find(query)
      .populate('employee', 'name employeeId department')
      .populate({ path: 'employee', populate: { path: 'department', select: 'name' } })
      .sort({ expenseDate: -1 });

    if (format === 'csv') {
      let csv = 'Employee ID,Employee Name,Category,Amount,Expense Date,Status,Description\n';
      expenses.forEach((e) => {
        const empId = e.employee ? e.employee.employeeId : '';
        const empName = e.employee ? e.employee.name : '';
        const expDate = new Date(e.expenseDate).toLocaleDateString();
        csv += `"${empId}","${empName}","${e.category}",${e.amount},"${expDate}","${e.status}","${e.description.replace(/"/g, '""')}"\n`;
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="expense_report.csv"');
      return res.status(200).send(csv);
    }

    res.status(200).json({ success: true, data: expenses });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLeaveReport,
  getExpenseReport
};
