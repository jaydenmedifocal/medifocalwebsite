import React, { useState, useEffect } from 'react';
import { getEquipment, reportEquipmentFault, linkEquipmentToStock, getEquipmentStock } from '../../services/fieldService';
import { getLocations } from '../../services/fieldService';
import { getTechnicians } from '../../services/fieldService';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Timestamp } from 'firebase/firestore';
import './Equipment.css';

const Equipment = () => {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [locations, setLocations] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [stockFormData, setStockFormData] = useState({
    productId: '',
    lotId: ''
  });

  const [formData, setFormData] = useState({
    assetName: '',
    locationId: '',
    personId: '',
    currentLocationId: '',
    managedById: '',
    ownedById: '',
    notes: ''
  });

  useEffect(() => {
    loadEquipment();
    loadLocations();
    loadTechnicians();
  }, []);

  const loadEquipment = async () => {
    try {
      setLoading(true);
      const equip = await getEquipment();
      setEquipment(equip);
    } catch (error) {
      console.error('Error loading equipment:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLocations = async () => {
    const locs = await getLocations();
    setLocations(locs);
  };

  const loadTechnicians = async () => {
    const techs = await getTechnicians();
    setTechnicians(techs);
  };

  const handleCreateEquipment = async (e) => {
    e.preventDefault();
    try {
      const equipmentRef = collection(db, 'equipmentAssets');
      
      const equipmentData = {
        assetName: formData.assetName,
        locationId: formData.locationId || null,
        location_id: formData.locationId || null,
        personId: formData.personId || null,
        person_id: formData.personId || null,
        currentLocationId: formData.currentLocationId || formData.locationId || null,
        current_location_id: formData.currentLocationId || formData.locationId || null,
        managedById: formData.managedById || null,
        managed_by_id: formData.managedById || null,
        ownedById: formData.ownedById || null,
        owned_by_id: formData.ownedById || null,
        notes: formData.notes || '',
        createdAt: Timestamp.now(),
        created_at: Timestamp.now(),
        updatedAt: Timestamp.now(),
        updated_at: Timestamp.now()
      };

      await addDoc(equipmentRef, equipmentData);
      setShowCreateModal(false);
      setFormData({
        assetName: '',
        locationId: '',
        personId: '',
        currentLocationId: '',
        managedById: '',
        ownedById: '',
        notes: ''
      });
      loadEquipment();
    } catch (error) {
      console.error('Error creating equipment:', error);
      alert('Failed to create equipment');
    }
  };

  const handleViewDetails = (equip) => {
    setSelectedEquipment(equip);
    setShowDetailsModal(true);
  };

  const handleReportFault = async (equipmentId) => {
    const description = prompt('Describe the equipment fault:');
    if (!description) return;

    try {
      await reportEquipmentFault({
        equipmentId: equipmentId,
        description: description
      });
      alert('Fault reported successfully. Email notification sent.');
    } catch (error) {
      console.error('Error reporting fault:', error);
      alert('Failed to report fault');
    }
  };

  if (loading) {
    return <div className="admin-loading">Loading equipment...</div>;
  }

  return (
    <div className="equipment">
      <div className="page-header">
        <h3>Equipment</h3>
        <button className="create-button" onClick={() => setShowCreateModal(true)}>
          + Register Equipment
        </button>
      </div>

      <div className="equipment-grid">
        {equipment.length === 0 ? (
          <div className="empty-state">
            <p>No equipment found. Register your first equipment.</p>
          </div>
        ) : (
          equipment.map((equip) => (
            <div key={equip.id} className="equipment-card">
              <div className="equipment-header">
                <h4>{equip.assetName || equip.name || 'Unnamed Equipment'}</h4>
              </div>

              <div className="equipment-details">
                {equip.currentLocationId && (
                  <div className="detail-item">
                    <span className="label">Location:</span>
                    <span className="value">
                      {locations.find(l => l.id === equip.currentLocationId)?.name || 'N/A'}
                    </span>
                  </div>
                )}
                {equip.personId && (
                  <div className="detail-item">
                    <span className="label">Operator:</span>
                    <span className="value">
                      {technicians.find(t => t.id === equip.personId)?.displayName || 'N/A'}
                    </span>
                  </div>
                )}
                {equip.lastServiceDate && (
                  <div className="detail-item">
                    <span className="label">Last Service:</span>
                    <span className="value">
                      {equip.lastServiceDate.toDate ? 
                        equip.lastServiceDate.toDate().toLocaleDateString() : 
                        'N/A'
                      }
                    </span>
                  </div>
                )}
                {equip.nextRequiredServiceDate && (
                  <div className="detail-item">
                    <span className="label">Next Service:</span>
                    <span className="value">
                      {equip.nextRequiredServiceDate.toDate ? 
                        equip.nextRequiredServiceDate.toDate().toLocaleDateString() : 
                        'N/A'
                      }
                    </span>
                  </div>
                )}
              </div>

              <div className="equipment-actions">
                <button className="stock-btn" onClick={() => {
                  setSelectedEquipment(equip);
                  setStockFormData({
                    productId: equip.productId || '',
                    lotId: equip.lotId || ''
                  });
                  setShowStockModal(true);
                }}>
                  {equip.productId ? 'Update Stock Link' : 'Link to Stock'}
                </button>
                <button 
                  className="view-btn"
                  onClick={() => handleViewDetails(equip)}
                >
                  View Details
                </button>
                <button 
                  className="report-btn"
                  onClick={() => handleReportFault(equip.id)}
                >
                  Report Fault
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h4>Register Equipment</h4>
            <form onSubmit={handleCreateEquipment}>
              <div className="form-group">
                <label>Equipment Name *</label>
                <input
                  type="text"
                  required
                  value={formData.assetName}
                  onChange={(e) => setFormData({ ...formData, assetName: e.target.value })}
                  placeholder="e.g., Dental Chair Model XYZ"
                />
              </div>

              <div className="form-group">
                <label>Assigned Location</label>
                <select
                  value={formData.locationId}
                  onChange={(e) => setFormData({ ...formData, locationId: e.target.value, currentLocationId: e.target.value })}
                >
                  <option value="">Select Location</option>
                  {locations.map(loc => (
                    <option key={loc.id} value={loc.id}>
                      {loc.completeName || loc.name || loc.id}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Assigned Operator</label>
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

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows="4"
                  placeholder="Equipment notes..."
                />
              </div>

              <div className="modal-actions">
                <button type="submit" className="btn-primary">Register Equipment</button>
                <button type="button" className="btn-secondary" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDetailsModal && selectedEquipment && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h4>Equipment Details</h4>
            <div className="equipment-details-modal">
              <div className="detail-row">
                <span className="detail-label">Name:</span>
                <span className="detail-value">{selectedEquipment.assetName || selectedEquipment.name}</span>
              </div>
              {selectedEquipment.currentLocationId && (
                <div className="detail-row">
                  <span className="detail-label">Location:</span>
                  <span className="detail-value">
                    {locations.find(l => l.id === selectedEquipment.currentLocationId)?.name || 'N/A'}
                  </span>
                </div>
              )}
              {selectedEquipment.personId && (
                <div className="detail-row">
                  <span className="detail-label">Operator:</span>
                  <span className="detail-value">
                    {technicians.find(t => t.id === selectedEquipment.personId)?.displayName || 'N/A'}
                  </span>
                </div>
              )}
              {selectedEquipment.lastServiceDate && (
                <div className="detail-row">
                  <span className="detail-label">Last Service:</span>
                  <span className="detail-value">
                    {selectedEquipment.lastServiceDate.toDate ? 
                      selectedEquipment.lastServiceDate.toDate().toLocaleDateString() : 
                      'N/A'
                    }
                  </span>
                </div>
              )}
              {selectedEquipment.nextRequiredServiceDate && (
                <div className="detail-row">
                  <span className="detail-label">Next Service:</span>
                  <span className="detail-value">
                    {selectedEquipment.nextRequiredServiceDate.toDate ? 
                      selectedEquipment.nextRequiredServiceDate.toDate().toLocaleDateString() : 
                      'N/A'
                    }
                  </span>
                </div>
              )}
              {selectedEquipment.notes && (
                <div className="detail-row">
                  <span className="detail-label">Notes:</span>
                  <span className="detail-value">{selectedEquipment.notes}</span>
                </div>
              )}
            </div>
            <div className="modal-actions">
              <button 
                className="report-btn"
                onClick={() => {
                  setShowDetailsModal(false);
                  handleReportFault(selectedEquipment.id);
                }}
              >
                Report Fault
              </button>
              <button className="btn-secondary" onClick={() => setShowDetailsModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showStockModal && selectedEquipment && (
        <div className="modal-overlay" onClick={() => setShowStockModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h4>Link Equipment to Stock: {selectedEquipment.assetName || selectedEquipment.name}</h4>
            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                await linkEquipmentToStock(selectedEquipment.id, stockFormData.productId, stockFormData.lotId || null);
                setShowStockModal(false);
                setSelectedEquipment(null);
                setStockFormData({ productId: '', lotId: '' });
                loadEquipment();
                alert('Equipment linked to stock successfully');
              } catch (error) {
                console.error('Error linking equipment to stock:', error);
                alert('Failed to link equipment to stock');
              }
            }}>
              <div className="form-group">
                <label>Product ID</label>
                <input
                  type="text"
                  value={stockFormData.productId}
                  onChange={(e) => setStockFormData({ ...stockFormData, productId: e.target.value })}
                  placeholder="Product ID"
                />
              </div>
              <div className="form-group">
                <label>Stock Lot ID (Serial #)</label>
                <input
                  type="text"
                  value={stockFormData.lotId}
                  onChange={(e) => setStockFormData({ ...stockFormData, lotId: e.target.value })}
                  placeholder="Optional: Stock Lot ID"
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn-primary">Link</button>
                <button type="button" className="btn-secondary" onClick={() => setShowStockModal(false)}>
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

export default Equipment;

