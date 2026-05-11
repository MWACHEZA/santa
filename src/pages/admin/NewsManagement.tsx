import React, { useState, useRef } from 'react';
import { useAdmin, ParishNews } from '../../contexts/AdminContext';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Upload, 
  Image, 
  FileText, 
  Calendar, 
  User, 
  Tag,
  Archive,
  Eye,
  Save,
  X
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import './NewsManagement.css';

interface NewsFormData {
  title: string;
  summary: string;
  content: string;
  category: string;
  imageUrl: string;
  isPublished: boolean;
}

const NewsManagement: React.FC = () => {
  const {
    parishNews,
    addParishNews,
    updateParishNews,
    deleteParishNews,

    archiveParishNews,
    newsCategories,
    fullNewsCategories,
    addCategory,
    logAdminAction

  } = useAdmin();
  const { success: toastSuccess, error: toastError } = useToast();
  const { user } = useAuth();

  const [showForm, setShowForm] = useState(false);
  const [editingNews, setEditingNews] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'published' | 'drafts' | 'archived'>('all');
  const [newCategory, setNewCategory] = useState('');
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  
  const [formData, setFormData] = useState<NewsFormData>({
    title: '',
    summary: '',
    content: '',
    category: '',
    imageUrl: '',
    isPublished: false
  });

  const [uploadPreview, setUploadPreview] = useState<string>('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (showForm || showCategoryForm) {
      document.body.classList.add('news-modal-open');
    } else {
      document.body.classList.remove('news-modal-open');
    }
    return () => {
      document.body.classList.remove('news-modal-open');
    };
  }, [showForm, showCategoryForm]);

  // Filter news based on active tab
  const getFilteredNews = () => {
    switch (activeTab) {
      case 'published':
        return parishNews.filter(news => news.isPublished && !news.isArchived);
      case 'drafts':
        return parishNews.filter(news => !news.isPublished && !news.isArchived);
      case 'archived':
        return parishNews.filter(news => news.isArchived);
      default:
        return parishNews.filter(news => !news.isArchived);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          setUploadPreview(result);
          // Don't put Base64 into formData to avoid sending massive strings to the DB
        };
        reader.readAsDataURL(file);
      } else {
        // For non-image files, use a placeholder
        setUploadPreview('/api/placeholder/300/200');
        setFormData(prev => ({ ...prev, imageUrl: '/api/placeholder/300/200' }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.summary || !formData.content) {
      toastError('Please fill in all required fields', 'Validation Error');
      return;
    }
    
    let finalImageUrl = editingNews ? formData.imageUrl : '';

    try {
      // 1. Upload image if a new file was selected
      if (uploadedFile) {
        try {
          const uploadRes = await api.upload.uploadSingle(uploadedFile, 'news');
          if (uploadRes.success && uploadRes.data) {
            finalImageUrl = uploadRes.data.url || uploadRes.data.fileUrl || uploadRes.data.path;
          } else {
            throw new Error(uploadRes.message || 'Image upload failed');
          }
        } catch (uploadErr: any) {
          console.error('Upload error:', uploadErr);
          toastError(uploadErr.message || 'Failed to upload featured image', 'Upload Error');
          return;
        }
      }

      if (!finalImageUrl && !editingNews) {
        toastError('Please select a featured image', 'Validation Error');
        return;
      }

      const newsData = {
        ...formData,
        imageUrl: finalImageUrl,
        author: user ? (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username) : 'Anonymous',
        authorRole: (['priest', 'secretary', 'reporter', 'vice_secretary'].includes(user?.role || '') 
          ? user?.role 
          : 'reporter') as any,
        publishedAt: formData.isPublished ? new Date().toISOString() : '',
        isArchived: false,
      };
      
      if (editingNews) {
        await updateParishNews(editingNews, newsData);
        logAdminAction('UPDATE_NEWS', 'news', editingNews, `Updated news article: ${formData.title}`);
        toastSuccess('News article updated', 'Parish News');
      } else {
        await addParishNews(newsData);
        logAdminAction('CREATE_NEWS', 'news', 'new', `Published ${formData.isPublished ? 'article' : 'draft'}: ${formData.title}`);
        toastSuccess(formData.isPublished ? 'New news article published' : 'News article saved as draft', 'Parish News');
        
        // Switch to appropriate tab to show the new article
        if (formData.isPublished) {
          setActiveTab('published');
        } else {
          setActiveTab('drafts');
        }
      }
      resetForm();
    } catch (err: any) {
      console.error('Submit error:', err);
      toastError(err.message || 'Failed to save news article. Please check your connection.', 'Error');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      summary: '',
      content: '',
      category: '',
      imageUrl: '',
      isPublished: false
    });
    setUploadPreview('');
    setUploadedFile(null);
    setShowForm(false);
    setEditingNews(null);
  };

  const handleEdit = (news: ParishNews) => {
    setFormData({
      title: news.title,
      summary: news.summary,
      content: news.content,
      category: news.category_id || news.category || '',
      imageUrl: news.imageUrl || '',
      isPublished: news.isPublished
    });
    setUploadPreview(news.imageUrl || '');
    setEditingNews(news.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this news article?')) {
      try {
        await deleteParishNews(id);
        logAdminAction('DELETE_NEWS', 'news', id, 'Deleted a news article');
        toastSuccess('News article deleted successfully', 'Parish News');
      } catch (err) {
        toastError('Failed to delete news article', 'Error');
      }
    }
  };

  const handleArchive = async (id: string) => {
    try {
      await archiveParishNews(id);
      toastSuccess('News article moved to archive', 'Parish News');
    } catch (err) {
      toastError('Failed to archive article', 'Error');
    }
  };

  const handleAddCategory = async () => {
    if (newCategory.trim() && !newsCategories.includes(newCategory.trim())) {
      try {
        await addCategory(newCategory.trim(), 'news');
        setNewCategory('');
        setShowCategoryForm(false);
      } catch (err) {
        toastError('Failed to add category', 'Error');
      }
    }
  };

  const removeCategory = (categoryToRemove: string) => {
    // Note: Deleting categories might need a backend endpoint, 
    // for now we'll just show a message or keep it as is if not implemented
    toastError('Category deletion not implemented yet', 'System');
  };


  const filteredNews = getFilteredNews();

  return (
    <div className="news-management">
      <div className="page-header">
        <div className="header-content">
          <h1>
            <FileText size={32} />
            News Management
          </h1>
          <p>Manage parish news articles, categories, and media uploads</p>
        </div>
        <div className="header-actions">
          <button 
            className="btn btn-secondary"
            onClick={() => setShowCategoryForm(true)}
          >
            <Tag size={20} />
            Manage Categories
          </button>
          <button 
            className="btn btn-primary"
            onClick={() => setShowForm(true)}
          >
            <Plus size={20} />
            Add News Article
          </button>
        </div>
      </div>

      {/* Category Management Modal */}
      {showCategoryForm && (
        <div className="news-modal-overlay" onClick={() => setShowCategoryForm(false)}>
          <div className="news-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Manage Categories</h2>
              <button className="modal-close" onClick={() => setShowCategoryForm(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="modal-body">
              <div className="category-form">
                <div className="form-group">
                  <label>Add New Category</label>
                  <div className="input-group">
                    <input
                      type="text"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      placeholder="Enter category name"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                    />
                    <button className="btn btn-primary" onClick={handleAddCategory}>
                      <Plus size={16} />
                      Add
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="categories-list">
                <h3>Existing Categories</h3>
                <div className="category-tags">
                  {newsCategories.map((category: string) => (
                    <div key={category} className="category-tag">
                      <span>{category}</span>
                      <button 
                        className="remove-category"
                        onClick={() => removeCategory(category)}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* News Form Modal */}
      {showForm && (
        <div className="news-modal-overlay" onClick={() => !editingNews && resetForm()}>
          <div className="news-modal-content large-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingNews ? 'Edit News Article' : 'Add New News Article'}</h2>
              <button className="modal-close" onClick={resetForm}>
                <X size={24} />
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit} className="news-form">
                <div className="form-row">
                  <div className="form-group">
                    <label><FileText size={16} /> Title *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g. Annual Parish Bazaar 2024"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label><Tag size={16} /> Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    >
                      <option value="">Select a category</option>
                      {fullNewsCategories.map((category: any) => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label><FileText size={16} /> Summary *</label>
                  <textarea
                    value={formData.summary}
                    onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                    placeholder="Provide a catchy summary for the news feed..."
                    rows={2}
                    required
                  />
                </div>

                <div className="form-group">
                  <label><FileText size={16} /> Content *</label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Write the full article details here..."
                    rows={4}
                    required
                  />
                </div>

                <div className="form-group">
                  <label><Image size={16} /> Featured Image / Attachment</label>
                  <div className="file-upload-area">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="image/*,application/pdf,.doc,.docx"
                      style={{ display: 'none' }}
                    />
                    <div 
                      className="upload-zone"
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.currentTarget.classList.add('drag-over');
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        e.currentTarget.classList.remove('drag-over');
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.currentTarget.classList.remove('drag-over');
                        const file = e.dataTransfer.files?.[0];
                        if (file) {
                          const event = { target: { files: [file] } } as any;
                          handleFileUpload(event);
                        }
                      }}
                    >
                      {uploadPreview ? (
                        <div className="upload-preview">
                          <img src={uploadPreview} alt="Preview" />
                          <div className="upload-overlay">
                            <Upload size={24} />
                            <span>Click to change image</span>
                          </div>
                        </div>
                      ) : (
                        <div className="upload-placeholder">
                          <div className="upload-icon-wrapper">
                            <Upload size={48} />
                          </div>
                          <span>Drop your image here or click to browse</span>
                          <small>Supports high-quality JPG, PNG, PDF or DOCX (Max 10MB)</small>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Author fields removed as they are now automatic */}

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.isPublished}
                      onChange={(e) => setFormData(prev => ({ ...prev, isPublished: e.target.checked }))}
                    />
                    <span className="checkmark"></span>
                    Publish immediately
                  </label>
                </div>

                <div className="form-actions">
                  <button type="button" className="btn btn-secondary" onClick={resetForm}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <Save size={20} />
                    {editingNews 
                      ? (formData.isPublished ? 'Update & Publish' : 'Update Draft') 
                      : (formData.isPublished ? 'Publish Article' : 'Save as Draft')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* News Tabs */}
      <div className="news-tabs">
        <button 
          className={`tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          <FileText size={20} />
          All News ({parishNews.filter(n => !n.isArchived).length})
        </button>
        <button 
          className={`tab ${activeTab === 'published' ? 'active' : ''}`}
          onClick={() => setActiveTab('published')}
        >
          <Eye size={20} />
          Published ({parishNews.filter(n => n.isPublished && !n.isArchived).length})
        </button>
        <button 
          className={`tab ${activeTab === 'drafts' ? 'active' : ''}`}
          onClick={() => setActiveTab('drafts')}
        >
          <Edit size={20} />
          Drafts ({parishNews.filter(n => !n.isPublished && !n.isArchived).length})
        </button>
        <button 
          className={`tab ${activeTab === 'archived' ? 'active' : ''}`}
          onClick={() => setActiveTab('archived')}
        >
          <Archive size={20} />
          Archived ({parishNews.filter(n => n.isArchived).length})
        </button>
      </div>

      {/* News List */}
      <div className="news-list">
        {filteredNews.length === 0 ? (
          <div className="empty-state">
            <FileText size={64} />
            <h3>No news articles found</h3>
            <p>
              {activeTab === 'all' && 'Start by creating your first news article.'}
              {activeTab === 'published' && 'No published articles yet.'}
              {activeTab === 'drafts' && 'No draft articles found.'}
              {activeTab === 'archived' && 'No archived articles found.'}
            </p>
            {activeTab !== 'archived' && (
              <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                <Plus size={20} />
                Add News Article
              </button>
            )}
          </div>
        ) : (
          <div className="news-grid">
            {filteredNews.map((news) => (
              <div key={news.id} className="news-card">
                {news.imageUrl && (
                  <div className="news-image">
                    <img src={news.imageUrl} alt={news.title} />
                  </div>
                )}
                <div className="news-content">
                  <div className="news-header">
                    <div className="news-meta">
                      <span className="news-status">
                        {news.isArchived ? (
                          <><Archive size={16} /> Archived</>
                        ) : news.isPublished ? (
                          <><Eye size={16} /> Published</>
                        ) : (
                          <><Edit size={16} /> Draft</>
                        )}
                      </span>
                      {news.category && (
                        <span className="news-category">
                          <Tag size={16} />
                          {news.category}
                        </span>
                      )}
                    </div>
                    <div className="news-actions">
                      <button 
                        className="btn-icon"
                        onClick={() => handleEdit(news)}
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      {!news.isArchived && (
                        <button 
                          className="btn-icon"
                          onClick={() => handleArchive(news.id)}
                          title="Archive"
                        >
                          <Archive size={16} />
                        </button>
                      )}
                      <button 
                        className="btn-icon danger"
                        onClick={() => handleDelete(news.id)}
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <h3>{news.title}</h3>
                  <p className="news-summary">{news.summary}</p>
                  
                  <div className="news-footer">
                    <div className="author-info">
                      <User size={16} />
                      <span>{news.author} {news.authorRole ? `(${news.authorRole.replace('_', ' ')})` : ''}</span>
                    </div>
                    <div className="news-date">
                      <Calendar size={16} />
                      <span>
                        {news.publishedAt && news.publishedAt !== '' && !isNaN(new Date(news.publishedAt).getTime())
                          ? new Date(news.publishedAt).toLocaleDateString()
                          : (news.createdAt && !isNaN(new Date(news.createdAt).getTime()) 
                              ? new Date(news.createdAt).toLocaleDateString() 
                              : 'Recently')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsManagement;
