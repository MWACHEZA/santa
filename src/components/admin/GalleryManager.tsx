import React, { useState } from 'react';
import { useAdmin, GalleryImage } from '../../contexts/AdminContext';
import { Plus, Edit, Trash2, Eye, EyeOff, Upload, Image as ImageIcon } from 'lucide-react';
import './GalleryManager.css';

const GalleryManager: React.FC = () => {
  const { 
    galleryImages, 
    addImage, 
    updateImage, 
    deleteImage 
  } = useAdmin();
  
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
    category: 'choir' as 'choir' | 'youth' | 'outreach' | 'mass' | 'events',
    isPublished: true
  });

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'choir', label: 'Parish Choir' },
    { value: 'youth', label: 'Youth Group' },
    { value: 'outreach', label: 'Community Outreach' },
    { value: 'mass', label: 'Mass & Liturgy' },
    { value: 'events', label: 'Parish Events' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
      updateImage(editingId, formData);
    } else {
      addImage(formData);
    }
    
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      url: '',
      category: 'choir',
      isPublished: true
    });
    setShowForm(false);
    setEditingId(null);
  };

  const handleEdit = (image: GalleryImage) => {
    setFormData({
      title: image.title,
      description: image.description,
      url: image.url,
      category: image.category,
      isPublished: image.isPublished
    });
    setEditingId(image.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this image?')) {
      deleteImage(id);
    }
  };

  const togglePublished = (id: string, isPublished: boolean) => {
    updateImage(id, { isPublished: !isPublished });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real application, you would upload to a server
      // For demo purposes, we'll create a local URL
      const url = URL.createObjectURL(file);
      setFormData({ ...formData, url });
    }
  };

  const filteredImages = selectedCategory === 'all' 
    ? galleryImages 
    : galleryImages.filter(img => img.category === selectedCategory);

  const getCategoryColor = (category: string) => {
    const colors = {
      choir: '#4ecdc4',
      youth: '#45b7d1',
      outreach: '#f093fb',
      mass: '#2d5016',
      events: '#f39c12'
    };
    return colors[category as keyof typeof colors] || '#6c757d';
  };

  return (
    <div className="gallery-manager">
      <div className="manager-header">
        <h2>Manage Gallery</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
        >
          <Plus size={20} />
          Add New Image
        </button>
      </div>

      <div className="gallery-filters">
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
                  {galleryImages.filter(img => img.category === category.value).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {showForm && (
        <div className="gallery-form-overlay">
          <div className="gallery-form">
            <div className="form-header">
              <h3>{editingId ? 'Edit Image' : 'Add New Image'}</h3>
              <button className="close-btn" onClick={resetForm}>×</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="title">Image Title *</label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter image title"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter image description"
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label htmlFor="image-upload">Image Upload</label>
                <div className="image-upload-area">
                  {formData.url ? (
                    <div className="image-preview">
                      <img src={formData.url} alt="Preview" />
                      <button 
                        type="button" 
                        className="remove-image"
                        onClick={() => setFormData({ ...formData, url: '' })}
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <div className="upload-placeholder">
                      <Upload size={48} />
                      <p>Click to upload image or enter URL below</p>
                    </div>
                  )}
                  <input
                    type="file"
                    id="image-upload"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                  <button 
                    type="button"
                    className="upload-btn"
                    onClick={() => document.getElementById('image-upload')?.click()}
                  >
                    Choose File
                  </button>
                </div>
                
                <div className="url-input">
                  <label htmlFor="url">Or enter image URL:</label>
                  <input
                    type="url"
                    id="url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="category">Category</label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  >
                    <option value="choir">Parish Choir</option>
                    <option value="youth">Youth Group</option>
                    <option value="outreach">Community Outreach</option>
                    <option value="mass">Mass & Liturgy</option>
                    <option value="events">Parish Events</option>
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
                  {editingId ? 'Update' : 'Add'} Image
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="gallery-grid">
        {filteredImages.length === 0 ? (
          <div className="empty-state">
            <ImageIcon size={48} />
            <h3>No Images Found</h3>
            <p>
              {selectedCategory === 'all' 
                ? 'Upload your first image to get started'
                : `No images in the ${categories.find(c => c.value === selectedCategory)?.label} category`
              }
            </p>
          </div>
        ) : (
          filteredImages.map((image) => (
            <div key={image.id} className="gallery-card">
              <div className="image-container">
                {image.url ? (
                  <img src={image.url} alt={image.title} />
                ) : (
                  <div className="image-placeholder">
                    <ImageIcon size={32} />
                    <span>No Image</span>
                  </div>
                )}
                
                <div className="image-overlay">
                  <div className="image-actions">
                    <button
                      className="action-btn"
                      onClick={() => togglePublished(image.id, image.isPublished)}
                      title={image.isPublished ? 'Unpublish' : 'Publish'}
                    >
                      {image.isPublished ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    <button
                      className="action-btn"
                      onClick={() => handleEdit(image)}
                      title="Edit"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className="action-btn delete"
                      onClick={() => handleDelete(image.id)}
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="image-info">
                <div className="image-header">
                  <h4>{image.title}</h4>
                  <div className="image-meta">
                    <span 
                      className="category-badge"
                      style={{ backgroundColor: getCategoryColor(image.category) }}
                    >
                      {categories.find(c => c.value === image.category)?.label}
                    </span>
                    <span className={`status-badge ${image.isPublished ? 'published' : 'unpublished'}`}>
                      {image.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>
                </div>
                
                {image.description && (
                  <p className="image-description">{image.description}</p>
                )}
                
                <div className="image-footer">
                  <span className="upload-date">
                    Uploaded: {new Date(image.uploadedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default GalleryManager;
