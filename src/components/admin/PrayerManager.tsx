import React, { useState } from 'react';
import { Plus, Edit, Trash2, Save, X, Calendar, BookOpen, Heart } from 'lucide-react';
import { useAdmin, type Prayer } from '../../contexts/AdminContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../../contexts/ToastContext';
import api from '../../services/api';
import './PrayerManager.css';

interface DailyReading {
  id: string;
  date: string;
  firstReading: {
    reference: string;
    text: string;
  };
  psalm: {
    reference: string;
    response: string;
    text: string;
  };
  gospel: {
    reference: string;
    text: string;
  };
  reflection?: string;
}

const PrayerManager: React.FC = () => {
  const { t } = useLanguage();
  const { 
    prayers, 
    addPrayer, 
    updatePrayer, 
    deletePrayer, 
    prayerCategories, 
    addCategory,
    isLoading: contextLoading 
  } = useAdmin();
  const { success, error, info } = useToast();
  
  const [activeTab, setActiveTab] = useState<'prayers' | 'readings'>('prayers');
  const [selectedPrayer, setSelectedPrayer] = useState<any | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [prayerToDelete, setPrayerToDelete] = useState<string | null>(null);
  
  const [readings, setReadings] = useState<DailyReading[]>([
    {
      id: '2024-12-30',
      date: '2024-12-30',
      firstReading: {
        reference: 'Isaiah 55:10-11',
        text: 'Thus says the LORD: Just as from the heavens the rain and snow come down...'
      },
      psalm: {
        reference: 'Psalm 65:10-14',
        response: 'The seed that falls on good ground will yield a fruitful harvest.',
        text: 'You have visited the land and watered it; greatly have you enriched it...'
      },
      gospel: {
        reference: 'Matthew 13:1-23',
        text: 'On that day, Jesus went out of the house and sat down by the sea...'
      },
      reflection: 'Today\'s readings invite us to reflect on how God\'s Word takes root in our hearts.'
    }
  ]);

  const [editingPrayer, setEditingPrayer] = useState<any | null>(null);
  const [editingReading, setEditingReading] = useState<DailyReading | null>(null);
  const [showPrayerForm, setShowPrayerForm] = useState(false);
  const [showReadingForm, setShowReadingForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddPrayer = () => {
    setEditingPrayer({
      title: '',
      text: '',
      category: prayerCategories[0] || 'Traditional',
      isPublished: true
    });
    setShowPrayerForm(true);
  };

  const handleSavePrayer = async (prayer: any) => {
    setIsSubmitting(true);
    try {
      if (prayer.id) {
        await updatePrayer(prayer.id, prayer);
        success('Prayer updated successfully');
      } else {
        await addPrayer(prayer);
        success('Prayer added successfully');
      }
      setEditingPrayer(null);
      setShowPrayerForm(false);
      setSelectedPrayer(null);
    } catch (err) {
      error('Failed to save prayer');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDeletePrayer = (id: string) => {
    setPrayerToDelete(id);
    setShowDeleteConfirm(true);
  };

  const handleDeletePrayer = async () => {
    if (!prayerToDelete) return;
    
    setIsSubmitting(true);
    try {
      await deletePrayer(prayerToDelete);
      success('Prayer deleted successfully');
      if (selectedPrayer?.id === prayerToDelete) {
        setSelectedPrayer(null);
      }
      setShowDeleteConfirm(false);
      setPrayerToDelete(null);
    } catch (err) {
      error('Failed to delete prayer');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddCategory = async () => {
    if (newCategoryName.trim() && !prayerCategories.includes(newCategoryName.trim())) {
      try {
        await addCategory(newCategoryName.trim(), 'prayer');
        success(`Category "${newCategoryName}" added`);
        setNewCategoryName('');
        setShowAddCategory(false);
      } catch (err) {
        error('Failed to add category');
        console.error('Failed to add prayer category', err);
      }
    }
  };

  const handleDeleteCategory = (categoryToDelete: string) => {
    info('Category deletion is currently disabled to protect existing data.');
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, prayerId: string) => {
    // Image upload logic... (can be refined to use actual upload API)
    info('Image upload feature will be available in the next update.');
  };

  const handleAddReading = () => {
    const today = new Date().toISOString().split('T')[0];
    setEditingReading({
      id: today,
      date: today,
      firstReading: { reference: '', text: '' },
      psalm: { reference: '', response: '', text: '' },
      gospel: { reference: '', text: '' },
      reflection: ''
    });
    setShowReadingForm(true);
  };

  const handleSaveReading = (reading: DailyReading) => {
    if (readings.find(r => r.id === reading.id)) {
      setReadings(readings.map(r => r.id === reading.id ? reading : r));
    } else {
      setReadings([...readings, reading]);
    }
    setEditingReading(null);
    setShowReadingForm(false);
    success('Daily reading saved');
  };

  // Filter prayers by selected category
  const filteredPrayers = selectedCategory === 'All' 
    ? prayers 
    : prayers.filter(prayer => prayer.category === selectedCategory);

  // Handle category selection
  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setSelectedPrayer(null); // Clear selected prayer when changing category
  };

  return (
    <div className="prayer-manager">
      <div className="manager-header">
        <div className="tab-buttons">
          <button
            className={`tab-btn ${activeTab === 'prayers' ? 'active' : ''}`}
            onClick={() => setActiveTab('prayers')}
          >
            <Heart size={20} />
            {t('admin.manage_prayers').split(' & ')[0]}
          </button>
          <button
            className={`tab-btn ${activeTab === 'readings' ? 'active' : ''}`}
            onClick={() => setActiveTab('readings')}
          >
            <BookOpen size={20} />
            {t('prayers.daily_readings')}
          </button>
        </div>
      </div>

      {activeTab === 'prayers' && (
        <div className="prayers-section">
          <div className="section-header">
            <h2>Parish Prayers Management</h2>
            <div className="header-actions">
              <button className="btn btn-secondary" onClick={() => setShowAddCategory(true)}>
                <Plus size={18} />
                Add Category
              </button>
              <button className="btn btn-primary" onClick={handleAddPrayer}>
                <Plus size={18} />
                Add Prayer
              </button>
            </div>
          </div>

          {/* Categories Management */}
          <div className="categories-section">
            <h3>Prayer Categories</h3>
            <div className="categories-list">
              {/* All Categories Option */}
              <div 
                key="All" 
                className={`category-item ${selectedCategory === 'All' ? 'selected' : ''}`}
                onClick={() => handleCategorySelect('All')}
                style={{ cursor: 'pointer' }}
              >
                <span className="category-name">All</span>
                <span className="prayer-count">
                  ({prayers.length} prayers)
                </span>
              </div>
              
              {prayerCategories.map((category) => (
                <div 
                  key={category} 
                  className={`category-item ${selectedCategory === category ? 'selected' : ''}`}
                  onClick={() => handleCategorySelect(category)}
                  style={{ cursor: 'pointer' }}
                >
                  <span className="category-name">{category}</span>
                  <span className="prayer-count">
                    ({prayers.filter(p => p.category === category).length} prayers)
                  </span>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent category selection when deleting
                      handleDeleteCategory(category);
                    }}
                    title="Delete category"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Prayers List */}
          <div className="prayers-list">
            <div className="section-header">
              <h3>
                {selectedCategory === 'All' 
                  ? `All Prayers (${filteredPrayers.length})` 
                  : `${selectedCategory} Prayers (${filteredPrayers.length})`
                }
              </h3>
            </div>
            
            {filteredPrayers.length === 0 ? (
              <div className="no-prayers-message">
                <p>No prayers found in the "{selectedCategory}" category.</p>
                <button 
                  className="btn btn-primary"
                  onClick={handleAddPrayer}
                >
                  <Plus size={18} />
                  Add First Prayer
                </button>
              </div>
            ) : (
              <div className="prayers-grid">
                {filteredPrayers.map((prayer) => (
                  <div 
                    key={prayer.id} 
                    className={`prayer-card ${selectedPrayer?.id === prayer.id ? 'selected' : ''}`}
                    onClick={() => setSelectedPrayer(prayer)}
                  >
                    {prayer.imageUrl && (
                      <div className="prayer-image">
                        <img src={prayer.imageUrl} alt={prayer.title} />
                      </div>
                    )}
                    <div className="prayer-header">
                      <h3>{prayer.title}</h3>
                      <span className="prayer-category">{prayer.category}</span>
                    </div>
                    <div className="prayer-text">
                      {prayer.text.length > 150 ? `${prayer.text.substring(0, 150)}...` : prayer.text}
                    </div>
                    <div className="prayer-meta">
                      <span className="created-date">
                        Created: {prayer.createdAt ? new Date(prayer.createdAt).toLocaleDateString() : 'N/A'}
                      </span>
                      <span className={`status ${prayer.isPublished ? 'published' : 'draft'}`}>
                        {prayer.isPublished ? '✅ Published' : '📝 Draft'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Selected Prayer Actions */}
          {selectedPrayer && (
            <div className="selected-prayer-panel">
              <div className="panel-header">
                <h3>Selected Prayer: {selectedPrayer.title}</h3>
                <button 
                  className="btn-close"
                  onClick={() => setSelectedPrayer(null)}
                >
                  <X size={20} />
                </button>
              </div>
              <div className="prayer-details">
                <div className="detail-item">
                  <label>Category:</label>
                  <span>{selectedPrayer.category}</span>
                </div>
                <div className="detail-item">
                  <label>Status:</label>
                  <span className={selectedPrayer.isPublished ? 'published' : 'draft'}>
                    {selectedPrayer.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>
                <div className="detail-item">
                  <label>Full Text:</label>
                  <div className="prayer-full-text">{selectedPrayer.text}</div>
                </div>
              </div>
              <div className="prayer-actions">
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setEditingPrayer(selectedPrayer);
                    setShowPrayerForm(true);
                  }}
                >
                  <Edit size={18} />
                  Edit Prayer
                </button>
                <label className="btn btn-secondary">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, selectedPrayer.id)}
                    style={{ display: 'none' }}
                  />
                  📷 Add/Change Image
                </label>
                <button
                  className="btn btn-danger"
                  onClick={() => confirmDeletePrayer(selectedPrayer.id)}
                >
                  <Trash2 size={18} />
                  Delete Prayer
                </button>
              </div>
            </div>
          )}

          {/* Add Category Modal */}
          {showAddCategory && (
            <div className="modal-overlay">
              <div className="modal">
                <div className="modal-header">
                  <h3>Add New Category</h3>
                  <button className="btn-close" onClick={() => setShowAddCategory(false)}>
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
                      placeholder="Enter category name"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                    />
                  </div>
                  <div className="form-actions">
                    <button className="btn btn-secondary" onClick={() => setShowAddCategory(false)}>
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

          {/* Delete Confirmation Modal */}
          {showDeleteConfirm && (
            <div className="modal-overlay">
              <div className="modal confirm-modal">
                <div className="modal-header">
                  <h3>Confirm Deletion</h3>
                  <button className="btn-close" onClick={() => setShowDeleteConfirm(false)}>
                    <X size={20} />
                  </button>
                </div>
                <div className="modal-content">
                  <p>Are you sure you want to delete this prayer? This action cannot be undone.</p>
                  <div className="form-actions">
                    <button 
                      className="btn btn-secondary" 
                      onClick={() => setShowDeleteConfirm(false)}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                    <button 
                      className="btn btn-danger" 
                      onClick={handleDeletePrayer}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Deleting...' : 'Delete Prayer'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Prayer Form Modal */}
          {showPrayerForm && (
            <PrayerForm
              prayer={editingPrayer}
              categories={prayerCategories}
              onSave={handleSavePrayer}
              onCancel={() => {
                setShowPrayerForm(false);
                setEditingPrayer(null);
              }}
              isSubmitting={isSubmitting}
            />
          )}
        </div>
      )}

      {activeTab === 'readings' && (
        <div className="readings-section">
          <div className="section-header">
            <h2>Daily Liturgical Readings</h2>
            <button className="btn btn-primary" onClick={handleAddReading}>
              <Plus size={20} />
              Add Reading
            </button>
          </div>

          <div className="readings-list">
            {readings.map((reading) => (
              <div key={reading.id} className="reading-card">
                <div className="reading-header">
                  <div className="reading-date">
                    <Calendar size={20} />
                    {new Date(reading.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                  <div className="reading-actions">
                    <button
                      className="btn btn-secondary btn-small"
                      onClick={() => {
                        setEditingReading(reading);
                        setShowReadingForm(true);
                      }}
                    >
                      <Edit size={16} />
                      Edit
                    </button>
                  </div>
                </div>
                <div className="reading-content">
                  <div className="reading-item">
                    <strong>First Reading:</strong> {reading.firstReading.reference}
                  </div>
                  <div className="reading-item">
                    <strong>Psalm:</strong> {reading.psalm.reference}
                  </div>
                  <div className="reading-item">
                    <strong>Gospel:</strong> {reading.gospel.reference}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {showReadingForm && (
            <ReadingForm
              reading={editingReading}
              onSave={handleSaveReading}
              onCancel={() => {
                setShowReadingForm(false);
                setEditingReading(null);
              }}
            />
          )}
        </div>
      )}
    </div>
  );
};

// Prayer Form Component
const PrayerForm: React.FC<{
  prayer: any | null;
  categories: string[];
  onSave: (prayer: any) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}> = ({ prayer, categories, onSave, onCancel, isSubmitting = false }) => {
  const [formData, setFormData] = useState<any>(
    prayer || {
      title: '',
      text: '',
      category: categories[0] || 'Traditional',
      isPublished: true
    }
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title.trim() && formData.text.trim()) {
      setUploading(true);
      try {
        let finalImageUrl = formData.imageUrl || '';
        if (imageFile) {
          const uploadRes = await api.upload.uploadSingle(imageFile, 'prayers');
          if (uploadRes.success && uploadRes.data) {
            finalImageUrl = uploadRes.data.url || uploadRes.data.fileUrl || uploadRes.data.path;
          }
        }
        onSave({ ...formData, imageUrl: finalImageUrl });
      } catch (err) {
        console.error('Failed to upload prayer image:', err);
      } finally {
        setUploading(false);
      }
    }
  };

  const isFormDisabled = isSubmitting || uploading;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>{prayer?.id ? 'Edit Prayer' : 'Add New Prayer'}</h3>
          <button className="close-btn" onClick={onCancel} disabled={isFormDisabled}>
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="prayer-form">
          <div className="form-group">
            <label>Prayer Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter prayer title"
              required
              disabled={isFormDisabled}
            />
          </div>
          
          <div className="form-group">
            <label>Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
              disabled={isFormDisabled}
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Prayer Image (Optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setImageFile(file);
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    setFormData({ ...formData, imageUrl: event.target?.result as string });
                  };
                  reader.readAsDataURL(file);
                }
              }}
              disabled={isFormDisabled}
            />
            {formData.imageUrl && (
              <div className="image-preview">
                <img src={formData.imageUrl} alt="Prayer preview" style={{ maxWidth: '200px', maxHeight: '150px' }} />
              </div>
            )}
          </div>
          
          <div className="form-group">
            <label>Prayer Text</label>
            <textarea
              value={formData.text}
              onChange={(e) => setFormData({ ...formData, text: e.target.value })}
              placeholder="Enter the full prayer text"
              rows={8}
              required
              disabled={isFormDisabled}
            />
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.isPublished}
                onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                disabled={isFormDisabled}
              />
              Publish this prayer (make it visible to parishioners)
            </label>
          </div>
          
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={isFormDisabled}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isFormDisabled}>
              {isFormDisabled ? (
                <>Saving...</>
              ) : (
                <>
                  <Save size={20} />
                  Save Prayer
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Reading Form Component
const ReadingForm: React.FC<{
  reading: DailyReading | null;
  onSave: (reading: DailyReading) => void;
  onCancel: () => void;
}> = ({ reading, onSave, onCancel }) => {
  const [formData, setFormData] = useState<DailyReading>(
    reading || {
      id: '',
      date: new Date().toISOString().split('T')[0],
      firstReading: { reference: '', text: '' },
      psalm: { reference: '', response: '', text: '' },
      gospel: { reference: '', text: '' },
      reflection: ''
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...formData, id: formData.date });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content large">
        <div className="modal-header">
          <h3>Edit Daily Reading</h3>
          <button className="close-btn" onClick={onCancel}>
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="reading-form">
          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>
          
          <div className="reading-sections">
            <div className="reading-section">
              <h4>First Reading</h4>
              <div className="form-group">
                <label>Reference</label>
                <input
                  type="text"
                  value={formData.firstReading.reference}
                  onChange={(e) => setFormData({
                    ...formData,
                    firstReading: { ...formData.firstReading, reference: e.target.value }
                  })}
                  placeholder="e.g., Isaiah 55:10-11"
                />
              </div>
              <div className="form-group">
                <label>Text</label>
                <textarea
                  value={formData.firstReading.text}
                  onChange={(e) => setFormData({
                    ...formData,
                    firstReading: { ...formData.firstReading, text: e.target.value }
                  })}
                  rows={4}
                />
              </div>
            </div>
            
            <div className="reading-section">
              <h4>Responsorial Psalm</h4>
              <div className="form-group">
                <label>Reference</label>
                <input
                  type="text"
                  value={formData.psalm.reference}
                  onChange={(e) => setFormData({
                    ...formData,
                    psalm: { ...formData.psalm, reference: e.target.value }
                  })}
                  placeholder="e.g., Psalm 65:10-14"
                />
              </div>
              <div className="form-group">
                <label>Response</label>
                <input
                  type="text"
                  value={formData.psalm.response}
                  onChange={(e) => setFormData({
                    ...formData,
                    psalm: { ...formData.psalm, response: e.target.value }
                  })}
                  placeholder="Psalm response"
                />
              </div>
              <div className="form-group">
                <label>Text</label>
                <textarea
                  value={formData.psalm.text}
                  onChange={(e) => setFormData({
                    ...formData,
                    psalm: { ...formData.psalm, text: e.target.value }
                  })}
                  rows={3}
                />
              </div>
            </div>
            
            <div className="reading-section">
              <h4>Gospel</h4>
              <div className="form-group">
                <label>Reference</label>
                <input
                  type="text"
                  value={formData.gospel.reference}
                  onChange={(e) => setFormData({
                    ...formData,
                    gospel: { ...formData.gospel, reference: e.target.value }
                  })}
                  placeholder="e.g., Matthew 13:1-23"
                />
              </div>
              <div className="form-group">
                <label>Text</label>
                <textarea
                  value={formData.gospel.text}
                  onChange={(e) => setFormData({
                    ...formData,
                    gospel: { ...formData.gospel, text: e.target.value }
                  })}
                  rows={4}
                />
              </div>
            </div>
          </div>
          
          <div className="form-group">
            <label>Reflection (Optional)</label>
            <textarea
              value={formData.reflection || ''}
              onChange={(e) => setFormData({ ...formData, reflection: e.target.value })}
              placeholder="Add a reflection on today's readings"
              rows={3}
            />
          </div>
          
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Save size={20} />
              Save Reading
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PrayerManager;
