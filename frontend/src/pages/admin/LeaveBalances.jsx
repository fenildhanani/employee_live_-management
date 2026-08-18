import React, { useState, useEffect } from 'react';
import { fetchAllLeaveBalances } from '../../services/leaveService';
import Loading from '../../components/Loading';

const LeaveBalancesAdmin = () => {
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const loadBalances = async () => {
      try {
        const res = await fetchAllLeaveBalances({ year });
        setBalances(res.data || []);
      } catch (err) {
        console.error('Failed to load leave balances:', err);
      } finally {
        setLoading(false);
      }
    };
    loadBalances();
  }, [year]);

  if (loading) return <Loading message="Loading employee leave balances..." />;

  return (
    <div className="space-y-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 className="fw-bold text-primary mb-1">Organization Leave Balances Master</h4>
          <p className="text-muted small mb-0">Master table of leave balances allocated across all employees.</p>
        </div>
        <select className="form-select w-auto" value={year} onChange={(e) => setYear(parseInt(e.target.value, 10))}>
          <option value={2026}>2026</option>
          <option value={2025}>2025</option>
        </select>
      </div>

      <div className="glass-card p-4">
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th>Leave Type</th>
                <th>Allocated</th>
                <th>Carry / Comp</th>
                <th>Used</th>
                <th>Remaining</th>
              </tr>
            </thead>
            <tbody>
              {balances.map((b) => (
                <tr key={b._id}>
                  <td>
                    <div className="fw-bold">{b.employee?.name}</div>
                    <small className="text-muted">{b.employee?.employeeId}</small>
                  </td>
                  <td className="small">{b.employee?.department?.name || 'N/A'}</td>
                  <td className="fw-semibold">{b.leaveType?.name}</td>
                  <td>{b.allocatedDays}</td>
                  <td>{b.carryForwardDays + b.compOffDays}</td>
                  <td className="text-warning fw-bold">{b.usedDays}</td>
                  <td className="text-success fw-bold fs-6">{b.remainingDays}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LeaveBalancesAdmin;
