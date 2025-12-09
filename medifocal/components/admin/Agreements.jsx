import React, { useState, useEffect } from 'react';
import { getAgreements, createAgreement } from '../../services/fieldService';
import { getLocations } from '../../services/fieldService';
import { Timestamp } from 'firebase/firestore';
import './Agreements.css';

const Agreements = () => {
  const [agreements, setAgreements] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    locationId: '',
    startDate: '',
    endDate: '',
    description: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [agreementsList, locs] = await Promise.all([
        getAgreements(),
        getLocations()
      ]);
      setAgreements(agreementsList);
      setLocations(locs);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createAgreement({
        name: formData.name,
        locationId: formData.locationId,
        startDate: formData.startDate ? Timestamp.fromDate(new Date(formData.startDate)) : null,
        endDate: formData.endDate ? Timestamp.fromDate(new Date(formData.endDate)) : null,
        description: formData.description,
        state: 'draft'
      });
      setShowCreateModal(false);
      setFormData({ name: '', locationId: '', startDate: '', endDate: '', description: '' });
      loadData();
    } catch (error) {
      console.error('Error creating agreement:', error);
      alert('Failed to create agreement');
    }
  };

  if (loading) {
    return <div className="admin-loading">Loading agreements...</div>;
  }

  return (
    <div className="agreements">
      <div className="page-header">
        <h3>Service Agreements</h3>
        <button className="create-button" onClick={() => setShowCreateModal(true)}>
          + Create Agreement
        </button>
      </div>

      <div className="agreements-grid">
        {agreements.length === 0 ? (
          <div className="empty-state">No agreements found</div>
        ) : (
          agreements.map((agreement) => (
            <div key={agreement.id} className="agreement-card">
              <h4>{agreement.name}</h4>
              <div className="agreement-details">
                {agreement.locationId && (
                  <div className="detail-item">
                    <span className="label">Location:</span>
                    <span className="value">
                      {locations.find(l => l.id === agreement.locationId)?.name || 'N/A'}
                    </span>
                  </div>
                )}
                {agreement.startDate && (
                  <div className="detail-item">
                    <span className="label">Start:</span>
                    <span className="value">
                      {agreement.startDate.toDate ? agreement.startDate.toDate().toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                )}
                {agreement.endDate && (
                  <div className="detail-item">
                    <span className="label">End:</span>
                    <span className="value">
                      {agreement.endDate.toDate ? agreement.endDate.toDate().toLocaleDateString() : 'N/A'}
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
            <h4>Create Service Agreement</h4>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Agreement Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Annual Maintenance Contract"
                />
              </div>
              <div className="form-group">
                <label>Location</label>
                <select
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
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="4"
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

export default Agreements;

