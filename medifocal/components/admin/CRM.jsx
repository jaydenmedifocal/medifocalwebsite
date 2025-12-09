import React, { useState, useEffect } from 'react';
import { getCRMLeads, createOrderFromLead } from '../../services/fieldService';
import { getLocations } from '../../services/fieldService';
import './CRM.css';

const CRM = () => {
  const [leads, setLeads] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState(null);
  const [showCreateOrderModal, setShowCreateOrderModal] = useState(false);

  const [formData, setFormData] = useState({
    locationId: '',
    description: '',
    priority: '0'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [leadsList, locs] = await Promise.all([
        getCRMLeads(),
        getLocations()
      ]);
      setLeads(leadsList);
      setLocations(locs);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    try {
      await createOrderFromLead(selectedLead.id, {
        locationId: formData.locationId,
        description: formData.description,
        priority: formData.priority,
        status: 'pending'
      });
      setShowCreateOrderModal(false);
      setSelectedLead(null);
      setFormData({ locationId: '', description: '', priority: '0' });
      alert('Service order created from lead successfully');
      loadData();
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to create order from lead');
    }
  };

  if (loading) {
    return <div className="admin-loading">Loading CRM leads...</div>;
  }

  return (
    <div className="crm">
      <div className="page-header">
        <h3>CRM Integration</h3>
        <p>Create service orders from CRM leads</p>
      </div>

      <div className="leads-grid">
        {leads.length === 0 ? (
          <div className="empty-state">No CRM leads found</div>
        ) : (
          leads.map((lead) => (
            <div key={lead.id} className="lead-card">
              <h4>{lead.name || lead.title || 'Untitled Lead'}</h4>
              <div className="lead-details">
                {lead.email && (
                  <div className="detail-item">
                    <span className="label">Email:</span>
                    <span className="value">{lead.email}</span>
                  </div>
                )}
                {lead.phone && (
                  <div className="detail-item">
                    <span className="label">Phone:</span>
                    <span className="value">{lead.phone}</span>
                  </div>
                )}
                {lead.fsmOrderCount > 0 && (
                  <div className="detail-item">
                    <span className="label">Orders:</span>
                    <span className="value">{lead.fsmOrderCount}</span>
                  </div>
                )}
              </div>
              <button
                className="create-order-btn"
                onClick={() => {
                  setSelectedLead(lead);
                  setFormData({
                    locationId: lead.fsmLocationId || '',
                    description: lead.description || '',
                    priority: '0'
                  });
                  setShowCreateOrderModal(true);
                }}
              >
                Create Service Order
              </button>
            </div>
          ))
        )}
      </div>

      {showCreateOrderModal && selectedLead && (
        <div className="modal-overlay" onClick={() => setShowCreateOrderModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h4>Create Order from Lead: {selectedLead.name || selectedLead.title}</h4>
            <form onSubmit={handleCreateOrder}>
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
                <label>Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                >
                  <option value="0">Normal</option>
                  <option value="1">Low</option>
                  <option value="2">High</option>
                  <option value="3">Urgent</option>
                </select>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="4"
                  placeholder="Service order description..."
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn-primary">Create Order</button>
                <button type="button" className="btn-secondary" onClick={() => setShowCreateOrderModal(false)}>
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

export default CRM;

