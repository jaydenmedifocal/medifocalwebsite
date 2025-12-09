import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, doc, updateDoc, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../firebase/config';
import './UserManagement.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [newRole, setNewRole] = useState('customer');

  const roles = [
    { value: 'customer', label: 'Customer' },
    { value: 'technician', label: 'Technician' },
    { value: 'manager', label: 'Manager' },
    { value: 'supervisor', label: 'Supervisor' },
    { value: 'admin', label: 'Admin' }
  ];

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const usersRef = collection(db, 'customers');
      const usersQuery = query(usersRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(usersQuery);
      
      const usersList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setUsers(usersList);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const userRef = doc(db, 'customers', userId);
      await updateDoc(userRef, {
        role: newRole,
        updatedAt: new Date()
      });

      // Send email notification to user
      try {
        const sendRoleChangeEmail = httpsCallable(functions, 'sendContactEmail');
        const user = users.find(u => u.id === userId);
        
        await sendRoleChangeEmail({
          name: 'Medifocal Admin',
          email: 'admin@medifocal.com',
          subject: 'Your Account Role Has Been Updated',
          message: `Your account role has been updated to: ${roles.find(r => r.value === newRole)?.label || newRole}. You now have access to additional features based on your role.`
        });
      } catch (emailError) {
        console.error('Error sending email:', emailError);
        // Continue even if email fails
      }

      // Update local state
      setUsers(users.map(u => 
        u.id === userId ? { ...u, role: newRole } : u
      ));
      
      setShowRoleModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error updating user role:', error);
      alert('Failed to update user role. Please try again.');
    }
  };

  const openRoleModal = (user) => {
    setSelectedUser(user);
    setNewRole(user.role || 'customer');
    setShowRoleModal(true);
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      admin: '#dc3545',
      supervisor: '#6f42c1',
      manager: '#0066cc',
      technician: '#28a745',
      customer: '#6c757d'
    };
    return colors[role] || '#6c757d';
  };

  if (loading) {
    return <div className="admin-loading">Loading users...</div>;
  }

  return (
    <div className="user-management">
      <div className="page-header">
        <h3>User Management</h3>
        <p>Manage user roles and permissions</p>
      </div>

      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Current Role</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.displayName || 'Not set'}</td>
                <td>{user.email}</td>
                <td>
                  <span 
                    className="role-badge"
                    style={{ backgroundColor: getRoleBadgeColor(user.role || 'customer') }}
                  >
                    {roles.find(r => r.value === (user.role || 'customer'))?.label || 'Customer'}
                  </span>
                </td>
                <td>
                  {user.createdAt?.toDate ? 
                    user.createdAt.toDate().toLocaleDateString() : 
                    'N/A'
                  }
                </td>
                <td>
                  <button 
                    className="edit-role-btn"
                    onClick={() => openRoleModal(user)}
                  >
                    Change Role
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showRoleModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowRoleModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h4>Change User Role</h4>
            <p className="user-info">
              <strong>{selectedUser.displayName || 'User'}</strong><br />
              {selectedUser.email}
            </p>
            
            <div className="role-selector">
              <label>Select New Role:</label>
              <select 
                value={newRole} 
                onChange={(e) => setNewRole(e.target.value)}
                className="role-select"
              >
                {roles.map(role => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="modal-actions">
              <button 
                className="btn-primary"
                onClick={() => handleRoleChange(selectedUser.id, newRole)}
              >
                Update Role
              </button>
              <button 
                className="btn-secondary"
                onClick={() => setShowRoleModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;

