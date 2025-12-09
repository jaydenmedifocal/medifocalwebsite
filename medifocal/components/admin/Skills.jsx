import React, { useState, useEffect } from 'react';
import { getSkills, assignSkillToTechnician, getTechnicians } from '../../services/fieldService';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Timestamp } from 'firebase/firestore';
import './Skills.css';

const Skills = () => {
  const [skills, setSkills] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  const [assignFormData, setAssignFormData] = useState({
    technicianId: '',
    level: 1
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [skillsList, techs] = await Promise.all([
        getSkills(),
        getTechnicians()
      ]);
      setSkills(skillsList);
      setTechnicians(techs);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'fsmSkills'), {
        name: formData.name,
        description: formData.description,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      setShowCreateModal(false);
      setFormData({ name: '', description: '' });
      loadData();
    } catch (error) {
      console.error('Error creating skill:', error);
      alert('Failed to create skill');
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    try {
      await assignSkillToTechnician(assignFormData.technicianId, selectedSkill.id, parseInt(assignFormData.level));
      setShowAssignModal(false);
      setAssignFormData({ technicianId: '', level: 1 });
      setSelectedSkill(null);
      alert('Skill assigned successfully');
    } catch (error) {
      console.error('Error assigning skill:', error);
      alert('Failed to assign skill');
    }
  };

  if (loading) {
    return <div className="admin-loading">Loading skills...</div>;
  }

  return (
    <div className="skills">
      <div className="page-header">
        <h3>Technician Skills</h3>
        <button className="create-button" onClick={() => setShowCreateModal(true)}>
          + Create Skill
        </button>
      </div>

      <div className="skills-grid">
        {skills.length === 0 ? (
          <div className="empty-state">No skills found</div>
        ) : (
          skills.map((skill) => (
            <div key={skill.id} className="skill-card">
              <h4>{skill.name}</h4>
              {skill.description && <p>{skill.description}</p>}
              <button
                className="assign-btn"
                onClick={() => {
                  setSelectedSkill(skill);
                  setShowAssignModal(true);
                }}
              >
                Assign to Technician
              </button>
            </div>
          ))
        )}
      </div>

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h4>Create Skill</h4>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Skill Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Equipment Repair, Installation"
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

      {showAssignModal && selectedSkill && (
        <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h4>Assign Skill: {selectedSkill.name}</h4>
            <form onSubmit={handleAssign}>
              <div className="form-group">
                <label>Technician *</label>
                <select
                  required
                  value={assignFormData.technicianId}
                  onChange={(e) => setAssignFormData({ ...assignFormData, technicianId: e.target.value })}
                >
                  <option value="">Select Technician</option>
                  {technicians.map(tech => (
                    <option key={tech.id} value={tech.id}>
                      {tech.displayName || tech.email}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Skill Level (1-5)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={assignFormData.level}
                  onChange={(e) => setAssignFormData({ ...assignFormData, level: e.target.value })}
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn-primary">Assign</button>
                <button type="button" className="btn-secondary" onClick={() => setShowAssignModal(false)}>
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

export default Skills;

