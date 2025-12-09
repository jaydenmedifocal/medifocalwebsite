import React, { useState, useEffect } from 'react';
import { getTechnicians } from '../../services/fieldService';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import './Technicians.css';

const Technicians = () => {
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTech, setSelectedTech] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    loadTechnicians();
  }, []);

  const loadTechnicians = async () => {
    try {
      setLoading(true);
      const techs = await getTechnicians();
      setTechnicians(techs);
    } catch (error) {
      console.error('Error loading technicians:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (tech) => {
    setSelectedTech(tech);
    setShowDetailsModal(true);
  };

  const handleToggleActive = async (techId, currentActive) => {
    try {
      const techRef = doc(db, 'customers', techId);
      await updateDoc(techRef, {
        active: !currentActive,
        updatedAt: new Date()
      });
      loadTechnicians();
    } catch (error) {
      console.error('Error updating technician:', error);
      alert('Failed to update technician status');
    }
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      technician: '#28a745',
      manager: '#0066cc',
      supervisor: '#6f42c1'
    };
    return colors[role] || '#6c757d';
  };

  if (loading) {
    return <div className="admin-loading">Loading technicians...</div>;
  }

  return (
    <div className="technicians">
      <div className="page-header">
        <h3>Technicians</h3>
        <p>Manage field service technicians and workers</p>
      </div>

      <div className="technicians-grid">
        {technicians.length === 0 ? (
          <div className="empty-state">
            <p>No technicians found. Assign "technician", "manager", or "supervisor" role to users.</p>
          </div>
        ) : (
          technicians.map((tech) => (
            <div key={tech.id} className="technician-card">
              <div className="tech-header">
                <div className="tech-avatar">
                  {tech.displayName ? tech.displayName.charAt(0).toUpperCase() : 'T'}
                </div>
                <div className="tech-info">
                  <h4>{tech.displayName || tech.email}</h4>
                  <span 
                    className="role-badge"
                    style={{ backgroundColor: getRoleBadgeColor(tech.role) }}
                  >
                    {tech.role || 'technician'}
                  </span>
                </div>
              </div>

              <div className="tech-details">
                <div className="detail-item">
                  <span className="label">Email:</span>
                  <span className="value">{tech.email || 'N/A'}</span>
                </div>
                {tech.phone && (
                  <div className="detail-item">
                    <span className="label">Phone:</span>
                    <span className="value">{tech.phone}</span>
                  </div>
                )}
                {tech.territoryIds && tech.territoryIds.length > 0 && (
                  <div className="detail-item">
                    <span className="label">Territories:</span>
                    <span className="value">{tech.territoryIds.length}</span>
                  </div>
                )}
              </div>

              <div className="tech-actions">
                <button 
                  className="view-btn"
                  onClick={() => handleViewDetails(tech)}
                >
                  View Details
                </button>
                <button
                  className={`toggle-btn ${tech.active !== false ? 'active' : ''}`}
                  onClick={() => handleToggleActive(tech.id, tech.active !== false)}
                >
                  {tech.active !== false ? 'Active' : 'Inactive'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showDetailsModal && selectedTech && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h4>Technician Details</h4>
            <div className="tech-details-modal">
              <div className="detail-row">
                <span className="detail-label">Name:</span>
                <span className="detail-value">{selectedTech.displayName || 'Not set'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Email:</span>
                <span className="detail-value">{selectedTech.email}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Role:</span>
                <span 
                  className="role-badge"
                  style={{ backgroundColor: getRoleBadgeColor(selectedTech.role) }}
                >
                  {selectedTech.role || 'technician'}
                </span>
              </div>
              {selectedTech.phone && (
                <div className="detail-row">
                  <span className="detail-label">Phone:</span>
                  <span className="detail-value">{selectedTech.phone}</span>
                </div>
              )}
              <div className="detail-row">
                <span className="detail-label">Status:</span>
                <span className="detail-value">
                  {selectedTech.active !== false ? 'Active' : 'Inactive'}
                </span>
              </div>
              {selectedTech.createdAt && (
                <div className="detail-row">
                  <span className="detail-label">Created:</span>
                  <span className="detail-value">
                    {selectedTech.createdAt.toDate ? 
                      selectedTech.createdAt.toDate().toLocaleDateString() : 
                      'N/A'
                    }
                  </span>
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

export default Technicians;

