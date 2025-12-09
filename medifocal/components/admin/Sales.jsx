import React, { useState, useEffect } from 'react';
import { getSalesOrders, linkOrderToSale, linkRecurringToSale, getRecurringOrdersForSale, linkAgreementToSale } from '../../services/fieldService';
import { getServiceOrders } from '../../services/fieldService';
import { getRecurringOrders } from '../../services/fieldService';
import { getAgreements } from '../../services/fieldService';
import './Sales.css';

const Sales = () => {
  const [salesOrders, setSalesOrders] = useState([]);
  const [serviceOrders, setServiceOrders] = useState([]);
  const [recurringOrders, setRecurringOrders] = useState([]);
  const [agreements, setAgreements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedServiceOrder, setSelectedServiceOrder] = useState(null);
  const [selectedSale, setSelectedSale] = useState(null);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showRecurringModal, setShowRecurringModal] = useState(false);
  const [showAgreementModal, setShowAgreementModal] = useState(false);
  const [activeTab, setActiveTab] = useState('orders');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [sales, service, recurring, agrs] = await Promise.all([
        getSalesOrders(),
        getServiceOrders(),
        getRecurringOrders(),
        getAgreements()
      ]);
      setSalesOrders(sales);
      setServiceOrders(service);
      setRecurringOrders(recurring);
      setAgreements(agrs);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLink = async (e) => {
    e.preventDefault();
    try {
      await linkOrderToSale(selectedServiceOrder.id, formData.saleId, formData.saleLineId);
      setShowLinkModal(false);
      setSelectedServiceOrder(null);
      setFormData({ saleId: '', saleLineId: '' });
      alert('Service order linked to sales order successfully');
      loadData();
    } catch (error) {
      console.error('Error linking order:', error);
      alert('Failed to link order');
    }
  };

  const [formData, setFormData] = useState({
    saleId: '',
    saleLineId: '',
    recurringId: '',
    agreementId: ''
  });

  if (loading) {
    return <div className="admin-loading">Loading sales orders...</div>;
  }

  return (
    <div className="sales">
      <div className="page-header">
        <h3>Sales Integration</h3>
        <p>Link service orders, recurring orders, and agreements to sales orders</p>
      </div>

      <div className="tabs">
        <button className={activeTab === 'orders' ? 'active' : ''} onClick={() => setActiveTab('orders')}>
          Service Orders
        </button>
        <button className={activeTab === 'recurring' ? 'active' : ''} onClick={() => setActiveTab('recurring')}>
          Recurring Orders
        </button>
        <button className={activeTab === 'agreements' ? 'active' : ''} onClick={() => setActiveTab('agreements')}>
          Agreements
        </button>
      </div>

      <div className="sales-grid">
        {salesOrders.length === 0 ? (
          <div className="empty-state">No sales orders found</div>
        ) : (
          salesOrders.map((sale) => (
            <div key={sale.id} className="sale-card">
              <h4>Sales Order #{sale.orderNumber || sale.id}</h4>
              <div className="sale-details">
                {sale.customerName && (
                  <div className="detail-item">
                    <span className="label">Customer:</span>
                    <span className="value">{sale.customerName}</span>
                  </div>
                )}
                {sale.total && (
                  <div className="detail-item">
                    <span className="label">Total:</span>
                    <span className="value">${sale.total.toFixed(2)}</span>
                  </div>
                )}
                {sale.fsmOrderIds && sale.fsmOrderIds.length > 0 && (
                  <div className="detail-item">
                    <span className="label">Service Orders:</span>
                    <span className="value">{sale.fsmOrderIds.length}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {activeTab === 'orders' && (
        <div className="link-section">
          <h4>Link Service Order to Sales Order</h4>
        <select
          value={selectedServiceOrder?.id || ''}
          onChange={(e) => {
            const order = serviceOrders.find(o => o.id === e.target.value);
            setSelectedServiceOrder(order);
            if (order) {
              setFormData({ saleId: order.saleId || '', saleLineId: order.saleLineId || '' });
              setShowLinkModal(true);
            }
          }}
        >
          <option value="">Select Service Order</option>
          {serviceOrders.map(order => (
            <option key={order.id} value={order.id}>
              {order.name || order.id}
            </option>
          ))}
        </select>
        </div>
      )}

      {showLinkModal && selectedServiceOrder && (
        <div className="modal-overlay" onClick={() => setShowLinkModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h4>Link Order: {selectedServiceOrder.name || selectedServiceOrder.id}</h4>
            <form onSubmit={handleLink}>
              <div className="form-group">
                <label>Sales Order *</label>
                <select
                  required
                  value={formData.saleId}
                  onChange={(e) => setFormData({ ...formData, saleId: e.target.value })}
                >
                  <option value="">Select Sales Order</option>
                  {salesOrders.map(sale => (
                    <option key={sale.id} value={sale.id}>
                      {sale.orderNumber || sale.id}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Sales Order Line (optional)</label>
                <input
                  type="text"
                  value={formData.saleLineId}
                  onChange={(e) => setFormData({ ...formData, saleLineId: e.target.value })}
                  placeholder="Line ID"
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn-primary">Link</button>
                <button type="button" className="btn-secondary" onClick={() => setShowLinkModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'recurring' && (
        <div className="link-section">
          <h4>Link Recurring Order to Sales Order</h4>
          <select
            value={selectedSale?.id || ''}
            onChange={(e) => {
              const sale = salesOrders.find(s => s.id === e.target.value);
              setSelectedSale(sale);
              if (sale) {
                setShowRecurringModal(true);
              }
            }}
          >
            <option value="">Select Sales Order</option>
            {salesOrders.map(sale => (
              <option key={sale.id} value={sale.id}>
                {sale.orderNumber || sale.id}
              </option>
            ))}
          </select>
        </div>
      )}

      {activeTab === 'agreements' && (
        <div className="link-section">
          <h4>Link Agreement to Sales Order</h4>
          <select
            value={selectedSale?.id || ''}
            onChange={(e) => {
              const sale = salesOrders.find(s => s.id === e.target.value);
              setSelectedSale(sale);
              if (sale) {
                setShowAgreementModal(true);
              }
            }}
          >
            <option value="">Select Sales Order</option>
            {salesOrders.map(sale => (
              <option key={sale.id} value={sale.id}>
                {sale.orderNumber || sale.id}
              </option>
            ))}
          </select>
        </div>
      )}

      {showRecurringModal && selectedSale && (
        <div className="modal-overlay" onClick={() => setShowRecurringModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h4>Link Recurring Order to Sale: {selectedSale.orderNumber || selectedSale.id}</h4>
            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                await linkRecurringToSale(formData.recurringId, selectedSale.id, formData.saleLineId);
                setShowRecurringModal(false);
                setSelectedSale(null);
                setFormData({ recurringId: '', saleLineId: '' });
                alert('Recurring order linked successfully');
                loadData();
              } catch (error) {
                console.error('Error linking recurring:', error);
                alert('Failed to link recurring order');
              }
            }}>
              <div className="form-group">
                <label>Recurring Order *</label>
                <select
                  required
                  value={formData.recurringId}
                  onChange={(e) => setFormData({ ...formData, recurringId: e.target.value })}
                >
                  <option value="">Select Recurring Order</option>
                  {recurringOrders.map(rec => (
                    <option key={rec.id} value={rec.id}>
                      {rec.name || rec.id}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Sales Order Line ID (optional)</label>
                <input
                  type="text"
                  value={formData.saleLineId}
                  onChange={(e) => setFormData({ ...formData, saleLineId: e.target.value })}
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn-primary">Link</button>
                <button type="button" className="btn-secondary" onClick={() => setShowRecurringModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAgreementModal && selectedSale && (
        <div className="modal-overlay" onClick={() => setShowAgreementModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h4>Link Agreement to Sale: {selectedSale.orderNumber || selectedSale.id}</h4>
            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                await linkAgreementToSale(selectedSale.id, formData.agreementId);
                setShowAgreementModal(false);
                setSelectedSale(null);
                setFormData({ agreementId: '' });
                alert('Agreement linked successfully');
                loadData();
              } catch (error) {
                console.error('Error linking agreement:', error);
                alert('Failed to link agreement');
              }
            }}>
              <div className="form-group">
                <label>Agreement *</label>
                <select
                  required
                  value={formData.agreementId}
                  onChange={(e) => setFormData({ ...formData, agreementId: e.target.value })}
                >
                  <option value="">Select Agreement</option>
                  {agreements.map(agr => (
                    <option key={agr.id} value={agr.id}>
                      {agr.name || agr.id}
                    </option>
                  ))}
                </select>
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn-primary">Link</button>
                <button type="button" className="btn-secondary" onClick={() => setShowAgreementModal(false)}>
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

export default Sales;

