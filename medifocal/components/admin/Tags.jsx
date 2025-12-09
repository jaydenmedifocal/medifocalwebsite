import React, { useState, useEffect } from 'react';
import { getTags, createTag } from '../../services/fieldService';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Timestamp } from 'firebase/firestore';
import './Tags.css';

const Tags = () => {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    parentId: '',
    color: 10,
    companyId: ''
  });

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      setLoading(true);
      const tagsList = await getTags();
      setTags(tagsList);
    } catch (error) {
      console.error('Error loading tags:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createTag({
        name: formData.name,
        parentId: formData.parentId || null,
        color: parseInt(formData.color) || 10,
        fullName: formData.parentId ? `${tags.find(t => t.id === formData.parentId)?.name}/${formData.name}` : formData.name
      });
      setShowCreateModal(false);
      setFormData({ name: '', parentId: '', color: 10, companyId: '' });
      loadTags();
    } catch (error) {
      console.error('Error creating tag:', error);
      alert('Failed to create tag');
    }
  };

  if (loading) {
    return <div className="admin-loading">Loading tags...</div>;
  }

  return (
    <div className="tags">
      <div className="page-header">
        <h3>Order Tags</h3>
        <button className="create-button" onClick={() => setShowCreateModal(true)}>
          + Create Tag
        </button>
      </div>

      <div className="tags-grid">
        {tags.length === 0 ? (
          <div className="empty-state">No tags found</div>
        ) : (
          tags.map((tag) => (
            <div key={tag.id} className="tag-card">
              <div className="tag-color" style={{ backgroundColor: `hsl(${tag.color * 10}, 70%, 50%)` }}></div>
              <h4>{tag.fullName || tag.name}</h4>
              {tag.parentId && <p className="parent-tag">Parent: {tags.find(t => t.id === tag.parentId)?.name}</p>}
            </div>
          ))
        )}
      </div>

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h4>Create Tag</h4>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Tag Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Urgent, Maintenance"
                />
              </div>
              <div className="form-group">
                <label>Parent Tag</label>
                <select
                  value={formData.parentId}
                  onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                >
                  <option value="">None</option>
                  {tags.map(tag => (
                    <option key={tag.id} value={tag.id}>{tag.name}</option>
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

export default Tags;

