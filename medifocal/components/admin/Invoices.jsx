import React, { useState, useEffect } from 'react';
import { getOrderInvoices } from '../../services/fieldService';
import { getServiceOrders } from '../../services/fieldService';
import './Invoices.css';

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterOrderId, setFilterOrderId] = useState('all');

  useEffect(() => {
    loadData();
  }, [filterOrderId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const ordersList = await getServiceOrders();
      setOrders(ordersList);

      if (filterOrderId !== 'all') {
        const invoicesList = await getOrderInvoices(filterOrderId);
        setInvoices(invoicesList);
      } else {
        setInvoices([]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="admin-loading">Loading invoices...</div>;
  }

  return (
    <div className="invoices">
      <div className="page-header">
        <h3>Invoice Tracking</h3>
        <p>View invoices linked to service orders</p>
      </div>

      <div className="filters">
        <label>Filter by Order:</label>
        <select value={filterOrderId} onChange={(e) => setFilterOrderId(e.target.value)}>
          <option value="all">All Orders</option>
          {orders.map(order => (
            <option key={order.id} value={order.id}>
              {order.name || order.id}
            </option>
          ))}
        </select>
      </div>

      <div className="invoices-list">
        {invoices.length === 0 ? (
          <div className="empty-state">
            {filterOrderId === 'all' ? 'Select an order to view invoices' : 'No invoices found for this order'}
          </div>
        ) : (
          invoices.map((invoice) => (
            <div key={invoice.id} className="invoice-card">
              <div className="invoice-header">
                <h4>Invoice #{invoice.invoiceNumber || invoice.id}</h4>
                <span className={`status-badge ${invoice.status || 'draft'}`}>
                  {invoice.status || 'draft'}
                </span>
              </div>
              <div className="invoice-details">
                {invoice.invoiceDate && (
                  <div className="detail-item">
                    <span className="label">Date:</span>
                    <span className="value">
                      {invoice.invoiceDate.toDate ? 
                        invoice.invoiceDate.toDate().toLocaleDateString() : 
                        'N/A'}
                    </span>
                  </div>
                )}
                {invoice.amount && (
                  <div className="detail-item">
                    <span className="label">Amount:</span>
                    <span className="value">${invoice.amount.toFixed(2)}</span>
                  </div>
                )}
                {invoice.customerName && (
                  <div className="detail-item">
                    <span className="label">Customer:</span>
                    <span className="value">{invoice.customerName}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Invoices;

