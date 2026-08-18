import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Loading from '../../components/Loading';
import { formatDateTime } from '../../utils/dateUtils';

const AuditLogsAdmin = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLogs = async () => {
      try {
        const res = await api.get('/subscription/audit-logs');
        setLogs(res.data.data || []);
      } catch (err) {
        console.error('Failed to load audit logs:', err);
      } finally {
        setLoading(false);
      }
    };
    loadLogs();
  }, []);

  if (loading) return <Loading message="Loading system audit logs..." />;

  return (
    <div className="space-y-4">
      <div>
        <h4 className="fw-bold text-primary mb-1">Company Security Audit Logs</h4>
        <p className="text-muted small mb-3">Immutable log of HR modifications, leave approvals, and security events.</p>
      </div>

      <div className="glass-card p-4">
        {logs.length === 0 ? (
          <p className="text-muted text-center py-4">No audit logs recorded.</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Action</th>
                  <th>Performed By</th>
                  <th>Target Entity</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l) => (
                  <tr key={l._id}>
                    <td className="small text-muted">{formatDateTime(l.createdAt)}</td>
                    <td>
                      <span className="badge bg-primary bg-opacity-10 text-primary fw-bold">{l.action}</span>
                    </td>
                    <td className="fw-semibold small">{l.performedBy?.name || 'System'} ({l.performedBy?.role})</td>
                    <td className="small">{l.targetEntity || 'N/A'}</td>
                    <td className="small text-secondary">{l.details}</td>
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

export default AuditLogsAdmin;
