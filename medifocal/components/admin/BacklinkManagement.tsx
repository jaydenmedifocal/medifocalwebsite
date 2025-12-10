import React, { useState, useEffect } from 'react';
import {
  getAllBacklinks,
  addBacklink,
  updateBacklink,
  deleteBacklink,
  requestRemoval,
  disavowBacklink,
  bulkDisavow,
  generateDisavowFile,
  importBacklinksFromCSV,
  getBacklinkStats,
  type Backlink
} from '../../services/backlinks';
import { buildBacklinks, getAvailableStrategies, getRecommendedStrategies } from '../../services/backlinkBuilder';
import { startBacklinkBuilding, getBacklinkJobStatus, waitForJobCompletion, type BacklinkJob } from '../../services/backlinkJobs';
import './BacklinkManagement.css';

const BacklinkManagement: React.FC = () => {
  const [backlinks, setBacklinks] = useState<Backlink[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [filter, setFilter] = useState<'all' | 'good' | 'neutral' | 'bad' | 'active' | 'broken' | 'disavowed'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showDisavowModal, setShowDisavowModal] = useState(false);
  const [showBuilderModal, setShowBuilderModal] = useState(false);
  const [building, setBuilding] = useState(false);
  const [currentJob, setCurrentJob] = useState<BacklinkJob | null>(null);
  const [jobProgress, setJobProgress] = useState<string>('');
  const [selectedBacklinks, setSelectedBacklinks] = useState<Set<string>>(new Set());
  const [editingBacklink, setEditingBacklink] = useState<Backlink | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    url: '',
    anchorText: '',
    targetUrl: 'https://medifocal.com',
    quality: 'unknown' as Backlink['quality'],
    status: 'active' as Backlink['status'],
    notes: '',
    domainAuthority: '',
  });

  useEffect(() => {
    loadBacklinks();
    loadStats();
    checkRunningJobs();
  }, [filter]);

  // Check for running jobs on mount and periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (currentJob?.status === 'running') {
        checkJobStatus();
      }
    }, 3000); // Check every 3 seconds

    return () => clearInterval(interval);
  }, [currentJob]);

  const checkRunningJobs = async () => {
    try {
      const job = await getBacklinkJobStatus();
      if (job.status === 'running') {
        setCurrentJob(job);
        setBuilding(true);
      }
    } catch (error) {
      // No jobs or error - ignore
    }
  };

  const checkJobStatus = async () => {
    if (!currentJob?.id) return;
    
    try {
      const job = await getBacklinkJobStatus(currentJob.id);
      setCurrentJob(job);
      
      if (job.status === 'completed') {
        setBuilding(false);
        setJobProgress('');
        loadBacklinks();
        loadStats();
        alert(`✅ Backlink building completed!\n\nCreated: ${job.created} backlinks\n\nSummary:\n${Object.entries(job.summary || {}).map(([strategy, count]) => `  • ${strategy}: ${count}`).join('\n')}`);
      } else if (job.status === 'failed') {
        setBuilding(false);
        setJobProgress('');
        alert(`❌ Backlink building failed: ${job.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error checking job status:', error);
    }
  };

  const loadBacklinks = async () => {
    try {
      setLoading(true);
      let allBacklinks = await getAllBacklinks();
      
      // Apply filters
      if (filter === 'good' || filter === 'neutral' || filter === 'bad') {
        allBacklinks = allBacklinks.filter(b => b.quality === filter);
      } else if (filter === 'active' || filter === 'broken' || filter === 'disavowed') {
        allBacklinks = allBacklinks.filter(b => b.status === filter);
      }
      
      // Apply search
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        allBacklinks = allBacklinks.filter(b =>
          b.url.toLowerCase().includes(term) ||
          b.domain.toLowerCase().includes(term) ||
          b.anchorText.toLowerCase().includes(term)
        );
      }
      
      setBacklinks(allBacklinks);
    } catch (error) {
      console.error('Error loading backlinks:', error);
      alert('Error loading backlinks');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await getBacklinkStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleAddBacklink = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addBacklink({
        url: formData.url,
        domain: extractDomain(formData.url),
        anchorText: formData.anchorText,
        targetUrl: formData.targetUrl,
        quality: formData.quality,
        status: formData.status,
        notes: formData.notes,
        domainAuthority: formData.domainAuthority ? parseInt(formData.domainAuthority) : undefined,
        source: 'manual',
      });
      
      setShowAddModal(false);
      resetForm();
      loadBacklinks();
      loadStats();
      alert('Backlink added successfully');
    } catch (error) {
      console.error('Error adding backlink:', error);
      alert('Error adding backlink');
    }
  };

  const handleUpdateBacklink = async (id: string, updates: Partial<Backlink>) => {
    try {
      await updateBacklink(id, updates);
      loadBacklinks();
      loadStats();
      setEditingBacklink(null);
      alert('Backlink updated successfully');
    } catch (error) {
      console.error('Error updating backlink:', error);
      alert('Error updating backlink');
    }
  };

  const handleDeleteBacklink = async (id: string) => {
    if (!confirm('Are you sure you want to delete this backlink?')) return;
    
    try {
      await deleteBacklink(id);
      loadBacklinks();
      loadStats();
      alert('Backlink deleted successfully');
    } catch (error) {
      console.error('Error deleting backlink:', error);
      alert('Error deleting backlink');
    }
  };

  const handleRequestRemoval = async (id: string, email?: string) => {
    try {
      await requestRemoval(id, email);
      loadBacklinks();
      loadStats();
      alert('Removal requested successfully');
    } catch (error) {
      console.error('Error requesting removal:', error);
      alert('Error requesting removal');
    }
  };

  const handleBulkDisavow = async () => {
    if (selectedBacklinks.size === 0) {
      alert('Please select backlinks to disavow');
      return;
    }
    
    if (!confirm(`Are you sure you want to disavow ${selectedBacklinks.size} backlinks?`)) return;
    
    try {
      await bulkDisavow(Array.from(selectedBacklinks));
      setSelectedBacklinks(new Set());
      loadBacklinks();
      loadStats();
      alert('Backlinks disavowed successfully');
    } catch (error) {
      console.error('Error disavowing backlinks:', error);
      alert('Error disavowing backlinks');
    }
  };

  const handleGenerateDisavowFile = async () => {
    try {
      const content = await generateDisavowFile();
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `disavow-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      alert('Disavow file generated successfully');
    } catch (error) {
      console.error('Error generating disavow file:', error);
      alert('Error generating disavow file');
    }
  };

  const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      const text = await file.text();
      const imported = await importBacklinksFromCSV(text);
      setShowImportModal(false);
      loadBacklinks();
      loadStats();
      alert(`Successfully imported ${imported} backlinks`);
    } catch (error) {
      console.error('Error importing CSV:', error);
      alert('Error importing CSV: ' + (error as Error).message);
    }
  };

  const extractDomain = (url: string): string => {
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  const resetForm = () => {
    setFormData({
      url: '',
      anchorText: '',
      targetUrl: 'https://medifocal.com',
      quality: 'unknown',
      status: 'active',
      notes: '',
      domainAuthority: '',
    });
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedBacklinks);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedBacklinks(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedBacklinks.size === backlinks.length) {
      setSelectedBacklinks(new Set());
    } else {
      setSelectedBacklinks(new Set(backlinks.map(b => b.id!).filter(Boolean)));
    }
  };

  const getQualityColor = (quality: Backlink['quality']) => {
    switch (quality) {
      case 'good': return 'text-green-600 bg-green-50';
      case 'neutral': return 'text-yellow-600 bg-yellow-50';
      case 'bad': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusColor = (status: Backlink['status']) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50';
      case 'broken': return 'text-red-600 bg-red-50';
      case 'removed': return 'text-gray-600 bg-gray-50';
      case 'pending_removal': return 'text-yellow-600 bg-yellow-50';
      case 'disavowed': return 'text-orange-600 bg-orange-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading && !stats) {
    return <div className="backlink-loading">Loading backlinks...</div>;
  }

  return (
    <div className="backlink-management">
      <div className="backlink-header">
        <div>
          <h2 className="backlink-title">Backlink Management</h2>
          <p className="backlink-subtitle">Monitor, manage, and optimize your backlink profile</p>
        </div>
        <div className="backlink-actions">
          <button
            onClick={() => setShowImportModal(true)}
            className="btn btn-secondary"
          >
            Import from CSV
          </button>
          <button
            onClick={() => setShowBuilderModal(true)}
            className="btn btn-primary"
          >
            🤖 Auto Build Backlinks
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary"
          >
            + Add Backlink
          </button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="backlink-stats">
          <div className="stat-card">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Backlinks</div>
          </div>
          <div className="stat-card">
            <div className="stat-value text-green-600">{stats.byQuality.good}</div>
            <div className="stat-label">Good Quality</div>
          </div>
          <div className="stat-card">
            <div className="stat-value text-yellow-600">{stats.byQuality.neutral}</div>
            <div className="stat-label">Neutral</div>
          </div>
          <div className="stat-card">
            <div className="stat-value text-red-600">{stats.byQuality.bad}</div>
            <div className="stat-label">Bad Quality</div>
          </div>
          <div className="stat-card">
            <div className="stat-value text-orange-600">{stats.byStatus.disavowed}</div>
            <div className="stat-label">Disavowed</div>
          </div>
          <div className="stat-card">
            <div className="stat-value text-yellow-600">{stats.removalRequested}</div>
            <div className="stat-label">Removal Requested</div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="backlink-filters">
        <div className="filter-group">
          <label>Filter:</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value as any)}>
            <option value="all">All Backlinks</option>
            <option value="good">Good Quality</option>
            <option value="neutral">Neutral</option>
            <option value="bad">Bad Quality</option>
            <option value="active">Active</option>
            <option value="broken">Broken</option>
            <option value="disavowed">Disavowed</option>
          </select>
        </div>
        <div className="search-group">
          <input
            type="text"
            placeholder="Search backlinks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && loadBacklinks()}
          />
          <button onClick={loadBacklinks}>Search</button>
        </div>
        {selectedBacklinks.size > 0 && (
          <div className="bulk-actions">
            <button onClick={handleBulkDisavow} className="btn btn-warning">
              Disavow Selected ({selectedBacklinks.size})
            </button>
            <button onClick={() => setSelectedBacklinks(new Set())} className="btn btn-secondary">
              Clear Selection
            </button>
          </div>
        )}
        <button onClick={handleGenerateDisavowFile} className="btn btn-primary">
          Generate Disavow File
        </button>
      </div>

      {/* Backlinks Table */}
      <div className="backlink-table-container">
        <table className="backlink-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={selectedBacklinks.size === backlinks.length && backlinks.length > 0}
                  onChange={toggleSelectAll}
                />
              </th>
              <th>URL / Domain</th>
              <th>Anchor Text</th>
              <th>Target URL</th>
              <th>Quality</th>
              <th>Status</th>
              <th>Source</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {backlinks.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center">
                  No backlinks found. {filter !== 'all' && 'Try changing the filter.'}
                </td>
              </tr>
            ) : (
              backlinks.map(backlink => (
                <tr key={backlink.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedBacklinks.has(backlink.id!)}
                      onChange={() => toggleSelect(backlink.id!)}
                    />
                  </td>
                  <td>
                    <div className="backlink-url">
                      <a href={backlink.url} target="_blank" rel="noopener noreferrer">
                        {backlink.domain}
                      </a>
                      {backlink.domainAuthority && (
                        <span className="da-badge">DA: {backlink.domainAuthority}</span>
                      )}
                    </div>
                  </td>
                  <td>{backlink.anchorText || '-'}</td>
                  <td>
                    <a href={backlink.targetUrl} target="_blank" rel="noopener noreferrer">
                      {backlink.targetUrl.replace('https://', '').substring(0, 30)}...
                    </a>
                  </td>
                  <td>
                    <span className={`quality-badge ${getQualityColor(backlink.quality)}`}>
                      {backlink.quality}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${getStatusColor(backlink.status)}`}>
                      {backlink.status}
                    </span>
                  </td>
                  <td>{backlink.source}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => {
                          setEditingBacklink(backlink);
                          setFormData({
                            url: backlink.url,
                            anchorText: backlink.anchorText,
                            targetUrl: backlink.targetUrl,
                            quality: backlink.quality,
                            status: backlink.status,
                            notes: backlink.notes || '',
                            domainAuthority: backlink.domainAuthority?.toString() || '',
                          });
                        }}
                        className="btn-icon"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      {backlink.status !== 'disavowed' && (
                        <button
                          onClick={() => disavowBacklink(backlink.id!).then(() => loadBacklinks())}
                          className="btn-icon"
                          title="Disavow"
                        >
                          🚫
                        </button>
                      )}
                      {backlink.status === 'active' && !backlink.removalRequested && (
                        <button
                          onClick={() => {
                            const email = prompt('Enter webmaster email (optional):');
                            handleRequestRemoval(backlink.id!, email || undefined);
                          }}
                          className="btn-icon"
                          title="Request Removal"
                        >
                          📧
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteBacklink(backlink.id!)}
                        className="btn-icon btn-danger"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Add New Backlink</h3>
            <form onSubmit={handleAddBacklink}>
              <div className="form-group">
                <label>URL *</label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  required
                  placeholder="https://example.com/page"
                />
              </div>
              <div className="form-group">
                <label>Anchor Text</label>
                <input
                  type="text"
                  value={formData.anchorText}
                  onChange={(e) => setFormData({ ...formData, anchorText: e.target.value })}
                  placeholder="Link text"
                />
              </div>
              <div className="form-group">
                <label>Target URL</label>
                <input
                  type="url"
                  value={formData.targetUrl}
                  onChange={(e) => setFormData({ ...formData, targetUrl: e.target.value })}
                  placeholder="https://medifocal.com/page"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Quality</label>
                  <select
                    value={formData.quality}
                    onChange={(e) => setFormData({ ...formData, quality: e.target.value as Backlink['quality'] })}
                  >
                    <option value="unknown">Unknown</option>
                    <option value="good">Good</option>
                    <option value="neutral">Neutral</option>
                    <option value="bad">Bad</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as Backlink['status'] })}
                  >
                    <option value="active">Active</option>
                    <option value="broken">Broken</option>
                    <option value="removed">Removed</option>
                    <option value="pending_removal">Pending Removal</option>
                    <option value="disavowed">Disavowed</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Domain Authority (optional)</label>
                <input
                  type="number"
                  value={formData.domainAuthority}
                  onChange={(e) => setFormData({ ...formData, domainAuthority: e.target.value })}
                  placeholder="0-100"
                  min="0"
                  max="100"
                />
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Backlink
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingBacklink && (
        <div className="modal-overlay" onClick={() => setEditingBacklink(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Edit Backlink</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleUpdateBacklink(editingBacklink.id!, {
                quality: formData.quality,
                status: formData.status,
                notes: formData.notes,
                domainAuthority: formData.domainAuthority ? parseInt(formData.domainAuthority) : undefined,
              });
            }}>
              <div className="form-group">
                <label>URL</label>
                <input type="text" value={editingBacklink.url} disabled />
              </div>
              <div className="form-group">
                <label>Anchor Text</label>
                <input type="text" value={editingBacklink.anchorText} disabled />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Quality</label>
                  <select
                    value={formData.quality}
                    onChange={(e) => setFormData({ ...formData, quality: e.target.value as Backlink['quality'] })}
                  >
                    <option value="unknown">Unknown</option>
                    <option value="good">Good</option>
                    <option value="neutral">Neutral</option>
                    <option value="bad">Bad</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as Backlink['status'] })}
                  >
                    <option value="active">Active</option>
                    <option value="broken">Broken</option>
                    <option value="removed">Removed</option>
                    <option value="pending_removal">Pending Removal</option>
                    <option value="disavowed">Disavowed</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setEditingBacklink(null)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="modal-overlay" onClick={() => setShowImportModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Import Backlinks from CSV</h3>
            <p>Export your backlinks from Google Search Console and upload the CSV file here.</p>
            <input
              type="file"
              accept=".csv"
              onChange={handleImportCSV}
            />
            <div className="modal-actions">
              <button onClick={() => setShowImportModal(false)} className="btn btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auto Builder Modal */}
      {showBuilderModal && (
        <div className="modal-overlay" onClick={() => setShowBuilderModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px' }}>
            <h3>🤖 Automatic Backlink Builder</h3>
            <p>Select strategies to automatically build high-quality backlinks based on industry best practices:</p>
            
            <div className="strategy-list">
              {getAvailableStrategies().map(strategy => (
                <div key={strategy.name} className={`strategy-item ${strategy.priority === 'very_high' || (strategy.priority === 'high' && strategy.authorityLevel === 'very_high') ? 'strategy-high-priority' : ''}`}>
                  <div className="strategy-header">
                    <h4>{strategy.name}</h4>
                    <div className="strategy-badges">
                      <span className={`priority-badge priority-${strategy.priority}`}>
                        {strategy.priority === 'very_high' ? 'CRITICAL' : strategy.priority.toUpperCase()}
                      </span>
                      <span className={`authority-badge authority-${strategy.authorityLevel}`}>
                        {strategy.authorityLevel === 'very_high' ? '⭐⭐⭐' : strategy.authorityLevel === 'high' ? '⭐⭐' : '⭐'} Authority
                      </span>
                    </div>
                  </div>
                  <p>{strategy.description}</p>
                  <div className="strategy-meta">
                    <span className="strategy-time">⏱️ {strategy.estimatedTime}</span>
                    <span className="strategy-expert">👤 {strategy.expertSource}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="recommendations-box">
              <h4>🏆 Top Strategies for #1 Rankings (Expert-Recommended)</h4>
              <p className="recommendations-intro">These strategies are proven by SEO experts to achieve top rankings:</p>
              <ul>
                {getRecommendedStrategies().map(strategy => (
                  <li key={strategy.name}>
                    <strong>{strategy.name}</strong> - {strategy.description}
                    <br />
                    <span className="recommendation-source">Recommended by: {strategy.expertSource} | Authority: {strategy.authorityLevel === 'very_high' ? 'Very High' : 'High'}</span>
                  </li>
                ))}
              </ul>
            </div>

            {building ? (
              <div className="building-status">
                <div className="spinner"></div>
                <p>{jobProgress || 'Building backlinks... This may take a few minutes.'}</p>
                {currentJob?.id && (
                  <p className="text-sm text-gray-500 mt-2">Job ID: {currentJob.id}</p>
                )}
                {currentJob?.created !== undefined && (
                  <p className="text-sm text-green-600 mt-1">Created so far: {currentJob.created} backlinks</p>
                )}
              </div>
            ) : (
              <div className="modal-actions">
                <button
                  onClick={async () => {
                    setBuilding(true);
                    setJobProgress('Starting backlink building...');
                    try {
                      // Start job in background (Firebase Function)
                      const result = await startBacklinkBuilding(['all']);
                      setCurrentJob({ id: result.jobId, status: 'running' } as BacklinkJob);
                      setJobProgress(`Job started (ID: ${result.jobId}). Running in background...`);
                      
                      // Monitor job progress
                      waitForJobCompletion(
                        result.jobId,
                        (job) => {
                          setCurrentJob(job);
                          if (job.status === 'running') {
                            setJobProgress(`Building backlinks... (${job.created || 0} created so far)`);
                          }
                        }
                      ).then((job) => {
                        setBuilding(false);
                        setJobProgress('');
                        setShowBuilderModal(false);
                        loadBacklinks();
                        loadStats();
                        
                        let message = `✅ Successfully created ${job.created} backlinks!\n\n`;
                        message += 'Summary by strategy:\n';
                        Object.entries(job.summary || {}).forEach(([strategy, count]) => {
                          message += `  • ${strategy}: ${count} backlinks\n`;
                        });
                        if (job.errors && job.errors.length > 0) {
                          message += `\n⚠️ Errors: ${job.errors.length}`;
                        }
                        alert(message);
                      }).catch((error) => {
                        setBuilding(false);
                        setJobProgress('');
                        alert('Error building backlinks: ' + (error as Error).message);
                      });
                    } catch (error) {
                      setBuilding(false);
                      setJobProgress('');
                      alert('Error starting backlink building: ' + (error as Error).message);
                    }
                  }}
                  className="btn btn-primary"
                  disabled={building}
                >
                  {building ? 'Building...' : 'Start Building (Background)'}
                </button>
                <button onClick={() => setShowBuilderModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BacklinkManagement;

