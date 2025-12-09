import React, { useState, useEffect } from 'react';
import { getRoutes, createRoute } from '../../services/fieldService';
import { getTechnicians } from '../../services/fieldService';
import { Timestamp } from 'firebase/firestore';
import './Routes.css';

const Routes = () => {
  const [routes, setRoutes] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    technicianId: '',
    days: [],
    maxOrder: 0
  });

  const daysOfWeek = [
    { id: 'mo', label: 'Monday' },
    { id: 'tu', label: 'Tuesday' },
    { id: 'we', label: 'Wednesday' },
    { id: 'th', label: 'Thursday' },
    { id: 'fr', label: 'Friday' },
    { id: 'sa', label: 'Saturday' },
    { id: 'su', label: 'Sunday' }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [routesList, techs] = await Promise.all([
        getRoutes(),
        getTechnicians()
      ]);
      setRoutes(routesList);
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
      await createRoute({
        name: formData.name,
        personId: formData.technicianId,
        dayIds: formData.days,
        maxOrder: parseInt(formData.maxOrder) || 0
      });
      setShowCreateModal(false);
      setFormData({ name: '', technicianId: '', days: [], maxOrder: 0 });
      loadData();
    } catch (error) {
      console.error('Error creating route:', error);
      alert('Failed to create route');
    }
  };

  const toggleDay = (dayId) => {
    setFormData({
      ...formData,
      days: formData.days.includes(dayId)
        ? formData.days.filter(d => d !== dayId)
        : [...formData.days, dayId]
    });
  };

  if (loading) {
    return <div className="admin-loading">Loading routes...</div>;
  }

  return (
    <div className="routes">
      <div className="page-header">
        <h3>Technician Routes</h3>
        <button className="create-button" onClick={() => setShowCreateModal(true)}>
          + Create Route
        </button>
      </div>

      <div className="routes-grid">
        {routes.length === 0 ? (
          <div className="empty-state">No routes found</div>
        ) : (
          routes.map((route) => (
            <div key={route.id} className="route-card">
              <h4>{route.name}</h4>
              <div className="route-details">
                <div className="detail-item">
                  <span className="label">Technician:</span>
                  <span className="value">
                    {technicians.find(t => t.id === route.personId)?.displayName || 'Unassigned'}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="label">Max Orders:</span>
                  <span className="value">{route.maxOrder || 'Unlimited'}</span>
                </div>
                {route.dayIds && route.dayIds.length > 0 && (
                  <div className="detail-item">
                    <span className="label">Days:</span>
                    <span className="value">
                      {route.dayIds.map(dayId => {
                        const day = daysOfWeek.find(d => d.id === dayId);
                        return day ? day.label : dayId;
                      }).join(', ')}
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
            <h4>Create Route</h4>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Route Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., North Route"
                />
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
                <label>Days of Week</label>
                <div className="days-selector">
                  {daysOfWeek.map(day => (
                    <label key={day.id} className="day-checkbox">
                      <input
                        type="checkbox"
                        checked={formData.days.includes(day.id)}
                        onChange={() => toggleDay(day.id)}
                      />
                      {day.label}
                    </label>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Max Orders per Day (0 = unlimited)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.maxOrder}
                  onChange={(e) => setFormData({ ...formData, maxOrder: e.target.value })}
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

export default Routes;

