import React, { useEffect, useState } from 'react';
import DashboardCard from '../../components/DashboardCard';
import Loading from '../../components/Loading';
import api from '../../services/api';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { NavLink } from 'react-router-dom';

const ManagerDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadManagerData = async () => {
      try {
        const [analyticRes, pendingRes] = await Promise.all([
          api.get('/analytics'),
          api.get('/leaves?status=pending&limit=5')
        ]);
        setAnalytics(analyticRes.data.data);
        setPendingApprovals(pendingRes.data.data || []);
      } catch (err) {
        console.error('Failed to load manager dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadManagerData();
  }, []);

  if (loading) return <Loading message="Loading Manager Dashboard..." />;

  return (
    <div className="space-y-4">
      <div>
        <h4 className="fw-bold text-primary mb-1">Team Manager Dashboard</h4>
        <p className="text-muted small mb-3">Monitor team availability, review leave approvals, and track monthly trends.</p>
      </div>

      {/* KPI Stat Cards */}
      <div className="row g-3">
        <div className="col-12 col-sm-6 col-xl-3">
          <DashboardCard title="Pending Approvals" value={pendingApprovals.length} icon="bi-hourglass-split" variant="warning" />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <DashboardCard title="On Leave Today" value={analytics?.onLeaveTodayCount || 0} icon="bi-person-slash" variant="danger" />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <DashboardCard title="Team Availability" value={`${analytics?.teamAvailabilityRate || 100}%`} icon="bi-people" variant="success" />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <DashboardCard title="Peak Absence Month" value={analytics?.peakAbsenceMonth || 'N/A'} icon="bi-graph-up" variant="info" />
        </div>
      </div>

      {/* Chart and Pending Requests Grid */}
      <div className="row g-4 my-2">
        {/* Recharts Monthly Leave Trend */}
        <div className="col-12 col-lg-7">
          <div className="glass-card p-4 h-100">
            <h5 className="fw-bold text-primary mb-3">Team Monthly Leave Trend</h5>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics?.monthlyTrend || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="leaveDays" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Total Leave Days" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Quick Pending Approvals */}
        <div className="col-12 col-lg-5">
          <div className="glass-card p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold text-primary mb-0">Action Required</h5>
              <NavLink to="/manager/approvals" className="btn btn-link btn-sm p-0 fw-semibold text-decoration-none">
                View All Approvals
              </NavLink>
            </div>

            {pendingApprovals.length === 0 ? (
              <p className="text-muted small text-center py-4">No pending leave requests awaiting approval.</p>
            ) : (
              <div className="space-y-3">
                {pendingApprovals.map((p) => (
                  <div key={p._id} className="p-3 bg-light rounded-3 border d-flex justify-content-between align-items-center">
                    <div>
                      <div className="fw-bold small">{p.employee?.name}</div>
                      <div className="text-muted extra-small">{p.leaveType?.name} • {p.totalDays} Day(s)</div>
                    </div>
                    <NavLink to="/manager/approvals" className="btn btn-primary btn-sm fw-bold">
                      Review
                    </NavLink>
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

export default ManagerDashboard;
