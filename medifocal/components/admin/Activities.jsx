import React, { useState, useEffect } from 'react';
import { getActivities, createActivity, updateActivity, getActivityTemplates, createActivityTemplate } from '../../services/fieldService';
import { getServiceOrders } from '../../services/fieldService';
import { Timestamp } from 'firebase/firestore';
import './Activities.css';

const Activities = () => {
  const [activities, setActivities] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [filterOrderId, setFilterOrderId] = useState('all');
  const [selectedActivity, setSelectedActivity] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    required: false,
    sequence: 0,
    orderId: '',
    templateId: ''
  });

  const [templateFormData, setTemplateFormData] = useState({
    name: '',
    activities: []
  });

  useEffect(() => {
    loadData();
  }, [filterOrderId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [activitiesList, templatesList, ordersList] = await Promise.all([
        getActivities(filterOrderId !== 'all' ? { orderId: filterOrderId } : {}),
        getActivityTemplates(),
        getServiceOrders()
      ]);
      setActivities(activitiesList);
      setTemplates(templatesList);
      setOrders(ordersList);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateActivity = async (e) => {
    e.preventDefault();
    try {
      await createActivity({
        name: formData.name,
        required: formData.required,
        sequence: parseInt(formData.sequence) || 0,
        orderId: formData.orderId || null,
        templateId: formData.templateId || null,
        state: 'todo',
        completed: false
      });
      setShowCreateModal(false);
      setFormData({ name: '', required: false, sequence: 0, orderId: '', templateId: '' });
      loadData();
    } catch (error) {
      console.error('Error creating activity:', error);
      alert('Failed to create activity');
    }
  };

  const handleCompleteActivity = async (activityId) => {
    try {
      await updateActivity(activityId, {
        completed: true,
        completedOn: Timestamp.now(),
        state: 'done'
      });
      loadData();
    } catch (error) {
      console.error('Error completing activity:', error);
      alert('Failed to complete activity');
    }
  };

  const handleCancelActivity = async (activityId) => {
    try {
      await updateActivity(activityId, { state: 'cancel' });
      loadData();
    } catch (error) {
      console.error('Error cancelling activity:', error);
      alert('Failed to cancel activity');
    }
  };

  if (loading) {
    return <div className="admin-loading">Loading activities...</div>;
  }

  return (
    <div className="activities">
      <div className="page-header">
        <h3>Service Order Activities</h3>
        <div className="header-actions">
          <button className="create-button" onClick={() => setShowTemplateModal(true)}>
            + Create Template
          </button>
          <button className="create-button" onClick={() => setShowCreateModal(true)}>
            + Add Activity
          </button>
        </div>
      </div>

      <div className="filters">
        <label>Filter by Order:</label>
        <select value={filterOrderId} onChange={(e) => setFilterOrderId(e.target.value)}>
          <option value="all">All Orders</option>
          {orders.map(order => (
            <option key={order.id} value={order.id}>
              {order.name || order.id}
            </option>
          ))}
        </select>
      </div>

      <div className="activities-list">
        {activities.length === 0 ? (
          <div className="empty-state">No activities found</div>
        ) : (
          activities.map((activity) => (
            <div key={activity.id} className={`activity-card ${activity.state}`}>
              <div className="activity-header">
                <div className="activity-info">
                  <h4>{activity.name}</h4>
                  {activity.required && <span className="required-badge">Required</span>}
                </div>
                <span className={`state-badge ${activity.state}`}>
                  {activity.state === 'todo' ? 'To Do' : activity.state === 'done' ? 'Completed' : 'Cancelled'}
                </span>
              </div>
              {activity.orderId && (
                <div className="activity-detail">
                  <span className="label">Order:</span>
                  <span className="value">{orders.find(o => o.id === activity.orderId)?.name || activity.orderId}</span>
                </div>
              )}
              {activity.completedOn && (
                <div className="activity-detail">
                  <span className="label">Completed:</span>
                  <span className="value">
                    {activity.completedOn.toDate ? activity.completedOn.toDate().toLocaleString() : 'N/A'}
                  </span>
                </div>
              )}
              <div className="activity-actions">
                {activity.state === 'todo' && (
                  <>
                    <button className="complete-btn" onClick={() => handleCompleteActivity(activity.id)}>
                      Mark Complete
                    </button>
                    <button className="cancel-btn" onClick={() => handleCancelActivity(activity.id)}>
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h4>Create Activity</h4>
            <form onSubmit={handleCreateActivity}>
              <div className="form-group">
                <label>Activity Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Check equipment, Test functionality"
                />
              </div>
              <div className="form-group">
                <label>Sequence</label>
                <input
                  type="number"
                  value={formData.sequence}
                  onChange={(e) => setFormData({ ...formData, sequence: e.target.value })}
                  min="0"
                />
              </div>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.required}
                    onChange={(e) => setFormData({ ...formData, required: e.target.checked })}
                  />
                  Required Activity
                </label>
              </div>
              <div className="form-group">
                <label>Assign to Order</label>
                <select
                  value={formData.orderId}
                  onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
                >
                  <option value="">None</option>
                  {orders.map(order => (
                    <option key={order.id} value={order.id}>
                      {order.name || order.id}
                    </option>
                  ))}
                </select>
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

      {showTemplateModal && (
        <div className="modal-overlay" onClick={() => setShowTemplateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h4>Create Activity Template</h4>
            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                await createActivityTemplate({
                  name: templateFormData.name,
                  activities: templateFormData.activities
                });
                setShowTemplateModal(false);
                setTemplateFormData({ name: '', activities: [] });
                loadData();
              } catch (error) {
                alert('Failed to create template');
              }
            }}>
              <div className="form-group">
                <label>Template Name *</label>
                <input
                  type="text"
                  required
                  value={templateFormData.name}
                  onChange={(e) => setTemplateFormData({ ...templateFormData, name: e.target.value })}
                  placeholder="e.g., Standard Service Checklist"
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn-primary">Create Template</button>
                <button type="button" className="btn-secondary" onClick={() => setShowTemplateModal(false)}>
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

export default Activities;

