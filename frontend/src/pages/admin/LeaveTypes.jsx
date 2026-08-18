import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Loading from '../../components/Loading';
import Modal from '../../components/Modal';
import Notification from '../../components/Notification';

const LeaveTypesAdmin = () => {
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingType, setEditingType] = useState(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [annualAllocation, setAnnualAllocation] = useState(12);
  const [paid, setPaid] = useState(true);
  const [maxConsecutiveDays, setMaxConsecutiveDays] = useState(14);
  const [minimumNoticeDays, setMinimumNoticeDays] = useState(1);
  const [carryForwardAllowed, setCarryForwardAllowed] = useState(false);
  const [maxCarryForward, setMaxCarryForward] = useState(0);
  const [requiresDocument, setRequiresDocument] = useState(false);

  const [msg, setMsg] = useState('');

  const loadTypes = async () => {
    try {
      const res = await api.get('/leave-types');
      setLeaveTypes(res.data.data || []);
    } catch (err) {
      console.error('Failed to load leave types:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTypes();
  }, []);

  const handleOpenAdd = () => {
    setEditingType(null);
    setName('');
    setDescription('');
    setAnnualAllocation(12);
    setPaid(true);
    setMaxConsecutiveDays(14);
    setMinimumNoticeDays(1);
    setCarryForwardAllowed(false);
    setMaxCarryForward(0);
    setRequiresDocument(false);
    setShowModal(true);
  };

  const handleOpenEdit = (lt) => {
    setEditingType(lt);
    setName(lt.name);
    setDescription(lt.description);
    setAnnualAllocation(lt.annualAllocation);
    setPaid(lt.paid);
    setMaxConsecutiveDays(lt.maxConsecutiveDays);
    setMinimumNoticeDays(lt.minimumNoticeDays);
    setCarryForwardAllowed(lt.carryForwardAllowed);
    setMaxCarryForward(lt.maxCarryForward);
    setRequiresDocument(lt.requiresDocument);
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const payload = {
      name,
      description,
      annualAllocation: parseFloat(annualAllocation),
      paid,
      maxConsecutiveDays: parseInt(maxConsecutiveDays, 10),
      minimumNoticeDays: parseInt(minimumNoticeDays, 10),
      carryForwardAllowed,
      maxCarryForward: parseInt(maxCarryForward, 10),
      requiresDocument
    };

    try {
      if (editingType) {
        await api.put(`/leave-types/${editingType._id}`, payload);
        setMsg('Leave type updated.');
      } else {
        await api.post('/leave-types', payload);
        setMsg('Leave type created.');
      }
      setShowModal(false);
      loadTypes();
    } catch (err) {
      setMsg(err.response?.data?.message || 'Save failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this leave type?')) return;
    try {
      await api.delete(`/leave-types/${id}`);
      setMsg('Leave type deleted.');
      loadTypes();
    } catch (err) {
      setMsg('Failed to delete leave type.');
    }
  };

  if (loading) return <Loading message="Loading leave types builder..." />;

  return (
    <div className="space-y-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 className="fw-bold text-primary mb-1">Leave Types Builder</h4>
          <p className="text-muted small mb-0">Configure company leave types, annual allocations, and rules.</p>
        </div>
        <button className="btn btn-primary fw-bold" onClick={handleOpenAdd}>
          <i className="bi bi-plus-lg me-1"></i> Create Leave Type
        </button>
      </div>

      <Notification type="info" message={msg} onClose={() => setMsg('')} />

      <div className="row g-4">
        {leaveTypes.map((lt) => (
          <div key={lt._id} className="col-12 col-md-6 col-lg-4">
            <div className="glass-card p-4 h-100 d-flex flex-column justify-content-between">
              <div>
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <h5 className="fw-bold text-primary mb-0">{lt.name}</h5>
                  <span className={`badge ${lt.paid ? 'bg-success' : 'bg-warning text-dark'}`}>
                    {lt.paid ? 'Paid' : 'Unpaid'}
                  </span>
                </div>
                <p className="text-muted small mb-3">{lt.description}</p>
                <div className="p-3 bg-light rounded-3 border extra-small space-y-1">
                  <div>Allocation: <strong className="text-dark">{lt.annualAllocation} Days/Year</strong></div>
                  <div>Max Consecutive: <strong className="text-dark">{lt.maxConsecutiveDays} Days</strong></div>
                  <div>Min Notice: <strong className="text-dark">{lt.minimumNoticeDays} Day(s)</strong></div>
                  <div>Carry Forward: <strong className="text-dark">{lt.carryForwardAllowed ? `Yes (Max ${lt.maxCarryForward})` : 'No'}</strong></div>
                  <div>Document Required: <strong className="text-dark">{lt.requiresDocument ? 'Yes' : 'No'}</strong></div>
                </div>
              </div>
              <div className="d-flex justify-content-end gap-2 border-top pt-3 mt-3">
                <button className="btn btn-outline-primary btn-sm" onClick={() => handleOpenEdit(lt)}>Edit</button>
                <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(lt._id)}>Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Form */}
      <Modal show={showModal} title={editingType ? 'Edit Leave Type' : 'Create Leave Type'} onClose={() => setShowModal(false)}>
        <form onSubmit={handleSave}>
          <div className="row g-3">
            <div className="col-6">
              <label className="form-label small fw-semibold">Leave Type Name</label>
              <input type="text" className="form-control" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="col-6">
              <label className="form-label small fw-semibold">Annual Allocation (Days)</label>
              <input type="number" className="form-control" value={annualAllocation} onChange={(e) => setAnnualAllocation(e.target.value)} required />
            </div>
            <div className="col-12">
              <label className="form-label small fw-semibold">Description</label>
              <input type="text" className="form-control" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="col-6">
              <label className="form-label small fw-semibold">Max Consecutive Days</label>
              <input type="number" className="form-control" value={maxConsecutiveDays} onChange={(e) => setMaxConsecutiveDays(e.target.value)} />
            </div>
            <div className="col-6">
              <label className="form-label small fw-semibold">Minimum Notice Days</label>
              <input type="number" className="form-control" value={minimumNoticeDays} onChange={(e) => setMinimumNoticeDays(e.target.value)} />
            </div>
            <div className="col-6">
              <div className="form-check mt-3">
                <input type="checkbox" className="form-check-input" id="paidCheck" checked={paid} onChange={(e) => setPaid(e.target.checked)} />
                <label className="form-check-label small fw-semibold" htmlFor="paidCheck">Paid Leave</label>
              </div>
            </div>
            <div className="col-6">
              <div className="form-check mt-3">
                <input type="checkbox" className="form-check-input" id="docCheck" checked={requiresDocument} onChange={(e) => setRequiresDocument(e.target.checked)} />
                <label className="form-check-label small fw-semibold" htmlFor="docCheck">Requires Medical Document</label>
              </div>
            </div>
            <div className="col-6">
              <div className="form-check mt-2">
                <input type="checkbox" className="form-check-input" id="carryCheck" checked={carryForwardAllowed} onChange={(e) => setCarryForwardAllowed(e.target.checked)} />
                <label className="form-check-label small fw-semibold" htmlFor="carryCheck">Allow Carry Forward</label>
              </div>
            </div>
            {carryForwardAllowed && (
              <div className="col-6">
                <label className="form-label small fw-semibold">Max Carry Forward (Days)</label>
                <input type="number" className="form-control" value={maxCarryForward} onChange={(e) => setMaxCarryForward(e.target.value)} />
              </div>
            )}
          </div>
          <div className="mt-4 text-end gap-2 d-flex justify-content-end">
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-sm fw-bold">Save Leave Type</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default LeaveTypesAdmin;
