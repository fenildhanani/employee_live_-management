import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Loading from '../../components/Loading';
import Modal from '../../components/Modal';
import Notification from '../../components/Notification';

const GradesAdmin = () => {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingGrade, setEditingGrade] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const [msg, setMsg] = useState('');

  const loadGrades = async () => {
    try {
      const res = await api.get('/grades');
      setGrades(res.data.data || []);
    } catch (err) {
      console.error('Failed to load grades:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGrades();
  }, []);

  const handleOpenAdd = () => {
    setEditingGrade(null);
    setName('');
    setDescription('');
    setShowModal(true);
  };

  const handleOpenEdit = (grade) => {
    setEditingGrade(grade);
    setName(grade.name);
    setDescription(grade.description);
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingGrade) {
        await api.put(`/grades/${editingGrade._id}`, { name, description });
        setMsg('Grade updated successfully.');
      } else {
        await api.post('/grades', { name, description });
        setMsg('Grade created successfully.');
      }
      setShowModal(false);
      loadGrades();
    } catch (err) {
      setMsg(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this grade?')) return;
    try {
      await api.delete(`/grades/${id}`);
      setMsg('Grade deleted.');
      loadGrades();
    } catch (err) {
      setMsg('Failed to delete grade.');
    }
  };

  if (loading) return <Loading message="Loading grades..." />;

  return (
    <div className="space-y-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 className="fw-bold text-primary mb-1">Employee Grades</h4>
          <p className="text-muted small mb-0">Configure company salary/seniority grades.</p>
        </div>
        <button className="btn btn-primary fw-bold" onClick={handleOpenAdd}>
          <i className="bi bi-plus-lg me-1"></i> Add Grade
        </button>
      </div>

      <Notification type="info" message={msg} onClose={() => setMsg('')} />

      <div className="row g-4">
        {grades.map((g) => (
          <div key={g._id} className="col-12 col-md-6 col-lg-4">
            <div className="glass-card p-4 h-100 d-flex flex-column justify-content-between">
              <div>
                <h5 className="fw-bold text-primary mb-1">{g.name}</h5>
                <p className="text-muted small mb-3">{g.description || 'No description provided.'}</p>
              </div>
              <div className="d-flex justify-content-end gap-2 border-top pt-2">
                <button className="btn btn-outline-primary btn-sm" onClick={() => handleOpenEdit(g)}>Edit</button>
                <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(g._id)}>Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal show={showModal} title={editingGrade ? 'Edit Grade' : 'Add Grade'} onClose={() => setShowModal(false)}>
        <form onSubmit={handleSave}>
          <div className="mb-3">
            <label className="form-label small fw-semibold">Grade Name</label>
            <input type="text" className="form-control" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="mb-3">
            <label className="form-label small fw-semibold">Description</label>
            <textarea className="form-control" rows="3" value={description} onChange={(e) => setDescription(e.target.value)}></textarea>
          </div>
          <div className="text-end gap-2 d-flex justify-content-end">
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-sm fw-bold">Save Grade</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default GradesAdmin;
