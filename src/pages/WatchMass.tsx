
import React, { useState } from 'react';
import { Play, Calendar, Clock, Users, Video, Eye, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import CustomVideoPlayer from '../components/common/CustomVideoPlayer';

import './WatchMass.css';

interface LiveStream {
  id: string;
  title: string;
  description: string;
  streamUrl: string;
  isLive: boolean;
  scheduledTime: string;
  viewers: number;
  thumbnail: string;
}

interface VideoArchive {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnail: string;
  duration: string;
  publishedDate: string;
  views: number;
  category: string;
}

interface VideoCategory {
  id: string;
  name: string;
  description: string;
}

const WatchMass: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'live' | 'archive'>('live');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(false);

  const [liveStreams, setLiveStreams] = useState<LiveStream[]>([]);

  const [videoArchive, setVideoArchive] = useState<VideoArchive[]>([]);
  const [categories, setCategories] = useState<VideoCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<VideoArchive | LiveStream | null>(null);

  // Fetch data on mount
  React.useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [streamsRes, archiveRes, categoriesRes] = await Promise.all([
          api.videos.getStreams({ active: true }),
          api.videos.getArchive({ published: true }),
          api.categories.getByType('video')
        ]);
        
        if (streamsRes.success) {
          const now = new Date();
          setLiveStreams((streamsRes.data?.items || streamsRes.data || []).map((s: any) => {
            const scheduledTime = new Date(s.scheduled_time || s.scheduledTime);
            return {
              ...s,
              streamUrl: s.stream_url || s.streamUrl,
              // Automatically treat as live if marked so OR if the scheduled time has passed
              isLive: (s.is_live ?? s.isLive) || scheduledTime <= now,
              scheduledTime: s.scheduled_time || s.scheduledTime,
              viewers: s.viewers ?? 0,
              thumbnail: s.thumbnail || ''
            };
          }));
        }
        
        if (archiveRes.success) {
          setVideoArchive((archiveRes.data?.items || archiveRes.data || []).map((v: any) => ({
            ...v,
            videoUrl: v.video_url || v.videoUrl,
            publishedDate: v.published_at || v.publishedAt || v.created_at,
            views: v.views ?? 0,
            category: (v.category || 'mass').toLowerCase()
          })));
        }

        if (categoriesRes.success) {
          setCategories(categoriesRes.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch videos:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Refresh every minute to update viewer counts and "Live" status
    const interval = setInterval(async () => {
      try {
        const streamsRes = await api.videos.getStreams({ active: true });
        if (streamsRes.success) {
          const now = new Date();
          setLiveStreams((streamsRes.data?.items || streamsRes.data || []).map((s: any) => {
            const scheduledTime = new Date(s.scheduled_time || s.scheduledTime);
            return {
              ...s,
              streamUrl: s.stream_url || s.streamUrl,
              isLive: (s.is_live ?? s.isLive) || scheduledTime <= now,
              scheduledTime: s.scheduled_time || s.scheduledTime,
              viewers: s.viewers ?? 0,
              thumbnail: s.thumbnail || ''
            };
          }));
        }
      } catch (err) {
        console.error('Failed to refresh stream data:', err);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Handle viewer tracking when stream modal opens/closes
  React.useEffect(() => {
    if (selectedVideo && 'streamUrl' in selectedVideo) {
      const streamId = selectedVideo.id;
      api.videos.startViewer(streamId).catch(err => console.error('Failed to start viewer:', err));
      
      // Poll to check if stream is still live
      const statusCheck = setInterval(async () => {
        try {
          const res = await api.videos.getStreams();
          if (res.success) {
            const currentStream = (res.data?.items || res.data || []).find((s: any) => s.id === streamId);
            if (currentStream) {
              const now = new Date();
              const scheduledTime = new Date(currentStream.scheduled_time || currentStream.scheduledTime);
              const isActuallyLive = (currentStream.is_live ?? currentStream.isLive) || scheduledTime <= now;
              
              if (!isActuallyLive) {
                // Stream was truly ended
                alert("The live stream has ended.");
                setSelectedVideo(null);
              }
            }
          }
        } catch (err) {
          console.error('Failed to check stream status:', err);
        }
      }, 30000);

      return () => {
        clearInterval(statusCheck);
        api.videos.stopViewer(streamId).catch(err => console.error('Failed to stop viewer:', err));
      };
    }
  }, [selectedVideo]);


  const filteredVideos = videoArchive.filter(video => 
    selectedCategory === 'all' || video.category === selectedCategory
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="watch-mass">
      {/* Hero Section */}
      <section className="watch-mass-hero">
        <div className="container">
          <div className="hero-content">
            <h1>Watch Mass Online</h1>
            <p>Join our parish community from anywhere in the world. Experience our masses, events, and special services through live streaming and video archives.</p>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <section className="watch-mass-content">
        <div className="container">
          <div className="content-tabs">
            <button 
              className={`tab-button ${activeTab === 'live' ? 'active' : ''}`}
              onClick={() => setActiveTab('live')}
            >
              <Video size={20} />
              Live Streams
            </button>
            <button 
              className={`tab-button ${activeTab === 'archive' ? 'active' : ''}`}
              onClick={() => setActiveTab('archive')}
            >
              <Play size={20} />
              Video Archive
            </button>
          </div>

          {/* Live Streams Tab */}
          {activeTab === 'live' && (
            <div className="live-streams-section">
              <h2>Live Streams & Scheduled Events</h2>
              
              {liveStreams.length === 0 ? (
                <div className="no-streams">
                  <Video size={48} />
                  <h3>No Live Streams Available</h3>
                  <p>Check back later for scheduled masses and events.</p>
                </div>
              ) : (
                <div className="streams-grid">
                  {liveStreams.map(stream => (
                    <div 
                      key={stream.id} 
                      className="stream-card"
                      onClick={() => stream.isLive && setSelectedVideo(stream)}
                      style={{ cursor: stream.isLive ? 'pointer' : 'default' }}
                    >
                      <div className="stream-thumbnail">
                        {stream.thumbnail ? (
                          <img src={stream.thumbnail} alt={stream.title} className="thumbnail-img" />
                        ) : (
                          <div className="thumbnail-placeholder">
                            <Video size={48} />
                          </div>
                        )}
                        {stream.isLive && (
                          <div className="live-indicator">
                            <span className="live-dot"></span>
                            LIVE
                          </div>
                        )}
                        {stream.isLive && (
                          <div className="viewer-count">
                            <Users size={16} />
                            {stream.viewers} watching
                          </div>
                        )}
                      </div>
                      
                      <div className="stream-info">
                        <h3>{stream.title}</h3>
                        <p>{stream.description}</p>
                        
                        <div className="stream-meta">
                          <div className="time-info">
                            <Calendar size={16} />
                            {formatDate(stream.scheduledTime)}
                          </div>
                          <div className="time-info">
                            <Clock size={16} />
                            {formatTime(stream.scheduledTime)}
                          </div>
                        </div>
                        
                        <button 
                          className={`watch-button ${stream.isLive ? 'live' : 'scheduled'}`}
                          disabled={!stream.isLive}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (stream.isLive) setSelectedVideo(stream);
                          }}
                        >
                          {stream.isLive ? 'Watch Live' : 'Scheduled'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Video Archive Tab */}
          {activeTab === 'archive' && (
            <div className="video-archive-section">
              <div className="archive-header">
                <h2>Video Archive</h2>
                
                <div className="category-filter">
                  <select 
                    value={selectedCategory} 
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="category-select"
                  >
                    <option value="all">All Categories</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.name.toLowerCase()}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {loading ? (
                <div className="no-videos">
                  <Play size={48} />
                  <h3>Loading videos…</h3>
                </div>
              ) : filteredVideos.length === 0 ? (
                <div className="no-videos">
                  <Play size={48} />
                  <h3>No Videos Available</h3>
                  <p>No videos found in the selected category.</p>
                  <p className="admin-tip">Tip: Ensure videos are marked as "Published" in the Video Manager.</p>
                </div>
              ) : (
                <div className="videos-grid">
                  {filteredVideos.map(video => (
                    <div 
                      key={video.id} 
                      className="video-card"
                      onClick={() => {
                        setSelectedVideo(video);
                        api.videos.incrementViews(video.id, 'archive');
                      }}
                    >
                      <div className="video-thumbnail">
                        {video.thumbnail ? (
                          <img src={video.thumbnail} alt={video.title} />
                        ) : (
                          <div className="thumbnail-fallback">
                            <Play size={48} />
                          </div>
                        )}
                        <div className="video-duration">{video.duration}</div>
                        <div className="play-overlay">
                          <Play size={24} />
                        </div>
                      </div>
                      
                      <div className="video-info">
                        <h3>{video.title}</h3>
                        <p>{video.description}</p>
                        
                        <div className="video-meta">
                          <div className="publish-date">
                            <Calendar size={16} />
                            {formatDate(video.publishedDate)}
                          </div>
                          <div className="view-count">
                            <Eye size={16} />
                            {video.views} views
                          </div>
                        </div>
                        
                        <div className="video-category">
                          <span className={`category-badge ${video.category}`}>
                            {video.category.charAt(0).toUpperCase() + video.category.slice(1)}
                          </span>
                        </div>
                        <div className="video-actions" style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                          <a href={video.videoUrl} target="_blank" rel="noreferrer" className="watch-button">
                            Play
                          </a>
                          <a href={video.videoUrl} download target="_blank" rel="noreferrer" className="watch-button">
                            Download
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Video Player Modal */}
      {selectedVideo && (
        <div className="video-player-overlay" onClick={() => setSelectedVideo(null)}>
          <div className="video-player-container" onClick={e => e.stopPropagation()}>
            <button className="close-player" onClick={() => setSelectedVideo(null)}>
              <X size={24} />
            </button>
            <div className="video-wrapper" style={{ padding: 0 }}>
              <CustomVideoPlayer 
                src={'videoUrl' in selectedVideo ? selectedVideo.videoUrl : selectedVideo.streamUrl} 
                title={selectedVideo.title}
              />
            </div>
            <div className="player-info">
              <h2>{selectedVideo.title}</h2>
              <p>{selectedVideo.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WatchMass;
