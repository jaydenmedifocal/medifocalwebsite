import React, { useState, useEffect } from 'react';
import { getBlackoutDays, createBlackoutDay, getStressDays, createStressDay, getDeliveryTimeRanges, createDeliveryTimeRange, getRouteBlackoutGroups, createRouteBlackoutGroup } from '../../services/fieldService';
import { getRoutes } from '../../services/fieldService';
import { Timestamp } from 'firebase/firestore';
import './Availability.css';

const Availability = () => {
  const [blackoutDays, setBlackoutDays] = useState([]);
  const [stressDays, setStressDays] = useState([]);
  const [timeRanges, setTimeRanges] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('blackout');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [blackoutGroups, setBlackoutGroups] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    date: '',
    routeId: '',
    startTime: '',
    endTime: '',
    sequence: 10
  });

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [blackout, stress, ranges, routesList, groups] = await Promise.all([
        getBlackoutDays(),
        getStressDays(),
        getDeliveryTimeRanges(),
        getRoutes(),
        getRouteBlackoutGroups()
      ]);
      setBlackoutDays(blackout);
      setStressDays(stress);
      setTimeRanges(ranges);
      setRoutes(routesList);
      setBlackoutGroups(groups);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      if (activeTab === 'blackout') {
        await createBlackoutDay({
          name: formData.name,
          date: Timestamp.fromDate(new Date(formData.date))
        });
      } else if (activeTab === 'stress') {
        await createStressDay({
          name: formData.name,
          date: Timestamp.fromDate(new Date(formData.date))
        });
      } else if (activeTab === 'time-ranges') {
        // Convert time strings (HH:MM) to float (hours)
        const [startH, startM] = formData.startTime.split(':').map(Number);
        const [endH, endM] = formData.endTime.split(':').map(Number);
        const startTime = startH + startM / 60;
        const endTime = endH + endM / 60;
        
        await createDeliveryTimeRange({
          startTime: startTime,
          endTime: endTime,
          routeId: formData.routeId || null,
          sequence: parseInt(formData.sequence) || 10
        });
      } else {
        await createRouteBlackoutGroup({
          routeId: formData.routeId || null,
          name: formData.name
        });
      }
      setShowCreateModal(false);
      setFormData({ name: '', date: '', routeId: '', startTime: '', endTime: '', sequence: 10 });
      loadData();
    } catch (error) {
      console.error('Error creating:', error);
      alert('Failed to create');
    }
  };

  if (loading) {
    return <div className="admin-loading">Loading availability data...</div>;
  }

  const renderList = () => {
    let items = [];
    if (activeTab === 'blackout') items = blackoutDays;
    else if (activeTab === 'stress') items = stressDays;
    else if (activeTab === 'time-ranges') items = timeRanges;
    else items = blackoutGroups;

    return (
      <div className="items-list">
        {items.length === 0 ? (
          <div className="empty-state">No {activeTab} entries found</div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="item-card">
              {activeTab === 'time-ranges' ? (
                <>
                  <h4>{item.name || `${item.startTime} - ${item.endTime}`}</h4>
                  {item.routeId && (
                    <p>Route: {routes.find(r => r.id === item.routeId)?.name || 'N/A'}</p>
                  )}
                </>
              ) : (
                <>
                  <h4>{item.name}</h4>
                  <p>
                    {item.date?.toDate ? item.date.toDate().toLocaleDateString() : 'N/A'}
                  </p>
                </>
              )}
            </div>
          ))
        )}
      </div>
    );
  };

  return (
    <div className="availability">
      <div className="page-header">
        <h3>Availability Management</h3>
        <button className="create-button" onClick={() => setShowCreateModal(true)}>
          + Add {activeTab === 'blackout' ? 'Blackout Day' : activeTab === 'stress' ? 'Stress Day' : activeTab === 'time-ranges' ? 'Time Range' : 'Blackout Group'}
        </button>
      </div>

      <div className="tabs">
        <button className={activeTab === 'blackout' ? 'active' : ''} onClick={() => setActiveTab('blackout')}>
          Blackout Days
        </button>
        <button className={activeTab === 'stress' ? 'active' : ''} onClick={() => setActiveTab('stress')}>
          Stress Days
        </button>
        <button className={activeTab === 'time-ranges' ? 'active' : ''} onClick={() => setActiveTab('time-ranges')}>
          Delivery Time Ranges
        </button>
        <button className={activeTab === 'blackout-groups' ? 'active' : ''} onClick={() => setActiveTab('blackout-groups')}>
          Route Blackout Groups
        </button>
      </div>

      {renderList()}

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h4>
              Create {activeTab === 'blackout' ? 'Blackout Day' : activeTab === 'stress' ? 'Stress Day' : activeTab === 'time-ranges' ? 'Time Range' : 'Blackout Group'}
            </h4>
            <form onSubmit={handleCreate}>
              {activeTab !== 'time-ranges' && (
                <>
                  <div className="form-group">
                    <label>Description *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Public Holiday, High Demand Period"
                    />
                  </div>
                  <div className="form-group">
                    <label>Date *</label>
                    <input
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>
                </>
              )}
              {activeTab === 'time-ranges' && (
                <>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Start Time *</label>
                      <input
                        type="time"
                        required
                        value={formData.startTime}
                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>End Time *</label>
                      <input
                        type="time"
                        required
                        value={formData.endTime}
                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Route (optional)</label>
                    <select
                      value={formData.routeId}
                      onChange={(e) => setFormData({ ...formData, routeId: e.target.value })}
                    >
                      <option value="">Global (all routes)</option>
                      {routes.map(route => (
                        <option key={route.id} value={route.id}>{route.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Sequence</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.sequence}
                      onChange={(e) => setFormData({ ...formData, sequence: e.target.value })}
                    />
                  </div>
                </>
              )}
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

export default Availability;

