import React, { useState } from 'react';
import { useAdmin, Event } from '../../contexts/AdminContext';
import { Plus, Edit, Trash2, Eye, EyeOff, Calendar, Clock, MapPin, X } from 'lucide-react';
import './EventManager.css';

const EventManager: React.FC = () => {
  const { 
    events, 
    addEvent, 
    updateEvent, 
    deleteEvent 
  } = useAdmin();
  
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    category: 'mass' as 'mass' | 'meeting' | 'social' | 'education' | 'outreach',
    isPublished: true
  });

  const [eventCategories, setEventCategories] = useState([
    'mass', 'meeting', 'social', 'education', 'outreach', 'retreat', 'fundraising', 'youth'
  ]);
  
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);

  const categories = [
    { value: 'all', label: 'All Events' },
    ...eventCategories.map(cat => ({ 
      value: cat, 
      label: cat.charAt(0).toUpperCase() + cat.slice(1).replace(/([A-Z])/g, ' $1')
    }))
  ];

  // Load categories from localStorage
  React.useEffect(() => {
    const savedCategories = localStorage.getItem('eventCategories');
    if (savedCategories) {
      try {
        const parsedCategories = JSON.parse(savedCategories);
        if (Array.isArray(parsedCategories)) {
          setEventCategories(parsedCategories);
        }
      } catch (error) {
        console.error('Error loading event categories:', error);
      }
    }
  }, []);

  const handleAddCategory = () => {
    if (newCategoryName.trim() && !eventCategories.includes(newCategoryName.trim().toLowerCase())) {
      const updatedCategories = [...eventCategories, newCategoryName.trim().toLowerCase()];
      setEventCategories(updatedCategories);
      localStorage.setItem('eventCategories', JSON.stringify(updatedCategories));
      setNewCategoryName('');
      setShowAddCategory(false);
    }
  };

  const handleDeleteCategory = (categoryToDelete: string) => {
    if (window.confirm(`Are you sure you want to delete the "${categoryToDelete}" category?`)) {
      const updatedCategories = eventCategories.filter(cat => cat !== categoryToDelete);
      setEventCategories(updatedCategories);
      localStorage.setItem('eventCategories', JSON.stringify(updatedCategories));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
      updateEvent(editingId, formData);
    } else {
      addEvent(formData);
    }
    
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      date: '',
      time: '',
      location: '',
      category: 'mass',
      isPublished: true
    });
    setShowForm(false);
    setEditingId(null);
  };

  const handleEdit = (event: Event) => {
    setFormData({
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time,
      location: event.location,
      category: event.category,
      isPublished: event.isPublished
    });
    setEditingId(event.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      deleteEvent(id);
    }
  };

  const togglePublished = (id: string, isPublished: boolean) => {
    updateEvent(id, { isPublished: !isPublished });
  };

  const filteredEvents = selectedCategory === 'all' 
    ? events 
    : events.filter(event => event.category === selectedCategory);

  const sortedEvents = filteredEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const getCategoryColor = (category: string) => {
    const colors = {
      mass: '#2d5016',
      meeting: '#4ecdc4',
      social: '#45b7d1',
      education: '#f093fb',
      outreach: '#f39c12'
    };
    return colors[category as keyof typeof colors] || '#6c757d';
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'mass': return '⛪';
      case 'meeting': return '👥';
      case 'social': return '🎉';
      case 'education': return '📚';
      case 'outreach': return '🤝';
      default: return '📅';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isUpcoming = (dateString: string) => {
    return new Date(dateString) >= new Date();
  };

  return (
    <div className="event-manager">
      <div className="manager-header">
        <h2>Manage Events</h2>
        <div className="header-actions">
          <button 
            className="btn btn-secondary"
            onClick={() => setShowAddCategory(true)}
          >
            <Plus size={18} />
            Add Category
          </button>
          <button 
            className="btn btn-primary"
            onClick={() => setShowForm(true)}
          >
            <Plus size={18} />
            New Event
          </button>
        </div>
      </div>

      {/* Category Management Section */}
      <div className="categories-section">
        <h3>Event Categories</h3>
        <div className="categories-list">
          {eventCategories.map((category) => (
            <div key={category} className="category-item">
              <span className="category-icon">{getCategoryIcon(category)}</span>
              <span className="category-name">{category.charAt(0).toUpperCase() + category.slice(1)}</span>
              <span className="event-count">
                ({events.filter(e => e.category === category).length} events)
              </span>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => handleDeleteCategory(category)}
                title="Delete category"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="event-filters">
        <div className="filter-tabs">
          {categories.map(category => (
            <button
              key={category.value}
              className={`filter-tab ${selectedCategory === category.value ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category.value)}
            >
              {category.label}
              {category.value !== 'all' && (
                <span className="count">
                  {events.filter(event => event.category === category.value).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {showForm && (
        <div className="event-form-overlay">
          <div className="event-form">
            <div className="form-header">
              <h3>{editingId ? 'Edit Event' : 'Create New Event'}</h3>
              <button className="close-btn" onClick={resetForm}>×</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="title">Event Title *</label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter event title"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description *</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter event description"
                  rows={4}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="date">Date *</label>
                  <input
                    type="date"
                    id="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="time">Time (Optional)</label>
                  <input
                    type="time"
                    id="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    placeholder="Select event time"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="location">Location (Optional)</label>
                <input
                  type="text"
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Main Church, Parish Hall, Community Center"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="category">Category</label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  >
                    <option value="mass">Mass & Liturgy</option>
                    <option value="meeting">Meetings</option>
                    <option value="social">Social Events</option>
                    <option value="education">Education</option>
                    <option value="outreach">Outreach</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.isPublished}
                      onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    />
                    <span>Published (visible on website)</span>
                  </label>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingId ? 'Update' : 'Create'} Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="events-list">
        {sortedEvents.length === 0 ? (
          <div className="empty-state">
            <Calendar size={48} />
            <h3>No Events Found</h3>
            <p>
              {selectedCategory === 'all' 
                ? 'Create your first event to get started'
                : `No events in the ${categories.find(c => c.value === selectedCategory)?.label} category`
              }
            </p>
          </div>
        ) : (
          <div className="events-grid">
            {sortedEvents.map((event) => (
              <div key={event.id} className={`event-card ${event.category} ${isUpcoming(event.date) ? 'upcoming' : 'past'}`}>
                <div className="event-header">
                  <div className="event-meta">
                    <div className="category-badge" style={{ backgroundColor: getCategoryColor(event.category) }}>
                      <span className="category-icon">{getCategoryIcon(event.category)}</span>
                      <span>{categories.find(c => c.value === event.category)?.label}</span>
                    </div>
                    <div className="status-badge">
                      {event.isPublished ? (
                        <span className="published">Published</span>
                      ) : (
                        <span className="unpublished">Draft</span>
                      )}
                    </div>
                  </div>
                  <div className="event-actions">
                    <button
                      className="action-btn"
                      onClick={() => togglePublished(event.id, event.isPublished)}
                      title={event.isPublished ? 'Unpublish' : 'Publish'}
                    >
                      {event.isPublished ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    <button
                      className="action-btn"
                      onClick={() => handleEdit(event)}
                      title="Edit"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className="action-btn delete"
                      onClick={() => handleDelete(event.id)}
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="event-content">
                  <h4>{event.title}</h4>
                  <p className="event-description">{event.description}</p>
                  
                  <div className="event-details">
                    <div className="event-detail">
                      <Calendar size={16} />
                      <span>{formatDate(event.date)}</span>
                    </div>
                    <div className="event-detail">
                      <Clock size={16} />
                      <span>{event.time}</span>
                    </div>
                    <div className="event-detail">
                      <MapPin size={16} />
                      <span>{event.location}</span>
                    </div>
                  </div>
                </div>
                
                <div className="event-footer">
                  <span className="created-date">
                    Created: {new Date(event.createdAt).toLocaleDateString()}
                  </span>
                  {!isUpcoming(event.date) && (
                    <span className="past-event">Past Event</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Category Modal */}
      {showAddCategory && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Add New Event Category</h3>
              <button 
                className="btn-close"
                onClick={() => setShowAddCategory(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-content">
              <div className="form-group">
                <label>Category Name</label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Enter category name (e.g., retreat, fundraising)"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                />
              </div>
              <div className="form-actions">
                <button 
                  className="btn btn-secondary" 
                  onClick={() => setShowAddCategory(false)}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-primary" 
                  onClick={handleAddCategory}
                  disabled={!newCategoryName.trim()}
                >
                  Add Category
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventManager;
