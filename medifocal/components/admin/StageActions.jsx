import React, { useState, useEffect } from 'react';
import { getStages } from '../../services/fieldService';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Timestamp } from 'firebase/firestore';
import './StageActions.css';

const StageActions = () => {
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStage, setSelectedStage] = useState(null);
  const [showActionModal, setShowActionModal] = useState(false);

  const [formData, setFormData] = useState({
    actionName: '',
    actionType: 'email',
    actionConfig: {}
  });

  useEffect(() => {
    loadStages();
  }, []);

  const loadStages = async () => {
    try {
      setLoading(true);
      const stagesList = await getStages();
      setStages(stagesList);
    } catch (error) {
      console.error('Error loading stages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSetAction = async (e) => {
    e.preventDefault();
    try {
      const stageRef = doc(db, 'fsmStages', selectedStage.id);
      await updateDoc(stageRef, {
        actionId: formData.actionName,
        actionType: formData.actionType,
        actionConfig: formData.actionConfig,
        updatedAt: Timestamp.now()
      });
      setShowActionModal(false);
      setSelectedStage(null);
      setFormData({ actionName: '', actionType: 'email', actionConfig: {} });
      loadStages();
      alert('Stage action configured successfully');
    } catch (error) {
      console.error('Error setting action:', error);
      alert('Failed to set stage action');
    }
  };

  if (loading) {
    return <div className="admin-loading">Loading stages...</div>;
  }

  return (
    <div className="stage-actions">
      <div className="page-header">
        <h3>Stage Server Actions</h3>
        <p>Configure automated actions when orders reach specific stages</p>
      </div>

      <div className="stages-list">
        {stages.length === 0 ? (
          <div className="empty-state">No stages found</div>
        ) : (
          stages.map((stage) => (
            <div key={stage.id} className="stage-card">
              <div className="stage-header">
                <h4>{stage.name}</h4>
                <span className="stage-color" style={{ backgroundColor: stage.customColor || '#FFFFFF' }}></span>
              </div>
              <div className="stage-details">
                {stage.actionId ? (
                  <div className="action-info">
                    <span className="label">Action:</span>
                    <span className="value">{stage.actionId}</span>
                  </div>
                ) : (
                  <span className="no-action">No action configured</span>
                )}
              </div>
              <button
                className="configure-btn"
                onClick={() => {
                  setSelectedStage(stage);
                  setFormData({
                    actionName: stage.actionId || '',
                    actionType: stage.actionType || 'email',
                    actionConfig: stage.actionConfig || {}
                  });
                  setShowActionModal(true);
                }}
              >
                {stage.actionId ? 'Update Action' : 'Configure Action'}
              </button>
            </div>
          ))
        )}
      </div>

      {showActionModal && selectedStage && (
        <div className="modal-overlay" onClick={() => setShowActionModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h4>Configure Action: {selectedStage.name}</h4>
            <form onSubmit={handleSetAction}>
              <div className="form-group">
                <label>Action Name *</label>
                <input
                  type="text"
                  required
                  value={formData.actionName}
                  onChange={(e) => setFormData({ ...formData, actionName: e.target.value })}
                  placeholder="e.g., send_notification, update_status"
                />
              </div>
              <div className="form-group">
                <label>Action Type</label>
                <select
                  value={formData.actionType}
                  onChange={(e) => setFormData({ ...formData, actionType: e.target.value })}
                >
                  <option value="email">Email Notification</option>
                  <option value="update">Update Field</option>
                  <option value="create">Create Record</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn-primary">Save</button>
                <button type="button" className="btn-secondary" onClick={() => setShowActionModal(false)}>
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

export default StageActions;

