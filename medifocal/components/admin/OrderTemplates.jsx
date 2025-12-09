import React, { useState, useEffect } from 'react';
import { getOrderTemplates, createOrderTemplate, linkRepairTemplateToOrderTemplate } from '../../services/fieldService';
import { getCategories } from '../../services/fieldService';
import { getOrderTypes } from '../../services/fieldService';
import { getTeams } from '../../services/fieldService';
import './OrderTemplates.css';

const OrderTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orderTypes, setOrderTypes] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    instructions: '',
    duration: 0,
    categoryIds: [],
    typeId: '',
    teamId: '',
    repairOrderTemplateId: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [templatesList, cats, types, teamsList] = await Promise.all([
        getOrderTemplates(),
        getCategories(),
        getOrderTypes(),
        getTeams()
      ]);
      setTemplates(templatesList);
      setCategories(cats);
      setOrderTypes(types);
      setTeams(teamsList);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createOrderTemplate({
        name: formData.name,
        instructions: formData.instructions,
        duration: parseFloat(formData.duration) || 0,
        categoryIds: formData.categoryIds,
        typeId: formData.typeId || null,
        teamId: formData.teamId || null
      });
      setShowCreateModal(false);
      setFormData({ name: '', instructions: '', duration: 0, categoryIds: [], typeId: '', teamId: '' });
      loadData();
    } catch (error) {
      console.error('Error creating template:', error);
      alert('Failed to create template');
    }
  };

  const toggleCategory = (categoryId) => {
    setFormData({
      ...formData,
      categoryIds: formData.categoryIds.includes(categoryId)
        ? formData.categoryIds.filter(id => id !== categoryId)
        : [...formData.categoryIds, categoryId]
    });
  };

  if (loading) {
    return <div className="admin-loading">Loading templates...</div>;
  }

  return (
    <div className="order-templates">
      <div className="page-header">
        <h3>Order Templates</h3>
        <button className="create-button" onClick={() => setShowCreateModal(true)}>
          + Create Template
        </button>
      </div>

      <div className="templates-grid">
        {templates.length === 0 ? (
          <div className="empty-state">No templates found</div>
        ) : (
          templates.map((template) => (
            <div key={template.id} className="template-card">
              <h4>{template.name}</h4>
              {template.duration > 0 && (
                <p className="template-detail">Duration: {template.duration} hours</p>
              )}
              {template.teamId && (
                <p className="template-detail">
                  Team: {teams.find(t => t.id === template.teamId)?.name || 'N/A'}
                </p>
              )}
            </div>
          ))
        )}
      </div>

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h4>Create Order Template</h4>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Template Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Standard Installation"
                />
              </div>
              <div className="form-group">
                <label>Instructions</label>
                <textarea
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  rows="4"
                  placeholder="Template instructions..."
                />
              </div>
              <div className="form-group">
                <label>Default Duration (hours)</label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Order Type</label>
                <select
                  value={formData.typeId}
                  onChange={(e) => setFormData({ ...formData, typeId: e.target.value })}
                >
                  <option value="">None</option>
                  {orderTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Team</label>
                <select
                  value={formData.teamId}
                  onChange={(e) => setFormData({ ...formData, teamId: e.target.value })}
                >
                  <option value="">None</option>
                  {teams.map(team => (
                    <option key={team.id} value={team.id}>{team.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Repair Order Template ID (optional)</label>
                <input
                  type="text"
                  value={formData.repairOrderTemplateId}
                  onChange={(e) => setFormData({ ...formData, repairOrderTemplateId: e.target.value })}
                  placeholder="Repair template ID"
                />
              </div>
              <div className="form-group">
                <label>Categories</label>
                <div className="categories-selector">
                  {categories.map(cat => (
                    <label key={cat.id} className="category-checkbox">
                      <input
                        type="checkbox"
                        checked={formData.categoryIds.includes(cat.id)}
                        onChange={() => toggleCategory(cat.id)}
                      />
                      {cat.name}
                    </label>
                  ))}
                </div>
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

export default OrderTemplates;

