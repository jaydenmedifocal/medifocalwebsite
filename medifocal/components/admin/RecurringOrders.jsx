import React, { useState, useEffect } from 'react';
import { getRecurringOrders, createRecurringOrder, startRecurringOrder } from '../../services/fieldService';
import { getLocations } from '../../services/fieldService';
import { getTechnicians } from '../../services/fieldService';
import { Timestamp } from 'firebase/firestore';
import './RecurringOrders.css';

const RecurringOrders = () => {
  const [recurringOrders, setRecurringOrders] = useState([]);
  const [locations, setLocations] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    locationId: '',
    technicianId: '',
    frequency: 'weekly',
    interval: 1,
    startDate: '',
    endDate: '',
    maxOrders: 0,
    description: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [recurring, locs, techs] = await Promise.all([
        getRecurringOrders(),
        getLocations(),
        getTechnicians()
      ]);
      setRecurringOrders(recurring);
      setLocations(locs);
      setTechnicians(techs);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createRecurringOrder({
        name: formData.name || `REC-${Date.now()}`,
        locationId: formData.locationId,
        personId: formData.technicianId,
        frequency: formData.frequency,
        interval: parseInt(formData.interval) || 1,
        startDate: formData.startDate ? Timestamp.fromDate(new Date(formData.startDate)) : null,
        endDate: formData.endDate ? Timestamp.fromDate(new Date(formData.endDate)) : null,
        maxOrders: parseInt(formData.maxOrders) || 0,
        description: formData.description,
        state: 'draft'
      });
      setShowCreateModal(false);
      setFormData({
        name: '',
        locationId: '',
        technicianId: '',
        frequency: 'weekly',
        interval: 1,
        startDate: '',
        endDate: '',
        maxOrders: 0,
        description: ''
      });
      loadData();
    } catch (error) {
      console.error('Error creating recurring order:', error);
      alert('Failed to create recurring order');
    }
  };

  const handleStart = async (recurringId) => {
    if (window.confirm('Start this recurring order? This will begin generating service orders.')) {
      try {
        await startRecurringOrder(recurringId);
        loadData();
      } catch (error) {
        console.error('Error starting recurring order:', error);
        alert('Failed to start recurring order');
      }
    }
  };

  const getStateColor = (state) => {
    const colors = {
      draft: '#6c757d',
      progress: '#0066cc',
      suspend: '#ffc107',
      close: '#28a745'
    };
    return colors[state] || '#6c757d';
  };

  if (loading) {
    return <div className="admin-loading">Loading recurring orders...</div>;
  }

  return (
    <div className="recurring-orders">
      <div className="page-header">
        <h3>Recurring Service Orders</h3>
        <button className="create-button" onClick={() => setShowCreateModal(true)}>
          + Create Recurring Order
        </button>
      </div>

      <div className="recurring-grid">
        {recurringOrders.length === 0 ? (
          <div className="empty-state">No recurring orders found</div>
        ) : (
          recurringOrders.map((recurring) => (
            <div key={recurring.id} className="recurring-card">
              <div className="recurring-header">
                <h4>{recurring.name}</h4>
                <span className="state-badge" style={{ backgroundColor: getStateColor(recurring.state) }}>
                  {recurring.state}
                </span>
              </div>
              <div className="recurring-details">
                <div className="detail-item">
                  <span className="label">Location:</span>
                  <span className="value">
                    {locations.find(l => l.id === recurring.locationId)?.name || 'N/A'}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="label">Frequency:</span>
                  <span className="value">
                    Every {recurring.interval} {recurring.frequency}
                  </span>
                </div>
                {recurring.maxOrders > 0 && (
                  <div className="detail-item">
                    <span className="label">Max Orders:</span>
                    <span className="value">{recurring.maxOrders}</span>
                  </div>
                )}
              </div>
              <div className="recurring-actions">
                {recurring.state === 'draft' && (
                  <button className="start-btn" onClick={() => handleStart(recurring.id)}>
                    Start
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h4>Create Recurring Order</h4>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Monthly Maintenance"
                />
              </div>
              <div className="form-group">
                <label>Location *</label>
                <select
                  required
                  value={formData.locationId}
                  onChange={(e) => setFormData({ ...formData, locationId: e.target.value })}
                >
                  <option value="">Select Location</option>
                  {locations.map(loc => (
                    <option key={loc.id} value={loc.id}>
                      {loc.completeName || loc.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Frequency</label>
                  <select
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Interval</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.interval}
                    onChange={(e) => setFormData({ ...formData, interval: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Max Orders (0 = unlimited)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.maxOrders}
                  onChange={(e) => setFormData({ ...formData, maxOrders: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
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

export default RecurringOrders;

