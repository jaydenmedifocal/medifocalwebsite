import React, { useState, useEffect } from 'react';
import { getStockPickings } from '../../services/fieldService';
import { getServiceOrders } from '../../services/fieldService';
import './Stock.css';

const Stock = () => {
  const [pickings, setPickings] = useState([]);
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
        const pickingsList = await getStockPickings(filterOrderId);
        setPickings(pickingsList);
      } else {
        setPickings([]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="admin-loading">Loading stock operations...</div>;
  }

  return (
    <div className="stock">
      <div className="page-header">
        <h3>Stock/Inventory Management</h3>
        <p>View stock pickings linked to service orders</p>
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

      <div className="pickings-list">
        {pickings.length === 0 ? (
          <div className="empty-state">
            {filterOrderId === 'all' ? 'Select an order to view stock pickings' : 'No stock pickings found'}
          </div>
        ) : (
          pickings.map((picking) => (
            <div key={picking.id} className="picking-card">
              <h4>{picking.name || `Picking #${picking.id}`}</h4>
              <div className="picking-details">
                <div className="detail-item">
                  <span className="label">Type:</span>
                  <span className="value">{picking.pickingType || 'N/A'}</span>
                </div>
                {picking.scheduledDate && (
                  <div className="detail-item">
                    <span className="label">Scheduled:</span>
                    <span className="value">
                      {picking.scheduledDate.toDate ? 
                        picking.scheduledDate.toDate().toLocaleDateString() : 
                        'N/A'}
                    </span>
                  </div>
                )}
                {picking.state && (
                  <div className="detail-item">
                    <span className="label">State:</span>
                    <span className={`status-badge ${picking.state}`}>{picking.state}</span>
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

export default Stock;

