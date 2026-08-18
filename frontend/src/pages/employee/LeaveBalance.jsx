import React, { useState, useEffect } from 'react';
import { fetchMyLeaveBalances } from '../../services/leaveService';
import Loading from '../../components/Loading';

const LeaveBalancePage = () => {
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const loadBalances = async () => {
      try {
        const res = await fetchMyLeaveBalances(year);
        setBalances(res.data || []);
      } catch (err) {
        console.error('Failed to load leave balances:', err);
      } finally {
        setLoading(false);
      }
    };
    loadBalances();
  }, [year]);

  if (loading) return <Loading message="Loading leave balances..." />;

  return (
    <div className="space-y-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 className="fw-bold text-primary mb-1">My Leave Balances</h4>
          <p className="text-muted small mb-0">Detailed breakdown of your leave entitlements, used days, and remaining balances.</p>
        </div>
        <select className="form-select w-auto" value={year} onChange={(e) => setYear(parseInt(e.target.value, 10))}>
          <option value={2026}>2026</option>
          <option value={2025}>2025</option>
        </select>
      </div>

      <div className="row g-4">
        {balances.map((b) => {
          const totalAlloc = b.allocatedDays + b.carryForwardDays + b.compOffDays;
          const percentageUsed = totalAlloc > 0 ? Math.round((b.usedDays / totalAlloc) * 100) : 0;

          return (
            <div key={b._id} className="col-12 col-md-6 col-xl-4">
              <div className="glass-card p-4 h-100">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <h5 className="fw-bold mb-1 text-primary">{b.leaveType?.name}</h5>
                    <span className={`badge ${b.leaveType?.paid ? 'bg-success' : 'bg-secondary'} bg-opacity-20 text-dark extra-small`}>
                      {b.leaveType?.paid ? 'Paid Leave' : 'Unpaid Leave'}
                    </span>
                  </div>
                  <div className="text-end">
                    <div className="fs-3 fw-bold text-success">{b.remainingDays}</div>
                    <div className="extra-small text-muted">Remaining</div>
                  </div>
                </div>

                <div className="progress mb-3" style={{ height: '8px' }}>
                  <div className="progress-bar bg-primary" role="progressbar" style={{ width: `${percentageUsed}%` }}></div>
                </div>

                <div className="row text-center g-2 pt-2 border-top extra-small text-muted">
                  <div className="col-4 border-end">
                    <div className="fw-bold text-dark fs-6">{b.allocatedDays}</div>
                    <div>Allocated</div>
                  </div>
                  <div className="col-4 border-end">
                    <div className="fw-bold text-info fs-6">{b.carryForwardDays + b.compOffDays}</div>
                    <div>Carry / Comp</div>
                  </div>
                  <div className="col-4">
                    <div className="fw-bold text-warning fs-6">{b.usedDays}</div>
                    <div>Used</div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LeaveBalancePage;
