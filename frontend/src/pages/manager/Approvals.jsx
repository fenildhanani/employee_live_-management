import React, { useState, useEffect } from 'react';
import { fetchLeaves, approveLeaveRequest, rejectLeaveRequest } from '../../services/leaveService';
import StatusBadge from '../../components/StatusBadge';
import Loading from '../../components/Loading';
import Modal from '../../components/Modal';
import Notification from '../../components/Notification';
import { formatDate } from '../../utils/dateUtils';

const ManagerApprovals = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');

  const [selectedLeave, setSelectedLeave] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectComment, setRejectComment] = useState('');
  const [approveComment, setApproveComment] = useState('');

  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const loadLeaves = async () => {
    try {
      const res = await fetchLeaves({ status: statusFilter, limit: 20 });
      setLeaves(res.data || []);
    } catch (err) {
      console.error('Failed to load leaves:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaves();
  }, [statusFilter]);

  const handleApprove = async (leaveId) => {
    try {
      await approveLeaveRequest(leaveId, approveComment || 'Approved by Manager');
      setActionSuccess('Leave request approved successfully!');
      loadLeaves();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Approval failed');
    }
  };

  const handleOpenRejectModal = (leave) => {
    setSelectedLeave(leave);
    setRejectComment('');
    setShowRejectModal(true);
  };

  const handleConfirmReject = async () => {
    if (!rejectComment || rejectComment.trim() === '') {
      setActionError('Rejection reason (comment) is required');
      return;
    }
    try {
      await rejectLeaveRequest(selectedLeave._id, rejectComment);
      setActionSuccess('Leave request rejected.');
      setShowRejectModal(false);
      loadLeaves();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Rejection failed');
    }
  };

  if (loading) return <Loading message="Loading pending leave approvals..." />;

  return (
    <div className="space-y-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
        <div>
          <h4 className="fw-bold text-primary mb-1">Team Leave Approvals</h4>
          <p className="text-muted small mb-0">Review, approve, or reject leave applications submitted by team members.</p>
        </div>
        <select className="form-select w-auto" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="pending">Pending Requests</option>
          <option value="approved">Approved Requests</option>
          <option value="rejected">Rejected Requests</option>
          <option value="">All Requests</option>
        </select>
      </div>

      <Notification type="danger" message={actionError} onClose={() => setActionError('')} />
      <Notification type="success" message={actionSuccess} onClose={() => setActionSuccess('')} />

      <div className="glass-card p-4">
        {leaves.length === 0 ? (
          <p className="text-muted text-center py-5">No leave applications found for this filter.</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Leave Type</th>
                  <th>Dates</th>
                  <th>Days</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leaves.map((l) => (
                  <tr key={l._id}>
                    <td>
                      <div className="fw-bold">{l.employee?.name}</div>
                      <small className="text-muted">{l.employee?.employeeId}</small>
                    </td>
                    <td className="fw-semibold">{l.leaveType?.name}</td>
                    <td className="small">
                      {formatDate(l.startDate)} - {formatDate(l.endDate)}
                    </td>
                    <td><span className="badge bg-primary bg-opacity-10 text-primary fw-bold">{l.totalDays}</span></td>
                    <td className="small text-truncate" style={{ maxWidth: '200px' }} title={l.reason}>
                      {l.reason}
                    </td>
                    <td><StatusBadge status={l.status} /></td>
                    <td>
                      {l.status === 'pending' ? (
                        <div className="d-flex gap-2">
                          <button className="btn btn-success btn-sm fw-bold" onClick={() => handleApprove(l._id)}>
                            <i className="bi bi-check-lg me-1"></i>Approve
                          </button>
                          <button className="btn btn-outline-danger btn-sm fw-bold" onClick={() => handleOpenRejectModal(l)}>
                            <i className="bi bi-x-lg me-1"></i>Reject
                          </button>
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

      {/* Reject Modal */}
      <Modal
        show={showRejectModal}
        title="Reject Leave Request"
        onClose={() => setShowRejectModal(false)}
        footer={
          <>
            <button className="btn btn-secondary btn-sm" onClick={() => setShowRejectModal(false)}>
              Cancel
            </button>
            <button className="btn btn-danger btn-sm fw-bold" onClick={handleConfirmReject}>
              Confirm Rejection
            </button>
          </>
        }
      >
        <p className="small text-muted">
          Rejecting leave request for <strong>{selectedLeave?.employee?.name}</strong>.
        </p>
        <div className="mb-3">
          <label className="form-label small fw-semibold">Rejection Comment / Reason (Required)</label>
          <textarea
            className="form-control"
            rows="3"
            placeholder="Please specify why this leave request is being rejected..."
            value={rejectComment}
            onChange={(e) => setRejectComment(e.target.value)}
            required
          ></textarea>
        </div>
      </Modal>
    </div>
  );
};

export default ManagerApprovals;
