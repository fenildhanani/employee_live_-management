import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Sidebar = ({ show, onClose }) => {
  const { user, logout } = useContext(AuthContext);
  const role = user?.role || 'employee';

  const employeeLinks = [
    { to: '/employee/dashboard', label: 'Dashboard', icon: 'bi-grid-fill' },
    { to: '/employee/profile', label: 'My Profile', icon: 'bi-person-badge-fill' },
    { to: '/employee/apply-leave', label: 'Apply Leave', icon: 'bi-file-earmark-plus-fill' },
    { to: '/employee/my-leaves', label: 'My Leaves', icon: 'bi-journal-bookmark-fill' },
    { to: '/employee/leave-balance', label: 'Leave Balance', icon: 'bi-pie-chart-fill' },
    { to: '/employee/holidays', label: 'Holiday Calendar', icon: 'bi-calendar-event-fill' },
    { to: '/employee/team-calendar', label: 'Team Calendar', icon: 'bi-calendar-week-fill' },
    { to: '/employee/attendance', label: 'Attendance', icon: 'bi-clock-history' },
    { to: '/employee/comp-off', label: 'Comp-Off', icon: 'bi-plus-circle-dotted' },
    { to: '/employee/expenses', label: 'Expenses', icon: 'bi-receipt' },
    { to: '/employee/notifications', label: 'Notifications', icon: 'bi-bell-fill' }
  ];

  const managerLinks = [
    { to: '/manager/dashboard', label: 'Manager Dashboard', icon: 'bi-speedometer2' },
    { to: '/manager/approvals', label: 'Pending Approvals', icon: 'bi-check-circle-fill' },
    { to: '/manager/team', label: 'Team Members', icon: 'bi-people-fill' },
    { to: '/manager/team-calendar', label: 'Team Calendar', icon: 'bi-calendar-range-fill' },
    { to: '/manager/attendance', label: 'Team Attendance', icon: 'bi-clock' },
    { to: '/manager/comp-off', label: 'Comp-Off Approvals', icon: 'bi-plus-circle-fill' },
    { to: '/manager/expenses', label: 'Team Expenses', icon: 'bi-wallet2' },
    { to: '/manager/reports', label: 'Team Reports', icon: 'bi-bar-chart-line-fill' }
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'HR Master Dashboard', icon: 'bi-columns-gap' },
    { to: '/admin/employees', label: 'Employees CRUD', icon: 'bi-people-fill' },
    { to: '/admin/departments', label: 'Departments', icon: 'bi-building' },
    { to: '/admin/grades', label: 'Employee Grades', icon: 'bi-award-fill' },
    { to: '/admin/leave-types', label: 'Leave Types', icon: 'bi-tags-fill' },
    { to: '/admin/policies', label: 'Leave Policies', icon: 'bi-sliders' },
    { to: '/admin/leave-requests', label: 'All Leave Requests', icon: 'bi-card-checklist' },
    { to: '/admin/leave-balances', label: 'Manage Balances', icon: 'bi-wallet-fill' },
    { to: '/admin/holidays', label: 'Holidays Master', icon: 'bi-calendar-check-fill' },
    { to: '/admin/attendance', label: 'Attendance Master', icon: 'bi-calendar3' },
    { to: '/admin/comp-off', label: 'Comp-Off Master', icon: 'bi-plus-square-fill' },
    { to: '/admin/expenses', label: 'Expenses Master', icon: 'bi-cash-stack' },
    { to: '/admin/analytics', label: 'Analytics', icon: 'bi-graph-up-arrow' },
    { to: '/admin/reports', label: 'Export Reports', icon: 'bi-file-earmark-spreadsheet-fill' },
    { to: '/admin/audit-logs', label: 'Audit Logs', icon: 'bi-shield-check' },
    { to: '/admin/subscription', label: 'Subscription', icon: 'bi-credit-card-fill' },
    { to: '/admin/settings', label: 'Company Settings', icon: 'bi-gear-fill' }
  ];

  let links = employeeLinks;
  if (role === 'manager') links = [...managerLinks, ...employeeLinks];
  if (role === 'hr_admin') links = [...adminLinks, ...managerLinks, ...employeeLinks];

  return (
    <aside className={`app-sidebar ${show ? 'show' : ''}`}>
      <div className="p-3 d-flex align-items-center justify-content-between border-bottom border-secondary border-opacity-25">
        <div className="d-flex align-items-center gap-2">
          <i className="bi bi-briefcase-fill text-primary fs-3"></i>
          <span className="fw-bold fs-5 tracking-wide text-white">ELMS SaaS</span>
        </div>
        <button className="btn btn-outline-light btn-sm d-lg-none" onClick={onClose}>
          <i className="bi bi-x-lg"></i>
        </button>
      </div>

      <div className="py-3 overflow-auto" style={{ maxHeight: 'calc(100vh - 140px)' }}>
        <div className="px-3 mb-2 text-uppercase extra-small text-muted fw-bold">
          Navigation ({role.replace('_', ' ')})
        </div>
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <i className={`bi ${link.icon} fs-5`}></i>
            <span>{link.label}</span>
          </NavLink>
        ))}
      </div>

      <div className="position-absolute bottom-0 start-0 end-0 p-3 border-top border-secondary border-opacity-25 bg-dark">
        <div className="text-center extra-small text-white-50 mb-2">
          Developed by <strong className="text-info">Fenil Dhanani</strong>
        </div>
        <button className="btn btn-outline-danger w-100 btn-sm d-flex align-items-center justify-content-center gap-2" onClick={logout}>
          <i className="bi bi-box-arrow-right"></i> Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
