import React, { useEffect, useState } from 'react';
import DashboardCard from '../../components/DashboardCard';
import Loading from '../../components/Loading';
import api from '../../services/api';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { NavLink } from 'react-router-dom';

const HRDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHRData = async () => {
      try {
        const res = await api.get('/analytics');
        setAnalytics(res.data.data);
      } catch (err) {
        console.error('Failed to load HR dashboard analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    loadHRData();
  }, []);

  if (loading) return <Loading message="Loading HR Master Dashboard..." />;

  return (
    <div className="space-y-4">
      <div>
        <h4 className="fw-bold text-primary mb-1">HR Master Executive Dashboard</h4>
        <p className="text-muted small mb-3">Organization-wide workforce insights, leave utilization, and absenteeism tracking.</p>
      </div>

      {/* KPI Cards */}
      <div className="row g-3">
        <div className="col-12 col-sm-6 col-xl-2">
          <DashboardCard title="Total Employees" value={analytics?.totalEmployees || 0} icon="bi-people-fill" variant="primary" />
        </div>
        <div className="col-12 col-sm-6 col-xl-2">
          <DashboardCard title="On Leave Today" value={analytics?.onLeaveTodayCount || 0} icon="bi-person-x-fill" variant="danger" />
        </div>
        <div className="col-12 col-sm-6 col-xl-2">
          <DashboardCard title="Pending Requests" value={analytics?.pendingRequestsCount || 0} icon="bi-clock-history" variant="warning" />
        </div>
        <div className="col-12 col-sm-6 col-xl-2">
          <DashboardCard title="Leave Utilization" value={`${analytics?.leaveUtilizationRate || 0}%`} icon="bi-pie-chart-fill" variant="info" />
        </div>
        <div className="col-12 col-sm-6 col-xl-2">
          <DashboardCard title="Absenteeism Rate" value={`${analytics?.absenteeismRate || 0}%`} icon="bi-graph-down" variant="warning" />
        </div>
        <div className="col-12 col-sm-6 col-xl-2">
          <DashboardCard title="Team Availability" value={`${analytics?.teamAvailabilityRate || 100}%`} icon="bi-check-circle-fill" variant="success" />
        </div>
      </div>

      {/* Analytics Chart */}
      <div className="glass-card p-4 my-3">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold text-primary mb-0">Organization Leave Utilization Trend</h5>
          <NavLink to="/admin/analytics" className="btn btn-outline-primary btn-sm fw-bold">
            Detailed Analytics <i className="bi bi-arrow-right"></i>
          </NavLink>
        </div>
        <div style={{ width: '100%', height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics?.monthlyTrend || []}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="leaveDays" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Approved Leave Days" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default HRDashboard;
