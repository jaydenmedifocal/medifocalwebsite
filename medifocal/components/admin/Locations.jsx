import React, { useState, useEffect } from 'react';
import { getLocations } from '../../services/fieldService';
import { collection, addDoc, getDocs, query, limit } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Timestamp } from 'firebase/firestore';
import './Locations.css';

const Locations = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: 'Australia',
    direction: '',
    description: '',
    parentId: ''
  });

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    try {
      setLoading(true);
      const locs = await getLocations();
      setLocations(locs);
    } catch (error) {
      console.error('Error loading locations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLocation = async (e) => {
    e.preventDefault();
    try {
      // Try fsmLocations first, fallback to addresses
      let locationsRef = collection(db, 'fsmLocations');
      
      try {
        await getDocs(query(locationsRef, limit(1)));
      } catch (error) {
        locationsRef = collection(db, 'addresses');
      }

      const locationData = {
        name: formData.name,
        completeName: formData.name,
        complete_name: formData.name,
        street: formData.street,
        city: formData.city,
        state: formData.state,
        state_name: formData.state,
        zip: formData.zip,
        postcode: formData.zip,
        country: formData.country,
        country_name: formData.country,
        direction: formData.direction,
        description: formData.description,
        parentId: formData.parentId || null,
        parent_id: formData.parentId || null,
        fsm_location: true,
        createdAt: Timestamp.now(),
        created_at: Timestamp.now(),
        updatedAt: Timestamp.now(),
        updated_at: Timestamp.now()
      };

      await addDoc(locationsRef, locationData);
      setShowCreateModal(false);
      setFormData({
        name: '',
        street: '',
        city: '',
        state: '',
        zip: '',
        country: 'Australia',
        direction: '',
        description: '',
        parentId: ''
      });
      loadLocations();
    } catch (error) {
      console.error('Error creating location:', error);
      alert('Failed to create location');
    }
  };

  const handleViewDetails = (location) => {
    setSelectedLocation(location);
    setShowDetailsModal(true);
  };

  if (loading) {
    return <div className="admin-loading">Loading locations...</div>;
  }

  return (
    <div className="locations">
      <div className="page-header">
        <h3>Service Locations</h3>
        <button className="create-button" onClick={() => setShowCreateModal(true)}>
          + Add Location
        </button>
      </div>

      <div className="locations-grid">
        {locations.length === 0 ? (
          <div className="empty-state">
            <p>No locations found. Create your first service location.</p>
          </div>
        ) : (
          locations.map((location) => (
            <div key={location.id} className="location-card">
              <div className="location-header">
                <h4>{location.completeName || location.name || 'Unnamed Location'}</h4>
              </div>

              <div className="location-details">
                {location.street && (
                  <div className="detail-item">
                    <span className="label">Address:</span>
                    <span className="value">
                      {location.street}
                      {location.city && `, ${location.city}`}
                      {location.state && `, ${location.state}`}
                      {location.zip && ` ${location.zip}`}
                    </span>
                  </div>
                )}
                {location.direction && (
                  <div className="detail-item">
                    <span className="label">Directions:</span>
                    <span className="value">{location.direction}</span>
                  </div>
                )}
                {location.equipmentCount > 0 && (
                  <div className="detail-item">
                    <span className="label">Equipment:</span>
                    <span className="value">{location.equipmentCount}</span>
                  </div>
                )}
              </div>

              <div className="location-actions">
                <button 
                  className="view-btn"
                  onClick={() => handleViewDetails(location)}
                >
                  View Details
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h4>Create Service Location</h4>
            <form onSubmit={handleCreateLocation}>
              <div className="form-group">
                <label>Location Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Main Office, Customer Site"
                />
              </div>

              <div className="form-group">
                <label>Street Address</label>
                <input
                  type="text"
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  placeholder="Street address"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="City"
                  />
                </div>

                <div className="form-group">
                  <label>State</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="State"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Postcode</label>
                  <input
                    type="text"
                    value={formData.zip}
                    onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                    placeholder="Postcode"
                  />
                </div>

                <div className="form-group">
                  <label>Country</label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    placeholder="Country"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Directions</label>
                <textarea
                  value={formData.direction}
                  onChange={(e) => setFormData({ ...formData, direction: e.target.value })}
                  rows="3"
                  placeholder="Directions to location..."
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                  placeholder="Location description..."
                />
              </div>

              <div className="modal-actions">
                <button type="submit" className="btn-primary">Create Location</button>
                <button type="button" className="btn-secondary" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDetailsModal && selectedLocation && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h4>Location Details</h4>
            <div className="location-details-modal">
              <div className="detail-row">
                <span className="detail-label">Name:</span>
                <span className="detail-value">{selectedLocation.completeName || selectedLocation.name}</span>
              </div>
              {selectedLocation.street && (
                <div className="detail-row">
                  <span className="detail-label">Address:</span>
                  <span className="detail-value">
                    {selectedLocation.street}
                    {selectedLocation.city && `, ${selectedLocation.city}`}
                    {selectedLocation.state && `, ${selectedLocation.state}`}
                    {selectedLocation.zip && ` ${selectedLocation.zip}`}
                  </span>
                </div>
              )}
              {selectedLocation.direction && (
                <div className="detail-row">
                  <span className="detail-label">Directions:</span>
                  <span className="detail-value">{selectedLocation.direction}</span>
                </div>
              )}
              {selectedLocation.description && (
                <div className="detail-row">
                  <span className="detail-label">Description:</span>
                  <span className="detail-value">{selectedLocation.description}</span>
                </div>
              )}
              {selectedLocation.equipmentCount > 0 && (
                <div className="detail-row">
                  <span className="detail-label">Equipment Count:</span>
                  <span className="detail-value">{selectedLocation.equipmentCount}</span>
                </div>
              )}
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowDetailsModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Locations;

