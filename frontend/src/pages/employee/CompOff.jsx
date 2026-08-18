import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Loading from '../../components/Loading';
import StatusBadge from '../../components/StatusBadge';
import Notification from '../../components/Notification';
import { formatDate } from '../../utils/dateUtils';

const CompOffPage = () => {
  const [compOffs, setCompOffs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [workDate, setWorkDate] = useState('');
  const [reason, setReason] = useState('');
  const [earnedDays, setEarnedDays] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      await api.post('/comp-off', { workDate, reason, earnedDays });
      setSuccess('Comp-Off request submitted successfully!');
      setWorkDate('');
      setReason('');
      loadCompOffs();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit comp-off request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading message="Loading Comp-Off requests..." />;

  return (
    <div className="space-y-4">
      <div>
        <h4 className="fw-bold text-primary mb-1">Comp-Off Requests</h4>
        <p className="text-muted small mb-3">Claim compensatory off for working on weekends or holidays.</p>
      </div>

      <div className="row g-4">
        {/* Claim Form */}
        <div className="col-12 col-lg-5">
          <div className="glass-card p-4">
            <h5 className="fw-bold text-primary mb-3">Claim New Comp-Off</h5>

            <Notification type="danger" message={error} onClose={() => setError('')} />
            <Notification type="success" message={success} onClose={() => setSuccess('')} />

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Weekend / Holiday Work Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={workDate}
                  onChange={(e) => setWorkDate(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold">Earned Days</label>
                <select className="form-select" value={earnedDays} onChange={(e) => setEarnedDays(parseFloat(e.target.value))}>
                  <option value={1}>1.0 Day (Full Day Overtime)</option>
                  <option value={0.5}>0.5 Day (Half Day Overtime)</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold">Work Reason / Task Details</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Describe the overtime project or task worked on..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                ></textarea>
              </div>

              <button type="submit" className="btn btn-primary w-100 fw-bold" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Claim'}
              </button>
            </form>
          </div>
        </div>

        {/* Request History */}
        <div className="col-12 col-lg-7">
          <div className="glass-card p-4 h-100">
            <h5 className="fw-bold text-primary mb-3">My Comp-Off History</h5>
            {compOffs.length === 0 ? (
              <p className="text-muted text-center py-4">No Comp-Off requests submitted.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead>
                    <tr>
                      <th>Work Date</th>
                      <th>Days</th>
                      <th>Reason</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {compOffs.map((c) => (
                      <tr key={c._id}>
                        <td className="fw-bold">{formatDate(c.workDate)}</td>
                        <td><span className="badge bg-secondary bg-opacity-10 text-dark fw-bold">{c.earnedDays}</span></td>
                        <td className="small text-truncate" style={{ maxWidth: '180px' }} title={c.reason}>{c.reason}</td>
                        <td><StatusBadge status={c.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompOffPage;
