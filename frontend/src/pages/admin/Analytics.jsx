import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import Loading from '../../components/Loading';
import DashboardCard from '../../components/DashboardCard';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from 'recharts';

const AnalyticsAdmin = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const res = await api.get('/analytics');
        setData(res.data.data);
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    loadAnalytics();
  }, []);

  if (loading) return <Loading message="Loading HR workforce analytics..." />;

  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444'];

  const distributionData = [
    { name: 'On Duty', value: data?.totalEmployees ? data.totalEmployees - (data.onLeaveTodayCount || 0) : 10 },
    { name: 'On Approved Leave', value: data?.onLeaveTodayCount || 0 }
  ];

  return (
    <div className="space-y-4">
      <div>
        <h4 className="fw-bold text-primary mb-1">HR Analytics & Intelligence</h4>
        <p className="text-muted small mb-3">In-depth workforce statistics, leave utilization ratios, and absenteeism metrics.</p>
      </div>

      <div className="row g-3">
        <div className="col-12 col-sm-6 col-xl-3">
          <DashboardCard title="Leave Utilization" value={`${data?.leaveUtilizationRate || 0}%`} subtitle="Used / Allocated Ratio" icon="bi-pie-chart-fill" variant="primary" />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <DashboardCard title="Absenteeism Rate" value={`${data?.absenteeismRate || 0}%`} subtitle="Absent Days / Working Days" icon="bi-graph-down" variant="warning" />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <DashboardCard title="Team Availability" value={`${data?.teamAvailabilityRate || 100}%`} subtitle="Available Workforce Ratio" icon="bi-check-circle-fill" variant="success" />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <DashboardCard title="Peak Absence Month" value={data?.peakAbsenceMonth || 'N/A'} subtitle="Highest Leave Consumption" icon="bi-calendar-range-fill" variant="info" />
        </div>
      </div>

      <div className="row g-4 my-2">
        <div className="col-12 col-lg-8">
          <div className="glass-card p-4 h-100">
            <h5 className="fw-bold text-primary mb-3">12-Month Leave Consumption Trend</h5>
            <div style={{ width: '100%', height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.monthlyTrend || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="leaveDays" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Leave Days Consumed" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-4">
          <div className="glass-card p-4 h-100">
            <h5 className="fw-bold text-primary mb-3">Daily Workforce Availability</h5>
            <div style={{ width: '100%', height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={distributionData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsAdmin;
