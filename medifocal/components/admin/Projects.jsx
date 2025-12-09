import React, { useState, useEffect } from 'react';
import { getProjects, createOrderFromProjectTask } from '../../services/fieldService';
import { getLocations } from '../../services/fieldService';
import './Projects.css';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
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
      const [projectsList, locs] = await Promise.all([
        getProjects(),
        getLocations()
      ]);
      setProjects(projectsList);
      setLocations(locs);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    if (!selectedTask) return;
    
    try {
      await createOrderFromProjectTask(selectedTask.id, {
        locationId: formData.locationId,
        description: formData.description,
        priority: formData.priority,
        status: 'pending'
      });
      setShowCreateOrderModal(false);
      setSelectedTask(null);
      setFormData({ locationId: '', description: '', priority: '0' });
      alert('Service order created from project task successfully');
      loadData();
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to create order from project task');
    }
  };

  if (loading) {
    return <div className="admin-loading">Loading projects...</div>;
  }

  // Flatten projects to get all tasks
  const allTasks = projects.flatMap(project => 
    (project.tasks || []).map(task => ({ ...task, projectName: project.name }))
  );

  return (
    <div className="projects">
      <div className="page-header">
        <h3>Project Integration</h3>
        <p>Create service orders from project tasks</p>
      </div>

      <div className="tasks-grid">
        {allTasks.length === 0 ? (
          <div className="empty-state">No project tasks found</div>
        ) : (
          allTasks.map((task) => (
            <div key={task.id} className="task-card">
              <h4>{task.name || 'Untitled Task'}</h4>
              <div className="task-details">
                <div className="detail-item">
                  <span className="label">Project:</span>
                  <span className="value">{task.projectName || 'N/A'}</span>
                </div>
                {task.fsmOrderIds && task.fsmOrderIds.length > 0 && (
                  <div className="detail-item">
                    <span className="label">Orders:</span>
                    <span className="value">{task.fsmOrderIds.length}</span>
                  </div>
                )}
              </div>
              <button
                className="create-order-btn"
                onClick={() => {
                  setSelectedTask(task);
                  setFormData({
                    locationId: task.locationId || '',
                    description: task.description || '',
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

      {showCreateOrderModal && selectedTask && (
        <div className="modal-overlay" onClick={() => setShowCreateOrderModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h4>Create Order from Task: {selectedTask.name}</h4>
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

export default Projects;

