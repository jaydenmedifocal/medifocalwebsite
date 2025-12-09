import React, { useState, useEffect } from 'react';
import { getOrderTypes, createOrderType } from '../../services/fieldService';
import './OrderTypes.css';

const OrderTypes = () => {
  const [orderTypes, setOrderTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    internalType: 'fsm'
  });

  useEffect(() => {
    loadOrderTypes();
  }, []);

  const loadOrderTypes = async () => {
    try {
      setLoading(true);
      const typesList = await getOrderTypes();
      setOrderTypes(typesList);
    } catch (error) {
      console.error('Error loading order types:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createOrderType({
        name: formData.name,
        internalType: formData.internalType
      });
      setShowCreateModal(false);
      setFormData({ name: '', internalType: 'fsm' });
      loadOrderTypes();
    } catch (error) {
      console.error('Error creating order type:', error);
      alert('Failed to create order type');
    }
  };

  if (loading) {
    return <div className="admin-loading">Loading order types...</div>;
  }

  return (
    <div className="order-types">
      <div className="page-header">
        <h3>Order Types</h3>
        <button className="create-button" onClick={() => setShowCreateModal(true)}>
          + Create Order Type
        </button>
      </div>

      <div className="types-grid">
        {orderTypes.length === 0 ? (
          <div className="empty-state">No order types found</div>
        ) : (
          orderTypes.map((type) => (
            <div key={type.id} className="type-card">
              <h4>{type.name}</h4>
              <span className="type-badge">{type.internalType || 'fsm'}</span>
            </div>
          ))
        )}
      </div>

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h4>Create Order Type</h4>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Type Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Installation, Repair, Maintenance"
                />
              </div>
              <div className="form-group">
                <label>Internal Type</label>
                <select
                  value={formData.internalType}
                  onChange={(e) => setFormData({ ...formData, internalType: e.target.value })}
                >
                  <option value="fsm">FSM</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn-primary">Create</button>
                <button type="button" className="btn-secondary" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderTypes;

