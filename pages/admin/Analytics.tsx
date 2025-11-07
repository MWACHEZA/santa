import React, { useState } from 'react';
import { 
  Users, 
  Eye, 
  Video, 
  TrendingUp, 
  Clock, 
  Heart, 
  MessageSquare,
  Download,
  BarChart3,
  Activity,
  FileText,
  Printer
} from 'lucide-react';
import { AnalyticsExporter, ExportFormat } from '../../utils/exportUtils';
import './Analytics.css';

interface AnalyticsData {
  users: {
    total: number;
    active: number;
    newThisMonth: number;
    growth: number;
  };
  content: {
    totalViews: number;
    videoViews: number;
    newsViews: number;
    prayerViews: number;
  };
  videos: {
    totalVideos: number;
    liveStreams: number;
    totalWatchTime: string;
    averageViewDuration: string;
  };
  engagement: {
    totalInteractions: number;
    averageSessionTime: string;
    bounceRate: number;
    returnVisitors: number;
  };
  demographics: {
    byGender: Array<{ gender: string; count: number; percentage: number }>;
    byAge: Array<{ ageGroup: string; count: number; percentage: number }>;
    bySection: Array<{ section: string; count: number; percentage: number }>;
    byAssociation: Array<{ association: string; count: number; percentage: number }>;
  };
  popular: {
    pages: Array<{ name: string; views: number; growth: number }>;
    videos: Array<{ title: string; views: number; duration: string }>;
    categories: Array<{ name: string; percentage: number; color: string }>;
  };
}

const Analytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [activeTab, setActiveTab] = useState<'overview' | 'content' | 'users' | 'videos' | 'demographics'>('overview');

  // Updated analytics data to reflect current system features
  const [analyticsData] = useState<AnalyticsData>({
    users: {
      total: 1247,
      active: 342,
      newThisMonth: 89,
      growth: 12.5
    },
    content: {
      totalViews: 45680, // Updated to match image
      videoViews: 18930, // Increased due to Watch Mass feature
      newsViews: 12240,  // Increased news engagement
      prayerViews: 14510 // High prayer engagement
    },
    videos: {
      totalVideos: 67,   // More videos due to Watch Mass archive
      liveStreams: 18,   // Active live streaming
      totalWatchTime: '4,850 hours', // Increased watch time
      averageViewDuration: '24:32'   // Better engagement
    },
    engagement: {
      totalInteractions: 12680,
      averageSessionTime: '4:32', // Matches image
      bounceRate: 28.4,  // Improved due to better content
      returnVisitors: 78.3 // Higher return rate
    },
    demographics: {
      byGender: [
        { gender: 'Female', count: 687, percentage: 58.0 },
        { gender: 'Male', count: 498, percentage: 42.0 }
      ],
      byAge: [
        { ageGroup: '18-30', count: 186, percentage: 14.9 },
        { ageGroup: '31-45', count: 374, percentage: 30.0 },
        { ageGroup: '46-60', count: 436, percentage: 35.0 },
        { ageGroup: '61+', count: 251, percentage: 20.1 }
      ],
      bySection: [
        { section: 'St Gabriel', count: 89, percentage: 8.2 },
        { section: 'St Augustine', count: 76, percentage: 7.0 },
        { section: 'St Mary Magdalena', count: 94, percentage: 8.7 },
        { section: 'St Michael', count: 112, percentage: 10.3 },
        { section: 'St Stephen', count: 67, percentage: 6.2 },
        { section: 'St Francis of Assisi', count: 83, percentage: 7.6 },
        { section: 'St Monica', count: 91, percentage: 8.4 },
        { section: 'St Theresa', count: 78, percentage: 7.2 },
        { section: 'St Bernadette', count: 85, percentage: 7.8 },
        { section: 'St Philomina', count: 72, percentage: 6.6 },
        { section: 'St Peter', count: 98, percentage: 9.0 },
        { section: 'St Bernard', count: 69, percentage: 6.4 },
        { section: 'St Veronica', count: 74, percentage: 6.8 },
        { section: 'St Paul', count: 88, percentage: 8.1 },
        { section: 'St Luke', count: 81, percentage: 7.5 },
        { section: 'St Basil', count: 65, percentage: 6.0 },
        { section: 'St Anthony', count: 92, percentage: 8.5 }
      ],
      byAssociation: [
        { association: 'Missionary Childhood (MCA)', count: 145, percentage: 13.4 },
        { association: 'Catholic Junior Youth (CJA)', count: 89, percentage: 8.2 },
        { association: 'Catholic Senior Youth (CYA)', count: 124, percentage: 11.4 },
        { association: 'Catholic Young Adults (CYAA)', count: 97, percentage: 8.9 },
        { association: 'Most Sacred Heart of Jesus', count: 156, percentage: 14.4 },
        { association: 'Sodality of Our Lady', count: 134, percentage: 12.3 },
        { association: 'St Anne', count: 78, percentage: 7.2 },
        { association: 'St Joseph', count: 92, percentage: 8.5 },
        { association: 'Couples Association', count: 67, percentage: 6.2 },
        { association: 'Focolare', count: 43, percentage: 4.0 },
        { association: 'Women\'s Forum', count: 112, percentage: 10.3 },
        { association: 'Association of Altar Servers', count: 87, percentage: 8.0 }
      ]
    },
    popular: {
      pages: [
        { name: 'Home', views: 12450, growth: 8.2 }, // Updated to match image data
        { name: 'Watch Mass', views: 8920, growth: 25.6 }, // New popular feature
        { name: 'Mass Times', views: 6920, growth: 12.1 }, // From image
        { name: 'Events', views: 6740, growth: 15.3 }, // From image
        { name: 'Gallery', views: 5430, growth: 8.7 }, // From image
        { name: 'Prayers', views: 4340, growth: 5.1 },
        { name: 'Contact', views: 4200, growth: 3.2 }, // From image
        { name: 'News', views: 3890, growth: 18.4 },
        { name: 'Ministries', views: 2560, growth: 22.8 },
        { name: 'Outreach', views: 1890, growth: 16.2 },
        { name: 'Profile Management', views: 1240, growth: 45.8 } // New feature
      ],
      videos: [
        { title: 'Sunday Mass - November 10, 2024 (Live)', views: 2450, duration: '1:18:45' },
        { title: 'All Saints Day Special Service', views: 1890, duration: '45:20' },
        { title: 'Youth Ministry Gathering', views: 1670, duration: '32:15' },
        { title: 'Evening Prayer & Reflection', views: 1240, duration: '25:10' },
        { title: 'Parish Community Meeting', views: 890, duration: '1:05:30' },
        { title: 'Children\'s Mass Celebration', views: 760, duration: '38:22' }
      ],
      categories: [
        { name: 'Live Mass', percentage: 35, color: '#2d5016' },
        { name: 'Archived Masses', percentage: 28, color: '#4a7c2a' },
        { name: 'Community Events', percentage: 20, color: '#6ba83a' },
        { name: 'Prayer Services', percentage: 12, color: '#8bc34a' },
        { name: 'Special Occasions', percentage: 5, color: '#a4d65e' }
      ]
    }
  });

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? '#28a745' : '#dc3545';
  };

  const [showExportMenu, setShowExportMenu] = useState(false);

  const handleExport = async (format: ExportFormat) => {
    try {
      setShowExportMenu(false);
      
      if (activeTab === 'overview') {
        AnalyticsExporter.printAnalyticsSummary(analyticsData);
      } else if (activeTab === 'users') {
        // Mock user data for export
        const userData = [
          { username: 'john_doe', firstName: 'John', lastName: 'Doe', email: 'john@example.com', role: 'parishioner', association: 'Youth Group', section: 'Adult Section', isBaptized: true, isConfirmed: true, receivesCommunion: true, isMarried: false, createdAt: '2024-01-15', lastLogin: '2024-11-05' },
          { username: 'mary_smith', firstName: 'Mary', lastName: 'Smith', email: 'mary@example.com', role: 'parishioner', association: 'Catholic Women League', section: 'Adult Section', isBaptized: true, isConfirmed: true, receivesCommunion: true, isMarried: true, spouseName: 'Peter Smith', createdAt: '2024-02-10', lastLogin: '2024-11-04' }
        ];
        AnalyticsExporter.exportUserAnalytics(userData, format);
      } else if (activeTab === 'videos') {
        AnalyticsExporter.exportVideoAnalytics(analyticsData.popular.videos, format);
      } else if (activeTab === 'content') {
        const contentData = analyticsData.popular.pages.map(page => ({
          type: 'page',
          title: page.name,
          views: page.views,
          category: 'website',
          isPublished: true,
          author: 'System',
          createdAt: '2024-01-01'
        }));
        AnalyticsExporter.exportContentAnalytics(contentData, format);
      } else if (activeTab === 'demographics') {
        // Export demographics data
        const demographicsData = {
          gender: analyticsData.demographics.byGender,
          age: analyticsData.demographics.byAge,
          sections: analyticsData.demographics.bySection,
          associations: analyticsData.demographics.byAssociation
        };
        
        if (format === 'csv') {
          let csvContent = 'Category,Item,Count,Percentage\n';
          
          demographicsData.gender.forEach(item => {
            csvContent += `Gender,${item.gender},${item.count},${item.percentage}%\n`;
          });
          
          demographicsData.age.forEach(item => {
            csvContent += `Age Group,${item.ageGroup},${item.count},${item.percentage}%\n`;
          });
          
          demographicsData.sections.forEach(item => {
            csvContent += `Section,${item.section},${item.count},${item.percentage}%\n`;
          });
          
          demographicsData.associations.forEach(item => {
            csvContent += `Association,${item.association},${item.count},${item.percentage}%\n`;
          });
          
          const blob = new Blob([csvContent], { type: 'text/csv' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `demographics-analytics-${new Date().toISOString().split('T')[0]}.csv`;
          a.click();
          window.URL.revokeObjectURL(url);
        } else {
          // For other formats, create a simple text export
          console.log('Demographics data:', demographicsData);
        }
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    }
  };

  const handlePrint = () => {
    setShowExportMenu(false);
    AnalyticsExporter.printAnalyticsSummary(analyticsData);
  };

  return (
    <div className="analytics-dashboard">
      <div className="analytics-header">
        <div className="header-content">
          <h1>Analytics Dashboard</h1>
          <p>Comprehensive insights into your parish website performance</p>
        </div>
        
        <div className="header-controls">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="time-range-select"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          
          <div className="export-dropdown">
            <button 
              className="export-btn"
              onClick={() => setShowExportMenu(!showExportMenu)}
            >
              <Download size={20} />
              Export Report
            </button>
            
            {showExportMenu && (
              <div className="export-menu">
                <button onClick={() => handleExport('csv')} className="export-option">
                  <FileText size={16} />
                  Export as CSV
                </button>
                <button onClick={() => handleExport('json')} className="export-option">
                  <FileText size={16} />
                  Export as JSON
                </button>
                <button onClick={() => handleExport('pdf')} className="export-option">
                  <FileText size={16} />
                  Export as PDF
                </button>
                <button onClick={() => handleExport('excel')} className="export-option">
                  <FileText size={16} />
                  Export as Excel
                </button>
                <hr className="export-divider" />
                <button onClick={handlePrint} className="export-option">
                  <Printer size={16} />
                  Print Report
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="analytics-tabs">
        <button 
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <BarChart3 size={20} />
          Overview
        </button>
        <button 
          className={`tab-button ${activeTab === 'content' ? 'active' : ''}`}
          onClick={() => setActiveTab('content')}
        >
          <Eye size={20} />
          Content
        </button>
        <button 
          className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <Users size={20} />
          Users
        </button>
        <button 
          className={`tab-button ${activeTab === 'videos' ? 'active' : ''}`}
          onClick={() => setActiveTab('videos')}
        >
          <Video size={20} />
          Videos
        </button>
        <button 
          className={`tab-button ${activeTab === 'demographics' ? 'active' : ''}`}
          onClick={() => setActiveTab('demographics')}
        >
          <Activity size={20} />
          Demographics
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="analytics-content">
          {/* Key Metrics */}
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-icon users">
                <Users size={24} />
              </div>
              <div className="metric-info">
                <h3>Total Users</h3>
                <div className="metric-value">{formatNumber(analyticsData.users.total)}</div>
                <div className="metric-growth" style={{ color: getGrowthColor(analyticsData.users.growth) }}>
                  <TrendingUp size={16} />
                  +{analyticsData.users.growth}%
                </div>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon views">
                <Eye size={24} />
              </div>
              <div className="metric-info">
                <h3>Total Views</h3>
                <div className="metric-value">{formatNumber(analyticsData.content.totalViews)}</div>
                <div className="metric-growth" style={{ color: '#28a745' }}>
                  <TrendingUp size={16} />
                  +8.3%
                </div>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon videos">
                <Video size={24} />
              </div>
              <div className="metric-info">
                <h3>Video Views</h3>
                <div className="metric-value">{formatNumber(analyticsData.content.videoViews)}</div>
                <div className="metric-growth" style={{ color: '#28a745' }}>
                  <TrendingUp size={16} />
                  +15.6%
                </div>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon engagement">
                <Heart size={24} />
              </div>
              <div className="metric-info">
                <h3>Engagement</h3>
                <div className="metric-value">{formatNumber(analyticsData.engagement.totalInteractions)}</div>
                <div className="metric-growth" style={{ color: '#28a745' }}>
                  <TrendingUp size={16} />
                  +6.8%
                </div>
              </div>
            </div>
          </div>

          {/* Popular Content */}
          <div className="content-grid">
            <div className="analytics-card">
              <h3>Most Popular Pages</h3>
              <div className="popular-list">
                {analyticsData.popular.pages.map((page, index) => (
                  <div key={page.name} className="popular-item">
                    <div className="item-info">
                      <span className="item-rank">#{index + 1}</span>
                      <span className="item-name">{page.name}</span>
                    </div>
                    <div className="item-stats">
                      <span className="item-views">{formatNumber(page.views)} views</span>
                      <span 
                        className="item-growth"
                        style={{ color: getGrowthColor(page.growth) }}
                      >
                        {page.growth >= 0 ? '+' : ''}{page.growth}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="analytics-card">
              <h3>Watch Mass Performance</h3>
              <div className="video-stats">
                <div className="stat-item">
                  <div className="stat-label">Total Videos</div>
                  <div className="stat-value">{analyticsData.videos.totalVideos}</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">Live Streams</div>
                  <div className="stat-value">{analyticsData.videos.liveStreams}</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">Total Watch Time</div>
                  <div className="stat-value">{analyticsData.videos.totalWatchTime}</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">Avg. Duration</div>
                  <div className="stat-value">{analyticsData.videos.averageViewDuration}</div>
                </div>
              </div>
              
              <div className="feature-highlights">
                <h4>New Features Impact</h4>
                <div className="highlight-item">
                  <span className="highlight-label">Watch Mass Page:</span>
                  <span className="highlight-value">+25.6% growth</span>
                </div>
                <div className="highlight-item">
                  <span className="highlight-label">Profile Management:</span>
                  <span className="highlight-value">+45.8% growth</span>
                </div>
                <div className="highlight-item">
                  <span className="highlight-label">Get Involved Dropdown:</span>
                  <span className="highlight-value">Improved navigation</span>
                </div>
              </div>
            </div>
          </div>

          {/* Category Distribution */}
          <div className="analytics-card">
            <h3>Content Category Distribution</h3>
            <div className="category-chart">
              {analyticsData.popular.categories.map(category => (
                <div key={category.name} className="category-item">
                  <div className="category-info">
                    <div 
                      className="category-color" 
                      style={{ backgroundColor: category.color }}
                    ></div>
                    <span className="category-name">{category.name}</span>
                  </div>
                  <div className="category-percentage">{category.percentage}%</div>
                  <div className="category-bar">
                    <div 
                      className="category-fill"
                      style={{ 
                        width: `${category.percentage}%`,
                        backgroundColor: category.color 
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Content Tab */}
      {activeTab === 'content' && (
        <div className="analytics-content">
          <div className="content-analytics">
            <div className="analytics-card">
              <h3>Content Performance</h3>
              <div className="content-metrics">
                <div className="content-metric">
                  <Video size={32} />
                  <div className="content-metric-info">
                    <div className="content-metric-value">{formatNumber(analyticsData.content.videoViews)}</div>
                    <div className="content-metric-label">Video Views</div>
                  </div>
                </div>
                <div className="content-metric">
                  <MessageSquare size={32} />
                  <div className="content-metric-info">
                    <div className="content-metric-value">{formatNumber(analyticsData.content.newsViews)}</div>
                    <div className="content-metric-label">News Views</div>
                  </div>
                </div>
                <div className="content-metric">
                  <Heart size={32} />
                  <div className="content-metric-info">
                    <div className="content-metric-value">{formatNumber(analyticsData.content.prayerViews)}</div>
                    <div className="content-metric-label">Prayer Views</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="analytics-card">
              <h3>Top Performing Videos</h3>
              <div className="video-performance">
                {analyticsData.popular.videos.map((video, index) => (
                  <div key={video.title} className="video-performance-item">
                    <div className="video-rank">#{index + 1}</div>
                    <div className="video-details">
                      <div className="video-title">{video.title}</div>
                      <div className="video-meta">
                        <span>{formatNumber(video.views)} views</span>
                        <span>{video.duration}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="analytics-content">
          <div className="user-analytics">
            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-icon">
                  <Users size={24} />
                </div>
                <div className="metric-info">
                  <h3>Active Users</h3>
                  <div className="metric-value">{analyticsData.users.active}</div>
                </div>
              </div>
              
              <div className="metric-card">
                <div className="metric-icon">
                  <TrendingUp size={24} />
                </div>
                <div className="metric-info">
                  <h3>New Users</h3>
                  <div className="metric-value">{analyticsData.users.newThisMonth}</div>
                </div>
              </div>
              
              <div className="metric-card">
                <div className="metric-icon">
                  <Clock size={24} />
                </div>
                <div className="metric-info">
                  <h3>Avg. Session</h3>
                  <div className="metric-value">{analyticsData.engagement.averageSessionTime}</div>
                </div>
              </div>
              
              <div className="metric-card">
                <div className="metric-icon">
                  <Activity size={24} />
                </div>
                <div className="metric-info">
                  <h3>Return Rate</h3>
                  <div className="metric-value">{analyticsData.engagement.returnVisitors}%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Videos Tab */}
      {activeTab === 'videos' && (
        <div className="analytics-content">
          <div className="video-analytics">
            <div className="analytics-card">
              <h3>Video Analytics Summary</h3>
              <div className="video-summary">
                <div className="summary-item">
                  <Video size={24} />
                  <div>
                    <div className="summary-value">{analyticsData.videos.totalVideos}</div>
                    <div className="summary-label">Total Videos</div>
                  </div>
                </div>
                <div className="summary-item">
                  <Activity size={24} />
                  <div>
                    <div className="summary-value">{analyticsData.videos.liveStreams}</div>
                    <div className="summary-label">Live Streams</div>
                  </div>
                </div>
                <div className="summary-item">
                  <Clock size={24} />
                  <div>
                    <div className="summary-value">{analyticsData.videos.totalWatchTime}</div>
                    <div className="summary-label">Total Watch Time</div>
                  </div>
                </div>
                <div className="summary-item">
                  <TrendingUp size={24} />
                  <div>
                    <div className="summary-value">{analyticsData.videos.averageViewDuration}</div>
                    <div className="summary-label">Avg. View Duration</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Demographics Tab */}
      {activeTab === 'demographics' && (
        <div className="analytics-content">
          <div className="demographics-grid">
            {/* Gender Distribution */}
            <div className="demographic-card">
              <h3>Gender Distribution</h3>
              <div className="demographic-chart">
                {analyticsData.demographics.byGender.map((item, index) => (
                  <div key={index} className="demographic-item">
                    <div className="demographic-bar">
                      <div 
                        className="demographic-fill gender"
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                    <div className="demographic-info">
                      <span className="demographic-label">{item.gender}</span>
                      <span className="demographic-value">{item.count} ({item.percentage}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Age Groups */}
            <div className="demographic-card">
              <h3>Age Distribution</h3>
              <div className="demographic-chart">
                {analyticsData.demographics.byAge.map((item, index) => (
                  <div key={index} className="demographic-item">
                    <div className="demographic-bar">
                      <div 
                        className="demographic-fill age"
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                    <div className="demographic-info">
                      <span className="demographic-label">{item.ageGroup}</span>
                      <span className="demographic-value">{item.count} ({item.percentage}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Parish Sections */}
            <div className="demographic-card">
              <h3>Parish Sections</h3>
              <div className="demographic-chart">
                {analyticsData.demographics.bySection.map((item, index) => (
                  <div key={index} className="demographic-item">
                    <div className="demographic-bar">
                      <div 
                        className="demographic-fill section"
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                    <div className="demographic-info">
                      <span className="demographic-label">{item.section}</span>
                      <span className="demographic-value">{item.count} ({item.percentage}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Associations */}
            <div className="demographic-card">
              <h3>Association Membership</h3>
              <div className="demographic-chart">
                {analyticsData.demographics.byAssociation.map((item, index) => (
                  <div key={index} className="demographic-item">
                    <div className="demographic-bar">
                      <div 
                        className="demographic-fill association"
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                    <div className="demographic-info">
                      <span className="demographic-label">{item.association}</span>
                      <span className="demographic-value">{item.count} ({item.percentage}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Demographics Summary */}
          <div className="demographics-summary">
            <h3>Demographics Summary</h3>
            <div className="summary-grid">
              <div className="summary-card">
                <div className="summary-icon">👥</div>
                <div className="summary-content">
                  <div className="summary-title">Most Common Age Group</div>
                  <div className="summary-value">46-60 years (35.0%)</div>
                </div>
              </div>
              <div className="summary-card">
                <div className="summary-icon">⚖️</div>
                <div className="summary-content">
                  <div className="summary-title">Gender Ratio</div>
                  <div className="summary-value">58.0% Female, 42.0% Male</div>
                </div>
              </div>
              <div className="summary-card">
                <div className="summary-icon">⛪</div>
                <div className="summary-content">
                  <div className="summary-title">Largest Section</div>
                  <div className="summary-value">St. Mary (25.0%)</div>
                </div>
              </div>
              <div className="summary-card">
                <div className="summary-icon">🤝</div>
                <div className="summary-content">
                  <div className="summary-title">Association Participation</div>
                  <div className="summary-value">53.2% are members</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
