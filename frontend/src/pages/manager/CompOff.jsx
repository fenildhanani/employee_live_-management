import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Loading from '../../components/Loading';
import StatusBadge from '../../components/StatusBadge';
import Notification from '../../components/Notification';
import { formatDate } from '../../utils/dateUtils';

const ManagerCompOff = () => {
  const [compOffs, setCompOffs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

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

  useEffect(() => {
    loadCompOffs();
  }, []);

  const handleApprove = async (id) => {
    try {
      await api.post(`/comp-off/${id}/approve`);
      setMsg('Comp-Off request approved.');
      loadCompOffs();
    } catch (err) {
      setMsg('Approval failed.');
    }
  };

  const handleReject = async (id) => {
    try {
      await api.post(`/comp-off/${id}/reject`);
      setMsg('Comp-Off request rejected.');
      loadCompOffs();
    } catch (err) {
      setMsg('Rejection failed.');
    }
  };

  if (loading) return <Loading message="Loading Comp-Off requests..." />;

  return (
    <div className="space-y-4">
      <div>
        <h4 className="fw-bold text-primary mb-1">Team Comp-Off Approvals</h4>
        <p className="text-muted small mb-3">Review weekend overtime compensation requests.</p>
      </div>

      <Notification type="info" message={msg} onClose={() => setMsg('')} />

      <div className="glass-card p-4">
        {compOffs.length === 0 ? (
          <p className="text-muted text-center py-4">No comp-off requests found.</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Work Date</th>
                  <th>Days</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Action</th>
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
                    <td className="small text-truncate" style={{ maxWidth: '200px' }} title={c.reason}>{c.reason}</td>
                    <td><StatusBadge status={c.status} /></td>
                    <td>
                      {c.status === 'pending' ? (
                        <div className="d-flex gap-2">
                          <button className="btn btn-success btn-sm fw-bold" onClick={() => handleApprove(c._id)}>Approve</button>
                          <button className="btn btn-outline-danger btn-sm fw-bold" onClick={() => handleReject(c._id)}>Reject</button>
                        </div>
                      ) : (
                        <span className="text-muted small">Processed</span>
                      )}
                    </td>
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

export default ManagerCompOff;
