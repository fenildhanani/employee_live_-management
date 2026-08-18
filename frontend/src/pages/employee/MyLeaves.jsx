import React, { useState, useEffect } from 'react';
import { fetchLeaves, cancelLeaveRequest } from '../../services/leaveService';
import StatusBadge from '../../components/StatusBadge';
import Loading from '../../components/Loading';
import Modal from '../../components/Modal';
import Notification from '../../components/Notification';
import { formatDate } from '../../utils/dateUtils';

const MyLeaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  const [selectedLeave, setSelectedLeave] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const loadLeaves = async () => {
    try {
      const res = await fetchLeaves({ page, limit: 10, status: statusFilter });
      setLeaves(res.data || []);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      console.error('Failed to load leaves:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaves();
  }, [page, statusFilter]);

  const handleCancelClick = (leave) => {
    setSelectedLeave(leave);
    setCancelReason('');
    setShowCancelModal(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedLeave) return;
    try {
      await cancelLeaveRequest(selectedLeave._id, cancelReason);
      setActionSuccess('Leave request cancelled successfully');
      setShowCancelModal(false);
      loadLeaves();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to cancel leave');
    }
  };

  if (loading) return <Loading message="Fetching your leave records..." />;

  return (
    <div className="space-y-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
        <div>
          <h4 className="fw-bold text-primary mb-1">My Leave History</h4>
          <p className="text-muted small mb-0">Track and manage all your submitted leave requests.</p>
        </div>
        <div className="d-flex gap-2">
          <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <Notification type="danger" message={actionError} onClose={() => setActionError('')} />
      <Notification type="success" message={actionSuccess} onClose={() => setActionSuccess('')} />

      <div className="glass-card p-4">
        {leaves.length === 0 ? (
          <div className="text-center py-5 text-muted">No leave applications found matching your criteria.</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead>
                <tr>
                  <th>Leave Type</th>
                  <th>Duration</th>
                  <th>Days</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Applied On</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {leaves.map((l) => (
                  <tr key={l._id}>
                    <td className="fw-bold">{l.leaveType?.name}</td>
                    <td className="small">
                      {formatDate(l.startDate)} ({l.startSession}) -<br />
                      {formatDate(l.endDate)} ({l.endSession})
                    </td>
                    <td>
                      <span className="badge bg-primary bg-opacity-10 text-primary fw-bold fs-6">{l.totalDays}</span>
                    </td>
                    <td className="small text-truncate" style={{ maxWidth: '200px' }} title={l.reason}>
                      {l.reason}
                    </td>
                    <td>
                      <StatusBadge status={l.status} />
                    </td>
                    <td className="small text-muted">{formatDate(l.createdAt)}</td>
                    <td>
                      {['pending', 'approved'].includes(l.status) ? (
                        <button className="btn btn-outline-danger btn-sm" onClick={() => handleCancelClick(l)}>
                          Cancel
                        </button>
                      ) : (
                        <span className="text-muted extra-small">None</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
            <button className="btn btn-outline-secondary btn-sm" disabled={page === 1} onClick={() => setPage(page - 1)}>
              Previous
            </button>
            <span className="small text-muted">Page {page} of {totalPages}</span>
            <button className="btn btn-outline-secondary btn-sm" disabled={page === totalPages} onClick={() => setPage(page + 1)}>
              Next
            </button>
          </div>
        )}
      </div>

      {/* Cancel Modal */}
      <Modal
        show={showCancelModal}
        title="Cancel Leave Request"
        onClose={() => setShowCancelModal(false)}
        footer={
          <>
            <button className="btn btn-secondary btn-sm" onClick={() => setShowCancelModal(false)}>
              Back
            </button>
            <button className="btn btn-danger btn-sm fw-bold" onClick={handleConfirmCancel}>
              Confirm Cancellation
            </button>
          </>
        }
      >
        <p className="small">Are you sure you want to cancel this leave application?</p>
        <div className="mb-3">
          <label className="form-label small fw-semibold">Cancellation Reason (Optional)</label>
          <input
            type="text"
            className="form-control"
            placeholder="Reason for cancellation..."
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
};

export default MyLeaves;
