import React, { useState, useEffect } from 'react';
import { getFrequencySets, createFrequencySet, getFrequencies, createFrequency } from '../../services/fieldService';
import './FrequencySets.css';

const FrequencySets = () => {
  const [frequencySets, setFrequencySets] = useState([]);
  const [frequencies, setFrequencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('sets');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [setFormData, setSetFormData] = useState({
    name: '',
    scheduleDays: 30,
    bufferEarly: 0,
    bufferLate: 0,
    frequencyIds: []
  });

  const [frequencyFormData, setFrequencyFormData] = useState({
    name: '',
    interval: 1,
    intervalType: 'weekly',
    isExclusive: false,
    useByweekday: false,
    mo: false, tu: false, we: false, th: false, fr: false, sa: false, su: false,
    useBymonthday: false,
    monthDay: 1,
    useBymonth: false,
    jan: false, feb: false, mar: false, apr: false, may: false, jun: false,
    jul: false, aug: false, sep: false, oct: false, nov: false, dec: false,
    useSetpos: false,
    setPos: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [sets, freqs] = await Promise.all([
        getFrequencySets(),
        getFrequencies()
      ]);
      setFrequencySets(sets);
      setFrequencies(freqs);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSet = async (e) => {
    e.preventDefault();
    try {
      await createFrequencySet(setFormData);
      setShowCreateModal(false);
      setSetFormData({ name: '', scheduleDays: 30, bufferEarly: 0, bufferLate: 0, frequencyIds: [] });
      loadData();
    } catch (error) {
      console.error('Error creating frequency set:', error);
      alert('Failed to create frequency set');
    }
  };

  const handleCreateFrequency = async (e) => {
    e.preventDefault();
    try {
      await createFrequency(frequencyFormData);
      setShowCreateModal(false);
      setFrequencyFormData({
        name: '', interval: 1, intervalType: 'weekly', isExclusive: false,
        useByweekday: false, mo: false, tu: false, we: false, th: false, fr: false, sa: false, su: false,
        useBymonthday: false, monthDay: 1,
        useBymonth: false, jan: false, feb: false, mar: false, apr: false, may: false, jun: false,
        jul: false, aug: false, sep: false, oct: false, nov: false, dec: false,
        useSetpos: false, setPos: 0
      });
      loadData();
    } catch (error) {
      console.error('Error creating frequency:', error);
      alert('Failed to create frequency');
    }
  };

  if (loading) {
    return <div className="admin-loading">Loading...</div>;
  }

  return (
    <div className="frequency-sets">
      <div className="page-header">
        <h3>Frequency Sets & Rules</h3>
        <button className="create-button" onClick={() => setShowCreateModal(true)}>
          + Create {activeTab === 'sets' ? 'Frequency Set' : 'Frequency Rule'}
        </button>
      </div>

      <div className="tabs">
        <button className={activeTab === 'sets' ? 'active' : ''} onClick={() => setActiveTab('sets')}>
          Frequency Sets
        </button>
        <button className={activeTab === 'frequencies' ? 'active' : ''} onClick={() => setActiveTab('frequencies')}>
          Frequency Rules
        </button>
      </div>

      {activeTab === 'sets' && (
        <div className="sets-grid">
          {frequencySets.length === 0 ? (
            <div className="empty-state">No frequency sets found</div>
          ) : (
            frequencySets.map((set) => (
              <div key={set.id} className="set-card">
                <h4>{set.name}</h4>
                <div className="set-details">
                  <div className="detail-item">
                    <span className="label">Schedule Days:</span>
                    <span className="value">{set.scheduleDays}</span>
                  </div>
                  {set.bufferEarly > 0 && (
                    <div className="detail-item">
                      <span className="label">Early Buffer:</span>
                      <span className="value">{set.bufferEarly} days</span>
                    </div>
                  )}
                  {set.bufferLate > 0 && (
                    <div className="detail-item">
                      <span className="label">Late Buffer:</span>
                      <span className="value">{set.bufferLate} days</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'frequencies' && (
        <div className="frequencies-grid">
          {frequencies.length === 0 ? (
            <div className="empty-state">No frequency rules found</div>
          ) : (
            frequencies.map((freq) => (
              <div key={freq.id} className="frequency-card">
                <h4>{freq.name}</h4>
                <div className="frequency-details">
                  <div className="detail-item">
                    <span className="label">Interval:</span>
                    <span className="value">Every {freq.interval} {freq.intervalType}</span>
                  </div>
                  {freq.isExclusive && (
                    <span className="exclusive-badge">Exclusive</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <h4>Create {activeTab === 'sets' ? 'Frequency Set' : 'Frequency Rule'}</h4>
            {activeTab === 'sets' ? (
              <form onSubmit={handleCreateSet}>
                <div className="form-group">
                  <label>Name *</label>
                  <input
                    type="text"
                    required
                    value={setFormData.name}
                    onChange={(e) => setSetFormData({ ...setFormData, name: e.target.value })}
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Schedule Days Ahead</label>
                    <input
                      type="number"
                      min="1"
                      value={setFormData.scheduleDays}
                      onChange={(e) => setSetFormData({ ...setFormData, scheduleDays: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Early Buffer (days)</label>
                    <input
                      type="number"
                      min="0"
                      value={setFormData.bufferEarly}
                      onChange={(e) => setSetFormData({ ...setFormData, bufferEarly: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Late Buffer (days)</label>
                    <input
                      type="number"
                      min="0"
                      value={setFormData.bufferLate}
                      onChange={(e) => setSetFormData({ ...setFormData, bufferLate: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="modal-actions">
                  <button type="submit" className="btn-primary">Create</button>
                  <button type="button" className="btn-secondary" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleCreateFrequency}>
                <div className="form-group">
                  <label>Name *</label>
                  <input
                    type="text"
                    required
                    value={frequencyFormData.name}
                    onChange={(e) => setFrequencyFormData({ ...frequencyFormData, name: e.target.value })}
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Repeat Every</label>
                    <input
                      type="number"
                      min="1"
                      value={frequencyFormData.interval}
                      onChange={(e) => setFrequencyFormData({ ...frequencyFormData, interval: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Interval Type *</label>
                    <select
                      required
                      value={frequencyFormData.intervalType}
                      onChange={(e) => setFrequencyFormData({ ...frequencyFormData, intervalType: e.target.value })}
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={frequencyFormData.isExclusive}
                      onChange={(e) => setFrequencyFormData({ ...frequencyFormData, isExclusive: e.target.checked })}
                    />
                    Exclusive Rule (prevents these days)
                  </label>
                </div>
                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={frequencyFormData.useByweekday}
                      onChange={(e) => setFrequencyFormData({ ...frequencyFormData, useByweekday: e.target.checked })}
                    />
                    Use Days of Week
                  </label>
                  {frequencyFormData.useByweekday && (
                    <div className="weekdays-selector">
                      {['mo', 'tu', 'we', 'th', 'fr', 'sa', 'su'].map(day => (
                        <label key={day} className="day-checkbox">
                          <input
                            type="checkbox"
                            checked={frequencyFormData[day]}
                            onChange={(e) => setFrequencyFormData({ ...frequencyFormData, [day]: e.target.checked })}
                          />
                          {day.toUpperCase()}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={frequencyFormData.useBymonthday}
                      onChange={(e) => setFrequencyFormData({ ...frequencyFormData, useBymonthday: e.target.checked })}
                    />
                    Use Day of Month
                  </label>
                  {frequencyFormData.useBymonthday && (
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={frequencyFormData.monthDay}
                      onChange={(e) => setFrequencyFormData({ ...frequencyFormData, monthDay: parseInt(e.target.value) })}
                    />
                  )}
                </div>
                <div className="modal-actions">
                  <button type="submit" className="btn-primary">Create</button>
                  <button type="button" className="btn-secondary" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FrequencySets;

