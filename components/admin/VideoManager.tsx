import React, { useState } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, Video, Calendar, Clock, Users } from 'lucide-react';
import { LiveStream, VideoArchive } from '../../contexts/AdminContext';
import './VideoManager.css';

const VideoManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'streams' | 'archive'>('streams');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<LiveStream | VideoArchive | null>(null);

  // Mock data - replace with actual API calls
  const [liveStreams, setLiveStreams] = useState<LiveStream[]>([
    {
      id: '1',
      title: 'Sunday Mass - Live',
      description: 'Weekly Sunday Mass celebration',
      streamUrl: 'https://www.youtube.com/embed/live_stream_id',
      isLive: true,
      scheduledTime: '2024-11-10T09:00:00',
      viewers: 45,
      thumbnail: '/api/placeholder/400/225',
      createdBy: 'admin',
      createdAt: '2024-11-01T10:00:00'
    }
  ]);

  const [videoArchive, setVideoArchive] = useState<VideoArchive[]>([
    {
      id: '1',
      title: 'Sunday Mass - November 3, 2024',
      description: 'Complete Sunday Mass service with homily',
      videoUrl: 'https://www.youtube.com/embed/video_id_1',
      thumbnail: '/api/placeholder/400/225',
      duration: '1:15:30',
      publishedDate: '2024-11-03',
      views: 234,
      category: 'mass',
      createdBy: 'admin',
      createdAt: '2024-11-03T12:00:00',
      isPublished: true
    }
  ]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
    thumbnail: '',
    scheduledTime: '',
    category: 'mass' as VideoArchive['category'],
    duration: '',
    isLive: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (activeTab === 'streams') {
      const newStream: LiveStream = {
        id: Date.now().toString(),
        title: formData.title,
        description: formData.description,
        streamUrl: formData.url,
        isLive: formData.isLive,
        scheduledTime: formData.scheduledTime,
        viewers: 0,
        thumbnail: formData.thumbnail,
        createdBy: 'admin',
        createdAt: new Date().toISOString()
      };
      
      if (editingItem) {
        setLiveStreams(streams => streams.map(s => s.id === editingItem.id ? { ...newStream, id: editingItem.id } : s));
      } else {
        setLiveStreams(streams => [...streams, newStream]);
      }
    } else {
      const newVideo: VideoArchive = {
        id: Date.now().toString(),
        title: formData.title,
        description: formData.description,
        videoUrl: formData.url,
        thumbnail: formData.thumbnail,
        duration: formData.duration,
        publishedDate: new Date().toISOString().split('T')[0],
        views: 0,
        category: formData.category,
        createdBy: 'admin',
        createdAt: new Date().toISOString(),
        isPublished: true
      };
      
      if (editingItem) {
        setVideoArchive(videos => videos.map(v => v.id === editingItem.id ? { ...newVideo, id: editingItem.id } : v));
      } else {
        setVideoArchive(videos => [...videos, newVideo]);
      }
    }
    
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      url: '',
      thumbnail: '',
      scheduledTime: '',
      category: 'mass',
      duration: '',
      isLive: false
    });
    setShowAddForm(false);
    setEditingItem(null);
  };

  const handleEdit = (item: LiveStream | VideoArchive) => {
    setEditingItem(item);
    if ('streamUrl' in item) {
      // It's a LiveStream
      setFormData({
        title: item.title,
        description: item.description,
        url: item.streamUrl,
        thumbnail: item.thumbnail,
        scheduledTime: item.scheduledTime,
        category: 'mass',
        duration: '',
        isLive: item.isLive
      });
    } else {
      // It's a VideoArchive
      setFormData({
        title: item.title,
        description: item.description,
        url: item.videoUrl,
        thumbnail: item.thumbnail,
        scheduledTime: '',
        category: item.category,
        duration: item.duration,
        isLive: false
      });
    }
    setShowAddForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      if (activeTab === 'streams') {
        setLiveStreams(streams => streams.filter(s => s.id !== id));
      } else {
        setVideoArchive(videos => videos.filter(v => v.id !== id));
      }
    }
  };

  const togglePublished = (id: string) => {
    setVideoArchive(videos => 
      videos.map(v => 
        v.id === id ? { ...v, isPublished: !v.isPublished } : v
      )
    );
  };

  return (
    <div className="video-manager">
      <div className="video-manager-header">
        <h2>Video Management</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowAddForm(true)}
        >
          <Plus size={20} />
          Add {activeTab === 'streams' ? 'Stream' : 'Video'}
        </button>
      </div>

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
                
                <div className="form-group">
                  <label>Thumbnail URL</label>
                  <input
                    type="url"
                    value={formData.thumbnail}
                    onChange={(e) => setFormData({...formData, thumbnail: e.target.value})}
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

              <div className="form-group">
                <label>{activeTab === 'streams' ? 'Stream URL' : 'Video URL'}</label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({...formData, url: e.target.value})}
                  required
                />
              </div>

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
                      onChange={(e) => setFormData({...formData, category: e.target.value as VideoArchive['category']})}
                    >
                      <option value="mass">Mass</option>
                      <option value="event">Event</option>
                      <option value="sermon">Sermon</option>
                      <option value="special">Special</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Duration (HH:MM:SS)</label>
                    <input
                      type="text"
                      value={formData.duration}
                      onChange={(e) => setFormData({...formData, duration: e.target.value})}
                      placeholder="1:15:30"
                    />
                  </div>
                </div>
              )}

              <div className="form-actions">
                <button type="button" onClick={resetForm} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingItem ? 'Update' : 'Add'} {activeTab === 'streams' ? 'Stream' : 'Video'}
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
                      <img src={stream.thumbnail} alt={stream.title} />
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
                          className="btn btn-sm btn-secondary"
                          onClick={() => handleEdit(stream)}
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(stream.id)}
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
                      <img src={video.thumbnail} alt={video.title} />
                      <div className="video-duration">{video.duration}</div>
                      {!video.isPublished && (
                        <div className="unpublished-badge">DRAFT</div>
                      )}
                    </div>
                    
                    <div className="video-info">
                      <h4>{video.title}</h4>
                      <p>{video.description}</p>
                      
                      <div className="video-meta">
                        <div className="meta-item">
                          <Calendar size={16} />
                          {new Date(video.publishedDate).toLocaleDateString()}
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
                          className="btn btn-sm btn-secondary"
                          onClick={() => handleEdit(video)}
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          className={`btn btn-sm ${video.isPublished ? 'btn-warning' : 'btn-success'}`}
                          onClick={() => togglePublished(video.id)}
                        >
                          {video.isPublished ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                        <button 
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(video.id)}
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
    </div>
  );
};

export default VideoManager;
