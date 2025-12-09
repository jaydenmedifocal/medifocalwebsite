import React, { useState, useEffect } from 'react';
import { getCategories, createCategory } from '../../services/fieldService';
import './Categories.css';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    parentId: '',
    color: 10,
    description: ''
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const cats = await getCategories();
      setCategories(cats);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createCategory({
        name: formData.name,
        parentId: formData.parentId || null,
        color: parseInt(formData.color) || 10,
        description: formData.description,
        fullName: formData.parentId ? `${categories.find(c => c.id === formData.parentId)?.name}/${formData.name}` : formData.name
      });
      setShowCreateModal(false);
      setFormData({ name: '', parentId: '', color: 10, description: '' });
      loadCategories();
    } catch (error) {
      console.error('Error creating category:', error);
      alert('Failed to create category');
    }
  };

  if (loading) {
    return <div className="admin-loading">Loading categories...</div>;
  }

  return (
    <div className="categories">
      <div className="page-header">
        <h3>Categories</h3>
        <button className="create-button" onClick={() => setShowCreateModal(true)}>
          + Create Category
        </button>
      </div>

      <div className="categories-grid">
        {categories.length === 0 ? (
          <div className="empty-state">No categories found</div>
        ) : (
          categories.map((category) => (
            <div key={category.id} className="category-card">
              <div className="category-color" style={{ backgroundColor: `hsl(${category.color * 10}, 70%, 50%)` }}></div>
              <div className="category-info">
                <h4>{category.fullName || category.name}</h4>
                {category.description && <p>{category.description}</p>}
                {category.parentId && (
                  <span className="parent-badge">
                    Parent: {categories.find(c => c.id === category.parentId)?.name}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h4>Create Category</h4>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Category Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Installation, Repair"
                />
              </div>
              <div className="form-group">
                <label>Parent Category</label>
                <select
                  value={formData.parentId}
                  onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                >
                  <option value="">None</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Color Index (0-11)</label>
                <input
                  type="number"
                  min="0"
                  max="11"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
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

export default Categories;

