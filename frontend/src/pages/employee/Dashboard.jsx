import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import DashboardCard from '../../components/DashboardCard';
import StatusBadge from '../../components/StatusBadge';
import Loading from '../../components/Loading';
import { fetchMyLeaveBalances, fetchLeaves } from '../../services/leaveService';
import api from '../../services/api';
import { formatDate } from '../../utils/dateUtils';
import { NavLink } from 'react-router-dom';

const EmployeeDashboard = () => {
  const { user } = useContext(AuthContext);
  const [balances, setBalances] = useState([]);
  const [recentLeaves, setRecentLeaves] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [attendance, setAttendance] = useState(null);

  const loadDashboardData = async () => {
    try {
      const [balRes, leaveRes, hldyRes, attRes] = await Promise.all([
        fetchMyLeaveBalances(new Date().getFullYear()),
        fetchLeaves({ limit: 5 }),
        api.get('/holidays'),
        api.get('/attendance')
      ]);

      setBalances(balRes.data || []);
      setRecentLeaves(leaveRes.data || []);
      setHolidays((hldyRes.data.data || []).slice(0, 4));

      const todayAtt = (attRes.data.data || []).find((a) => new Date(a.attendanceDate).toDateString() === new Date().toDateString());
      setAttendance(todayAtt || null);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleClockIn = async () => {
    try {
      await api.post('/attendance/clock-in');
      loadDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Clock in failed');
    }
  };

  const handleClockOut = async () => {
    try {
      await api.post('/attendance/clock-out');
      loadDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Clock out failed');
    }
  };

  if (loading) return <Loading message="Loading your dashboard..." />;

  const totalAllocated = balances.reduce((acc, b) => acc + b.allocatedDays + b.carryForwardDays + b.compOffDays, 0);
  const totalUsed = balances.reduce((acc, b) => acc + b.usedDays, 0);
  const totalRemaining = balances.reduce((acc, b) => acc + b.remainingDays, 0);
  const pendingCount = recentLeaves.filter((l) => l.status === 'pending').length;

  return (
    <div className="space-y-4">
      {/* Welcome Banner */}
      <div className="glass-card p-4 bg-gradient text-white d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3" style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)' }}>
        <div>
          <h3 className="fw-bold mb-1">Welcome back, {user?.name}! 👋</h3>
          <p className="mb-0 text-white-50">{user?.department?.name || 'Staff'} • {user?.location || 'Headquarters'}</p>
        </div>
        <div className="d-flex align-items-center gap-2">
          {!attendance?.checkIn ? (
            <button className="btn btn-light fw-bold text-primary shadow" onClick={handleClockIn}>
              <i className="bi bi-clock me-2"></i>Clock In Now
            </button>
          ) : !attendance?.checkOut ? (
            <button className="btn btn-warning fw-bold text-dark shadow" onClick={handleClockOut}>
              <i className="bi bi-box-arrow-right me-2"></i>Clock Out ({attendance.workingHours || 0} hrs)
            </button>
          ) : (
            <span className="badge bg-light text-dark p-2 fs-6">
              <i className="bi bi-check-circle-fill text-success me-2"></i>Clocked Out Today ({attendance.workingHours} hrs)
            </span>
          )}
          <NavLink to="/employee/apply-leave" className="btn btn-outline-light fw-bold">
            <i className="bi bi-plus-lg me-1"></i> Apply Leave
          </NavLink>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row g-3 my-2">
        <div className="col-12 col-sm-6 col-xl-3">
          <DashboardCard title="Total Leave Allocation" value={`${totalAllocated} Days`} icon="bi-wallet2" variant="primary" />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <DashboardCard title="Used Leave" value={`${totalUsed} Days`} icon="bi-calendar-check" variant="warning" />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <DashboardCard title="Remaining Balance" value={`${totalRemaining} Days`} icon="bi-pie-chart" variant="success" />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <DashboardCard title="Pending Requests" value={pendingCount} icon="bi-hourglass-split" variant="info" />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="row g-4">
        {/* Recent Leaves Table */}
        <div className="col-12 col-lg-8">
          <div className="glass-card p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0 text-primary">Recent Leave Applications</h5>
              <NavLink to="/employee/my-leaves" className="btn btn-link btn-sm text-decoration-none p-0 fw-semibold">
                View All <i className="bi bi-arrow-right"></i>
              </NavLink>
            </div>
            {recentLeaves.length === 0 ? (
              <div className="text-center py-4 text-muted">No recent leave requests found.</div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead>
                    <tr>
                      <th>Leave Type</th>
                      <th>Dates</th>
                      <th>Days</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentLeaves.map((l) => (
                      <tr key={l._id}>
                        <td className="fw-semibold">{l.leaveType?.name}</td>
                        <td className="small">{formatDate(l.startDate)} - {formatDate(l.endDate)}</td>
                        <td><span className="badge bg-secondary bg-opacity-10 text-dark fw-bold">{l.totalDays}</span></td>
                        <td><StatusBadge status={l.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Holidays Widget */}
        <div className="col-12 col-lg-4">
          <div className="glass-card p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0 text-primary">Upcoming Holidays</h5>
              <NavLink to="/employee/holidays" className="btn btn-link btn-sm text-decoration-none p-0 fw-semibold">
                Calendar
              </NavLink>
            </div>
            {holidays.length === 0 ? (
              <p className="text-muted small">No upcoming holidays scheduled.</p>
            ) : (
              <div className="space-y-3">
                {holidays.map((h) => (
                  <div key={h._id} className="d-flex align-items-center gap-3 p-2 border-bottom">
                    <div className="bg-primary bg-opacity-10 text-primary rounded text-center p-2" style={{ minWidth: '55px' }}>
                      <div className="fw-bold fs-5">{new Date(h.date).getDate()}</div>
                      <div className="extra-small text-uppercase">{new Date(h.date).toLocaleString('default', { month: 'short' })}</div>
                    </div>
                    <div>
                      <div className="fw-bold small">{h.name}</div>
                      <span className="badge bg-info bg-opacity-20 text-info extra-small">{h.holidayType}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
