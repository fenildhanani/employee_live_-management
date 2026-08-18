import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './components/ProtectedRoute';

import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

import Login from './pages/auth/Login';

// Employee Pages
import EmployeeDashboard from './pages/employee/Dashboard';
import ProfilePage from './pages/employee/Profile';
import ApplyLeave from './pages/employee/ApplyLeave';
import MyLeaves from './pages/employee/MyLeaves';
import LeaveBalancePage from './pages/employee/LeaveBalance';
import HolidaysPage from './pages/employee/Holidays';
import TeamCalendar from './pages/employee/TeamCalendar';
import AttendancePage from './pages/employee/Attendance';
import CompOffPage from './pages/employee/CompOff';
import ExpensesPage from './pages/employee/Expenses';
import NotificationsPage from './pages/employee/Notifications';

// Manager Pages
import ManagerDashboard from './pages/manager/Dashboard';
import ManagerApprovals from './pages/manager/Approvals';
import ManagerTeam from './pages/manager/Team';
import ManagerCompOff from './pages/manager/CompOff';
import ManagerExpenses from './pages/manager/Expenses';
import ManagerReports from './pages/manager/Reports';

// Admin Pages
import HRDashboard from './pages/admin/Dashboard';
import EmployeesAdmin from './pages/admin/Employees';
import DepartmentsAdmin from './pages/admin/Departments';
import GradesAdmin from './pages/admin/Grades';
import LeaveTypesAdmin from './pages/admin/LeaveTypes';
import LeavePoliciesAdmin from './pages/admin/LeavePolicies';
import LeaveRequestsAdmin from './pages/admin/LeaveRequests';
import LeaveBalancesAdmin from './pages/admin/LeaveBalances';
import HolidaysAdmin from './pages/admin/Holidays';
import AttendanceAdmin from './pages/admin/Attendance';
import CompOffAdmin from './pages/admin/CompOff';
import ExpensesAdmin from './pages/admin/Expenses';
import AnalyticsAdmin from './pages/admin/Analytics';
import ReportsAdmin from './pages/admin/Reports';
import AuditLogsAdmin from './pages/admin/AuditLogs';
import SubscriptionAdmin from './pages/admin/Subscription';
import SettingsAdmin from './pages/admin/Settings';

const DashboardLayout = ({ children }) => {
  const [showSidebar, setShowSidebar] = useState(false);

  return (
    <div className="d-flex">
      <Sidebar show={showSidebar} onClose={() => setShowSidebar(false)} />
      <div className="app-main flex-grow-1">
        <Navbar onToggleSidebar={() => setShowSidebar(!showSidebar)} />
        <main>{children}</main>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />

            {/* Employee Routes */}
            <Route
              path="/employee/*"
              element={
                <ProtectedRoute allowedRoles={['employee', 'manager', 'hr_admin']}>
                  <DashboardLayout>
                    <Routes>
                      <Route path="dashboard" element={<EmployeeDashboard />} />
                      <Route path="profile" element={<ProfilePage />} />
                      <Route path="apply-leave" element={<ApplyLeave />} />
                      <Route path="my-leaves" element={<MyLeaves />} />
                      <Route path="leave-balance" element={<LeaveBalancePage />} />
                      <Route path="holidays" element={<HolidaysPage />} />
                      <Route path="team-calendar" element={<TeamCalendar />} />
                      <Route path="attendance" element={<AttendancePage />} />
                      <Route path="comp-off" element={<CompOffPage />} />
                      <Route path="expenses" element={<ExpensesPage />} />
                      <Route path="notifications" element={<NotificationsPage />} />
                      <Route path="*" element={<Navigate to="dashboard" replace />} />
                    </Routes>
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            {/* Manager Routes */}
            <Route
              path="/manager/*"
              element={
                <ProtectedRoute allowedRoles={['manager', 'hr_admin']}>
                  <DashboardLayout>
                    <Routes>
                      <Route path="dashboard" element={<ManagerDashboard />} />
                      <Route path="approvals" element={<ManagerApprovals />} />
                      <Route path="team" element={<ManagerTeam />} />
                      <Route path="team-calendar" element={<TeamCalendar />} />
                      <Route path="attendance" element={<AttendanceAdmin />} />
                      <Route path="comp-off" element={<ManagerCompOff />} />
                      <Route path="expenses" element={<ManagerExpenses />} />
                      <Route path="reports" element={<ManagerReports />} />
                      <Route path="*" element={<Navigate to="dashboard" replace />} />
                    </Routes>
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            {/* HR Admin Routes */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute allowedRoles={['hr_admin']}>
                  <DashboardLayout>
                    <Routes>
                      <Route path="dashboard" element={<HRDashboard />} />
                      <Route path="employees" element={<EmployeesAdmin />} />
                      <Route path="departments" element={<DepartmentsAdmin />} />
                      <Route path="grades" element={<GradesAdmin />} />
                      <Route path="leave-types" element={<LeaveTypesAdmin />} />
                      <Route path="policies" element={<LeavePoliciesAdmin />} />
                      <Route path="leave-requests" element={<LeaveRequestsAdmin />} />
                      <Route path="leave-balances" element={<LeaveBalancesAdmin />} />
                      <Route path="holidays" element={<HolidaysAdmin />} />
                      <Route path="attendance" element={<AttendanceAdmin />} />
                      <Route path="comp-off" element={<CompOffAdmin />} />
                      <Route path="expenses" element={<ExpensesAdmin />} />
                      <Route path="analytics" element={<AnalyticsAdmin />} />
                      <Route path="reports" element={<ReportsAdmin />} />
                      <Route path="audit-logs" element={<AuditLogsAdmin />} />
                      <Route path="subscription" element={<SubscriptionAdmin />} />
                      <Route path="settings" element={<SettingsAdmin />} />
                      <Route path="*" element={<Navigate to="dashboard" replace />} />
                    </Routes>
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  );
};

export default App;
