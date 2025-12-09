import React, { useState, useEffect } from 'react';
import { getLocationPersons, assignTechnicianToLocation } from '../../services/fieldService';
import { getLocations } from '../../services/fieldService';
import { getTechnicians } from '../../services/fieldService';
import './LocationPersons.css';

const LocationPersons = () => {
  const [locationPersons, setLocationPersons] = useState([]);
  const [locations, setLocations] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterLocationId, setFilterLocationId] = useState('all');

  const [formData, setFormData] = useState({
    locationId: '',
    technicianId: '',
    sequence: 10
  });

  useEffect(() => {
    loadData();
  }, [filterLocationId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [locs, techs] = await Promise.all([
        getLocations(),
        getTechnicians()
      ]);
      setLocations(locs);
      setTechnicians(techs);

      const filters = filterLocationId !== 'all' ? { locationId: filterLocationId } : {};
      const assignments = await getLocationPersons(filterLocationId !== 'all' ? filterLocationId : null);
      setLocationPersons(assignments);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await assignTechnicianToLocation(formData.locationId, formData.technicianId, parseInt(formData.sequence));
      setShowCreateModal(false);
      setFormData({ locationId: '', technicianId: '', sequence: 10 });
      loadData();
    } catch (error) {
      console.error('Error assigning technician:', error);
      alert('Failed to assign technician. They may already be assigned to this location.');
    }
  };

  if (loading) {
    return <div className="admin-loading">Loading location assignments...</div>;
  }

  return (
    <div className="location-persons">
      <div className="page-header">
        <h3>Location Technician Assignments</h3>
        <button className="create-button" onClick={() => setShowCreateModal(true)}>
          + Assign Technician
        </button>
      </div>

      <div className="filters">
        <label>Filter by Location:</label>
        <select value={filterLocationId} onChange={(e) => setFilterLocationId(e.target.value)}>
          <option value="all">All Locations</option>
          {locations.map(loc => (
            <option key={loc.id} value={loc.id}>
              {loc.completeName || loc.name}
            </option>
          ))}
        </select>
      </div>

      <div className="assignments-list">
        {locationPersons.length === 0 ? (
          <div className="empty-state">
            {filterLocationId === 'all' ? 'No technician assignments found' : 'No technicians assigned to this location'}
          </div>
        ) : (
          locationPersons.map((assignment) => (
            <div key={assignment.id} className="assignment-card">
              <div className="assignment-header">
                <h4>
                  {locations.find(l => l.id === assignment.locationId)?.completeName || assignment.locationId}
                </h4>
                <span className="sequence-badge">Priority: {assignment.sequence}</span>
              </div>
              <div className="assignment-details">
                <div className="detail-item">
                  <span className="label">Technician:</span>
                  <span className="value">
                    {technicians.find(t => t.id === assignment.personId)?.displayName || 'N/A'}
                  </span>
                </div>
                {assignment.email && (
                  <div className="detail-item">
                    <span className="label">Email:</span>
                    <span className="value">{assignment.email}</span>
                  </div>
                )}
                {assignment.phone && (
                  <div className="detail-item">
                    <span className="label">Phone:</span>
                    <span className="value">{assignment.phone}</span>
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
            <h4>Assign Technician to Location</h4>
            <form onSubmit={handleCreate}>
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
                <label>Priority Sequence (lower = higher priority)</label>
                <input
                  type="number"
                  min="1"
                  value={formData.sequence}
                  onChange={(e) => setFormData({ ...formData, sequence: e.target.value })}
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn-primary">Assign</button>
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

export default LocationPersons;

