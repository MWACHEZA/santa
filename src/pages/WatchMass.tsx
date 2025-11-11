import React, { useState } from 'react';
import { Play, Calendar, Clock, Users, Video, Eye } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
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
  category: 'mass' | 'event' | 'sermon' | 'special';
}

const WatchMass: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'live' | 'archive'>('live');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  // const { user } = useAuth(); // Currently unused

  // Mock data - replace with actual API calls
  const [liveStreams] = useState<LiveStream[]>([
    {
      id: '1',
      title: 'Sunday Mass - Live',
      description: 'Join us for our weekly Sunday Mass celebration',
      streamUrl: 'https://www.youtube.com/embed/live_stream_id',
      isLive: true,
      scheduledTime: '2024-11-10T09:00:00',
      viewers: 45,
      thumbnail: '/api/placeholder/400/225'
    },
    {
      id: '2',
      title: 'Evening Prayer Service',
      description: 'Daily evening prayer and reflection',
      streamUrl: 'https://www.youtube.com/embed/evening_stream_id',
      isLive: false,
      scheduledTime: '2024-11-10T18:00:00',
      viewers: 0,
      thumbnail: '/api/placeholder/400/225'
    }
  ]);

  const [videoArchive] = useState<VideoArchive[]>([
    {
      id: '1',
      title: 'Sunday Mass - November 3, 2024',
      description: 'Complete Sunday Mass service with homily',
      videoUrl: 'https://www.youtube.com/embed/video_id_1',
      thumbnail: '/api/placeholder/400/225',
      duration: '1:15:30',
      publishedDate: '2024-11-03',
      views: 234,
      category: 'mass'
    },
    {
      id: '2',
      title: 'All Saints Day Special Service',
      description: 'Special celebration for All Saints Day',
      videoUrl: 'https://www.youtube.com/embed/video_id_2',
      thumbnail: '/api/placeholder/400/225',
      duration: '45:20',
      publishedDate: '2024-11-01',
      views: 156,
      category: 'special'
    },
    {
      id: '3',
      title: 'Youth Ministry Event',
      description: 'Youth gathering and worship session',
      videoUrl: 'https://www.youtube.com/embed/video_id_3',
      thumbnail: '/api/placeholder/400/225',
      duration: '32:15',
      publishedDate: '2024-10-28',
      views: 89,
      category: 'event'
    }
  ]);

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
                    <div key={stream.id} className={`stream-card ${stream.isLive ? 'live' : 'scheduled'}`}>
                      <div className="stream-thumbnail">
                        <img src={stream.thumbnail} alt={stream.title} />
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
                    <option value="mass">Sunday Mass</option>
                    <option value="event">Events</option>
                    <option value="sermon">Sermons</option>
                    <option value="special">Special Services</option>
                  </select>
                </div>
              </div>

              {filteredVideos.length === 0 ? (
                <div className="no-videos">
                  <Play size={48} />
                  <h3>No Videos Available</h3>
                  <p>No videos found in the selected category.</p>
                </div>
              ) : (
                <div className="videos-grid">
                  {filteredVideos.map(video => (
                    <div key={video.id} className="video-card">
                      <div className="video-thumbnail">
                        <img src={video.thumbnail} alt={video.title} />
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
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default WatchMass;
