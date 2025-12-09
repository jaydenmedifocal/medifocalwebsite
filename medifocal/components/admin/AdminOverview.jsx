import React, { useState, useEffect } from 'react';
import { getServiceOrders, getTechnicians, getLocations, getEquipment, getServiceAlerts } from '../../services/fieldService';
import './AdminOverview.css';

const AdminOverview = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    activeOrders: 0,
    technicians: 0,
    locations: 0,
    equipment: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Load service orders
      const allOrders = await getServiceOrders();
      const totalOrders = allOrders.length;
      const activeOrders = allOrders.filter(order => 
        order.status !== 'completed' && order.status !== 'cancelled'
      ).length;

      // Load technicians
      const technicians = await getTechnicians();

      // Load locations
      const locations = await getLocations();

      // Load equipment
      const equipment = await getEquipment();

      setStats({
        totalOrders,
        activeOrders,
        technicians: technicians.length,
        locations: locations.length,
        equipment: equipment.length
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="admin-loading">Loading statistics...</div>;
  }

  const StatIcon = ({ children, color }) => (
    <div className={`stat-icon-wrapper ${color}`}>
      {children}
    </div>
  );

  return (
    <div className="admin-overview">
      <div className="overview-header">
        <div>
          <h2 className="overview-title">Dashboard</h2>
          <p className="overview-subtitle">Welcome back, Administrator.</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-content">
            <p className="stat-label">Total Orders</p>
            <p className="stat-value">{stats.totalOrders}</p>
          </div>
          <StatIcon color="bg-blue-500">
            <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </StatIcon>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <p className="stat-label">Active Orders</p>
            <p className="stat-value">{stats.activeOrders}</p>
          </div>
          <StatIcon color="bg-blue-500">
            <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </StatIcon>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <p className="stat-label">Technicians</p>
            <p className="stat-value">{stats.technicians}</p>
          </div>
          <StatIcon color="bg-indigo-500">
            <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </StatIcon>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <p className="stat-label">Locations</p>
            <p className="stat-value">{stats.locations}</p>
          </div>
          <StatIcon color="bg-green-500">
            <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </StatIcon>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <p className="stat-label">Equipment</p>
            <p className="stat-value">{stats.equipment}</p>
          </div>
          <StatIcon color="bg-orange-500">
            <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </StatIcon>
        </div>
      </div>

      <div className="overview-sections">
        <div className="overview-section">
          <div className="section-header">
            <h3 className="section-title">
              <svg xmlns="http://www.w3.org/2000/svg" width={18} height={18} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="section-icon">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
              Recent Activity
            </h3>
            <button className="section-link">View All</button>
          </div>
          <div className="section-content">
            <p className="section-placeholder">Recent service orders and updates will appear here.</p>
          </div>
        </div>

        <div className="overview-section">
          <div className="section-header">
            <h3 className="section-title">
              <svg xmlns="http://www.w3.org/2000/svg" width={18} height={18} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="section-icon">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Priority Tasks
            </h3>
            <button className="section-link">Manage</button>
          </div>
          <div className="section-content">
            <p className="section-placeholder">Priority tasks and reminders will appear here.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;

