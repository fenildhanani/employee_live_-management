import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Loading from '../../components/Loading';
import StatusBadge from '../../components/StatusBadge';
import { formatDate } from '../../utils/dateUtils';

const ManagerTeam = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTeam = async () => {
      try {
        const res = await api.get('/employees');
        setMembers(res.data.data || []);
      } catch (err) {
        console.error('Failed to load team members:', err);
      } finally {
        setLoading(false);
      }
    };
    loadTeam();
  }, []);

  if (loading) return <Loading message="Loading team members..." />;

  return (
    <div className="space-y-4">
      <div>
        <h4 className="fw-bold text-primary mb-1">My Team Directory</h4>
        <p className="text-muted small mb-3">Overview of employees reporting to you.</p>
      </div>

      <div className="row g-4">
        {members.map((m) => (
          <div key={m._id} className="col-12 col-md-6 col-lg-4">
            <div className="glass-card p-4 h-100">
              <div className="d-flex align-items-center gap-3 mb-3">
                <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold fs-4" style={{ width: '50px', height: '50px' }}>
                  {m.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h6 className="fw-bold mb-0">{m.name}</h6>
                  <div className="small text-muted">{m.email}</div>
                  <small className="text-primary fw-semibold">{m.employeeId}</small>
                </div>
              </div>
              <hr />
              <div className="space-y-1 small text-secondary">
                <div>Department: <span className="fw-semibold text-dark">{m.department?.name || 'N/A'}</span></div>
                <div>Location: <span className="fw-semibold text-dark">{m.location}</span></div>
                <div>Joined: <span className="fw-semibold text-dark">{formatDate(m.joiningDate)}</span></div>
                <div>Status: <StatusBadge status={m.status} /></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManagerTeam;
