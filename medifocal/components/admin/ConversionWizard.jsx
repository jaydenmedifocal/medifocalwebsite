import React, { useState, useEffect } from 'react';
import { getConvertiblePartners, convertPartners } from '../../services/fieldService';
import './ConversionWizard.css';

const ConversionWizard = () => {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [converting, setConverting] = useState(false);
  const [selectedPartners, setSelectedPartners] = useState([]);
  const [recordType, setRecordType] = useState('location');
  const [conversionResults, setConversionResults] = useState(null);

  useEffect(() => {
    loadPartners();
  }, []);

  const loadPartners = async () => {
    try {
      setLoading(true);
      const partnersList = await getConvertiblePartners();
      setPartners(partnersList);
    } catch (error) {
      console.error('Error loading partners:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPartner = (partnerId) => {
    setSelectedPartners(prev => {
      if (prev.includes(partnerId)) {
        return prev.filter(id => id !== partnerId);
      } else {
        return [...prev, partnerId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedPartners.length === partners.length) {
      setSelectedPartners([]);
    } else {
      setSelectedPartners(partners.map(p => p.id));
    }
  };

  const handleConvert = async () => {
    if (selectedPartners.length === 0) {
      alert('Please select at least one partner to convert');
      return;
    }

    try {
      setConverting(true);
      const result = await convertPartners(selectedPartners, recordType);
      setConversionResults(result);
      
      if (result.success) {
        // Reload partners to remove converted ones
        await loadPartners();
        setSelectedPartners([]);
      }
    } catch (error) {
      console.error('Error converting partners:', error);
      alert(`Conversion failed: ${error.message}`);
    } finally {
      setConverting(false);
    }
  };

  if (loading) {
    return <div className="admin-loading">Loading partners...</div>;
  }

  return (
    <div className="conversion-wizard">
      <div className="page-header">
        <h3>Partner to FSM Conversion Wizard</h3>
        <p>Convert customers (partners) to Field Service Locations or Workers</p>
      </div>

      <div className="wizard-container">
        <div className="wizard-step">
          <h4>Step 1: Select Conversion Type</h4>
          <div className="conversion-type-selector">
            <label className={`type-option ${recordType === 'location' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="recordType"
                value="location"
                checked={recordType === 'location'}
                onChange={(e) => setRecordType(e.target.value)}
              />
              <div className="type-content">
                <strong>Convert to Location</strong>
                <p>Create a Field Service Location from the selected partner(s)</p>
              </div>
            </label>
            <label className={`type-option ${recordType === 'person' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="recordType"
                value="person"
                checked={recordType === 'person'}
                onChange={(e) => setRecordType(e.target.value)}
              />
              <div className="type-content">
                <strong>Convert to Worker</strong>
                <p>Convert the selected partner(s) to Field Service Workers</p>
              </div>
            </label>
          </div>
        </div>

        <div className="wizard-step">
          <div className="step-header">
            <h4>Step 2: Select Partners to Convert</h4>
            <div className="selection-actions">
              <button className="select-all-btn" onClick={handleSelectAll}>
                {selectedPartners.length === partners.length ? 'Deselect All' : 'Select All'}
              </button>
              <span className="selection-count">
                {selectedPartners.length} of {partners.length} selected
              </span>
            </div>
          </div>

          {partners.length === 0 ? (
            <div className="empty-state">
              <p>No partners available for conversion.</p>
              <p className="hint">All partners have already been converted to locations or workers.</p>
            </div>
          ) : (
            <div className="partners-list">
              {partners.map((partner) => (
                <div
                  key={partner.id}
                  className={`partner-card ${selectedPartners.includes(partner.id) ? 'selected' : ''}`}
                  onClick={() => handleSelectPartner(partner.id)}
                >
                  <input
                    type="checkbox"
                    checked={selectedPartners.includes(partner.id)}
                    onChange={() => handleSelectPartner(partner.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="partner-info">
                    <div className="partner-name">
                      {partner.displayName || partner.name || partner.email || 'Unnamed Partner'}
                    </div>
                    <div className="partner-details">
                      {partner.email && <span className="detail-item">📧 {partner.email}</span>}
                      {partner.phone && <span className="detail-item">📞 {partner.phone}</span>}
                      {partner.city && <span className="detail-item">📍 {partner.city}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="wizard-step">
          <div className="step-header">
            <h4>Step 3: Convert</h4>
          </div>
          <div className="convert-actions">
            <button
              className="convert-button"
              onClick={handleConvert}
              disabled={selectedPartners.length === 0 || converting}
            >
              {converting ? 'Converting...' : `Convert ${selectedPartners.length} Partner(s) to ${recordType === 'location' ? 'Location(s)' : 'Worker(s)'}`}
            </button>
          </div>
        </div>

        {conversionResults && (
          <div className={`conversion-results ${conversionResults.success ? 'success' : 'error'}`}>
            <h4>Conversion Results</h4>
            {conversionResults.converted && conversionResults.converted.length > 0 && (
              <div className="results-section">
                <strong>✅ Successfully Converted ({conversionResults.converted.length}):</strong>
                <ul>
                  {conversionResults.converted.map((result, idx) => (
                    <li key={idx}>
                      Partner {result.partnerId} → {recordType === 'location' ? `Location ${result.locationId}` : `Worker ${result.workerId}`}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {conversionResults.errors && conversionResults.errors.length > 0 && (
              <div className="results-section">
                <strong>❌ Errors ({conversionResults.errors.length}):</strong>
                <ul>
                  {conversionResults.errors.map((error, idx) => (
                    <li key={idx}>
                      Partner {error.partnerId}: {error.error}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <button
              className="clear-results-btn"
              onClick={() => setConversionResults(null)}
            >
              Clear Results
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversionWizard;

