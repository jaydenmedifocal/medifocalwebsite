import React, { useState, useEffect } from 'react';
import { getRecurringTemplates, createRecurringTemplate } from '../../services/fieldService';
import { getFrequencySets } from '../../services/fieldService';
import { getOrderTemplates } from '../../services/fieldService';
import './RecurringTemplates.css';

const RecurringTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [frequencySets, setFrequencySets] = useState([]);
  const [orderTemplates, setOrderTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    frequencySetId: '',
    orderTemplateId: '',
    maxOrders: 0,
    description: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [templatesList, sets, orderTemps] = await Promise.all([
        getRecurringTemplates(),
        getFrequencySets(),
        getOrderTemplates()
      ]);
      setTemplates(templatesList);
      setFrequencySets(sets);
      setOrderTemplates(orderTemps);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createRecurringTemplate({
        name: formData.name,
        fsmFrequencySetId: formData.frequencySetId || null,
        fsmOrderTemplateId: formData.orderTemplateId || null,
        maxOrders: parseInt(formData.maxOrders) || 0,
        description: formData.description
      });
      setShowCreateModal(false);
      setFormData({ name: '', frequencySetId: '', orderTemplateId: '', maxOrders: 0, description: '' });
      loadData();
    } catch (error) {
      console.error('Error creating recurring template:', error);
      alert('Failed to create recurring template');
    }
  };

  if (loading) {
    return <div className="admin-loading">Loading recurring templates...</div>;
  }

  return (
    <div className="recurring-templates">
      <div className="page-header">
        <h3>Recurring Templates</h3>
        <button className="create-button" onClick={() => setShowCreateModal(true)}>
          + Create Template
        </button>
      </div>

      <div className="templates-grid">
        {templates.length === 0 ? (
          <div className="empty-state">No recurring templates found</div>
        ) : (
          templates.map((template) => (
            <div key={template.id} className="template-card">
              <h4>{template.name}</h4>
              <div className="template-details">
                {template.fsmFrequencySetId && (
                  <div className="detail-item">
                    <span className="label">Frequency Set:</span>
                    <span className="value">
                      {frequencySets.find(f => f.id === template.fsmFrequencySetId)?.name || 'N/A'}
                    </span>
                  </div>
                )}
                {template.fsmOrderTemplateId && (
                  <div className="detail-item">
                    <span className="label">Order Template:</span>
                    <span className="value">
                      {orderTemplates.find(t => t.id === template.fsmOrderTemplateId)?.name || 'N/A'}
                    </span>
                  </div>
                )}
                {template.maxOrders > 0 && (
                  <div className="detail-item">
                    <span className="label">Max Orders:</span>
                    <span className="value">{template.maxOrders}</span>
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
            <h4>Create Recurring Template</h4>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Template Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Monthly Maintenance"
                />
              </div>
              <div className="form-group">
                <label>Frequency Set</label>
                <select
                  value={formData.frequencySetId}
                  onChange={(e) => setFormData({ ...formData, frequencySetId: e.target.value })}
                >
                  <option value="">Select Frequency Set</option>
                  {frequencySets.map(set => (
                    <option key={set.id} value={set.id}>{set.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Order Template</label>
                <select
                  value={formData.orderTemplateId}
                  onChange={(e) => setFormData({ ...formData, orderTemplateId: e.target.value })}
                >
                  <option value="">Select Order Template</option>
                  {orderTemplates.map(template => (
                    <option key={template.id} value={template.id}>{template.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Maximum Orders</label>
                <input
                  type="number"
                  min="0"
                  value={formData.maxOrders}
                  onChange={(e) => setFormData({ ...formData, maxOrders: e.target.value })}
                  placeholder="0 = unlimited"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
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

export default RecurringTemplates;

