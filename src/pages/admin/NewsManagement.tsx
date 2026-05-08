import React, { useState, useRef } from 'react';
import { useAdmin } from '../../contexts/AdminContext';
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
import './NewsManagement.css';

interface NewsFormData {
  title: string;
  summary: string;
  content: string;
  category: string;
  imageUrl: string;
  author: string;
  authorRole: 'priest' | 'secretary' | 'reporter' | 'vice_secretary';
  isPublished: boolean;
}

const NewsManagement: React.FC = () => {
  const {
    parishNews,
    addParishNews,
    updateParishNews,
    deleteParishNews,
    archiveParishNews
  } = useAdmin();

  const [showForm, setShowForm] = useState(false);
  const [editingNews, setEditingNews] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'published' | 'drafts' | 'archived'>('all');
  const [categories, setCategories] = useState<string[]>([
    'Liturgy', 'Community', 'Education', 'Youth', 'Charity', 'Events', 'Announcements'
  ]);
  const [newCategory, setNewCategory] = useState('');
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  
  const [formData, setFormData] = useState<NewsFormData>({
    title: '',
    summary: '',
    content: '',
    category: '',
    imageUrl: '',
    author: '',
    authorRole: 'secretary',
    isPublished: false
  });

  const [uploadPreview, setUploadPreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          setUploadPreview(result);
          setFormData(prev => ({ ...prev, imageUrl: result }));
        };
        reader.readAsDataURL(file);
      } else {
        // For non-image files, use a placeholder
        setUploadPreview('/api/placeholder/300/200');
        setFormData(prev => ({ ...prev, imageUrl: '/api/placeholder/300/200' }));
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.summary || !formData.content) {
      alert('Please fill in all required fields');
      return;
    }

    const newsData = {
      ...formData,
      publishedAt: formData.isPublished ? new Date().toISOString() : '',
      isArchived: false,
    };

    if (editingNews) {
      updateParishNews(editingNews, newsData);
    } else {
      addParishNews(newsData);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      summary: '',
      content: '',
      category: '',
      imageUrl: '',
      author: '',
      authorRole: 'secretary',
      isPublished: false
    });
    setUploadPreview('');
    setShowForm(false);
    setEditingNews(null);
  };

  const handleEdit = (news: any) => {
    setFormData({
      title: news.title,
      summary: news.summary,
      content: news.content,
      category: news.category || '',
      imageUrl: news.imageUrl || '',
      author: news.author,
      authorRole: news.authorRole,
      isPublished: news.isPublished
    });
    setUploadPreview(news.imageUrl || '');
    setEditingNews(news.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this news article?')) {
      deleteParishNews(id);
    }
  };

  const handleArchive = (id: string) => {
    if (window.confirm('Are you sure you want to archive this news article?')) {
      archiveParishNews(id);
    }
  };

  const addCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      const updatedCategories = [...categories, newCategory.trim()];
      setCategories(updatedCategories);
      // Save to localStorage
      localStorage.setItem('newsCategories', JSON.stringify(updatedCategories));
      setNewCategory('');
      setShowCategoryForm(false);
    }
  };

  const removeCategory = (categoryToRemove: string) => {
    if (window.confirm(`Are you sure you want to remove the "${categoryToRemove}" category?`)) {
      const updatedCategories = categories.filter(cat => cat !== categoryToRemove);
      setCategories(updatedCategories);
      // Save to localStorage
      localStorage.setItem('newsCategories', JSON.stringify(updatedCategories));
    }
  };

  // Load categories from localStorage on component mount
  React.useEffect(() => {
    const savedCategories = localStorage.getItem('newsCategories');
    if (savedCategories) {
      try {
        const parsedCategories = JSON.parse(savedCategories);
        if (Array.isArray(parsedCategories)) {
          setCategories(parsedCategories);
        }
      } catch (error) {
        console.error('Error loading news categories:', error);
      }
    }
  }, []);

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
        <div className="modal-overlay" onClick={() => setShowCategoryForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
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
                      onKeyPress={(e) => e.key === 'Enter' && addCategory()}
                    />
                    <button className="btn btn-primary" onClick={addCategory}>
                      <Plus size={16} />
                      Add
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="categories-list">
                <h3>Existing Categories</h3>
                <div className="category-tags">
                  {categories.map((category) => (
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
        <div className="modal-overlay" onClick={() => !editingNews && resetForm()}>
          <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()}>
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
                    <label>Title *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter news title"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    >
                      <option value="">Select category</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Summary *</label>
                  <textarea
                    value={formData.summary}
                    onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                    placeholder="Enter a brief summary"
                    rows={3}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Content *</label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Enter the full article content"
                    rows={8}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Upload Image/File</label>
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
                    >
                      {uploadPreview ? (
                        <div className="upload-preview">
                          <img src={uploadPreview} alt="Preview" />
                          <div className="upload-overlay">
                            <Upload size={24} />
                            <span>Click to change</span>
                          </div>
                        </div>
                      ) : (
                        <div className="upload-placeholder">
                          <Image size={48} />
                          <span>Click to upload image or file</span>
                          <small>Supports: JPG, PNG, PDF, DOC, DOCX</small>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Author *</label>
                    <input
                      type="text"
                      value={formData.author}
                      onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                      placeholder="Enter author name"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Author Role</label>
                    <select
                      value={formData.authorRole}
                      onChange={(e) => setFormData(prev => ({ ...prev, authorRole: e.target.value as any }))}
                    >
                      <option value="priest">Priest</option>
                      <option value="secretary">Secretary</option>
                      <option value="reporter">Reporter</option>
                      <option value="vice_secretary">Vice Secretary</option>
                    </select>
                  </div>
                </div>

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
                    {editingNews ? 'Update Article' : 'Save Article'}
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
                      <span>{news.author} ({news.authorRole?.replace('_', ' ')})</span>
                    </div>
                    <div className="news-date">
                      <Calendar size={16} />
                      <span>
                        {news.publishedAt 
                          ? new Date(news.publishedAt).toLocaleDateString()
                          : new Date(news.createdAt).toLocaleDateString()
                        }
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
