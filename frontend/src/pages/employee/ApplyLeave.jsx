import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { fetchMyLeaveBalances, submitLeaveRequest } from '../../services/leaveService';
import api from '../../services/api';
import Notification from '../../components/Notification';
import Loading from '../../components/Loading';

const ApplyLeave = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [leaveTypes, setLeaveTypes] = useState([]);
  const [balances, setBalances] = useState([]);
  const [selectedLeaveType, setSelectedLeaveType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startSession, setStartSession] = useState('Full Day');
  const [endSession, setEndSession] = useState('Full Day');
  const [reason, setReason] = useState('');
  const [file, setFile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [calculatedDays, setCalculatedDays] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [ltRes, balRes] = await Promise.all([
          api.get('/leave-types'),
          fetchMyLeaveBalances(new Date().getFullYear())
        ]);
        setLeaveTypes(ltRes.data.data || []);
        setBalances(balRes.data || []);
        if (ltRes.data.data && ltRes.data.data.length > 0) {
          setSelectedLeaveType(ltRes.data.data[0]._id);
        }
      } catch (err) {
        setError('Failed to load leave types or balances');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (start <= end) {
        const timeDiff = end.getTime() - start.getTime();
        let days = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
        if (days === 1 && (startSession !== 'Full Day' || endSession !== 'Full Day')) {
          days = 0.5;
        } else {
          if (startSession !== 'Full Day') days -= 0.5;
          if (endSession !== 'Full Day') days -= 0.5;
        }
        setCalculatedDays(Math.max(0.5, days));
      } else {
        setCalculatedDays(0);
      }
    }
  }, [startDate, endDate, startSession, endSession]);

  const activeBalance = balances.find((b) => b.leaveType?._id === selectedLeaveType);
  const availableDays = activeBalance ? activeBalance.remainingDays : 0;
  const remainingAfterLeave = availableDays - calculatedDays;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (calculatedDays <= 0) {
      setError('Please select valid start and end dates');
      return;
    }

    if (calculatedDays > availableDays) {
      setError(`Insufficient leave balance! You requested ${calculatedDays} day(s) but only have ${availableDays} remaining.`);
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('leaveType', selectedLeaveType);
      formData.append('startDate', startDate);
      formData.append('endDate', endDate);
      formData.append('startSession', startSession);
      formData.append('endSession', endSession);
      formData.append('reason', reason);
      if (file) formData.append('attachment', file);

      const res = await submitLeaveRequest(formData);
      if (res.success) {
        setSuccess('Leave request submitted successfully!');
        setTimeout(() => navigate('/employee/my-leaves'), 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit leave request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading message="Loading leave application form..." />;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="glass-card p-4 p-md-5">
        <h4 className="fw-bold text-primary mb-1">
          <i className="bi bi-file-earmark-plus me-2"></i>Apply for Leave
        </h4>
        <p className="text-muted small mb-4">Submit a new leave application to your manager for approval.</p>

        <Notification type="danger" message={error} onClose={() => setError('')} />
        <Notification type="success" message={success} onClose={() => setSuccess('')} />

        <form onSubmit={handleSubmit}>
          {/* Live Balance Summary Header */}
          <div className="row g-3 mb-4 p-3 bg-light rounded-3 border">
            <div className="col-12 col-md-4 text-center border-end">
              <div className="text-muted extra-small uppercase">Available Balance</div>
              <div className="fw-bold fs-4 text-success">{availableDays} Days</div>
            </div>
            <div className="col-12 col-md-4 text-center border-end">
              <div className="text-muted extra-small uppercase">Calculated Duration</div>
              <div className="fw-bold fs-4 text-primary">{calculatedDays} Days</div>
            </div>
            <div className="col-12 col-md-4 text-center">
              <div className="text-muted extra-small uppercase">Est. Remaining Balance</div>
              <div className={`fw-bold fs-4 ${remainingAfterLeave < 0 ? 'text-danger' : 'text-secondary'}`}>
                {remainingAfterLeave} Days
              </div>
            </div>
          </div>

          <div className="row g-3">
            <div className="col-12 col-md-6">
              <label className="form-label fw-semibold small">Leave Type</label>
              <select
                className="form-select"
                value={selectedLeaveType}
                onChange={(e) => setSelectedLeaveType(e.target.value)}
                required
              >
                {leaveTypes.map((lt) => (
                  <option key={lt._id} value={lt._id}>
                    {lt.name} ({lt.paid ? 'Paid' : 'Unpaid'})
                  </option>
                ))}
              </select>
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label fw-semibold small">Attachment (Optional)</label>
              <input type="file" className="form-control" onChange={(e) => setFile(e.target.files[0])} />
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label fw-semibold small">Start Date</label>
              <input
                type="date"
                className="form-control"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label fw-semibold small">Start Session</label>
              <select className="form-select" value={startSession} onChange={(e) => setStartSession(e.target.value)}>
                <option value="Full Day">Full Day</option>
                <option value="First Half">First Half</option>
                <option value="Second Half">Second Half</option>
              </select>
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label fw-semibold small">End Date</label>
              <input
                type="date"
                className="form-control"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label fw-semibold small">End Session</label>
              <select className="form-select" value={endSession} onChange={(e) => setEndSession(e.target.value)}>
                <option value="Full Day">Full Day</option>
                <option value="First Half">First Half</option>
                <option value="Second Half">Second Half</option>
              </select>
            </div>

            <div className="col-12">
              <label className="form-label fw-semibold small">Reason for Leave</label>
              <textarea
                className="form-control"
                rows="3"
                placeholder="Provide a detailed reason for leave..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              ></textarea>
            </div>
          </div>

          <div className="mt-4 d-flex justify-content-end gap-2">
            <button type="button" className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary fw-bold" disabled={submitting || calculatedDays <= 0}>
              {submitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplyLeave;
