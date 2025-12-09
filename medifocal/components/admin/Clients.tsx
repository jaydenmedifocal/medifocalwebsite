import React, { useState, useEffect } from 'react';
import {
  getBusinessClients,
  createBusinessClient,
  updateBusinessClient,
  deleteBusinessClient,
  findDuplicateClients,
  mergeClients,
  syncClientToStripe,
  BusinessClient
} from '../../services/clients';
import './Clients.css';

const Clients = () => {
  const [clients, setClients] = useState<BusinessClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<BusinessClient | null>(null);
  const [duplicates, setDuplicates] = useState<BusinessClient[]>([]);
  const [mergeTargets, setMergeTargets] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState<Partial<BusinessClient>>({
    businessName: '',
    contactName: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zip: '',
      country: 'AU'
    },
    abn: '',
    website: '',
    industry: '',
    notes: '',
    isActive: true
  });

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      const clientsList = await getBusinessClients();
      setClients(clientsList);
    } catch (error) {
      console.error('Error loading clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (client?: BusinessClient) => {
    if (client) {
      setSelectedClient(client);
      setFormData({
        businessName: client.businessName || '',
        contactName: client.contactName || '',
        email: client.email || '',
        phone: client.phone || '',
        address: client.address || {
          street: '',
          city: '',
          state: '',
          zip: '',
          country: 'AU'
        },
        abn: client.abn || '',
        website: client.website || '',
        industry: client.industry || '',
        notes: client.notes || '',
        isActive: client.isActive !== undefined ? client.isActive : true
      });
    } else {
      setSelectedClient(null);
      setFormData({
        businessName: '',
        contactName: '',
        email: '',
        phone: '',
        address: {
          street: '',
          city: '',
          state: '',
          zip: '',
          country: 'AU'
        },
        abn: '',
        website: '',
        industry: '',
        notes: '',
        isActive: true
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedClient(null);
    setFormData({
      businessName: '',
      contactName: '',
      email: '',
      phone: '',
      address: {
        street: '',
        city: '',
        state: '',
        zip: '',
        country: 'AU'
      },
      abn: '',
      website: '',
      industry: '',
      notes: '',
      isActive: true
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedClient?.id) {
        await updateBusinessClient(selectedClient.id, formData);
      } else {
        // Check for duplicates before creating
        const duplicates = await findDuplicateClients(formData);
        if (duplicates.length > 0) {
          setDuplicates(duplicates);
          setShowMergeModal(true);
          return;
        }
        await createBusinessClient(formData as Omit<BusinessClient, 'id' | 'createdAt' | 'updatedAt'>);
      }
      handleCloseModal();
      loadClients();
    } catch (error) {
      console.error('Error saving client:', error);
      alert('Error saving client. Please try again.');
    }
  };

  const handleDelete = async (clientId: string) => {
    if (!confirm('Are you sure you want to delete this client?')) return;
    
    try {
      await deleteBusinessClient(clientId);
      loadClients();
    } catch (error) {
      console.error('Error deleting client:', error);
      alert('Error deleting client. Please try again.');
    }
  };

  const handleMerge = async () => {
    if (!selectedClient?.id || mergeTargets.length === 0) return;
    
    try {
      await mergeClients(selectedClient.id, mergeTargets);
      setShowMergeModal(false);
      setDuplicates([]);
      setMergeTargets([]);
      handleCloseModal();
      loadClients();
    } catch (error) {
      console.error('Error merging clients:', error);
      alert('Error merging clients. Please try again.');
    }
  };

  const handleCreateAnyway = async () => {
    try {
      await createBusinessClient(formData as Omit<BusinessClient, 'id' | 'createdAt' | 'updatedAt'>);
      setShowMergeModal(false);
      setDuplicates([]);
      handleCloseModal();
      loadClients();
    } catch (error) {
      console.error('Error creating client:', error);
      alert('Error creating client. Please try again.');
    }
  };

  const handleSyncToStripe = async (clientId: string) => {
    try {
      const client = await getBusinessClients().then(clients => clients.find(c => c.id === clientId));
      if (client) {
        await syncClientToStripe(clientId, client);
        alert('Client synced to Stripe successfully!');
        loadClients();
      }
    } catch (error) {
      console.error('Error syncing to Stripe:', error);
      alert('Error syncing to Stripe. Please try again.');
    }
  };

  const filteredClients = clients.filter(client => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      client.businessName?.toLowerCase().includes(query) ||
      client.contactName?.toLowerCase().includes(query) ||
      client.email?.toLowerCase().includes(query) ||
      client.phone?.includes(query) ||
      client.abn?.includes(query)
    );
  });

  if (loading) {
    return (
      <div className="fs-content">
        <div className="admin-loading">Loading clients...</div>
      </div>
    );
  }

  return (
    <div className="fs-content">
      <div className="page-header">
        <div>
          <h2 className="page-title">Business Clients</h2>
          <p className="page-subtitle">Manage business clients and sync with Stripe</p>
        </div>
        <button className="btn-primary" onClick={() => handleOpenModal()}>
          <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Client
        </button>
      </div>

      <div className="clients-filters">
        <div className="search-box">
          <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search clients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="clients-table-container">
        <table className="clients-table">
          <thead>
            <tr>
              <th>Business Name</th>
              <th>Contact</th>
              <th>Email</th>
              <th>Phone</th>
              <th>ABN</th>
              <th>Stripe</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredClients.length === 0 ? (
              <tr>
                <td colSpan={8} className="empty-state">
                  {searchQuery ? 'No clients found matching your search.' : 'No clients yet. Click "Add Client" to create one.'}
                </td>
              </tr>
            ) : (
              filteredClients.map(client => (
                <tr key={client.id}>
                  <td>
                    <div className="client-name">
                      <strong>{client.businessName}</strong>
                      {client.mergedFrom && client.mergedFrom.length > 0 && (
                        <span className="merged-badge" title={`Merged from ${client.mergedFrom.length} client(s)`}>
                          Merged
                        </span>
                      )}
                    </div>
                  </td>
                  <td>{client.contactName || '-'}</td>
                  <td>{client.email}</td>
                  <td>{client.phone || '-'}</td>
                  <td>{client.abn || '-'}</td>
                  <td>
                    {client.stripeCustomerId ? (
                      <a
                        href={client.stripeLink || `https://dashboard.stripe.com/customers/${client.stripeCustomerId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="stripe-link"
                      >
                        View in Stripe
                      </a>
                    ) : (
                      <button
                        className="btn-link"
                        onClick={() => handleSyncToStripe(client.id!)}
                      >
                        Sync to Stripe
                      </button>
                    )}
                  </td>
                  <td>
                    <span className={`status-badge ${client.isActive ? 'active' : 'inactive'}`}>
                      {client.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-icon"
                        onClick={() => handleOpenModal(client)}
                        title="Edit"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        className="btn-icon btn-danger"
                        onClick={() => handleDelete(client.id!)}
                        title="Delete"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedClient ? 'Edit Client' : 'Add New Client'}</h3>
              <button className="modal-close" onClick={handleCloseModal}>×</button>
            </div>
            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-group">
                <label>Business Name *</label>
                <input
                  type="text"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Contact Name</label>
                  <input
                    type="text"
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>ABN</label>
                  <input
                    type="text"
                    value={formData.abn}
                    onChange={(e) => setFormData({ ...formData, abn: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Website</label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Industry</label>
                  <input
                    type="text"
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Street Address</label>
                <input
                  type="text"
                  value={formData.address?.street || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    address: { ...formData.address, street: e.target.value }
                  })}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    value={formData.address?.city || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      address: { ...formData.address, city: e.target.value }
                    })}
                  />
                </div>
                <div className="form-group">
                  <label>State</label>
                  <input
                    type="text"
                    value={formData.address?.state || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      address: { ...formData.address, state: e.target.value }
                    })}
                  />
                </div>
                <div className="form-group">
                  <label>ZIP</label>
                  <input
                    type="text"
                    value={formData.address?.zip || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      address: { ...formData.address, zip: e.target.value }
                    })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={4}
                />
              </div>
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                  Active
                </label>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {selectedClient ? 'Update' : 'Create'} Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Merge Modal */}
      {showMergeModal && duplicates.length > 0 && (
        <div className="modal-overlay" onClick={() => setShowMergeModal(false)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Potential Duplicate Clients Found</h3>
              <button className="modal-close" onClick={() => setShowMergeModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p>We found {duplicates.length} potential duplicate client(s). Would you like to merge them or create a new client anyway?</p>
              <div className="duplicates-list">
                {duplicates.map(duplicate => (
                  <div key={duplicate.id} className="duplicate-item">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={mergeTargets.includes(duplicate.id!)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setMergeTargets([...mergeTargets, duplicate.id!]);
                          } else {
                            setMergeTargets(mergeTargets.filter(id => id !== duplicate.id));
                          }
                        }}
                      />
                      <div className="duplicate-info">
                        <strong>{duplicate.businessName}</strong>
                        <div className="duplicate-details">
                          {duplicate.email && <span>Email: {duplicate.email}</span>}
                          {duplicate.phone && <span>Phone: {duplicate.phone}</span>}
                          {duplicate.abn && <span>ABN: {duplicate.abn}</span>}
                        </div>
                      </div>
                    </label>
                  </div>
                ))}
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={handleCreateAnyway}>
                  Create Anyway
                </button>
                {mergeTargets.length > 0 && (
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => {
                      // Use first duplicate as primary, merge others into it
                      const primaryId = duplicates[0].id!;
                      const mergeIds = mergeTargets.filter(id => id !== primaryId);
                      if (mergeIds.length > 0) {
                        setSelectedClient(duplicates[0]);
                        handleMerge();
                      } else {
                        handleCreateAnyway();
                      }
                    }}
                  >
                    Merge Selected ({mergeTargets.length})
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clients;







