import React, { useState, useEffect } from 'react';
import { getRepairOrders, createRepairOrder } from '../../services/fieldService';
import { getServiceOrders } from '../../services/fieldService';
import { getEquipment } from '../../services/fieldService';
import './RepairOrders.css';

const RepairOrders = () => {
  const [repairOrders, setRepairOrders] = useState([]);
  const [orders, setOrders] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterOrderId, setFilterOrderId] = useState('all');

  const [formData, setFormData] = useState({
    orderId: '',
    equipmentId: '',
    description: ''
  });

  useEffect(() => {
    loadData();
  }, [filterOrderId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ordersList, equip] = await Promise.all([
        getServiceOrders(),
        getEquipment()
      ]);
      setOrders(ordersList);
      setEquipment(equip);

      if (filterOrderId !== 'all') {
        const repairs = await getRepairOrders(filterOrderId);
        setRepairOrders(repairs);
      } else {
        setRepairOrders([]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const selectedEquip = equipment.find(e => e.id === formData.equipmentId);
      await createRepairOrder({
        name: `${orders.find(o => o.id === formData.orderId)?.name || formData.orderId} - ${selectedEquip?.assetName || formData.equipmentId}`,
        fsmOrderId: formData.orderId,
        equipmentId: formData.equipmentId,
        description: formData.description,
        status: 'draft'
      });
      setShowCreateModal(false);
      setFormData({ orderId: '', equipmentId: '', description: '' });
      loadData();
    } catch (error) {
      console.error('Error creating repair order:', error);
      alert('Failed to create repair order');
    }
  };

  if (loading) {
    return <div className="admin-loading">Loading repair orders...</div>;
  }

  return (
    <div className="repair-orders">
      <div className="page-header">
        <h3>Repair Orders</h3>
        <button className="create-button" onClick={() => setShowCreateModal(true)}>
          + Create Repair Order
        </button>
      </div>

      <div className="filters">
        <label>Filter by Service Order:</label>
        <select value={filterOrderId} onChange={(e) => setFilterOrderId(e.target.value)}>
          <option value="all">All Orders</option>
          {orders.map(order => (
            <option key={order.id} value={order.id}>
              {order.name || order.id}
            </option>
          ))}
        </select>
      </div>

      <div className="repairs-list">
        {repairOrders.length === 0 ? (
          <div className="empty-state">
            {filterOrderId === 'all' ? 'Select an order to view repair orders' : 'No repair orders found'}
          </div>
        ) : (
          repairOrders.map((repair) => (
            <div key={repair.id} className="repair-card">
              <h4>{repair.name}</h4>
              <div className="repair-details">
                {repair.equipmentId && (
                  <div className="detail-item">
                    <span className="label">Equipment:</span>
                    <span className="value">
                      {equipment.find(e => e.id === repair.equipmentId)?.assetName || 'N/A'}
                    </span>
                  </div>
                )}
                {repair.status && (
                  <div className="detail-item">
                    <span className="label">Status:</span>
                    <span className={`status-badge ${repair.status}`}>{repair.status}</span>
                  </div>
                )}
                {repair.description && (
                  <div className="detail-item">
                    <span className="label">Description:</span>
                    <span className="value">{repair.description}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h4>Create Repair Order</h4>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Service Order *</label>
                <select
                  required
                  value={formData.orderId}
                  onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
                >
                  <option value="">Select Order</option>
                  {orders.map(order => (
                    <option key={order.id} value={order.id}>
                      {order.name || order.id}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Equipment *</label>
                <select
                  required
                  value={formData.equipmentId}
                  onChange={(e) => setFormData({ ...formData, equipmentId: e.target.value })}
                >
                  <option value="">Select Equipment</option>
                  {equipment.map(equip => (
                    <option key={equip.id} value={equip.id}>
                      {equip.assetName || equip.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="4"
                  placeholder="Repair description..."
                />
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

export default RepairOrders;

