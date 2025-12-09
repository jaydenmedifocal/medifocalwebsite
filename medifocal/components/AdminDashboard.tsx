import React from 'react';
import { View } from './App';
import FieldServiceApp from './FieldServiceApp';

interface AdminDashboardProps {
  setCurrentView: (view: View) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ setCurrentView }) => {
  return (
    <div className="field-service-container" style={{ height: '100vh', width: '100%', overflow: 'hidden' }}>
      <FieldServiceApp setCurrentView={setCurrentView} />
    </div>
  );
};

export default AdminDashboard;
