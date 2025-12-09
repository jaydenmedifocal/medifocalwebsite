import React, { useState, useEffect } from 'react';
import { getConfigSettings, updateConfigSettings } from '../../services/fieldService';
import './ConfigSettings.css';

const ConfigSettings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    autoPopulatePersonsOnLocation: false,
    autoPopulateEquipmentsOnOrder: false,
    searchOnCompleteName: false,
    fsmOrderRequestLateLowest: 72,
    fsmOrderRequestLateLow: 48,
    fsmOrderRequestLateMedium: 24,
    fsmOrderRequestLateHigh: 8
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const config = await getConfigSettings();
      if (config) {
        setSettings(config);
        setFormData({
          autoPopulatePersonsOnLocation: config.autoPopulatePersonsOnLocation || false,
          autoPopulateEquipmentsOnOrder: config.autoPopulateEquipmentsOnOrder || false,
          searchOnCompleteName: config.searchOnCompleteName || false,
          fsmOrderRequestLateLowest: config.fsmOrderRequestLateLowest || 72,
          fsmOrderRequestLateLow: config.fsmOrderRequestLateLow || 48,
          fsmOrderRequestLateMedium: config.fsmOrderRequestLateMedium || 24,
          fsmOrderRequestLateHigh: config.fsmOrderRequestLateHigh || 8
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await updateConfigSettings(formData);
      alert('Settings saved successfully');
      loadSettings();
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="admin-loading">Loading settings...</div>;
  }

  return (
    <div className="config-settings">
      <div className="page-header">
        <h3>Configuration Settings</h3>
        <p>Configure system-wide field service settings</p>
      </div>

      <form onSubmit={handleSave} className="settings-form">
        <div className="settings-section">
          <h4>Auto-Population Settings</h4>
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={formData.autoPopulatePersonsOnLocation}
                onChange={(e) => setFormData({ ...formData, autoPopulatePersonsOnLocation: e.target.checked })}
              />
              Auto-populate Workers on Location based on Territory
            </label>
          </div>
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={formData.autoPopulateEquipmentsOnOrder}
                onChange={(e) => setFormData({ ...formData, autoPopulateEquipmentsOnOrder: e.target.checked })}
              />
              Auto-populate Equipments on Order based on Location
            </label>
          </div>
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={formData.searchOnCompleteName}
                onChange={(e) => setFormData({ ...formData, searchOnCompleteName: e.target.checked })}
              />
              Search Location By Hierarchy
            </label>
          </div>
        </div>

        <div className="settings-section">
          <h4>Priority Buffer Hours (Late Order Detection)</h4>
          <p className="section-description">
            Hours of buffer before an order is considered late based on priority
          </p>
          <div className="form-row">
            <div className="form-group">
              <label>Lowest Priority</label>
              <input
                type="number"
                min="0"
                value={formData.fsmOrderRequestLateLowest}
                onChange={(e) => setFormData({ ...formData, fsmOrderRequestLateLowest: parseFloat(e.target.value) })}
              />
            </div>
            <div className="form-group">
              <label>Low Priority</label>
              <input
                type="number"
                min="0"
                value={formData.fsmOrderRequestLateLow}
                onChange={(e) => setFormData({ ...formData, fsmOrderRequestLateLow: parseFloat(e.target.value) })}
              />
            </div>
            <div className="form-group">
              <label>Medium Priority</label>
              <input
                type="number"
                min="0"
                value={formData.fsmOrderRequestLateMedium}
                onChange={(e) => setFormData({ ...formData, fsmOrderRequestLateMedium: parseFloat(e.target.value) })}
              />
            </div>
            <div className="form-group">
              <label>High Priority</label>
              <input
                type="number"
                min="0"
                value={formData.fsmOrderRequestLateHigh}
                onChange={(e) => setFormData({ ...formData, fsmOrderRequestLateHigh: parseFloat(e.target.value) })}
              />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ConfigSettings;

