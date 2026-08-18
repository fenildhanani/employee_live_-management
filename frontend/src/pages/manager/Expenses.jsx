import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Loading from '../../components/Loading';
import StatusBadge from '../../components/StatusBadge';
import Notification from '../../components/Notification';
import { formatDate } from '../../utils/dateUtils';

const ManagerExpenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  const loadExpenses = async () => {
    try {
      const res = await api.get('/expenses');
      setExpenses(res.data.data || []);
    } catch (err) {
      console.error('Failed to load expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.patch(`/expenses/${id}/status`, { status });
      setMsg(`Expense status updated to ${status}.`);
      loadExpenses();
    } catch (err) {
      setMsg('Failed to update expense status.');
    }
  };

  if (loading) return <Loading message="Loading team expense claims..." />;

  return (
    <div className="space-y-4">
      <div>
        <h4 className="fw-bold text-primary mb-1">Team Expense Review</h4>
        <p className="text-muted small mb-3">Review reimbursement claims submitted by team members.</p>
      </div>

      <Notification type="info" message={msg} onClose={() => setMsg('')} />

      <div className="glass-card p-4">
        {expenses.length === 0 ? (
          <p className="text-muted text-center py-4">No expense claims found.</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((e) => (
                  <tr key={e._id}>
                    <td>
                      <div className="fw-bold">{e.employee?.name}</div>
                      <small className="text-muted">{e.employee?.department?.name}</small>
                    </td>
                    <td className="fw-semibold">{e.category}</td>
                    <td className="small">{formatDate(e.expenseDate)}</td>
                    <td className="fw-bold text-success">${e.amount.toFixed(2)}</td>
                    <td><StatusBadge status={e.status} /></td>
                    <td>
                      {e.status === 'pending' ? (
                        <div className="d-flex gap-2">
                          <button className="btn btn-success btn-sm fw-bold" onClick={() => handleUpdateStatus(e._id, 'approved')}>Approve</button>
                          <button className="btn btn-outline-danger btn-sm fw-bold" onClick={() => handleUpdateStatus(e._id, 'rejected')}>Reject</button>
                        </div>
                      ) : e.status === 'approved' ? (
                        <button className="btn btn-primary btn-sm fw-bold" onClick={() => handleUpdateStatus(e._id, 'paid')}>Mark Paid</button>
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

export default ManagerExpenses;
