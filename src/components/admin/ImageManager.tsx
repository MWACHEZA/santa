import React, { useState } from 'react';
import { Upload, Image, Trash2, Edit, Eye, X, Save } from 'lucide-react';
import ImageUpload from './ImageUpload';
import './ImageManager.css';

interface ImageItem {
  id: string;
  url: string;
  title: string;
  description: string;
  category: 'gallery' | 'prayers' | 'events' | 'ministries' | 'home' | 'sacraments';
  altText: string;
  uploadDate: string;
}

const ImageManager: React.FC = () => {
  const [images, setImages] = useState<ImageItem[]>([
    {
      id: '1',
      url: '/api/placeholder/400/300',
      title: 'Palm Sunday Celebration',
      description: 'Parish celebrating Palm Sunday with procession',
      category: 'gallery',
      altText: 'Parishioners holding palm branches during Palm Sunday procession',
      uploadDate: '2024-03-24'
    },
    {
      id: '2',
      url: '/api/placeholder/400/300',
      title: 'Our Father Prayer Image',
      description: 'Beautiful image for Our Father prayer',
      category: 'prayers',
      altText: 'Artistic representation of the Our Father prayer',
      uploadDate: '2024-03-20'
    },
    {
      id: '3',
      url: '/api/placeholder/400/300',
      title: 'Youth Group Meeting',
      description: 'CYA Youth group during their weekly meeting',
      category: 'ministries',
      altText: 'Young people gathered in church hall for youth group meeting',
      uploadDate: '2024-03-18'
    }
  ]);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editingImage, setEditingImage] = useState<ImageItem | null>(null);
  const [showImageModal, setShowImageModal] = useState<ImageItem | null>(null);

  const categories = [
    { value: 'all', label: 'All Images' },
    { value: 'gallery', label: 'Gallery' },
    { value: 'prayers', label: 'Prayers' },
    { value: 'events', label: 'Events' },
    { value: 'ministries', label: 'Ministries' },
    { value: 'home', label: 'Home Page' },
    { value: 'sacraments', label: 'Sacraments' }
  ];

  const filteredImages = selectedCategory === 'all' 
    ? images 
    : images.filter(img => img.category === selectedCategory);

  const handleUpload = (imageData: Omit<ImageItem, 'id' | 'uploadDate'>) => {
    const newImage: ImageItem = {
      ...imageData,
      id: Date.now().toString(),
      uploadDate: new Date().toISOString().split('T')[0]
    };
    setImages([...images, newImage]);
    setShowUploadModal(false);
  };

  const handleEdit = (imageData: ImageItem) => {
    setImages(images.map(img => img.id === imageData.id ? imageData : img));
    setEditingImage(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this image?')) {
      setImages(images.filter(img => img.id !== id));
    }
  };

  return (
    <div className="image-manager">
      <div className="manager-header">
        <h2>Image Management</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowUploadModal(true)}
        >
          <Upload size={20} />
          Upload Image
        </button>
      </div>

      {/* Category Filter */}
      <div className="category-filter">
        <label>Filter by Category:</label>
        <select 
          value={selectedCategory} 
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {categories.map(cat => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>
      </div>

      {/* Images Grid */}
      <div className="images-grid">
        {filteredImages.map(image => (
          <div key={image.id} className="image-card">
            <div className="image-preview">
              <img src={image.url} alt={image.altText} />
              <div className="image-overlay">
                <button 
                  className="overlay-btn"
                  onClick={() => setShowImageModal(image)}
                  title="View Full Size"
                >
                  <Eye size={16} />
                </button>
                <button 
                  className="overlay-btn"
                  onClick={() => setEditingImage(image)}
                  title="Edit Image"
                >
                  <Edit size={16} />
                </button>
                <button 
                  className="overlay-btn delete"
                  onClick={() => handleDelete(image.id)}
                  title="Delete Image"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <div className="image-info">
              <h4>{image.title}</h4>
              <p className="image-description">{image.description}</p>
              <div className="image-meta">
                <span className="category-tag">{image.category}</span>
                <span className="upload-date">{new Date(image.uploadDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredImages.length === 0 && (
        <div className="empty-state">
          <Image size={48} />
          <h3>No images found</h3>
          <p>Upload some images to get started</p>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <ImageUploadModal
          onSave={handleUpload}
          onCancel={() => setShowUploadModal(false)}
        />
      )}

      {/* Edit Modal */}
      {editingImage && (
        <ImageEditModal
          image={editingImage}
          onSave={handleEdit}
          onCancel={() => setEditingImage(null)}
        />
      )}

      {/* View Modal */}
      {showImageModal && (
        <ImageViewModal
          image={showImageModal}
          onClose={() => setShowImageModal(null)}
        />
      )}
    </div>
  );
};

// Upload Modal Component
const ImageUploadModal: React.FC<{
  onSave: (image: Omit<ImageItem, 'id' | 'uploadDate'>) => void;
  onCancel: () => void;
}> = ({ onSave, onCancel }) => {
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    url: '',
    title: '',
    description: '',
    category: 'gallery' as ImageItem['category'],
    altText: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.url && formData.title && formData.altText) {
      let finalImageUrl = formData.url;
      
      // If an image file was selected, we would upload it here
      if (selectedImageFile) {
        // In a real implementation, you would upload the file to your server
        // finalImageUrl = await uploadImageToServer(selectedImageFile);
        console.log('Image file selected for upload:', selectedImageFile.name);
      }
      
      onSave({
        ...formData,
        url: finalImageUrl
      });
    }
  };

  const handleImageSelect = (file: File, previewUrl: string) => {
    setSelectedImageFile(file);
    setFormData(prev => ({
      ...prev,
      url: previewUrl
    }));
  };

  const handleImageRemove = () => {
    setSelectedImageFile(null);
    setFormData(prev => ({
      ...prev,
      url: ''
    }));
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Upload New Image</h3>
          <button className="close-btn" onClick={onCancel}>
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="image-form">
          <ImageUpload
            label="Upload Image"
            onImageSelect={handleImageSelect}
            onImageRemove={handleImageRemove}
            currentImageUrl={formData.url && !formData.url.includes('placeholder') ? formData.url : undefined}
            maxSizeInMB={5}
            required
          />
          
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter image title"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter image description"
              rows={3}
            />
          </div>
          
          <div className="form-group">
            <label>Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as ImageItem['category'] })}
            >
              <option value="gallery">Gallery</option>
              <option value="prayers">Prayers</option>
              <option value="events">Events</option>
              <option value="ministries">Ministries</option>
              <option value="home">Home Page</option>
              <option value="sacraments">Sacraments</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Alt Text (for accessibility)</label>
            <input
              type="text"
              value={formData.altText}
              onChange={(e) => setFormData({ ...formData, altText: e.target.value })}
              placeholder="Describe the image for screen readers"
              required
            />
          </div>
          
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Save size={20} />
              Upload Image
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Edit Modal Component
const ImageEditModal: React.FC<{
  image: ImageItem;
  onSave: (image: ImageItem) => void;
  onCancel: () => void;
}> = ({ image, onSave, onCancel }) => {
  const [formData, setFormData] = useState(image);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Edit Image</h3>
          <button className="close-btn" onClick={onCancel}>
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="image-form">
          <div className="form-group">
            <label>Image URL</label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>
          
          <div className="form-group">
            <label>Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as ImageItem['category'] })}
            >
              <option value="gallery">Gallery</option>
              <option value="prayers">Prayers</option>
              <option value="events">Events</option>
              <option value="ministries">Ministries</option>
              <option value="home">Home Page</option>
              <option value="sacraments">Sacraments</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Alt Text</label>
            <input
              type="text"
              value={formData.altText}
              onChange={(e) => setFormData({ ...formData, altText: e.target.value })}
              required
            />
          </div>
          
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Save size={20} />
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// View Modal Component
const ImageViewModal: React.FC<{
  image: ImageItem;
  onClose: () => void;
}> = ({ image, onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content image-view-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{image.title}</h3>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <div className="image-view-content">
          <img src={image.url} alt={image.altText} />
          <div className="image-details">
            <p><strong>Description:</strong> {image.description}</p>
            <p><strong>Category:</strong> {image.category}</p>
            <p><strong>Alt Text:</strong> {image.altText}</p>
            <p><strong>Upload Date:</strong> {new Date(image.uploadDate).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageManager;
