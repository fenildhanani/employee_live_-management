import React, { useState, useEffect } from 'react';
import { fetchEmployees, createEmployeeApi, updateEmployeeApi, updateEmployeeStatusApi, deleteEmployeeApi } from '../../services/employeeService';
import api from '../../services/api';
import Loading from '../../components/Loading';
import Modal from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';
import Notification from '../../components/Notification';
import { formatDate } from '../../utils/dateUtils';

const EmployeesAdmin = () => {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [grades, setGrades] = useState([]);
  const [managers, setManagers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [editingEmp, setEditingEmp] = useState(null);

  const [employeeId, setEmployeeId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('employee');
  const [deptId, setDeptId] = useState('');
  const [gradeId, setGradeId] = useState('');
  const [managerId, setManagerId] = useState('');
  const [location, setLocation] = useState('Headquarters');
  const [phone, setPhone] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadData = async () => {
    try {
      const [empRes, deptRes, gradeRes] = await Promise.all([
        fetchEmployees({ page, limit: 10, search }),
        api.get('/departments'),
        api.get('/grades')
      ]);
      setEmployees(empRes.data || []);
      setTotalPages(empRes.totalPages || 1);
      setDepartments(deptRes.data.data || []);
      setGrades(gradeRes.data.data || []);

      const mgrs = (empRes.data || []).filter((e) => ['manager', 'hr_admin'].includes(e.role));
      setManagers(mgrs);
    } catch (err) {
      console.error('Failed to load employee directory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, search]);

  const handleOpenAdd = () => {
    setEditingEmp(null);
    setEmployeeId(`EMP-${Math.floor(100 + Math.random() * 900)}`);
    setName('');
    setEmail('');
    setPassword('Password123!');
    setRole('employee');
    setDeptId(departments[0]?._id || '');
    setGradeId(grades[0]?._id || '');
    setManagerId('');
    setLocation('Headquarters');
    setPhone('');
    setShowModal(true);
  };

  const handleOpenEdit = (emp) => {
    setEditingEmp(emp);
    setEmployeeId(emp.employeeId);
    setName(emp.name);
    setEmail(emp.email);
    setPassword('');
    setRole(emp.role);
    setDeptId(emp.department?._id || '');
    setGradeId(emp.grade?._id || '');
    setManagerId(emp.manager?._id || '');
    setLocation(emp.location || 'Headquarters');
    setPhone(emp.phone || '');
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const payload = {
        employeeId,
        name,
        email,
        role,
        department: deptId || null,
        grade: gradeId || null,
        manager: managerId || null,
        location,
        phone
      };

      if (editingEmp) {
        await updateEmployeeApi(editingEmp._id, payload);
        setSuccess('Employee updated successfully.');
      } else {
        payload.password = password || 'Password123!';
        await createEmployeeApi(payload);
        setSuccess('Employee created successfully with initialized leave balances.');
      }

      setShowModal(false);
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Save operation failed');
    }
  };

  const handleToggleStatus = async (emp) => {
    const nextStatus = emp.status === 'active' ? 'inactive' : 'active';
    try {
      await updateEmployeeStatusApi(emp._id, nextStatus);
      setSuccess(`Employee status updated to ${nextStatus}.`);
      loadData();
    } catch (err) {
      setError('Status update failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this employee record?')) return;
    try {
      await deleteEmployeeApi(id);
      setSuccess('Employee deleted successfully.');
      loadData();
    } catch (err) {
      setError('Failed to delete employee.');
    }
  };

  if (loading) return <Loading message="Loading employee directory..." />;

  return (
    <div className="space-y-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
        <div>
          <h4 className="fw-bold text-primary mb-1">HR Employee Management</h4>
          <p className="text-muted small mb-0">Create, update, deactivate, and manage company staff directory.</p>
        </div>
        <div className="d-flex gap-2">
          <input
            type="text"
            className="form-control"
            placeholder="Search by name, ID, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="btn btn-primary fw-bold text-nowrap shadow" onClick={handleOpenAdd}>
            <i className="bi bi-person-plus-fill me-1"></i> Add Employee
          </button>
        </div>
      </div>

      <Notification type="danger" message={error} onClose={() => setError('')} />
      <Notification type="success" message={success} onClose={() => setSuccess('')} />

      <div className="glass-card p-4">
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Department</th>
                <th>Role</th>
                <th>Manager</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp._id}>
                  <td className="fw-bold text-primary">{emp.employeeId}</td>
                  <td>
                    <div className="fw-bold">{emp.name}</div>
                    <small className="text-muted">{emp.email}</small>
                  </td>
                  <td className="small">{emp.department?.name || 'N/A'}</td>
                  <td>
                    <span className="badge bg-secondary bg-opacity-20 text-dark text-uppercase extra-small">
                      {emp.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="small">{emp.manager?.name || 'None'}</td>
                  <td><StatusBadge status={emp.status} /></td>
                  <td>
                    <div className="d-flex gap-2">
                      <button className="btn btn-outline-primary btn-sm" onClick={() => handleOpenEdit(emp)}>Edit</button>
                      <button className={`btn btn-outline-${emp.status === 'active' ? 'warning' : 'success'} btn-sm`} onClick={() => handleToggleStatus(emp)}>
                        {emp.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                      <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(emp._id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

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

      {/* Employee Modal Form */}
      <Modal
        show={showModal}
        title={editingEmp ? 'Edit Employee' : 'Add New Employee'}
        onClose={() => setShowModal(false)}
      >
        <form onSubmit={handleSave}>
          <div className="row g-3">
            <div className="col-6">
              <label className="form-label small fw-semibold">Employee ID</label>
              <input type="text" className="form-control" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} required />
            </div>
            <div className="col-6">
              <label className="form-label small fw-semibold">Full Name</label>
              <input type="text" className="form-control" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="col-6">
              <label className="form-label small fw-semibold">Email Address</label>
              <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            {!editingEmp && (
              <div className="col-6">
                <label className="form-label small fw-semibold">Password</label>
                <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
            )}
            <div className="col-6">
              <label className="form-label small fw-semibold">Role</label>
              <select className="form-select" value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="hr_admin">HR Admin</option>
              </select>
            </div>
            <div className="col-6">
              <label className="form-label small fw-semibold">Department</label>
              <select className="form-select" value={deptId} onChange={(e) => setDeptId(e.target.value)}>
                <option value="">Select Department</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div className="col-6">
              <label className="form-label small fw-semibold">Grade</label>
              <select className="form-select" value={gradeId} onChange={(e) => setGradeId(e.target.value)}>
                <option value="">Select Grade</option>
                {grades.map((g) => (
                  <option key={g._id} value={g._id}>{g.name}</option>
                ))}
              </select>
            </div>
            <div className="col-6">
              <label className="form-label small fw-semibold">Manager</label>
              <select className="form-select" value={managerId} onChange={(e) => setManagerId(e.target.value)}>
                <option value="">None (Self)</option>
                {managers.map((m) => (
                  <option key={m._id} value={m._id}>{m.name}</option>
                ))}
              </select>
            </div>
            <div className="col-6">
              <label className="form-label small fw-semibold">Location</label>
              <input type="text" className="form-control" value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
            <div className="col-6">
              <label className="form-label small fw-semibold">Phone</label>
              <input type="text" className="form-control" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          </div>
          <div className="mt-4 text-end gap-2 d-flex justify-content-end">
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-sm fw-bold">Save Employee</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default EmployeesAdmin;
