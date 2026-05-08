import React, { useState } from 'react';
import { useAdmin, GalleryImage } from '../../contexts/AdminContext';
import { Plus, Edit, Trash2, Eye, EyeOff, Upload, Image as ImageIcon, Tag, FileText } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import GalleryCategoryManager from './GalleryCategoryManager';
import api from '../../services/api';
import './GalleryManager.css';

const GalleryManager: React.FC = () => {
  const { 
    galleryImages, 
    addImage, 
    updateImage, 
    deleteImage,
    galleryCategories,
    fetchCategories
  } = useAdmin();
  const { success: toastSuccess, error: toastError } = useToast();
  
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'gallery' | 'categories'>('gallery');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
    category: galleryCategories[0] || 'general',
    isPublished: true
  });
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.url) {
      toastError('Please upload an image first', 'Gallery');
      return;
    }
    setIsUploading(true);
    
    try {
      if (editingId) {
        await updateImage(editingId, formData);
        toastSuccess('Image updated successfully', 'Gallery');
      } else {
        await addImage(formData);
        toastSuccess('New image added to gallery', 'Gallery');
      }
      resetForm();
    } catch (err) {
      toastError('Failed to save image', 'Error');
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      url: '',
      category: galleryCategories[0] || 'general',
      isPublished: true
    });
    setUploadPreview('');
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
    setUploadPreview(image.url || '');
    setEditingId(image.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this image?')) {
      try {
        deleteImage(id);
        toastSuccess('Image deleted from gallery', 'Gallery');
      } catch (err) {
        toastError('Failed to delete image', 'Error');
      }
    }
  };

  const togglePublished = (id: string, isPublished: boolean) => {
    try {
      updateImage(id, { isPublished: !isPublished });
      toastSuccess(isPublished ? 'Image unpublished' : 'Image published', 'Status Update');
    } catch (err) {
      toastError('Failed to update status', 'Error');
    }
  };

  const [uploadPreview, setUploadPreview] = useState<string>('');
  const [isUploadingFile, setIsUploadingFile] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show local preview immediately
    const reader = new FileReader();
    reader.onload = (ev) => setUploadPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    // Upload to server and save the real URL
    setIsUploadingFile(true);
    try {
      const uploadRes = await api.upload.uploadSingle(file, 'gallery');
      if (uploadRes.success && uploadRes.data) {
        const serverUrl = uploadRes.data.url || uploadRes.data.fileUrl || uploadRes.data.path;
        setFormData((prev: any) => ({ ...prev, url: serverUrl }));
      } else {
        toastError('Image upload failed', 'Gallery');
      }
    } catch (err) {
      console.error('Image upload error:', err);
      toastError('Failed to upload image', 'Gallery');
    } finally {
      setIsUploadingFile(false);
    }
  };

  const filteredImages = selectedCategory === 'all' 
    ? galleryImages 
    : galleryImages.filter(img => (img.category || '').toLowerCase() === selectedCategory.toLowerCase());

  const getCategoryColor = (category: string) => {
    if (!category) return '#6c757d';
    
    const colors: Record<string, string> = {
      'Mass & Liturgy': '#2d5016',
      'Parish Events': '#f39c12',
      'Youth Group': '#45b7d1',
      'Parish Choir': '#4ecdc4',
      'Community Outreach': '#f093fb'
    };
    
    // Case-insensitive matching for hardcoded ones
    const matchedKey = Object.keys(colors).find(
      key => key.toLowerCase() === category.toLowerCase()
    );
    if (matchedKey) return colors[matchedKey];
    
    // Generate a beautiful stable pastel/vibrant color based on the category name
    let hash = 0;
    for (let i = 0; i < category.length; i++) {
      hash = category.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash) % 360;
    // Saturation = 65%, Lightness = 40% for strong readability of white text
    return `hsl(${hue}, 65%, 40%)`;
  };


  return (
    <div className="gallery-manager">
      {/* Scoped styles — enforced regardless of external CSS */}
      <style>{`
        .gallery-grid {
          display: grid !important;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)) !important;
          gap: 1.5rem !important;
          align-items: start !important;
        }
        .gallery-card {
          overflow: hidden !important;
          display: flex !important;
          flex-direction: column !important;
          border-radius: 16px !important;
          background: white !important;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08) !important;
          border: 1px solid #e5e7eb !important;
        }
        .gallery-card .image-container {
          width: 100% !important;
          height: 200px !important;
          min-height: 200px !important;
          max-height: 200px !important;
          overflow: hidden !important;
          flex-shrink: 0 !important;
          flex-grow: 0 !important;
          position: relative !important;
          display: block !important;
          background: #f0f4f0 !important;
        }
        .gallery-card .image-container img {
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
          object-position: center !important;
        }
        .gallery-card .image-info {
          padding: 1.25rem !important;
          flex: 1 !important;
        }
      `}</style>
      {/* Tab Bar */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '2px solid #e5e7eb', paddingBottom: '0' }}>
        <button
          onClick={() => setActiveTab('gallery')}
          style={{
            padding: '0.65rem 1.5rem',
            fontWeight: 700,
            fontSize: '0.9rem',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            borderBottom: activeTab === 'gallery' ? '3px solid #2d5016' : '3px solid transparent',
            color: activeTab === 'gallery' ? '#2d5016' : '#6b7280',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <ImageIcon size={16} /> Gallery
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          style={{
            padding: '0.65rem 1.5rem',
            fontWeight: 700,
            fontSize: '0.9rem',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            borderBottom: activeTab === 'categories' ? '3px solid #2d5016' : '3px solid transparent',
            color: activeTab === 'categories' ? '#2d5016' : '#6b7280',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Tag size={16} /> Manage Categories
        </button>
      </div>

      {activeTab === 'categories' && <GalleryCategoryManager />}

      {activeTab === 'gallery' && (
      <>
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
          <button
            className={`filter-tab ${selectedCategory === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('all')}
          >
            All Categories
          </button>
          {galleryCategories.map(category => (
            <button
              key={category}
              className={`filter-tab ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
              <span className="count">
                {galleryImages.filter(img => (img.category || '').toLowerCase() === category.toLowerCase()).length}
              </span>
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
                  {(uploadPreview || formData.url) ? (
                    <div className="image-preview">
                      <img src={uploadPreview || formData.url} alt="Preview" />
                      {isUploadingFile && (
                        <div className="upload-overlay-status">Uploading...</div>
                      )}
                      <button 
                        type="button" 
                        className="remove-image"
                        onClick={() => { setFormData({ ...formData, url: '' }); setUploadPreview(''); }}
                        disabled={isUploadingFile}
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <div className="upload-placeholder">
                      <Upload size={48} />
                      <p>{isUploadingFile ? 'Uploading...' : 'Click to upload image'}</p>
                    </div>
                  )}
                  <input
                    type="file"
                    id="image-upload"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                    disabled={isUploadingFile}
                  />
                  <button 
                    type="button"
                    className="upload-btn"
                    onClick={() => document.getElementById('image-upload')?.click()}
                    disabled={isUploadingFile}
                  >
                    <Plus size={18} />
                    {isUploadingFile ? 'Uploading...' : 'Choose File'}
                  </button>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="category">Category</label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    {galleryCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                    {galleryCategories.length === 0 && <option value="general">General</option>}
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
                <button type="button" className="btn btn-secondary" onClick={resetForm} disabled={isUploading || isUploadingFile}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isUploading || isUploadingFile || !formData.url}>
                  {isUploading ? (
                    <>
                      <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                      Processing...
                    </>
                  ) : isUploadingFile ? (
                    <>Uploading image...</>
                  ) : (
                    <>
                      {editingId ? 'Update' : 'Add'} Image
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="gallery-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
        {filteredImages.length === 0 ? (
          <div className="empty-state">
            <ImageIcon size={48} />
            <h3>No Images Found</h3>
            <p>
              {selectedCategory === 'all' 
                ? 'Upload your first image to get started'
                : `No images in the ${selectedCategory} category`
              }
            </p>
          </div>
        ) : (
          filteredImages.map((image) => (
            <div key={image.id} className="gallery-card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', borderRadius: '16px', background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
              {/* Premium image container: entire image fits, gaps are filled with a gorgeous matching blur */}
              <div
                style={{
                  width: '100%',
                  height: '200px',
                  minHeight: '200px',
                  maxHeight: '200px',
                  flexShrink: 0,
                  flexGrow: 0,
                  position: 'relative',
                  overflow: 'hidden',
                  background: '#1a1a1a', // premium dark background
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {image.url ? (
                  <>
                    {/* Blurred background backup layer */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '-10px',
                        left: '-10px',
                        right: '-10px',
                        bottom: '-10px',
                        backgroundImage: `url(${image.url})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        filter: 'blur(12px) brightness(0.6)',
                        opacity: 0.65,
                        zIndex: 1,
                      }}
                    />
                    {/* Contained sharp image foreground layer */}
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundImage: `url(${image.url})`,
                        backgroundSize: 'contain',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        zIndex: 2,
                      }}
                    />
                  </>
                ) : (
                  <div className="image-placeholder" style={{ zIndex: 2 }}>
                    <ImageIcon size={32} />
                    <span>No Image</span>
                  </div>
                )}

                
                <div className="image-overlay" style={{ zIndex: 10 }}>
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
                      {image.category}
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
      </>
      )}
    </div>
  );
};

export default GalleryManager;
