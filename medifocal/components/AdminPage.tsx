import React, { useState } from 'react';
import { View } from '../App';
import AdminDashboard from './AdminDashboard';
import { useAuth } from '../contexts/AuthContext';
import AdminLoginModal from './AdminLoginModal';

interface AdminPageProps {
  setCurrentView: (view: View) => void;
  section?: string;
}

const AdminPage: React.FC<AdminPageProps> = ({ setCurrentView, section }) => {
  const { isAdmin, loading, user } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Check if user is admin
  if (!isAdmin) {
    // If user is logged in but not admin, show access denied
    // If user is not logged in, show login option
    const isLoggedIn = !!user;
    
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">
            {isLoggedIn 
              ? "You do not have permission to access the admin dashboard."
              : "Please log in to access the admin dashboard."}
          </p>
          <div className="flex gap-3 justify-center">
            {!isLoggedIn && (
              <button
                onClick={() => setShowLoginModal(true)}
                className="bg-brand-blue text-white font-semibold py-2 px-6 rounded-md hover:bg-brand-lightblue transition-colors"
              >
                Admin Login
              </button>
            )}
            <button
              onClick={() => setCurrentView({ page: 'home' })}
              className="bg-gray-200 text-gray-700 font-semibold py-2 px-6 rounded-md hover:bg-gray-300 transition-colors"
            >
              {isLoggedIn ? 'Back to Home' : 'Cancel'}
            </button>
          </div>
        </div>
        
        {/* Admin Login Modal */}
        <AdminLoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onSuccess={() => {
            setShowLoginModal(false);
            // Page will re-render and show admin dashboard if login successful
            window.location.reload();
          }}
        />
      </div>
    );
  }

  // Always show AdminDashboard which loads the field service app in an iframe
  return <AdminDashboard setCurrentView={setCurrentView} />;
};

export default AdminPage;
