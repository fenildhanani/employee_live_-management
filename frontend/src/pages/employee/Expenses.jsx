import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Loading from '../../components/Loading';
import StatusBadge from '../../components/StatusBadge';
import Notification from '../../components/Notification';
import { formatDate } from '../../utils/dateUtils';

const ExpensesPage = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [category, setCategory] = useState('Travel & Transport');
  const [amount, setAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('category', category);
      formData.append('amount', amount);
      formData.append('expenseDate', expenseDate);
      formData.append('description', description);
      if (file) formData.append('receipt', file);

      await api.post('/expenses', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setSuccess('Expense claim submitted successfully!');
      setAmount('');
      setExpenseDate('');
      setDescription('');
      setFile(null);
      loadExpenses();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit expense claim');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading message="Loading expense claims..." />;

  return (
    <div className="space-y-4">
      <div>
        <h4 className="fw-bold text-primary mb-1">Expense Reimbursement</h4>
        <p className="text-muted small mb-3">Submit business expense claims for manager review and finance payout.</p>
      </div>

      <div className="row g-4">
        {/* Claim Form */}
        <div className="col-12 col-lg-5">
          <div className="glass-card p-4">
            <h5 className="fw-bold text-primary mb-3">Submit New Expense</h5>

            <Notification type="danger" message={error} onClose={() => setError('')} />
            <Notification type="success" message={success} onClose={() => setSuccess('')} />

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Category</label>
                <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="Travel & Transport">Travel & Transport</option>
                  <option value="Meals & Entertainment">Meals & Entertainment</option>
                  <option value="Office Supplies">Office Supplies</option>
                  <option value="Training & Courses">Training & Courses</option>
                  <option value="Miscellaneous">Miscellaneous</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold">Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold">Expense Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold">Receipt File (Optional)</label>
                <input type="file" className="form-control" onChange={(e) => setFile(e.target.files[0])} />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold">Description</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Expense purpose details..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                ></textarea>
              </div>

              <button type="submit" className="btn btn-primary w-100 fw-bold" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Expense'}
              </button>
            </form>
          </div>
        </div>

        {/* Claim History */}
        <div className="col-12 col-lg-7">
          <div className="glass-card p-4 h-100">
            <h5 className="fw-bold text-primary mb-3">Expense History</h5>
            {expenses.length === 0 ? (
              <p className="text-muted text-center py-4">No expense claims submitted.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map((e) => (
                      <tr key={e._id}>
                        <td className="fw-bold">{e.category}</td>
                        <td className="small">{formatDate(e.expenseDate)}</td>
                        <td className="fw-bold text-success">${e.amount.toFixed(2)}</td>
                        <td><StatusBadge status={e.status} /></td>
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

export default ExpensesPage;
