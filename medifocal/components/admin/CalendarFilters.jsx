import React, { useState, useEffect } from 'react';
import { getPersonCalendarFilters, createPersonCalendarFilter } from '../../services/fieldService';
import { getTechnicians } from '../../services/fieldService';
import { useAuth } from '../../contexts/AuthContext';
import './CalendarFilters.css';

const CalendarFilters = () => {
  const { user } = useAuth();
  const [filters, setFilters] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [formData, setFormData] = useState({
    technicianId: '',
    personChecked: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [filtersList, techs] = await Promise.all([
        getPersonCalendarFilters(user?.uid),
        getTechnicians()
      ]);
      setFilters(filtersList);
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
      await createPersonCalendarFilter({
        userId: user?.uid,
        personId: formData.technicianId,
        personChecked: formData.personChecked
      });
      setShowCreateModal(false);
      setFormData({ technicianId: '', personChecked: true });
      loadData();
    } catch (error) {
      console.error('Error creating filter:', error);
      alert('Failed to create calendar filter');
    }
  };

  if (loading) {
    return <div className="admin-loading">Loading calendar filters...</div>;
  }

  return (
    <div className="calendar-filters">
      <div className="page-header">
        <h3>Personal Calendar Filters</h3>
        <button className="create-button" onClick={() => setShowCreateModal(true)}>
          + Add Filter
        </button>
      </div>

      <div className="filters-list">
        {filters.length === 0 ? (
          <div className="empty-state">No calendar filters found. Add filters to customize your calendar view.</div>
        ) : (
          filters.map((filter) => (
            <div key={filter.id} className="filter-card">
              <div className="filter-header">
                <h4>
                  {technicians.find(t => t.id === filter.personId)?.displayName || 'Unknown Technician'}
                </h4>
                <span className={`status-badge ${filter.personChecked ? 'checked' : 'unchecked'}`}>
                  {filter.personChecked ? 'Shown' : 'Hidden'}
                </span>
              </div>
              {filter.active !== false && (
                <span className="active-badge">Active</span>
              )}
            </div>
          ))
        )}
      </div>

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h4>Create Calendar Filter</h4>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Technician *</label>
                <select
                  required
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
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.personChecked}
                    onChange={(e) => setFormData({ ...formData, personChecked: e.target.checked })}
                  />
                  Show in Calendar (checked) or Hide (unchecked)
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

export default CalendarFilters;

