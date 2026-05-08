import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, Video, Calendar, Clock, Users } from 'lucide-react';
import { LiveStream, VideoArchive } from '../../contexts/AdminContext';
import './VideoManager.css';
import { api } from '../../services/api';

const VideoManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'streams' | 'archive'>('streams');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<LiveStream | VideoArchive | null>(null);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [liveStreams, setLiveStreams] = useState<LiveStream[]>([]);
  const [videoArchive, setVideoArchive] = useState<VideoArchive[]>([]);
  const [playerItem, setPlayerItem] = useState<VideoArchive | null>(null);

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
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setMessage(null);
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        api.setAuthToken(token);
      }
      let thumbnailUrl = formData.thumbnail;
      if (thumbnailFile) {
        const up = await tryUpload(thumbnailFile, 'image');
        thumbnailUrl = (up.data as any)?.url || (up.data as any)?.file?.url || (up.data as any)?.path || (up as any)?.url || thumbnailUrl;
      }
      if (activeTab === 'streams') {
        const payload = {
          title: formData.title,
          description: formData.description,
          streamUrl: formData.url,
          scheduledTime: formData.scheduledTime,
          thumbnail: thumbnailUrl,
          isLive: formData.isLive,
        };
        if (editingItem && 'streamUrl' in editingItem) {
          const res = await api.videos.updateStream(editingItem.id, payload);
          if (res.success) {
            setMessage({ type: 'success', text: 'Stream updated' });
          } else {
            throw new Error(res.message || 'Failed to update stream');
          }
        } else {
          const res = await api.videos.createStream(payload);
          if (!res.success) throw new Error(res.message || 'Failed to create stream');
          setMessage({ type: 'success', text: 'Stream created' });
        }
        const streamsRes = await api.videos.getStreams();
        const streams: any[] = (streamsRes.data?.items) || (streamsRes.data?.streams) || (Array.isArray(streamsRes.data) ? streamsRes.data : []);
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
      } else {
        let videoUrl = formData.url;
        if (videoFile) {
          const upv = await tryUpload(videoFile, 'video');
          videoUrl = (upv.data as any)?.url || (upv.data as any)?.file?.url || (upv.data as any)?.path || (upv as any)?.url || videoUrl;
        }
        const payload = {
          title: formData.title,
          description: formData.description,
          videoUrl,
          category: formData.category,
          duration: formData.duration || undefined,
          thumbnail: thumbnailUrl || undefined,
        };
        if (editingItem && !('streamUrl' in editingItem)) {
          const res = await api.videos.updateVideo(editingItem.id, payload);
          if (res.success) {
            setMessage({ type: 'success', text: 'Video updated' });
          } else {
            throw new Error(res.message || 'Failed to update video');
          }
        } else {
          const res = await api.videos.createVideo(payload);
          if (!res.success) throw new Error(res.message || 'Failed to create video');
          setMessage({ type: 'success', text: 'Video added' });
        }
        const archiveRes = await api.videos.getArchive({ published: true });
        const videos: any[] = (archiveRes.data?.items) || (archiveRes.data?.videos) || (Array.isArray(archiveRes.data) ? archiveRes.data : []);
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
      }
      resetForm();
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Operation failed' });
    } finally {
      setProcessing(false);
    }
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

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      setProcessing(true);
      setMessage(null);
      try {
        if (activeTab === 'streams') {
          const res = await api.videos.deleteStream(id);
          if (!res.success) throw new Error(res.message || 'Failed to delete stream');
          const streamsRes = await api.videos.getStreams();
          const streams: any[] = (streamsRes.data?.items) || (streamsRes.data?.streams) || (Array.isArray(streamsRes.data) ? streamsRes.data : []);
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
        } else {
          const res = await api.videos.deleteVideo(id);
          if (!res.success) throw new Error(res.message || 'Failed to delete video');
          const archiveRes = await api.videos.getArchive({ published: true });
          const videos: any[] = (archiveRes.data?.items) || (archiveRes.data?.videos) || (Array.isArray(archiveRes.data) ? archiveRes.data : []);
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
        }
        setMessage({ type: 'success', text: 'Deleted successfully' });
      } catch (err) {
        setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Delete failed' });
      } finally {
        setProcessing(false);
      }
    }
  };

  const togglePublished = async (id: string) => {
    setProcessing(true);
    setMessage(null);
    try {
      const current = videoArchive.find(v => v.id === id);
      const res = await api.videos.updateVideo(id, { isPublished: !(current?.isPublished ?? true) });
      if (!res.success) throw new Error(res.message || 'Failed to update publish status');
      const archiveRes = await api.videos.getArchive({ published: true });
      const videos: any[] = (archiveRes.data?.items) || (archiveRes.data?.videos) || (Array.isArray(archiveRes.data) ? archiveRes.data : []);
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
      setMessage({ type: 'success', text: 'Publish status updated' });
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Operation failed' });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="video-manager">
      <div className="video-manager-header">
        <h2>Video Management</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowAddForm(true)}
          disabled={processing}
        >
          <Plus size={20} />
          Add {activeTab === 'streams' ? 'Stream' : 'Video'}
        </button>
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
                
                <div className="form-group">
                  <label>Thumbnail (optional)</label>
                  {formData.thumbnail && !thumbnailFile && (
                    <img src={formData.thumbnail} alt="thumbnail" style={{ width: 120, height: 68, objectFit: 'cover', borderRadius: 8, marginBottom: 8 }} />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
                  />
                  <div className="url-input">
                    <label>Or enter thumbnail URL:</label>
                    <input
                      type="url"
                      value={formData.thumbnail}
                      onChange={(e) => setFormData({...formData, thumbnail: e.target.value})}
                    />
                  </div>
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
                <label>{activeTab === 'streams' ? 'Stream URL' : 'Video URL or Upload'}</label>
                {activeTab === 'archive' && (
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                  />
                )}
                <div className="url-input">
                  <input
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData({...formData, url: e.target.value})}
                    placeholder={activeTab === 'archive' ? 'https://example.com/video.mp4 (optional if uploading)' : 'https://example.com/live'}
                    required={activeTab === 'streams'}
                  />
                </div>
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
                <button type="submit" className="btn btn-primary" disabled={processing}>
                  {processing ? (editingItem ? 'Updating...' : 'Saving...') : `${editingItem ? 'Update' : 'Add'} ${activeTab === 'streams' ? 'Stream' : 'Video'}`}
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
                          disabled={processing}
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          className="btn btn-sm btn-primary"
                          onClick={() => setPlayerItem(video)}
                          title="Play"
                        >
                          Play
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
      {playerItem && (
        <div className="video-form-modal" onClick={() => setPlayerItem(null)}>
          <div className="video-form" onClick={(e) => e.stopPropagation()}>
            <h3>Playing: {playerItem.title}</h3>
            {/youtube|youtu\.be/.test(playerItem.videoUrl) ? (
              <iframe
                src={playerItem.videoUrl}
                title={playerItem.title}
                style={{ width: '100%', height: 360, border: 0, borderRadius: 8 }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video
                controls
                src={playerItem.videoUrl}
                style={{ width: '100%', borderRadius: 8 }}
              />
            )}
            <div className="form-actions" style={{ marginTop: 12 }}>
              <a href={playerItem.videoUrl} download target="_blank" rel="noreferrer" className="btn btn-primary">Download</a>
              <button className="btn btn-secondary" onClick={() => setPlayerItem(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoManager;
