import React, { useState, useEffect } from 'react';
import { getTerritories, getBranches, getDistricts, getRegions } from '../../services/fieldService';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Timestamp } from 'firebase/firestore';
import './Territories.css';

const Territories = () => {
  const [territories, setTerritories] = useState([]);
  const [branches, setBranches] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('territories');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    type: 'zip',
    branchId: '',
    districtId: '',
    regionId: '',
    description: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [terrs, brs, dists, regs] = await Promise.all([
        getTerritories(),
        getBranches(),
        getDistricts(),
        getRegions()
      ]);
      setTerritories(terrs);
      setBranches(brs);
      setDistricts(dists);
      setRegions(regs);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      let collectionName;
      const data = {
        name: formData.name,
        description: formData.description,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      if (activeTab === 'territories') {
        collectionName = 'territories';
        data.type = formData.type;
        data.branchId = formData.branchId || null;
      } else if (activeTab === 'branches') {
        collectionName = 'branches';
        data.districtId = formData.districtId || null;
      } else if (activeTab === 'districts') {
        collectionName = 'districts';
        data.regionId = formData.regionId || null;
      } else {
        collectionName = 'regions';
      }

      await addDoc(collection(db, collectionName), data);
      setShowCreateModal(false);
      setFormData({ name: '', type: 'zip', branchId: '', districtId: '', regionId: '', description: '' });
      loadData();
    } catch (error) {
      console.error('Error creating:', error);
      alert('Failed to create');
    }
  };

  if (loading) {
    return <div className="admin-loading">Loading...</div>;
  }

  const renderList = () => {
    let items = [];
    if (activeTab === 'territories') items = territories;
    else if (activeTab === 'branches') items = branches;
    else if (activeTab === 'districts') items = districts;
    else items = regions;

    return (
      <div className="items-grid">
        {items.length === 0 ? (
          <div className="empty-state">No {activeTab} found</div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="item-card">
              <h4>{item.name}</h4>
              {item.description && <p>{item.description}</p>}
            </div>
          ))
        )}
      </div>
    );
  };

  return (
    <div className="territories">
      <div className="page-header">
        <h3>Geographic Organization</h3>
        <button className="create-button" onClick={() => setShowCreateModal(true)}>
          + Create {activeTab.slice(0, -1)}
        </button>
      </div>

      <div className="tabs">
        <button className={activeTab === 'regions' ? 'active' : ''} onClick={() => setActiveTab('regions')}>
          Regions
        </button>
        <button className={activeTab === 'districts' ? 'active' : ''} onClick={() => setActiveTab('districts')}>
          Districts
        </button>
        <button className={activeTab === 'branches' ? 'active' : ''} onClick={() => setActiveTab('branches')}>
          Branches
        </button>
        <button className={activeTab === 'territories' ? 'active' : ''} onClick={() => setActiveTab('territories')}>
          Territories
        </button>
      </div>

      {renderList()}

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h4>Create {activeTab.slice(0, -1)}</h4>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              {activeTab === 'territories' && (
                <div className="form-group">
                  <label>Type</label>
                  <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
                    <option value="zip">Zip</option>
                    <option value="state">State</option>
                    <option value="country">Country</option>
                  </select>
                </div>
              )}
              {activeTab === 'territories' && branches.length > 0 && (
                <div className="form-group">
                  <label>Branch</label>
                  <select
                    value={formData.branchId}
                    onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                  >
                    <option value="">None</option>
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              )}
              {activeTab === 'branches' && districts.length > 0 && (
                <div className="form-group">
                  <label>District</label>
                  <select
                    value={formData.districtId}
                    onChange={(e) => setFormData({ ...formData, districtId: e.target.value })}
                  >
                    <option value="">None</option>
                    {districts.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              )}
              {activeTab === 'districts' && regions.length > 0 && (
                <div className="form-group">
                  <label>Region</label>
                  <select
                    value={formData.regionId}
                    onChange={(e) => setFormData({ ...formData, regionId: e.target.value })}
                  >
                    <option value="">None</option>
                    {regions.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>
              )}
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

export default Territories;

