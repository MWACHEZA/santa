import React, { useState } from 'react';
import { useAdmin, Announcement } from '../../contexts/AdminContext';
import { Plus, Edit, Trash2, Eye, EyeOff, AlertTriangle, Info, Calendar } from 'lucide-react';
import './AnnouncementManager.css';

const AnnouncementManager: React.FC = () => {
  const { 
    announcements, 
    addAnnouncement, 
    updateAnnouncement, 
    deleteAnnouncement 
  } = useAdmin();
  
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info' as 'urgent' | 'info' | 'event',
    isActive: true,
    expiresAt: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
      updateAnnouncement(editingId, formData);
    } else {
      addAnnouncement(formData);
    }
    
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      message: '',
      type: 'info',
      isActive: true,
      expiresAt: ''
    });
    setShowForm(false);
    setEditingId(null);
  };

  const handleEdit = (announcement: Announcement) => {
    setFormData({
      title: announcement.title,
      message: announcement.message,
      type: announcement.type,
      isActive: announcement.isActive,
      expiresAt: announcement.expiresAt || ''
    });
    setEditingId(announcement.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      deleteAnnouncement(id);
    }
  };

  const toggleActive = (id: string, isActive: boolean) => {
    updateAnnouncement(id, { isActive: !isActive });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'urgent': return <AlertTriangle size={16} />;
      case 'event': return <Calendar size={16} />;
      default: return <Info size={16} />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'urgent': return 'urgent';
      case 'event': return 'event';
      default: return 'info';
    }
  };

  return (
    <div className="announcement-manager">
      <div className="manager-header">
        <h2>Manage Announcements</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
        >
          <Plus size={20} />
          New Announcement
        </button>
      </div>

      {showForm && (
        <div className="announcement-form-overlay">
          <div className="announcement-form">
            <div className="form-header">
              <h3>{editingId ? 'Edit Announcement' : 'Create New Announcement'}</h3>
              <button className="close-btn" onClick={resetForm}>×</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="title">Title *</label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter announcement title"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="message">Message *</label>
                <textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Enter announcement message"
                  rows={4}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="type">Type</label>
                  <select
                    id="type"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  >
                    <option value="info">General Information</option>
                    <option value="urgent">Urgent Alert</option>
                    <option value="event">Event Announcement</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="expiresAt">Expires (Optional)</label>
                  <input
                    type="datetime-local"
                    id="expiresAt"
                    value={formData.expiresAt}
                    onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                  <span>Active (show on website)</span>
                </label>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingId ? 'Update' : 'Create'} Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="announcements-list">
        {announcements.length === 0 ? (
          <div className="empty-state">
            <AlertTriangle size={48} />
            <h3>No Announcements</h3>
            <p>Create your first announcement to get started</p>
          </div>
        ) : (
          announcements.map((announcement) => (
            <div key={announcement.id} className={`announcement-card ${getTypeColor(announcement.type)}`}>
              <div className="announcement-header">
                <div className="announcement-meta">
                  <div className="type-badge">
                    {getTypeIcon(announcement.type)}
                    <span>{announcement.type}</span>
                  </div>
                  <div className="status-badge">
                    {announcement.isActive ? (
                      <span className="active">Active</span>
                    ) : (
                      <span className="inactive">Inactive</span>
                    )}
                  </div>
                </div>
                <div className="announcement-actions">
                  <button
                    className="action-btn"
                    onClick={() => toggleActive(announcement.id, announcement.isActive)}
                    title={announcement.isActive ? 'Deactivate' : 'Activate'}
                  >
                    {announcement.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  <button
                    className="action-btn"
                    onClick={() => handleEdit(announcement)}
                    title="Edit"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    className="action-btn delete"
                    onClick={() => handleDelete(announcement.id)}
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              <div className="announcement-content">
                <h4>{announcement.title}</h4>
                <p>{announcement.message}</p>
              </div>
              
              <div className="announcement-footer">
                <span className="created-date">
                  Created: {new Date(announcement.createdAt).toLocaleDateString()}
                </span>
                {announcement.expiresAt && (
                  <span className="expires-date">
                    Expires: {new Date(announcement.expiresAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AnnouncementManager;
