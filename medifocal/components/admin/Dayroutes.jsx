import React, { useState, useEffect } from 'react';
import { getDayroutes, createDayroute } from '../../services/fieldService';
import { getRoutes } from '../../services/fieldService';
import { getTechnicians } from '../../services/fieldService';
import { Timestamp } from 'firebase/firestore';
import './Dayroutes.css';

const Dayroutes = () => {
  const [dayroutes, setDayroutes] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterRouteId, setFilterRouteId] = useState('all');

  const [formData, setFormData] = useState({
    routeId: '',
    personId: '',
    date: '',
    dateStartPlanned: '',
    workTime: 8.0,
    maxAllowTime: 10.0,
    maxOrder: 0
  });

  useEffect(() => {
    loadData();
  }, [filterRouteId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [routesList, techs] = await Promise.all([
        getRoutes(),
        getTechnicians()
      ]);
      setRoutes(routesList);
      setTechnicians(techs);

      const filters = filterRouteId !== 'all' ? { routeId: filterRouteId } : {};
      const dayroutesList = await getDayroutes(filters);
      setDayroutes(dayroutesList);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createDayroute({
        name: `${routes.find(r => r.id === formData.routeId)?.name || 'Route'} - ${formData.date}`,
        routeId: formData.routeId,
        personId: formData.personId || null,
        date: formData.date,
        dateStartPlanned: formData.dateStartPlanned || null,
        workTime: parseFloat(formData.workTime) || 8.0,
        maxAllowTime: parseFloat(formData.maxAllowTime) || 10.0,
        maxOrder: parseInt(formData.maxOrder) || 0
      });
      setShowCreateModal(false);
      setFormData({ routeId: '', personId: '', date: '', dateStartPlanned: '', workTime: 8.0, maxAllowTime: 10.0, maxOrder: 0 });
      loadData();
    } catch (error) {
      console.error('Error creating dayroute:', error);
      alert('Failed to create dayroute');
    }
  };

  if (loading) {
    return <div className="admin-loading">Loading dayroutes...</div>;
  }

  return (
    <div className="dayroutes">
      <div className="page-header">
        <h3>Day Routes</h3>
        <button className="create-button" onClick={() => setShowCreateModal(true)}>
          + Create Dayroute
        </button>
      </div>

      <div className="filters">
        <label>Filter by Route:</label>
        <select value={filterRouteId} onChange={(e) => setFilterRouteId(e.target.value)}>
          <option value="all">All Routes</option>
          {routes.map(route => (
            <option key={route.id} value={route.id}>
              {route.name}
            </option>
          ))}
        </select>
      </div>

      <div className="dayroutes-list">
        {dayroutes.length === 0 ? (
          <div className="empty-state">
            {filterRouteId === 'all' ? 'No dayroutes found' : 'No dayroutes found for selected route'}
          </div>
        ) : (
          dayroutes.map((dayroute) => (
            <div key={dayroute.id} className="dayroute-card">
              <div className="dayroute-header">
                <h4>{dayroute.name || `Dayroute ${dayroute.id}`}</h4>
                <div className="capacity-info">
                  <span className="capacity-badge">
                    {dayroute.orderCount || 0} / {dayroute.maxOrder || '∞'} orders
                  </span>
                </div>
              </div>
              <div className="dayroute-details">
                {dayroute.date && (
                  <div className="detail-item">
                    <span className="label">Date:</span>
                    <span className="value">
                      {dayroute.date.toDate ? dayroute.date.toDate().toLocaleDateString() : dayroute.date}
                    </span>
                  </div>
                )}
                {dayroute.personId && (
                  <div className="detail-item">
                    <span className="label">Technician:</span>
                    <span className="value">
                      {technicians.find(t => t.id === dayroute.personId)?.displayName || 'N/A'}
                    </span>
                  </div>
                )}
                {dayroute.workTime && (
                  <div className="detail-item">
                    <span className="label">Work Time:</span>
                    <span className="value">{dayroute.workTime} hours</span>
                  </div>
                )}
                {dayroute.orderRemaining !== undefined && (
                  <div className="detail-item">
                    <span className="label">Available Capacity:</span>
                    <span className={`value ${dayroute.orderRemaining <= 0 ? 'full' : ''}`}>
                      {dayroute.orderRemaining} orders
                    </span>
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
            <h4>Create Dayroute</h4>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Route *</label>
                <select
                  required
                  value={formData.routeId}
                  onChange={(e) => setFormData({ ...formData, routeId: e.target.value })}
                >
                  <option value="">Select Route</option>
                  {routes.map(route => (
                    <option key={route.id} value={route.id}>
                      {route.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Technician</label>
                <select
                  value={formData.personId}
                  onChange={(e) => setFormData({ ...formData, personId: e.target.value })}
                >
                  <option value="">Unassigned</option>
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
                  <label>Planned Start Time</label>
                  <input
                    type="datetime-local"
                    value={formData.dateStartPlanned}
                    onChange={(e) => setFormData({ ...formData, dateStartPlanned: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Work Time (hours)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={formData.workTime}
                    onChange={(e) => setFormData({ ...formData, workTime: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Max Allow Time (hours)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={formData.maxAllowTime}
                    onChange={(e) => setFormData({ ...formData, maxAllowTime: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Max Orders</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.maxOrder}
                    onChange={(e) => setFormData({ ...formData, maxOrder: e.target.value })}
                  />
                </div>
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

export default Dayroutes;

