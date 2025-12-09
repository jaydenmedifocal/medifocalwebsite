import React, { useState, useEffect } from 'react';
import { getSizes, createSize } from '../../services/fieldService';
import { getOrderTypes } from '../../services/fieldService';
import './Sizes.css';

const Sizes = () => {
  const [sizes, setSizes] = useState([]);
  const [orderTypes, setOrderTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    typeId: '',
    parentId: '',
    isOrderSize: false
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [sizesList, types] = await Promise.all([
        getSizes(),
        getOrderTypes()
      ]);
      setSizes(sizesList);
      setOrderTypes(types);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createSize({
        name: formData.name,
        typeId: formData.typeId || null,
        parentId: formData.parentId || null,
        isOrderSize: formData.isOrderSize
      });
      setShowCreateModal(false);
      setFormData({ name: '', typeId: '', parentId: '', isOrderSize: false });
      loadData();
    } catch (error) {
      console.error('Error creating size:', error);
      alert('Failed to create size');
    }
  };

  if (loading) {
    return <div className="admin-loading">Loading sizes...</div>;
  }

  return (
    <div className="sizes">
      <div className="page-header">
        <h3>Size Management</h3>
        <button className="create-button" onClick={() => setShowCreateModal(true)}>
          + Create Size
        </button>
      </div>

      <div className="sizes-grid">
        {sizes.length === 0 ? (
          <div className="empty-state">No sizes found</div>
        ) : (
          sizes.map((size) => (
            <div key={size.id} className="size-card">
              <h4>{size.name}</h4>
              {size.typeId && (
                <p className="size-detail">
                  Type: {orderTypes.find(t => t.id === size.typeId)?.name || 'N/A'}
                </p>
              )}
              {size.isOrderSize && <span className="order-size-badge">Default Order Size</span>}
            </div>
          ))
        )}
      </div>

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h4>Create Size</h4>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Size Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Small, Medium, Large"
                />
              </div>
              <div className="form-group">
                <label>Order Type</label>
                <select
                  value={formData.typeId}
                  onChange={(e) => setFormData({ ...formData, typeId: e.target.value })}
                >
                  <option value="">None</option>
                  {orderTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Parent Size</label>
                <select
                  value={formData.parentId}
                  onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                >
                  <option value="">None</option>
                  {sizes.map(size => (
                    <option key={size.id} value={size.id}>{size.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.isOrderSize}
                    onChange={(e) => setFormData({ ...formData, isOrderSize: e.target.checked })}
                  />
                  Default Order Size for this Type
                </label>
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

export default Sizes;

