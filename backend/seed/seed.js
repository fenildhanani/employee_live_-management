const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Company = require('../models/Company');
const User = require('../models/User');
const Department = require('../models/Department');
const Grade = require('../models/Grade');
const LeaveType = require('../models/LeaveType');
const LeavePolicy = require('../models/LeavePolicy');
const LeaveBalance = require('../models/LeaveBalance');
const LeaveRequest = require('../models/LeaveRequest');
const LeaveApproval = require('../models/LeaveApproval');
const Holiday = require('../models/Holiday');
const Attendance = require('../models/Attendance');
const CompOff = require('../models/CompOff');
const Notification = require('../models/Notification');
const ExpenseClaim = require('../models/ExpenseClaim');
const AuditLog = require('../models/AuditLog');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/employee_leave_management';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB for seeding...');

    await Company.deleteMany({});
    await User.deleteMany({});
    await Department.deleteMany({});
    await Grade.deleteMany({});
    await LeaveType.deleteMany({});
    await LeavePolicy.deleteMany({});
    await LeaveBalance.deleteMany({});
    await LeaveRequest.deleteMany({});
    await LeaveApproval.deleteMany({});
    await Holiday.deleteMany({});
    await Attendance.deleteMany({});
    await CompOff.deleteMany({});
    await Notification.deleteMany({});
    await ExpenseClaim.deleteMany({});
    await AuditLog.deleteMany({});

    console.log('Cleared existing data.');

    // 1. Company
    const company = await Company.create({
      name: 'Mord Spark Pvt. Ltd.',
      email: 'hr@mordspark.com',
      phone: '+91-98765-43210',
      address: 'Mord Spark Tech Park, SG Highway, Ahmedabad, Gujarat',
      country: 'India',
      timezone: 'Asia/Kolkata',
      subscriptionPlan: 'Professional',
      subscriptionStatus: 'active'
    });

    // 2. Departments
    const deptNames = ['Engineering', 'Human Resources', 'Sales & Marketing', 'Finance & Ops', 'Product Design'];
    const departments = [];
    for (const name of deptNames) {
      const dept = await Department.create({
        company: company._id,
        name,
        description: `${name} department of Acme Global`
      });
      departments.push(dept);
    }

    // 3. Grades
    const gradeData = [
      { name: 'Grade L1 - Junior', description: 'Entry level engineers and associates' },
      { name: 'Grade L2 - Mid Level', description: 'Experienced professionals' },
      { name: 'Grade L3 - Senior Lead', description: 'Senior leads and staff engineers' },
      { name: 'Grade L4 - Management', description: 'Engineering directors and HR leads' }
    ];
    const grades = [];
    for (const g of gradeData) {
      const grade = await Grade.create({
        company: company._id,
        name: g.name,
        description: g.description
      });
      grades.push(grade);
    }

    // 4. Leave Types
    const leaveTypesData = [
      { name: 'Casual Leave', description: 'Personal time off for short durations', annualAllocation: 12, paid: true, maxConsecutiveDays: 3, minimumNoticeDays: 1, carryForwardAllowed: false },
      { name: 'Sick Leave', description: 'Medical or illness absence', annualAllocation: 10, paid: true, maxConsecutiveDays: 10, minimumNoticeDays: 0, carryForwardAllowed: true, maxCarryForward: 5, requiresDocument: true },
      { name: 'Earned Leave / Annual', description: 'Privilege leave for planned vacations', annualAllocation: 15, paid: true, maxConsecutiveDays: 14, minimumNoticeDays: 5, carryForwardAllowed: true, maxCarryForward: 10 },
      { name: 'Maternity Leave', description: 'Maternity leave for mothers', annualAllocation: 84, paid: true, maxConsecutiveDays: 84, minimumNoticeDays: 30, carryForwardAllowed: false },
      { name: 'Paternity Leave', description: 'Paternity leave for new fathers', annualAllocation: 10, paid: true, maxConsecutiveDays: 10, minimumNoticeDays: 7, carryForwardAllowed: false },
      { name: 'Comp-Off', description: 'Compensation off for overtime weekend work', annualAllocation: 0, paid: true, maxConsecutiveDays: 3, minimumNoticeDays: 1, carryForwardAllowed: false }
    ];

    const leaveTypes = [];
    for (const lt of leaveTypesData) {
      const typeDoc = await LeaveType.create({
        company: company._id,
        ...lt
      });
      leaveTypes.push(typeDoc);
    }

    // 5. Leave Policies
    for (const lt of leaveTypes) {
      await LeavePolicy.create({
        company: company._id,
        leaveType: lt._id,
        department: departments[0]._id, // Engineering specific
        grade: grades[2]._id,
        allocation: lt.annualAllocation + 2,
        maxConsecutiveDays: lt.maxConsecutiveDays,
        minimumNoticeDays: lt.minimumNoticeDays,
        carryForwardAllowed: lt.carryForwardAllowed,
        maxCarryForward: lt.maxCarryForward
      });
    }

    // 6. Users: 1 HR Admin, 3 Managers, 15 Employees
    const passwordHash = 'Password123!';

    const hrAdmin = await User.create({
      company: company._id,
      employeeId: 'EMP-001',
      name: 'Sarah Connor (HR Admin)',
      email: 'hradmin@elms.com',
      password: passwordHash,
      role: 'hr_admin',
      department: departments[1]._id, // HR
      grade: grades[3]._id,
      joiningDate: new Date(2023, 0, 15),
      location: 'San Francisco',
      phone: '+1-555-1001'
    });

    const managers = [];
    const managerNames = [
      { name: 'Alex Rivera (Eng Manager)', email: 'manager1@elms.com', dept: departments[0]._id },
      { name: 'David Miller (Sales Manager)', email: 'manager2@elms.com', dept: departments[2]._id },
      { name: 'Elena Rostova (Design Manager)', email: 'manager3@elms.com', dept: departments[4]._id }
    ];

    for (let i = 0; i < managerNames.length; i++) {
      const m = await User.create({
        company: company._id,
        employeeId: `MGR-00${i + 1}`,
        name: managerNames[i].name,
        email: managerNames[i].email,
        password: passwordHash,
        role: 'manager',
        department: managerNames[i].dept,
        grade: grades[3]._id,
        joiningDate: new Date(2023, 2, 1),
        location: 'San Francisco',
        phone: `+1-555-200${i + 1}`
      });
      managers.push(m);
    }

    const employeeList = [];
    for (let i = 1; i <= 15; i++) {
      const assignedManager = managers[i % managers.length];
      const assignedDept = assignedManager.department;
      const assignedGrade = grades[i % grades.length];

      const emp = await User.create({
        company: company._id,
        employeeId: `EMP-${100 + i}`,
        name: `Employee ${i} (${assignedDept ? 'Staff' : 'Dev'})`,
        email: i === 1 ? 'employee@elms.com' : `employee${i}@elms.com`,
        password: passwordHash,
        role: 'employee',
        department: assignedDept,
        manager: assignedManager._id,
        grade: assignedGrade._id,
        joiningDate: new Date(2024, (i % 11), 10),
        location: i % 2 === 0 ? 'Ahmedabad' : 'Bengaluru',
        phone: `+91-98765-30${i < 10 ? '0' + i : i}`
      });
      employeeList.push(emp);
    }

    console.log(`Created ${1 + managers.length + employeeList.length} total users.`);

    // 7. Initialize Leave Balances
    const currentYear = new Date().getFullYear();
    const allUsers = [hrAdmin, ...managers, ...employeeList];

    for (const u of allUsers) {
      for (const lt of leaveTypes) {
        const alloc = lt.annualAllocation;
        const used = Math.floor(Math.random() * 4);
        await LeaveBalance.create({
          company: company._id,
          employee: u._id,
          leaveType: lt._id,
          year: currentYear,
          allocatedDays: alloc,
          carryForwardDays: lt.carryForwardAllowed ? 2 : 0,
          compOffDays: 1,
          usedDays: used,
          pendingDays: 0,
          remainingDays: alloc + (lt.carryForwardAllowed ? 2 : 0) + 1 - used
        });
      }
    }

    // 8. Holidays
    const holidaysData = [
      { name: "New Year's Day", date: new Date(currentYear, 0, 1), holidayType: 'National' },
      { name: 'Memorial Day', date: new Date(currentYear, 4, 27), holidayType: 'National' },
      { name: 'Independence Day', date: new Date(currentYear, 6, 4), holidayType: 'National' },
      { name: 'Labor Day', date: new Date(currentYear, 8, 2), holidayType: 'National' },
      { name: 'Thanksgiving Day', date: new Date(currentYear, 10, 26), holidayType: 'National' },
      { name: 'Company Foundation Day', date: new Date(currentYear, 9, 15), holidayType: 'Company' },
      { name: 'Christmas Day', date: new Date(currentYear, 11, 25), holidayType: 'National' }
    ];

    for (const h of holidaysData) {
      await Holiday.create({
        company: company._id,
        name: h.name,
        date: h.date,
        location: 'All',
        holidayType: h.holidayType,
        description: `Official holiday for ${h.name}`
      });
    }

    // 9. Leave Requests & Approvals
    const sampleLeaveReq = await LeaveRequest.create({
      company: company._id,
      employee: employeeList[0]._id, // employee@elms.com
      leaveType: leaveTypes[0]._id, // Casual
      startDate: new Date(currentYear, 8, 10),
      endDate: new Date(currentYear, 8, 11),
      startSession: 'Full Day',
      endSession: 'Full Day',
      totalDays: 2,
      reason: 'Attending family event in hometown',
      status: 'pending'
    });

    await LeaveRequest.create({
      company: company._id,
      employee: employeeList[0]._id,
      leaveType: leaveTypes[1]._id, // Sick
      startDate: new Date(currentYear, 5, 12),
      endDate: new Date(currentYear, 5, 12),
      startSession: 'Full Day',
      endSession: 'Full Day',
      totalDays: 1,
      reason: 'Fever and rest advised by doctor',
      status: 'approved'
    });

    await LeaveApproval.create({
      leaveRequest: sampleLeaveReq._id,
      approver: managers[0]._id,
      action: 'approved',
      comment: 'Approved. Enjoy your time off!',
      actionDate: new Date()
    });

    // 10. Attendance records
    for (const u of employeeList.slice(0, 5)) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      await Attendance.create({
        company: company._id,
        employee: u._id,
        attendanceDate: today,
        checkIn: new Date(today.getTime() + 9 * 60 * 60 * 1000), // 9 AM
        checkOut: new Date(today.getTime() + 17 * 60 * 60 * 1000), // 5 PM
        workingHours: 8,
        status: 'present',
        source: 'system'
      });
    }

    // 11. Comp-Off Request
    await CompOff.create({
      company: company._id,
      employee: employeeList[0]._id,
      workDate: new Date(currentYear, 7, 3), // Worked on Saturday
      reason: 'Critical server deployment over weekend',
      earnedDays: 1,
      status: 'pending'
    });

    // 12. Expense Claim
    await ExpenseClaim.create({
      company: company._id,
      employee: employeeList[0]._id,
      category: 'Travel & Transport',
      amount: 145.5,
      expenseDate: new Date(currentYear, 7, 1),
      description: 'Client meeting taxi fare',
      status: 'pending'
    });

    // 13. Notifications
    await Notification.create({
      company: company._id,
      user: employeeList[0]._id,
      title: 'Welcome to ELMS',
      message: 'Your employee profile and leave balances have been initialized.',
      type: 'system',
      isRead: false
    });

    console.log('Seeding completed successfully!');
    console.log('=============================================================');
    console.log('DEMO CREDENTIALS FOR TESTING:');
    console.log('-------------------------------------------------------------');
    console.log('HR Admin  : hradmin@elms.com   | Password: Password123!');
    console.log('Manager   : manager1@elms.com  | Password: Password123!');
    console.log('Employee  : employee@elms.com  | Password: Password123!');
    console.log('=============================================================');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Seeding Error:', error);
    process.exit(1);
  }
};

seedData();
