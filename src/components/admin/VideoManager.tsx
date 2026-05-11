import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, Video, Calendar, Clock, Users, Upload, X, FileVideo, Tags, Play } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { LiveStream, VideoArchive } from '../../contexts/AdminContext';
import { useToast } from '../../contexts/ToastContext';
import { api } from '../../services/api';
import './VideoManager.css';

interface VideoCategory {
  id: string;
  name: string;
  description: string;
}

const VideoManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'streams' | 'archive'>('streams');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<LiveStream | VideoArchive | null>(null);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [liveStreams, setLiveStreams] = useState<LiveStream[]>([]);
  const [videoArchive, setVideoArchive] = useState<VideoArchive[]>([]);
  const [categories, setCategories] = useState<VideoCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [previewVideo, setPreviewVideo] = useState<LiveStream | VideoArchive | null>(null);
  
  // Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
    thumbnail: '',
    scheduledTime: '',
    category: '' as string,
    duration: '',
    isLive: false,
    isPublished: true
  });
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    description: ''
  });

  const { success: toastSuccess, error: toastError } = useToast();

  const fetchCategories = useCallback(async () => {
    try {
      const res = await api.categories.getByType('video');
      if (res.success) {
        setCategories(res.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  }, []);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [streamsRes, archiveRes] = await Promise.all([
        api.videos.getStreams(),
        api.videos.getArchive()
      ]);
      
      if (streamsRes.success) {
        setLiveStreams((streamsRes.data?.items || streamsRes.data || []).map((s: any) => ({
          ...s,
          streamUrl: s.stream_url || s.streamUrl,
          isLive: s.is_live ?? s.isLive,
          scheduledTime: s.scheduled_time || s.scheduledTime,
          totalViews: s.total_views || s.totalViews,
          createdBy: s.created_by || s.createdBy,
          createdAt: s.created_at || s.createdAt
        })));
      } else {
        console.error('Streams fetch unsuccessful:', streamsRes);
      }
      
      if (archiveRes.success) {
        setVideoArchive((archiveRes.data?.items || archiveRes.data || []).map((v: any) => ({
          ...v,
          videoUrl: v.video_url || v.videoUrl,
          isPublished: v.is_published ?? v.isPublished,
          publishedAt: v.published_at || v.publishedAt,
          createdBy: v.created_by || v.createdBy,
          createdAt: v.created_at || v.createdAt
        })));
      } else {
        console.error('Archive fetch unsuccessful:', archiveRes);
      }
    } catch (err: any) {
      console.error('Failed to fetch video data:', err);
      toastError(err.message || 'Failed to connect to video service', 'Video Management');
    } finally {
      setIsLoading(false);
    }
  }, [toastError]);

  // Fetch data on mount
  useEffect(() => {
    fetchData();
    fetchCategories();
  }, [fetchData, fetchCategories]);

  // Dropzone Setup
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setSelectedFile(file);
      // Create a temporary URL to load the video and get its duration
      const url = URL.createObjectURL(file);
      if (videoRef.current) {
        videoRef.current.src = url;
      }
    }
  }, []);

  const tryUpload = async (file: File, type?: 'image' | 'video') => {
    try {
      const up = await api.upload.uploadSingle(file, type);
      return up;
    } catch (err) {
      const base = (process.env.REACT_APP_API_URL || '/api');
      const fd = new FormData();
      fd.append('file', file);
      if (type) fd.append('type', type);
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${base}/upload/single`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}`, 'x-access-token': token } : undefined,
        body: fd,
        credentials: 'include',
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Upload failed');
      }
      const data = await res.json();
      return data;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (token) api.setAuthToken(token);
        const [streamsRes, archiveRes] = await Promise.all([
          api.videos.getStreams(),
          api.videos.getArchive({ published: true })
        ]);
        const streams: any[] = (streamsRes.data?.items) || (streamsRes.data?.streams) || (Array.isArray(streamsRes.data) ? streamsRes.data : []);
        const videos: any[] = (archiveRes.data?.items) || (archiveRes.data?.videos) || (Array.isArray(archiveRes.data) ? archiveRes.data : []);
        setLiveStreams(streams.map(s => ({
          id: String(s.id),
          title: s.title,
          description: s.description ?? '',
          streamUrl: s.streamUrl ?? s.stream_url ?? '',
          isLive: !!(s.isLive ?? s.is_live),
          scheduledTime: s.scheduledTime ?? s.scheduled_time ?? new Date().toISOString(),
          viewers: s.viewers ?? 0,
          thumbnail: s.thumbnail ?? s.thumbnail_url ?? '',
          createdBy: s.createdBy ?? 'system',
          createdAt: s.createdAt ?? s.created_at ?? new Date().toISOString()
        })));
        setVideoArchive(videos.map(v => ({
          id: String(v.id),
          title: v.title,
          description: v.description ?? '',
          videoUrl: v.videoUrl ?? v.video_url ?? '',
          thumbnail: v.thumbnail ?? v.thumbnail_url ?? '',
          duration: v.duration ?? '',
          publishedDate: v.publishedDate ?? v.published_date ?? new Date().toISOString().split('T')[0],
          views: v.views ?? 0,
          category: (v.category ?? 'mass'),
          createdBy: v.createdBy ?? 'system',
          createdAt: v.createdAt ?? v.created_at ?? new Date().toISOString(),
          isPublished: !!(v.isPublished ?? v.is_published ?? true)
        })));
      } catch (err) {}
    };
    loadData();
  }, []);



  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'video/*': [] },
    multiple: false
  });

  const handleVideoMetadata = () => {
    if (videoRef.current) {
      const durationInSeconds = Math.floor(videoRef.current.duration);
      const hours = Math.floor(durationInSeconds / 3600);
      const minutes = Math.floor((durationInSeconds % 3600) / 60);
      const seconds = durationInSeconds % 60;
      
      const formattedDuration = [
        hours.toString().padStart(2, '0'),
        minutes.toString().padStart(2, '0'),
        seconds.toString().padStart(2, '0')
      ].join(':');
      
      setFormData(prev => ({ ...prev, duration: formattedDuration }));
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.categories.create({
        ...categoryFormData,
        type: 'video'
      });
      if (res.success) {
        toastSuccess('Category added successfully', 'Video Management');
        fetchCategories();
        setCategoryFormData({ name: '', description: '' });
      }
    } catch (err) {
      toastError('Failed to add category', 'Video Management');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (window.confirm('Delete this category?')) {
      try {
        await api.categories.delete(id);
        toastSuccess('Category deleted', 'Video Management');
        fetchCategories();
      } catch (err) {
        toastError('Failed to delete category', 'Video Management');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    
    try {
      let finalUrl = formData.url;
      let finalThumbnail = formData.thumbnail;

      // Handle File Upload for Archive
      if (activeTab === 'archive' && selectedFile && !editingItem) {
        setUploadProgress(10);
        const uploadRes = await api.upload.uploadSingle(selectedFile, 'videos');
        if (uploadRes.success) {
          finalUrl = uploadRes.data.url;
          finalThumbnail = uploadRes.data.thumbnailUrl || '';
          setUploadProgress(90);
        } else {
          throw new Error('Upload failed');
        }
      }

      if (activeTab === 'streams') {
        const streamData = {
          title: formData.title,
          description: formData.description,
          streamUrl: formData.url,
          isLive: formData.isLive,
          scheduledTime: formData.scheduledTime
        };
        
        if (editingItem) {
          const res = await api.videos.updateStream(editingItem.id, streamData);
          if (res.success) {
            toastSuccess('Live stream updated successfully', 'Video Management');
            fetchData();
          }
        } else {
          const res = await api.videos.createStream(streamData);
          if (res.success) {
            toastSuccess('New live stream added', 'Video Management');
            fetchData();
          }
        }
      } else {
        const videoData = {
          title: formData.title,
          description: formData.description,
          videoUrl: finalUrl,
          thumbnail: finalThumbnail,
          duration: formData.duration,
          category: formData.category,
          isPublished: formData.isPublished
        };
        
        if (editingItem) {
          const res = await api.videos.updateVideo(editingItem.id, videoData);
          if (res.success) {
            toastSuccess('Archive video updated successfully', 'Video Management');
            fetchData();
          }
        } else {
          const res = await api.videos.createVideo(videoData);
          if (res.success) {
            toastSuccess('New video added to archive', 'Video Management');
            fetchData();
          }
        }
      }
      resetForm();
    } catch (err) {
      console.error('Save error:', err);
      toastError('Failed to save video information', 'Video Management');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      url: '',
      thumbnail: '',
      scheduledTime: '',
      category: '',
      duration: '',
      isLive: false,
      isPublished: true
    });
    setSelectedFile(null);
    setShowAddForm(false);
    setEditingItem(null);
    setThumbnailFile(null);
    setVideoFile(null);
  };

  const handleEdit = (item: LiveStream | VideoArchive) => {
    setEditingItem(item);
    if ('streamUrl' in item) {
      // It's a LiveStream
      setFormData({
        title: item.title,
        description: item.description,
        url: item.streamUrl,
        scheduledTime: item.scheduledTime ? new Date(item.scheduledTime).toISOString().slice(0, 16) : '',
        category: 'mass',
        duration: '',
        thumbnail: '',
        isLive: item.isLive,
        isPublished: true
      });
    } else {
      // It's a VideoArchive
      setFormData({
        title: item.title,
        description: item.description,
        url: item.videoUrl,
        scheduledTime: '',
        duration: item.duration,
        category: item.category,
        thumbnail: '',
        isLive: false,
        isPublished: item.isPublished
      });
    }
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        if (activeTab === 'streams') {
          await api.videos.deleteStream(id);
        } else {
          await api.videos.deleteVideo(id);
        }
        toastSuccess('Item deleted successfully', 'Video Management');
        fetchData();
      } catch (err) {
        toastError('Failed to delete item', 'Video Management');
      }
    }
  };

  const togglePublished = async (id: string) => {
    const video = videoArchive.find(v => v.id === id);
    if (!video) return;

    try {
      const newState = !video.isPublished;
      await api.videos.updateVideo(id, { isPublished: newState });
      toastSuccess(newState ? 'Video published' : 'Video set to draft', 'Video Management');
      fetchData();
    } catch (err) {
      toastError('Failed to update status', 'Video Management');
    }
  };

  return (
    <div className="video-manager">
      {/* Hidden Video for duration calculation */}
      <video 
        ref={videoRef} 
        style={{ display: 'none' }} 
        onLoadedMetadata={handleVideoMetadata}
      />

      <div className="video-manager-header">
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            className="btn btn-secondary"
            onClick={() => setShowCategoryModal(true)}
          >
            <Tags size={20} />
            Manage Categories
          </button>
          <button 
            className="btn btn-primary"
            onClick={() => setShowAddForm(true)}
          >
            <Plus size={20} />
            Add {activeTab === 'streams' ? 'Stream' : 'Video'}
          </button>
        </div>
      </div>
      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="video-tabs">
        <button 
          className={`tab-button ${activeTab === 'streams' ? 'active' : ''}`}
          onClick={() => setActiveTab('streams')}
        >
          <Video size={20} />
          Live Streams
        </button>
        <button 
          className={`tab-button ${activeTab === 'archive' ? 'active' : ''}`}
          onClick={() => setActiveTab('archive')}
        >
          <Eye size={20} />
          Video Archive
        </button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="video-form-modal">
          <div className="video-form">
            <h3>{editingItem ? 'Edit' : 'Add'} {activeTab === 'streams' ? 'Stream' : 'Video'}</h3>
            
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                  />
                </div>

              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                />
              </div>

              {activeTab === 'streams' ? (
                <div className="form-group">
                  <label>Stream URL</label>
                  <input
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData({...formData, url: e.target.value})}
                    required
                  />
                </div>
              ) : !editingItem && (
                <div className="video-upload-section">
                  <label>Upload Video</label>
                  {!selectedFile ? (
                    <div 
                      {...getRootProps()} 
                      className={`video-dropzone ${isDragActive ? 'active' : ''}`}
                    >
                      <input {...getInputProps()} />
                      <Upload size={48} />
                      {isDragActive ? (
                        <p>Drop the video here...</p>
                      ) : (
                        <p>Drag & drop a video here, or click to select</p>
                      )}
                    </div>
                  ) : (
                    <div className="selected-file-info">
                      <div className="file-details">
                        <FileVideo size={32} className="text-primary" />
                        <div>
                          <p className="file-name">{selectedFile.name}</p>
                          <p className="file-size">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                        </div>
                      </div>
                      {!isUploading && (
                        <button 
                          type="button" 
                          onClick={() => setSelectedFile(null)}
                          className="btn btn-sm btn-danger"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  )}
                  {isUploading && (
                    <div className="upload-progress-container">
                      <div className="progress-bar-bg">
                        <div 
                          className="progress-bar-fill" 
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <div className="progress-text">
                        <span>Uploading...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'streams' ? (
                <div className="form-row">
                  <div className="form-group">
                    <label>Scheduled Time</label>
                    <input
                      type="datetime-local"
                      value={formData.scheduledTime}
                      onChange={(e) => setFormData({...formData, scheduledTime: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.isLive}
                        onChange={(e) => setFormData({...formData, isLive: e.target.checked})}
                      />
                      Currently Live
                    </label>
                  </div>
                </div>
              ) : (
                <div className="form-row">
                  <div className="form-group">
                    <label>Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.isPublished}
                        onChange={(e) => setFormData({...formData, isPublished: e.target.checked})}
                      />
                      Publish Immediately
                    </label>
                  </div>
                </div>
              )}

              <div className="form-actions">
                <button 
                  type="button" 
                  onClick={resetForm} 
                  className="btn btn-secondary"
                  disabled={isUploading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={isUploading || (activeTab === 'archive' && !selectedFile && !editingItem)}
                >
                  {isUploading ? 'Saving...' : (editingItem ? 'Update' : 'Add')} {activeTab === 'streams' ? 'Stream' : 'Video'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Content List */}
      <div className="video-content">
        {activeTab === 'streams' ? (
          <div className="streams-list">
            {liveStreams.length === 0 ? (
              <div className="empty-state">
                <Video size={48} />
                <h3>No Live Streams</h3>
                <p>Add your first live stream to get started.</p>
              </div>
            ) : (
              <div className="video-grid">
                {liveStreams.map(stream => (
                  <div key={stream.id} className={`video-item ${stream.isLive ? 'live' : ''}`}>
                    <div className="video-thumbnail">
                      {stream.thumbnail ? (
                        <img src={stream.thumbnail} alt={stream.title} />
                      ) : (
                        <div className="thumbnail-placeholder-admin">
                          <Video size={32} />
                        </div>
                      )}
                      {stream.isLive && (
                        <div className="live-badge">
                          <span className="live-dot"></span>
                          LIVE
                        </div>
                      )}
                      <div className="viewer-count">
                        <Users size={16} />
                        {stream.viewers}
                      </div>
                    </div>
                    
                    <div className="video-info">
                      <h4>{stream.title}</h4>
                      <p>{stream.description}</p>
                      
                      <div className="video-meta">
                        <div className="meta-item">
                          <Calendar size={16} />
                          {new Date(stream.scheduledTime).toLocaleDateString()}
                        </div>
                        <div className="meta-item">
                          <Clock size={16} />
                          {new Date(stream.scheduledTime).toLocaleTimeString()}
                        </div>
                      </div>
                      
                      <div className="video-actions">
                        <button 
                          className="btn btn-sm btn-info"
                          onClick={() => setPreviewVideo(stream)}
                          title="Preview"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          className="btn btn-sm btn-secondary"
                          onClick={() => handleEdit(stream)}
                          disabled={processing}
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(stream.id)}
                          disabled={processing}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="archive-list">
            {videoArchive.length === 0 ? (
              <div className="empty-state">
                <Eye size={48} />
                <h3>No Archived Videos</h3>
                <p>Add your first video to get started.</p>
              </div>
            ) : (
              <div className="video-grid">
                {videoArchive.map(video => (
                  <div key={video.id} className={`video-item ${!video.isPublished ? 'unpublished' : ''}`}>
                    <div className="video-thumbnail">
                      {video.thumbnail ? (
                        <img src={video.thumbnail} alt={video.title} />
                      ) : (
                        <div className="video-placeholder">
                          <Video size={48} />
                        </div>
                      )}
                      <div className="video-duration">{video.duration}</div>
                      {!video.isPublished && (
                        <div className="status-badge draft">DRAFT</div>
                      )}
                      {video.isPublished && (
                        <div className="status-badge published">PUBLISHED</div>
                      )}
                    </div>
                    
                    <div className="video-info">
                      <h4>{video.title}</h4>
                      <p>{video.description}</p>
                      
                      <div className="video-meta">
                        <div className="meta-item">
                          <Calendar size={16} />
                          {video.publishedAt ? new Date(video.publishedAt).toLocaleDateString() : new Date(video.createdAt).toLocaleDateString()}
                        </div>
                        <div className="meta-item">
                          <Eye size={16} />
                          {video.views} views
                        </div>
                        <div className="category-badge">
                          {video.category}
                        </div>
                      </div>
                      
                      <div className="video-actions">
                        <button 
                          className="btn btn-sm btn-info"
                          onClick={() => setPreviewVideo(video)}
                          title="Preview"
                        >
                          <Play size={16} />
                        </button>
                        <button 
                          className="btn btn-sm btn-secondary"
                          onClick={() => handleEdit(video)}
                          disabled={processing}
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          className={`btn btn-sm ${video.isPublished ? 'btn-warning' : 'btn-success'}`}
                          onClick={() => togglePublished(video.id)}
                          disabled={processing}
                        >
                          {video.isPublished ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                        <a 
                          className="btn btn-sm btn-primary"
                          href={video.videoUrl}
                          download
                          target="_blank"
                          rel="noreferrer"
                          title="Download Video"
                        >
                          Download
                        </a>
                        <button 
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(video.id)}
                          disabled={processing}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Category Management Modal */}
      {showCategoryModal && (
        <div className="video-form-modal">
          <div className="video-form category-modal">
            <div className="category-manager-header">
              <h3>Manage Video Categories</h3>
              <button 
                className="btn btn-sm btn-danger"
                onClick={() => setShowCategoryModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCategorySubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Category Name</label>
                  <input
                    type="text"
                    value={categoryFormData.name}
                    onChange={(e) => setCategoryFormData({...categoryFormData, name: e.target.value})}
                    placeholder="e.g. Choir Performances"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <input
                    type="text"
                    value={categoryFormData.description}
                    onChange={(e) => setCategoryFormData({...categoryFormData, description: e.target.value})}
                    placeholder="Brief description"
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary">
                <Plus size={16} /> Add Category
              </button>
            </form>

            <div className="category-table-container">
              <table className="category-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.length === 0 ? (
                    <tr>
                      <td colSpan={3} style={{ textAlign: 'center' }}>No categories found</td>
                    </tr>
                  ) : (
                    categories.map(cat => (
                      <tr key={cat.id}>
                        <td>{cat.name}</td>
                        <td>{cat.description}</td>
                        <td>
                          <button 
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDeleteCategory(cat.id)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Video Preview Modal */}
      {previewVideo && (
        <div className="video-form-modal" onClick={() => setPreviewVideo(null)}>
          <div className="video-player-container admin-player" onClick={e => e.stopPropagation()}>
            <button className="close-player" onClick={() => setPreviewVideo(null)}>
              <X size={24} />
            </button>
            <div className="video-wrapper">
              <video 
                src={'videoUrl' in previewVideo ? previewVideo.videoUrl : previewVideo.streamUrl} 
                controls 
                autoPlay 
                className="main-video"
              >
                Your browser does not support the video tag.
              </video>
            </div>
            <div className="player-info">
              <h3>{previewVideo.title}</h3>
              <p>{previewVideo.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoManager;
