import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, doc, query, where } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Timestamp } from 'firebase/firestore';
import { getServiceOrders } from '../../services/fieldService';
import './Teams.css';

const Teams = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      setLoading(true);
      // Try fsmTeams first, fallback to creating in memory
      let teamsRef = collection(db, 'fsmTeams');
      let snapshot;
      
      try {
        snapshot = await getDocs(teamsRef);
        const teamsList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setTeams(teamsList);
      } catch (error) {
        // Collection doesn't exist, create default team
        console.log('Teams collection not found, will create on first team creation');
        setTeams([]);
      }
    } catch (error) {
      console.error('Error loading teams:', error);
      setTeams([]);
    } finally {
      setLoading(false);
    }
  };

  const loadTeamStats = async (teamId) => {
    try {
      const orders = await getServiceOrders({ teamId });
      const activeOrders = orders.filter(o => 
        o.status !== 'completed' && o.status !== 'cancelled'
      );
      const unassignedOrders = activeOrders.filter(o => !o.personId);
      const unscheduledOrders = activeOrders.filter(o => !o.scheduledDateStart);
      
      return {
        total: orders.length,
        active: activeOrders.length,
        unassigned: unassignedOrders.length,
        unscheduled: unscheduledOrders.length
      };
    } catch (error) {
      return { total: 0, active: 0, unassigned: 0, unscheduled: 0 };
    }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    try {
      // Try fsmTeams first
      let teamsRef = collection(db, 'fsmTeams');
      
      try {
        await getDocs(query(teamsRef, limit(1)));
      } catch (error) {
        // Collection doesn't exist, it will be created on first write
      }

      const teamData = {
        name: formData.name,
        description: formData.description || '',
        sequence: teams.length + 1,
        createdAt: Timestamp.now(),
        created_at: Timestamp.now(),
        updatedAt: Timestamp.now(),
        updated_at: Timestamp.now()
      };

      await addDoc(teamsRef, teamData);
      setShowCreateModal(false);
      setFormData({
        name: '',
        description: ''
      });
      loadTeams();
    } catch (error) {
      console.error('Error creating team:', error);
      alert('Failed to create team');
    }
  };

  const handleViewDetails = async (team) => {
    const stats = await loadTeamStats(team.id);
    setSelectedTeam({ ...team, stats });
    setShowDetailsModal(true);
  };

  if (loading) {
    return <div className="admin-loading">Loading teams...</div>;
  }

  return (
    <div className="teams">
      <div className="page-header">
        <h3>Field Service Teams</h3>
        <button className="create-button" onClick={() => setShowCreateModal(true)}>
          + Create Team
        </button>
      </div>

      <div className="teams-grid">
        {teams.length === 0 ? (
          <div className="empty-state">
            <p>No teams found. Create your first field service team.</p>
          </div>
        ) : (
          teams.map((team) => (
            <div key={team.id} className="team-card">
              <div className="team-header">
                <h4>{team.name}</h4>
                {team.description && (
                  <p className="team-description">{team.description}</p>
                )}
              </div>

              <div className="team-actions">
                <button 
                  className="view-btn"
                  onClick={() => handleViewDetails(team)}
                >
                  View Details
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h4>Create Field Service Team</h4>
            <form onSubmit={handleCreateTeam}>
              <div className="form-group">
                <label>Team Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., North Team, Service Team A"
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="4"
                  placeholder="Team description..."
                />
              </div>

              <div className="modal-actions">
                <button type="submit" className="btn-primary">Create Team</button>
                <button type="button" className="btn-secondary" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDetailsModal && selectedTeam && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h4>Team Details</h4>
            <div className="team-details-modal">
              <div className="detail-row">
                <span className="detail-label">Name:</span>
                <span className="detail-value">{selectedTeam.name}</span>
              </div>
              {selectedTeam.description && (
                <div className="detail-row">
                  <span className="detail-label">Description:</span>
                  <span className="detail-value">{selectedTeam.description}</span>
                </div>
              )}
              {selectedTeam.stats && (
                <>
                  <div className="detail-row">
                    <span className="detail-label">Total Orders:</span>
                    <span className="detail-value">{selectedTeam.stats.total}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Active Orders:</span>
                    <span className="detail-value">{selectedTeam.stats.active}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Unassigned:</span>
                    <span className="detail-value">{selectedTeam.stats.unassigned}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Unscheduled:</span>
                    <span className="detail-value">{selectedTeam.stats.unscheduled}</span>
                  </div>
                </>
              )}
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowDetailsModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Teams;

