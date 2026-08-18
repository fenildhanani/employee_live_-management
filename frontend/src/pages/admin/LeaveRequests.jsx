import React, { useState, useEffect } from 'react';
import { fetchLeaves, approveLeaveRequest, rejectLeaveRequest } from '../../services/leaveService';
import StatusBadge from '../../components/StatusBadge';
import Loading from '../../components/Loading';
import Modal from '../../components/Modal';
import Notification from '../../components/Notification';
import { formatDate } from '../../utils/dateUtils';

const LeaveRequestsAdmin = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const [selectedLeave, setSelectedLeave] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectComment, setRejectComment] = useState('');
  const [msg, setMsg] = useState('');

  const loadLeaves = async () => {
    try {
      const res = await fetchLeaves({ status: statusFilter, limit: 30 });
      setLeaves(res.data || []);
    } catch (err) {
      console.error('Failed to load leave requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaves();
  }, [statusFilter]);

  const handleApprove = async (id) => {
    try {
      await approveLeaveRequest(id, 'Approved by HR Admin');
      setMsg('Leave request approved.');
      loadLeaves();
    } catch (err) {
      setMsg(err.response?.data?.message || 'Approval failed');
    }
  };

  const handleOpenReject = (leave) => {
    setSelectedLeave(leave);
    setRejectComment('');
    setShowRejectModal(true);
  };

  const handleConfirmReject = async () => {
    if (!rejectComment) return;
    try {
      await rejectLeaveRequest(selectedLeave._id, rejectComment);
      setMsg('Leave request rejected.');
      setShowRejectModal(false);
      loadLeaves();
    } catch (err) {
      setMsg(err.response?.data?.message || 'Rejection failed');
    }
  };

  if (loading) return <Loading message="Loading all leave requests..." />;

  return (
    <div className="space-y-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 className="fw-bold text-primary mb-1">Organization Leave Requests</h4>
          <p className="text-muted small mb-0">Master view of all employee leave applications across the company.</p>
        </div>
        <select className="form-select w-auto" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <Notification type="info" message={msg} onClose={() => setMsg('')} />

      <div className="glass-card p-4">
        {leaves.length === 0 ? (
          <p className="text-muted text-center py-4">No leave requests found.</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Leave Type</th>
                  <th>Dates</th>
                  <th>Days</th>
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
                    <td className="small">{l.employee?.department?.name || 'N/A'}</td>
                    <td className="fw-semibold">{l.leaveType?.name}</td>
                    <td className="small">{formatDate(l.startDate)} - {formatDate(l.endDate)}</td>
                    <td><span className="badge bg-primary bg-opacity-10 text-primary fw-bold">{l.totalDays}</span></td>
                    <td><StatusBadge status={l.status} /></td>
                    <td>
                      {l.status === 'pending' ? (
                        <div className="d-flex gap-2">
                          <button className="btn btn-success btn-sm fw-bold" onClick={() => handleApprove(l._id)}>Approve</button>
                          <button className="btn btn-outline-danger btn-sm fw-bold" onClick={() => handleOpenReject(l)}>Reject</button>
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

      <Modal show={showRejectModal} title="Reject Leave Request" onClose={() => setShowRejectModal(false)}>
        <p className="small">Provide a rejection reason for <strong>{selectedLeave?.employee?.name}</strong>:</p>
        <textarea
          className="form-control mb-3"
          rows="3"
          placeholder="Rejection reason..."
          value={rejectComment}
          onChange={(e) => setRejectComment(e.target.value)}
          required
        ></textarea>
        <div className="text-end gap-2 d-flex justify-content-end">
          <button className="btn btn-secondary btn-sm" onClick={() => setShowRejectModal(false)}>Cancel</button>
          <button className="btn btn-danger btn-sm fw-bold" onClick={handleConfirmReject}>Confirm Reject</button>
        </div>
      </Modal>
    </div>
  );
};

export default LeaveRequestsAdmin;
