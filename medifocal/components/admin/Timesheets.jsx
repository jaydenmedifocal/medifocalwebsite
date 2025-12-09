import React, { useState, useEffect } from 'react';
import { getTimesheets, createTimesheet } from '../../services/fieldService';
import { getServiceOrders } from '../../services/fieldService';
import { getTechnicians } from '../../services/fieldService';
import { Timestamp } from 'firebase/firestore';
import './Timesheets.css';

const Timesheets = () => {
  const [timesheets, setTimesheets] = useState([]);
  const [orders, setOrders] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterOrderId, setFilterOrderId] = useState('all');

  const [formData, setFormData] = useState({
    orderId: '',
    technicianId: '',
    date: new Date().toISOString().split('T')[0],
    hours: 0,
    description: ''
  });

  useEffect(() => {
    loadData();
  }, [filterOrderId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ordersList, techs] = await Promise.all([
        getServiceOrders(),
        getTechnicians()
      ]);
      setOrders(ordersList);
      setTechnicians(techs);

      if (filterOrderId !== 'all') {
        const timesheetsList = await getTimesheets(filterOrderId);
        setTimesheets(timesheetsList);
      } else {
        setTimesheets([]);
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
      await createTimesheet({
        fsmOrderId: formData.orderId,
        technicianId: formData.technicianId,
        date: Timestamp.fromDate(new Date(formData.date)),
        hours: parseFloat(formData.hours) || 0,
        description: formData.description
      });
      setShowCreateModal(false);
      setFormData({ orderId: '', technicianId: '', date: new Date().toISOString().split('T')[0], hours: 0, description: '' });
      loadData();
    } catch (error) {
      console.error('Error creating timesheet:', error);
      alert('Failed to create timesheet');
    }
  };

  if (loading) {
    return <div className="admin-loading">Loading timesheets...</div>;
  }

  return (
    <div className="timesheets">
      <div className="page-header">
        <h3>Timesheet Tracking</h3>
        <button className="create-button" onClick={() => setShowCreateModal(true)}>
          + Add Timesheet Entry
        </button>
      </div>

      <div className="filters">
        <label>Filter by Order:</label>
        <select value={filterOrderId} onChange={(e) => setFilterOrderId(e.target.value)}>
          <option value="all">All Orders</option>
          {orders.map(order => (
            <option key={order.id} value={order.id}>
              {order.name || order.id}
            </option>
          ))}
        </select>
      </div>

      <div className="timesheets-list">
        {timesheets.length === 0 ? (
          <div className="empty-state">
            {filterOrderId === 'all' ? 'Select an order to view timesheets' : 'No timesheet entries found'}
          </div>
        ) : (
          timesheets.map((timesheet) => (
            <div key={timesheet.id} className="timesheet-card">
              <div className="timesheet-header">
                <h4>
                  {orders.find(o => o.id === timesheet.fsmOrderId)?.name || timesheet.fsmOrderId}
                </h4>
                <span className="hours-badge">{timesheet.hours || 0} hours</span>
              </div>
              <div className="timesheet-details">
                {timesheet.technicianId && (
                  <div className="detail-item">
                    <span className="label">Technician:</span>
                    <span className="value">
                      {technicians.find(t => t.id === timesheet.technicianId)?.displayName || 'N/A'}
                    </span>
                  </div>
                )}
                {timesheet.date && (
                  <div className="detail-item">
                    <span className="label">Date:</span>
                    <span className="value">
                      {timesheet.date.toDate ? timesheet.date.toDate().toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                )}
                {timesheet.description && (
                  <div className="detail-item">
                    <span className="label">Description:</span>
                    <span className="value">{timesheet.description}</span>
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
            <h4>Add Timesheet Entry</h4>
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
                <label>Technician</label>
                <select
                  value={formData.technicianId}
                  onChange={(e) => setFormData({ ...formData, technicianId: e.target.value })}
                >
                  <option value="">Select Technician</option>
                  {technicians.map(tech => (
                    <option key={tech.id} value={tech.id}>
                      {tech.displayName || tech.email}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Hours *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.25"
                    value={formData.hours}
                    onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                  placeholder="Work description..."
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

export default Timesheets;

