import React, { useState, useEffect } from 'react';
import { getEquipment, updateEquipmentWarranty } from '../../services/fieldService';
import { Timestamp } from 'firebase/firestore';
import './EquipmentWarranty.css';

const EquipmentWarranty = () => {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [showWarrantyModal, setShowWarrantyModal] = useState(false);

  const [formData, setFormData] = useState({
    warrantyStartDate: '',
    warrantyEndDate: '',
    productWarranty: '',
    productWarrantyType: 'day'
  });

  useEffect(() => {
    loadEquipment();
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

  const handleUpdateWarranty = async (e) => {
    e.preventDefault();
    try {
      await updateEquipmentWarranty(selectedEquipment.id, {
        warrantyStartDate: formData.warrantyStartDate,
        warrantyEndDate: formData.warrantyEndDate,
        productWarranty: parseInt(formData.productWarranty) || null,
        productWarrantyType: formData.productWarrantyType
      });
      setShowWarrantyModal(false);
      setSelectedEquipment(null);
      setFormData({ warrantyStartDate: '', warrantyEndDate: '', productWarranty: '', productWarrantyType: 'day' });
      loadEquipment();
      alert('Warranty updated successfully');
    } catch (error) {
      console.error('Error updating warranty:', error);
      alert('Failed to update warranty');
    }
  };

  const handleEditWarranty = (equip) => {
    setSelectedEquipment(equip);
    setFormData({
      warrantyStartDate: equip.warrantyStartDate?.toDate ? equip.warrantyStartDate.toDate().toISOString().split('T')[0] : '',
      warrantyEndDate: equip.warrantyEndDate?.toDate ? equip.warrantyEndDate.toDate().toISOString().split('T')[0] : '',
      productWarranty: equip.productWarranty || '',
      productWarrantyType: equip.productWarrantyType || 'day'
    });
    setShowWarrantyModal(true);
  };

  const isWarrantyExpired = (warrantyEndDate) => {
    if (!warrantyEndDate) return false;
    const endDate = warrantyEndDate.toDate ? warrantyEndDate.toDate() : new Date(warrantyEndDate);
    return endDate < new Date();
  };

  const isWarrantyExpiringSoon = (warrantyEndDate) => {
    if (!warrantyEndDate) return false;
    const endDate = warrantyEndDate.toDate ? warrantyEndDate.toDate() : new Date(warrantyEndDate);
    const daysUntilExpiry = Math.ceil((endDate - new Date()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
  };

  if (loading) {
    return <div className="admin-loading">Loading equipment...</div>;
  }

  return (
    <div className="equipment-warranty">
      <div className="page-header">
        <h3>Equipment Warranty Management</h3>
      </div>

      <div className="equipment-grid">
        {equipment.length === 0 ? (
          <div className="empty-state">No equipment found</div>
        ) : (
          equipment.map((equip) => {
            const expired = isWarrantyExpired(equip.warrantyEndDate);
            const expiringSoon = isWarrantyExpiringSoon(equip.warrantyEndDate);
            
            return (
              <div key={equip.id} className={`equipment-card ${expired ? 'expired' : expiringSoon ? 'expiring' : ''}`}>
                <h4>{equip.assetName || equip.name}</h4>
                <div className="warranty-info">
                  {equip.warrantyStartDate && (
                    <div className="warranty-detail">
                      <span className="label">Start:</span>
                      <span className="value">
                        {equip.warrantyStartDate.toDate ? 
                          equip.warrantyStartDate.toDate().toLocaleDateString() : 
                          'N/A'}
                      </span>
                    </div>
                  )}
                  {equip.warrantyEndDate && (
                    <div className="warranty-detail">
                      <span className="label">End:</span>
                      <span className={`value ${expired ? 'expired' : expiringSoon ? 'expiring' : ''}`}>
                        {equip.warrantyEndDate.toDate ? 
                          equip.warrantyEndDate.toDate().toLocaleDateString() : 
                          'N/A'}
                      </span>
                    </div>
                  )}
                  {expired && <span className="warranty-badge expired">Expired</span>}
                  {expiringSoon && !expired && <span className="warranty-badge expiring">Expiring Soon</span>}
                </div>
                <button className="edit-btn" onClick={() => handleEditWarranty(equip)}>
                  {equip.warrantyStartDate ? 'Update Warranty' : 'Set Warranty'}
                </button>
              </div>
            );
          })
        )}
      </div>

      {showWarrantyModal && selectedEquipment && (
        <div className="modal-overlay" onClick={() => setShowWarrantyModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h4>Warranty: {selectedEquipment.assetName || selectedEquipment.name}</h4>
            <form onSubmit={handleUpdateWarranty}>
              <div className="form-row">
                <div className="form-group">
                  <label>Warranty Start Date</label>
                  <input
                    type="date"
                    value={formData.warrantyStartDate}
                    onChange={(e) => setFormData({ ...formData, warrantyStartDate: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Warranty End Date</label>
                  <input
                    type="date"
                    value={formData.warrantyEndDate}
                    onChange={(e) => setFormData({ ...formData, warrantyEndDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Warranty Duration</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.productWarranty}
                    onChange={(e) => setFormData({ ...formData, productWarranty: e.target.value })}
                    placeholder="Duration"
                  />
                </div>
                <div className="form-group">
                  <label>Warranty Type</label>
                  <select
                    value={formData.productWarrantyType}
                    onChange={(e) => setFormData({ ...formData, productWarrantyType: e.target.value })}
                  >
                    <option value="day">Days</option>
                    <option value="week">Weeks</option>
                    <option value="month">Months</option>
                    <option value="year">Years</option>
                  </select>
                </div>
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn-primary">Update</button>
                <button type="button" className="btn-secondary" onClick={() => setShowWarrantyModal(false)}>
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

export default EquipmentWarranty;

