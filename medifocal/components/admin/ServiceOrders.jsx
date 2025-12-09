import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getServiceOrders, updateServiceOrder, createServiceOrder } from '../../services/fieldService';
import { getTechnicians } from '../../services/fieldService';
import { getLocations } from '../../services/fieldService';
import { Timestamp } from 'firebase/firestore';
import './ServiceOrders.css';

const ServiceOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    locationId: '',
    technicianId: '',
    priority: '0', // Normal
    scheduledDateStart: '',
    scheduledDuration: '',
    description: '',
    equipmentId: ''
  });

  const [technicians, setTechnicians] = useState([]);
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    loadOrders();
    loadTechnicians();
    loadLocations();
  }, [filterStatus]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const filters = filterStatus !== 'all' ? { status: filterStatus } : {};
      const ordersList = await getServiceOrders(filters);
      setOrders(ordersList);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTechnicians = async () => {
    const techs = await getTechnicians();
    setTechnicians(techs);
  };

  const loadLocations = async () => {
    const locs = await getLocations();
    setLocations(locs);
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    try {
      const orderData = {
        name: formData.name || `SO-${Date.now()}`,
        locationId: formData.locationId,
        personId: formData.technicianId,
        priority: formData.priority,
        scheduledDateStart: formData.scheduledDateStart ? Timestamp.fromDate(new Date(formData.scheduledDateStart)) : null,
        scheduledDuration: parseFloat(formData.scheduledDuration) || 0,
        description: formData.description,
        equipmentId: formData.equipmentId,
        type: 'service',
        status: 'pending',
        stage: 'pending'
      };

      await createServiceOrder(orderData);
      setShowCreateModal(false);
      setFormData({
        name: '',
        locationId: '',
        technicianId: '',
        priority: '0',
        scheduledDateStart: '',
        scheduledDuration: '',
        description: '',
        equipmentId: ''
      });
      loadOrders();
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to create service order');
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateServiceOrder(orderId, { status: newStatus, stage: newStatus });
      loadOrders();
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Failed to update order status');
    }
  };

  const getPriorityLabel = (priority) => {
    const priorities = {
      '0': { label: 'Normal', color: '#6c757d' },
      '1': { label: 'Low', color: '#17a2b8' },
      '2': { label: 'High', color: '#ffc107' },
      '3': { label: 'Urgent', color: '#dc3545' }
    };
    return priorities[priority] || priorities['0'];
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#ffc107',
      'in-progress': '#0066cc',
      completed: '#28a745',
      cancelled: '#dc3545'
    };
    return colors[status] || '#6c757d';
  };

  if (loading) {
    return <div className="admin-loading">Loading service orders...</div>;
  }

  return (
    <div className="service-orders">
      <div className="page-header">
        <h3>Service Orders</h3>
        <button className="create-button" onClick={() => setShowCreateModal(true)}>
          + Create Service Order
        </button>
      </div>

      <div className="filters">
        <button
          className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
          onClick={() => setFilterStatus('all')}
        >
          All
        </button>
        <button
          className={`filter-btn ${filterStatus === 'pending' ? 'active' : ''}`}
          onClick={() => setFilterStatus('pending')}
        >
          Pending
        </button>
        <button
          className={`filter-btn ${filterStatus === 'in-progress' ? 'active' : ''}`}
          onClick={() => setFilterStatus('in-progress')}
        >
          In Progress
        </button>
        <button
          className={`filter-btn ${filterStatus === 'completed' ? 'active' : ''}`}
          onClick={() => setFilterStatus('completed')}
        >
          Completed
        </button>
      </div>

      <div className="orders-table-container">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order #</th>
              <th>Location</th>
              <th>Technician</th>
              <th>Priority</th>
              <th>Scheduled</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan="7" className="empty-state">
                  No service orders found
                </td>
              </tr>
            ) : (
              orders.map((order) => {
                const priority = getPriorityLabel(order.priority || '0');
                const statusColor = getStatusColor(order.status || 'pending');
                
                return (
                  <tr key={order.id}>
                    <td>{order.name || order.id}</td>
                    <td>{order.locationName || 'N/A'}</td>
                    <td>{order.technicianName || 'Unassigned'}</td>
                    <td>
                      <span className="priority-badge" style={{ backgroundColor: priority.color }}>
                        {priority.label}
                      </span>
                    </td>
                    <td>
                      {order.scheduledDateStart?.toDate ? (
                        <div>
                          <div>{order.scheduledDateStart.toDate().toLocaleDateString()}</div>
                          {order.scheduledDateEnd?.toDate && (
                            <div className="time-range">
                              {order.scheduledDateStart.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                              {order.scheduledDateEnd.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          )}
                        </div>
                      ) : (
                        'Not scheduled'
                      )}
                    </td>
                    <td>
                      <span className="status-badge" style={{ backgroundColor: statusColor }}>
                        {order.status || 'pending'}
                      </span>
                    </td>
                    <td>
                      <select
                        className="status-select"
                        value={order.status || 'pending'}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      >
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h4>Create Service Order</h4>
            <form onSubmit={handleCreateOrder}>
              <div className="form-group">
                <label>Order Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Auto-generated if empty"
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
                      {loc.completeName || loc.name || loc.street || loc.id}
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
                  <option value="">Unassigned</option>
                  {technicians.map(tech => (
                    <option key={tech.id} value={tech.id}>
                      {tech.displayName || tech.email}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                >
                  <option value="0">Normal</option>
                  <option value="1">Low</option>
                  <option value="2">High</option>
                  <option value="3">Urgent</option>
                </select>
              </div>

              <div className="form-group">
                <label>Scheduled Start</label>
                <input
                  type="datetime-local"
                  value={formData.scheduledDateStart}
                  onChange={(e) => setFormData({ ...formData, scheduledDateStart: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Duration (hours)</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={formData.scheduledDuration}
                  onChange={(e) => setFormData({ ...formData, scheduledDuration: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="4"
                  placeholder="Service order description..."
                />
              </div>

              <div className="modal-actions">
                <button type="submit" className="btn-primary">Create Order</button>
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

export default ServiceOrders;

