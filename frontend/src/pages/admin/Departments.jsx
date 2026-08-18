import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Loading from '../../components/Loading';
import Modal from '../../components/Modal';
import Notification from '../../components/Notification';

const DepartmentsAdmin = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const [msg, setMsg] = useState('');

  const loadDepartments = async () => {
    try {
      const res = await api.get('/departments');
      setDepartments(res.data.data || []);
    } catch (err) {
      console.error('Failed to load departments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  const handleOpenAdd = () => {
    setEditingDept(null);
    setName('');
    setDescription('');
    setShowModal(true);
  };

  const handleOpenEdit = (dept) => {
    setEditingDept(dept);
    setName(dept.name);
    setDescription(dept.description);
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingDept) {
        await api.put(`/departments/${editingDept._id}`, { name, description });
        setMsg('Department updated successfully.');
      } else {
        await api.post('/departments', { name, description });
        setMsg('Department created successfully.');
      }
      setShowModal(false);
      loadDepartments();
    } catch (err) {
      setMsg(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this department?')) return;
    try {
      await api.delete(`/departments/${id}`);
      setMsg('Department deleted.');
      loadDepartments();
    } catch (err) {
      setMsg('Failed to delete department.');
    }
  };

  if (loading) return <Loading message="Loading departments..." />;

  return (
    <div className="space-y-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 className="fw-bold text-primary mb-1">Company Departments</h4>
          <p className="text-muted small mb-0">Configure company functional departments.</p>
        </div>
        <button className="btn btn-primary fw-bold" onClick={handleOpenAdd}>
          <i className="bi bi-plus-lg me-1"></i> Add Department
        </button>
      </div>

      <Notification type="info" message={msg} onClose={() => setMsg('')} />

      <div className="row g-4">
        {departments.map((d) => (
          <div key={d._id} className="col-12 col-md-6 col-lg-4">
            <div className="glass-card p-4 h-100 d-flex flex-column justify-content-between">
              <div>
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <h5 className="fw-bold text-primary mb-0">{d.name}</h5>
                  <span className="badge bg-success bg-opacity-20 text-success">{d.status}</span>
                </div>
                <p className="text-muted small mb-3">{d.description || 'No description provided.'}</p>
              </div>
              <div className="d-flex justify-content-end gap-2 border-top pt-2">
                <button className="btn btn-outline-primary btn-sm" onClick={() => handleOpenEdit(d)}>Edit</button>
                <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(d._id)}>Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal show={showModal} title={editingDept ? 'Edit Department' : 'Add Department'} onClose={() => setShowModal(false)}>
        <form onSubmit={handleSave}>
          <div className="mb-3">
            <label className="form-label small fw-semibold">Department Name</label>
            <input type="text" className="form-control" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="mb-3">
            <label className="form-label small fw-semibold">Description</label>
            <textarea className="form-control" rows="3" value={description} onChange={(e) => setDescription(e.target.value)}></textarea>
          </div>
          <div className="text-end gap-2 d-flex justify-content-end">
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-sm fw-bold">Save Department</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DepartmentsAdmin;
