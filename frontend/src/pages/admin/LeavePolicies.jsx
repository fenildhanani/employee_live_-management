import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Loading from '../../components/Loading';
import Modal from '../../components/Modal';
import Notification from '../../components/Notification';

const LeavePoliciesAdmin = () => {
  const [policies, setPolicies] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [grades, setGrades] = useState([]);

  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [leaveTypeId, setLeaveTypeId] = useState('');
  const [deptId, setDeptId] = useState('');
  const [gradeId, setGradeId] = useState('');
  const [allocation, setAllocation] = useState(14);
  const [msg, setMsg] = useState('');

  const loadData = async () => {
    try {
      const [polRes, ltRes, deptRes, gradeRes] = await Promise.all([
        api.get('/policies'),
        api.get('/leave-types'),
        api.get('/departments'),
        api.get('/grades')
      ]);
      setPolicies(polRes.data.data || []);
      setLeaveTypes(ltRes.data.data || []);
      setDepartments(deptRes.data.data || []);
      setGrades(gradeRes.data.data || []);
      if (ltRes.data.data?.length > 0) setLeaveTypeId(ltRes.data.data[0]._id);
    } catch (err) {
      console.error('Failed to load leave policies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await api.post('/policies', {
        leaveType: leaveTypeId,
        department: deptId || null,
        grade: gradeId || null,
        allocation: parseFloat(allocation)
      });
      setMsg('Policy created successfully.');
      setShowModal(false);
      loadData();
    } catch (err) {
      setMsg(err.response?.data?.message || 'Policy creation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this policy?')) return;
    try {
      await api.delete(`/policies/${id}`);
      setMsg('Policy deleted.');
      loadData();
    } catch (err) {
      setMsg('Failed to delete policy.');
    }
  };

  if (loading) return <Loading message="Loading leave policies matrix..." />;

  return (
    <div className="space-y-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 className="fw-bold text-primary mb-1">Leave Policies Matrix</h4>
          <p className="text-muted small mb-0">Configure department and grade-specific override allocation rules.</p>
        </div>
        <button className="btn btn-primary fw-bold" onClick={() => setShowModal(true)}>
          <i className="bi bi-plus-lg me-1"></i> Add Policy Rule
        </button>
      </div>

      <Notification type="info" message={msg} onClose={() => setMsg('')} />

      <div className="glass-card p-4">
        {policies.length === 0 ? (
          <p className="text-muted text-center py-4">No custom leave policies configured.</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead>
                <tr>
                  <th>Leave Type</th>
                  <th>Department Rule</th>
                  <th>Grade Rule</th>
                  <th>Overridden Allocation</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {policies.map((p) => (
                  <tr key={p._id}>
                    <td className="fw-bold">{p.leaveType?.name}</td>
                    <td>{p.department?.name || <span className="badge bg-secondary bg-opacity-20 text-dark">All Departments</span>}</td>
                    <td>{p.grade?.name || <span className="badge bg-secondary bg-opacity-20 text-dark">All Grades</span>}</td>
                    <td className="fw-bold text-success">{p.allocation} Days</td>
                    <td>
                      <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(p._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal show={showModal} title="Create Leave Policy Override Rule" onClose={() => setShowModal(false)}>
        <form onSubmit={handleSave}>
          <div className="mb-3">
            <label className="form-label small fw-semibold">Leave Type</label>
            <select className="form-select" value={leaveTypeId} onChange={(e) => setLeaveTypeId(e.target.value)} required>
              {leaveTypes.map((lt) => (
                <option key={lt._id} value={lt._id}>{lt.name}</option>
              ))}
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label small fw-semibold">Department (Optional Override)</label>
            <select className="form-select" value={deptId} onChange={(e) => setDeptId(e.target.value)}>
              <option value="">All Departments (Default)</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>{d.name}</option>
              ))}
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label small fw-semibold">Grade (Optional Override)</label>
            <select className="form-select" value={gradeId} onChange={(e) => setGradeId(e.target.value)}>
              <option value="">All Grades (Default)</option>
              {grades.map((g) => (
                <option key={g._id} value={g._id}>{g.name}</option>
              ))}
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label small fw-semibold">Allocation (Days)</label>
            <input type="number" className="form-control" value={allocation} onChange={(e) => setAllocation(e.target.value)} required />
          </div>
          <div className="text-end gap-2 d-flex justify-content-end">
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-sm fw-bold">Save Policy Rule</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default LeavePoliciesAdmin;
