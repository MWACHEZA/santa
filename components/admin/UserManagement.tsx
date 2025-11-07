import React, { useState, useEffect, useCallback } from 'react';
import { useAuth, User, UserRole } from '../../contexts/AuthContext';
import { Search, Plus, Edit, Trash2, RotateCcw, X, Eye } from 'lucide-react';
import UserProfileViewer from './UserProfileViewer';
import './UserManagement.css';

interface CreateUserForm {
  username: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  password: string;
}

const UserManagement: React.FC = () => {
  const { listUsers, createUser, updateUser, deleteUser, resetPassword } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [createForm, setCreateForm] = useState<CreateUserForm>({
    username: '',
    email: '',
    phone: '',
    firstName: '',
    lastName: '',
    role: 'parishioner',
    password: ''
  });

  const loadUsers = useCallback(() => {
    setUsers(listUsers());
  }, [listUsers]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    const result = createUser(createForm);
    if (result.success) {
      showMessage('success', result.message);
      setCreateForm({
        username: '',
        email: '',
        phone: '',
        firstName: '',
        lastName: '',
        role: 'parishioner',
        password: ''
      });
      setShowCreateForm(false);
      loadUsers();
    } else {
      showMessage('error', result.message);
    }
  };

  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    
    const result = updateUser(editingUser.id, {
      username: editingUser.username,
      email: editingUser.email,
      phone: editingUser.phone,
      firstName: editingUser.firstName,
      lastName: editingUser.lastName,
      role: editingUser.role
    });
    
    if (result.success) {
      showMessage('success', result.message);
      setEditingUser(null);
      loadUsers();
    } else {
      showMessage('error', result.message);
    }
  };

  const handleDeleteUser = (userId: string, username: string) => {
    if (window.confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)) {
      const result = deleteUser(userId);
      if (result.success) {
        showMessage('success', result.message);
        loadUsers();
      } else {
        showMessage('error', result.message);
      }
    }
  };

  const handleResetPassword = (userId: string, username: string) => {
    if (window.confirm(`Reset password for "${username}" to "Password"? They will be required to change it on next login.`)) {
      const result = resetPassword(userId);
      if (result.success) {
        showMessage('success', result.message);
        loadUsers();
      } else {
        showMessage('error', result.message);
      }
    }
  };

  const handleViewProfile = (user: User) => {
    setSelectedUser(user);
    setShowUserProfile(true);
  };

  const handleCloseProfile = () => {
    setSelectedUser(null);
    setShowUserProfile(false);
  };

  const handleUserUpdate = (updatedUser: User) => {
    if (updateUser) {
      const result = updateUser(updatedUser.id, updatedUser);
      if (result.success) {
        loadUsers(); // Refresh the user list
        showMessage('success', 'User profile updated successfully!');
      } else {
        showMessage('error', result.message);
      }
    }
  };

  const getRoleBadgeClass = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'role-admin';
      case 'priest': return 'role-priest';
      case 'secretary': return 'role-secretary';
      case 'reporter': return 'role-reporter';
      case 'parishioner': return 'role-parishioner';
      default: return 'role-default';
    }
  };

  return (
    <div className="user-management">
      <div className="user-management-header">
        <h2>User Management</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowCreateForm(true)}
        >
          <Plus size={18} />
          Add User
        </button>
      </div>

      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Search Bar */}
      <div className="search-bar">
        <Search size={20} />
        <input
          type="text"
          placeholder="Search users by name, email, username, or role..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Create User Form */}
      {showCreateForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Create New User</h3>
              <button 
                className="btn-close"
                onClick={() => setShowCreateForm(false)}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="user-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Username *</label>
                  <input
                    type="text"
                    value={createForm.username}
                    onChange={(e) => setCreateForm({...createForm, username: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Role *</label>
                  <select
                    value={createForm.role}
                    onChange={(e) => setCreateForm({...createForm, role: e.target.value as UserRole})}
                    required
                  >
                    <option value="parishioner">Parishioner</option>
                    <option value="secretary">Secretary</option>
                    <option value="priest">Priest</option>
                    <option value="reporter">Reporter</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>First Name *</label>
                  <input
                    type="text"
                    value={createForm.firstName}
                    onChange={(e) => setCreateForm({...createForm, firstName: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Last Name *</label>
                  <input
                    type="text"
                    value={createForm.lastName}
                    onChange={(e) => setCreateForm({...createForm, lastName: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={createForm.email}
                    onChange={(e) => setCreateForm({...createForm, email: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    value={createForm.phone}
                    onChange={(e) => setCreateForm({...createForm, phone: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Password *</label>
                <input
                  type="password"
                  value={createForm.password}
                  onChange={(e) => setCreateForm({...createForm, password: e.target.value})}
                  required
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Full Name</th>
              <th>Username</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Status</th>
              <th>Created</th>
              <th>Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr 
                key={user.id}
                className={`user-row ${selectedUser?.id === user.id ? 'selected' : ''}`}
                onClick={() => setSelectedUser(user)}
              >
                <td className="user-id">{user.id}</td>
                <td className="user-fullname">
                  {user.firstName && user.lastName 
                    ? `${user.firstName} ${user.lastName}` 
                    : 'N/A'}
                </td>
                <td className="user-username">@{user.username}</td>
                <td className="user-email">{user.email || 'N/A'}</td>
                <td className="user-phone">{user.phone || 'N/A'}</td>
                <td>
                  <span className={`role-badge ${getRoleBadgeClass(user.role)}`}>
                    {user.role}
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${user.mustChangePassword ? 'pending' : 'active'}`}>
                    {user.mustChangePassword ? 'Password Reset Required' : 'Active'}
                  </span>
                </td>
                <td className="user-created">
                  {(user as any).createdAt ? new Date((user as any).createdAt).toLocaleDateString() : 'N/A'}
                </td>
                <td className="user-updated">
                  {(user as any).updatedAt ? new Date((user as any).updatedAt).toLocaleDateString() : 'N/A'}
                </td>
                <td className="user-actions">
                  <button 
                    className="action-btn view-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewProfile(user);
                    }}
                    title="View Profile"
                  >
                    <Eye size={16} />
                  </button>
                  <button 
                    className="action-btn edit-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingUser(user);
                    }}
                    title="Edit User"
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    className="action-btn reset-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleResetPassword(user.id, user.username);
                    }}
                    title="Reset Password"
                  >
                    <RotateCcw size={16} />
                  </button>
                  <button 
                    className="action-btn delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteUser(user.id, user.username);
                    }}
                    title="Delete User"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div className="no-users">
            {searchTerm ? 'No users found matching your search.' : 'No users found.'}
          </div>
        )}
      </div>

      {/* Selected User Details & Actions */}
      {selectedUser && (
        <div className="user-details-panel">
          <div className="user-details-header">
            <h3>Selected User Details</h3>
            <button 
              className="btn-close"
              onClick={() => setSelectedUser(null)}
              title="Close details"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="user-details-content">
            <div className="detail-grid">
              <div className="detail-item">
                <label>User ID:</label>
                <span>{selectedUser.id}</span>
              </div>
              <div className="detail-item">
                <label>Username:</label>
                <span>@{selectedUser.username}</span>
              </div>
              <div className="detail-item">
                <label>First Name:</label>
                <span>{selectedUser.firstName || 'Not provided'}</span>
              </div>
              <div className="detail-item">
                <label>Last Name:</label>
                <span>{selectedUser.lastName || 'Not provided'}</span>
              </div>
              <div className="detail-item">
                <label>Email:</label>
                <span>{selectedUser.email || 'Not provided'}</span>
              </div>
              <div className="detail-item">
                <label>Phone:</label>
                <span>{selectedUser.phone || 'Not provided'}</span>
              </div>
              <div className="detail-item">
                <label>Date of Birth:</label>
                <span>{(selectedUser as any).dateOfBirth ? new Date((selectedUser as any).dateOfBirth).toLocaleDateString() : 'Not provided'}</span>
              </div>
              <div className="detail-item">
                <label>Address:</label>
                <span>{(selectedUser as any).address || 'Not provided'}</span>
              </div>
              <div className="detail-item">
                <label>Emergency Contact:</label>
                <span>{(selectedUser as any).emergencyContact || 'Not provided'}</span>
              </div>
              <div className="detail-item">
                <label>Emergency Phone:</label>
                <span>{(selectedUser as any).emergencyPhone || 'Not provided'}</span>
              </div>
              <div className="detail-item">
                <label>Role:</label>
                <span className={`role-badge ${getRoleBadgeClass(selectedUser.role)}`}>
                  {selectedUser.role}
                </span>
              </div>
              <div className="detail-item">
                <label>Status:</label>
                <span className={`status-badge ${selectedUser.mustChangePassword ? 'pending' : 'active'}`}>
                  {selectedUser.mustChangePassword ? 'Password Reset Required' : 'Active'}
                </span>
              </div>
              <div className="detail-item">
                <label>Created:</label>
                <span>{(selectedUser as any).createdAt ? new Date((selectedUser as any).createdAt).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div className="detail-item">
                <label>Last Updated:</label>
                <span>{(selectedUser as any).updatedAt ? new Date((selectedUser as any).updatedAt).toLocaleDateString() : 'N/A'}</span>
              </div>
            </div>
          </div>

          <div className="user-actions-panel">
            <h4>Actions for {selectedUser.username}</h4>
            <div className="action-buttons-grid">
              <button 
                className="btn btn-primary action-btn"
                onClick={() => {setEditingUser(selectedUser); setSelectedUser(null);}}
                title="Edit user details"
              >
                <Edit size={18} />
                <span>Edit User</span>
              </button>
              <button 
                className="btn btn-warning action-btn"
                onClick={() => handleResetPassword(selectedUser.id, selectedUser.username)}
                title="Reset password to 'Password'"
              >
                <RotateCcw size={18} />
                <span>Reset Password</span>
              </button>
              <button 
                className="btn btn-danger action-btn"
                onClick={() => handleDeleteUser(selectedUser.id, selectedUser.username)}
                title="Delete user permanently"
              >
                <Trash2 size={18} />
                <span>Delete User</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Edit User: {editingUser.username}</h3>
              <button 
                className="btn-close"
                onClick={() => setEditingUser(null)}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleUpdateUser} className="user-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Username *</label>
                  <input
                    type="text"
                    value={editingUser.username}
                    onChange={(e) => setEditingUser({...editingUser, username: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Role *</label>
                  <select
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({...editingUser, role: e.target.value as UserRole})}
                    required
                  >
                    <option value="parishioner">Parishioner</option>
                    <option value="secretary">Secretary</option>
                    <option value="priest">Priest</option>
                    <option value="reporter">Reporter</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>First Name</label>
                  <input
                    type="text"
                    value={editingUser.firstName || ''}
                    onChange={(e) => setEditingUser({...editingUser, firstName: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    value={editingUser.lastName || ''}
                    onChange={(e) => setEditingUser({...editingUser, lastName: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={editingUser.email || ''}
                    onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    value={editingUser.phone || ''}
                    onChange={(e) => setEditingUser({...editingUser, phone: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setEditingUser(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Update User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Profile Modal */}
      {showUserProfile && selectedUser && (
        <div className="modal-overlay">
          <div className="modal-content user-profile-modal">
            <div className="modal-header">
              <h3>User Profile - {selectedUser.firstName} {selectedUser.lastName}</h3>
              <button 
                className="modal-close-btn"
                onClick={handleCloseProfile}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <UserProfileViewer 
                user={selectedUser}
                onUserUpdate={handleUserUpdate}
                isReadOnly={false}
              />
            </div>
          </div>
        </div>
      )}

      <div className="users-summary">
        <p>Total Users: {users.length} | Showing: {filteredUsers.length}</p>
      </div>
    </div>
  );
};

export default UserManagement;
