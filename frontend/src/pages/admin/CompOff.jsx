import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Loading from '../../components/Loading';
import StatusBadge from '../../components/StatusBadge';
import { formatDate } from '../../utils/dateUtils';

const CompOffAdmin = () => {
  const [compOffs, setCompOffs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCompOffs = async () => {
      try {
        const res = await api.get('/comp-off');
        setCompOffs(res.data.data || []);
      } catch (err) {
        console.error('Failed to load comp-offs:', err);
      } finally {
        setLoading(false);
      }
    };
    loadCompOffs();
  }, []);

  if (loading) return <Loading message="Loading Comp-Off master..." />;

  return (
    <div className="space-y-4">
      <div>
        <h4 className="fw-bold text-primary mb-1">Company Comp-Off Master</h4>
        <p className="text-muted small mb-3">Master log of compensatory off requests across all departments.</p>
      </div>

      <div className="glass-card p-4">
        {compOffs.length === 0 ? (
          <p className="text-muted text-center py-4">No comp-off records found.</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Work Date</th>
                  <th>Earned Days</th>
                  <th>Reason</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {compOffs.map((c) => (
                  <tr key={c._id}>
                    <td>
                      <div className="fw-bold">{c.employee?.name}</div>
                      <small className="text-muted">{c.employee?.department?.name}</small>
                    </td>
                    <td className="fw-semibold">{formatDate(c.workDate)}</td>
                    <td><span className="badge bg-primary bg-opacity-10 text-primary fw-bold">{c.earnedDays}</span></td>
                    <td className="small">{c.reason}</td>
                    <td><StatusBadge status={c.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompOffAdmin;
