import React, { useState, useEffect } from 'react';
import { getVehicles, createVehicle, assignDriverToVehicle } from '../../services/fieldService';
import { getTechnicians } from '../../services/fieldService';
import './Vehicles.css';

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  const [formData, setFormData] = useState({
    name: ''
  });

  const [assignFormData, setAssignFormData] = useState({
    driverId: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [vehiclesList, techs] = await Promise.all([
        getVehicles(),
        getTechnicians()
      ]);
      setVehicles(vehiclesList);
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
      await createVehicle({
        name: formData.name
      });
      setShowCreateModal(false);
      setFormData({ name: '' });
      loadData();
    } catch (error) {
      console.error('Error creating vehicle:', error);
      alert('Failed to create vehicle');
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    try {
      await assignDriverToVehicle(selectedVehicle.id, assignFormData.driverId);
      setShowAssignModal(false);
      setAssignFormData({ driverId: '' });
      setSelectedVehicle(null);
      loadData();
      alert('Driver assigned successfully');
    } catch (error) {
      console.error('Error assigning driver:', error);
      alert('Failed to assign driver');
    }
  };

  if (loading) {
    return <div className="admin-loading">Loading vehicles...</div>;
  }

  return (
    <div className="vehicles">
      <div className="page-header">
        <h3>Fleet Management</h3>
        <button className="create-button" onClick={() => setShowCreateModal(true)}>
          + Register Vehicle
        </button>
      </div>

      <div className="vehicles-grid">
        {vehicles.length === 0 ? (
          <div className="empty-state">No vehicles found</div>
        ) : (
          vehicles.map((vehicle) => (
            <div key={vehicle.id} className="vehicle-card">
              <h4>{vehicle.name}</h4>
              <div className="vehicle-details">
                {vehicle.personId && (
                  <div className="detail-item">
                    <span className="label">Driver:</span>
                    <span className="value">
                      {technicians.find(t => t.id === vehicle.personId)?.displayName || 'Unassigned'}
                    </span>
                  </div>
                )}
              </div>
              <button
                className="assign-btn"
                onClick={() => {
                  setSelectedVehicle(vehicle);
                  setAssignFormData({ driverId: vehicle.personId || '' });
                  setShowAssignModal(true);
                }}
              >
                {vehicle.personId ? 'Change Driver' : 'Assign Driver'}
              </button>
            </div>
          ))
        )}
      </div>

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h4>Register Vehicle</h4>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Vehicle Name/ID *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., VAN-001, Truck-123"
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn-primary">Register</button>
                <button type="button" className="btn-secondary" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAssignModal && selectedVehicle && (
        <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h4>Assign Driver: {selectedVehicle.name}</h4>
            <form onSubmit={handleAssign}>
              <div className="form-group">
                <label>Driver</label>
                <select
                  value={assignFormData.driverId}
                  onChange={(e) => setAssignFormData({ ...assignFormData, driverId: e.target.value })}
                >
                  <option value="">Unassigned</option>
                  {technicians.map(tech => (
                    <option key={tech.id} value={tech.id}>
                      {tech.displayName || tech.email}
                    </option>
                  ))}
                </select>
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn-primary">Assign</button>
                <button type="button" className="btn-secondary" onClick={() => setShowAssignModal(false)}>
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

export default Vehicles;

