import React, { useMemo, useState } from 'react';
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
import { api } from '../../services/api';
import { useAdmin } from '../../contexts/AdminContext';
import { useAuth } from '../../contexts/AuthContext';

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
  const { listUsers } = useAuth();
  const { parishNews, events, galleryImages } = useAdmin();

  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    users: { total: 0, active: 0, newThisMonth: 0, growth: 0 },
    content: { totalViews: 0, videoViews: 0, newsViews: 0, prayerViews: 0 },
    videos: { totalVideos: 0, liveStreams: 0, totalWatchTime: '0h', averageViewDuration: '0:00' },
    engagement: { totalInteractions: 0, averageSessionTime: '0:00', bounceRate: 0, returnVisitors: 0 },
    demographics: { byGender: [], byAge: [], bySection: [], byAssociation: [] },
    popular: { pages: [], videos: [], categories: [] }
  });

  React.useEffect(() => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
    const load = async () => {
      try {
        const [overviewRes, pagesRes, contentRes, videoRes, streamsRes, archiveRes] = await Promise.all([
          api.analytics.getOverview(days),
          api.analytics.getPages(days),
          api.analytics.getContent(days),
          api.videos.getVideoAnalytics({ timeRange: timeRange }),
          api.videos.getStreams({ active: true }),
          api.videos.getArchive({ published: true })
        ]);
        const o: any = overviewRes.success ? overviewRes.data : {};
        const p: any = pagesRes.success ? pagesRes.data : {};
        const c: any = contentRes.success ? contentRes.data : {};
        const v: any = videoRes.success ? videoRes.data : {};
        const pagesArr: any[] = p.pages || p.items || [];
        const popularPages = pagesArr.map((pg: any) => ({ name: pg.page || pg.title || 'Page', views: pg.views || pg.count || 0, growth: pg.growth || 0 }));
        const videoList: any[] = v.items || v.videos || [];
        const popularVideos = videoList.map((vi: any) => ({ title: vi.title || 'Video', views: vi.views || 0, duration: vi.duration || '0:00' }));
        const streams: any[] = (streamsRes.success && ((streamsRes.data?.items) || (streamsRes.data?.streams) || (Array.isArray(streamsRes.data) ? streamsRes.data : []))) || [];
        const archives: any[] = (archiveRes.success && ((archiveRes.data?.items) || (archiveRes.data?.videos) || (Array.isArray(archiveRes.data) ? archiveRes.data : []))) || [];
        const categoryCounts: Record<string, number> = {};
        parishNews.forEach(n => {
          const key = (n.category || 'news').toString();
          categoryCounts[key] = (categoryCounts[key] || 0) + 1;
        });
        events.forEach(e => {
          const key = (e.category || 'events').toString();
          categoryCounts[key] = (categoryCounts[key] || 0) + 1;
        });
        galleryImages.forEach(g => {
          const key = (g.category || 'gallery').toString();
          categoryCounts[key] = (categoryCounts[key] || 0) + 1;
        });
        archives.forEach(vv => {
          const key = (vv.category || 'mass').toString();
          categoryCounts[key] = (categoryCounts[key] || 0) + 1;
        });
        const totalCategories = Object.values(categoryCounts).reduce((a, b) => a + b, 0) || 1;
        const palette = ['#45b7d1', '#4ecdc4', '#ff6b6b', '#96ceb4', '#f7b267', '#b8de6f'];
        const popularCategories = Object.entries(categoryCounts).map(([name, count], idx) => ({ name, percentage: Number(((count / totalCategories) * 100).toFixed(1)), color: palette[idx % palette.length] }));
        setAnalyticsData({
          users: {
            total: o.users?.total ?? o.totalUsers ?? 0,
            active: o.users?.active ?? o.activeUsers ?? 0,
            newThisMonth: o.users?.newThisMonth ?? o.newUsers ?? 0,
            growth: o.users?.growth ?? o.userGrowth ?? 0
          },
          content: {
            totalViews: c.totalViews ?? o.content?.totalViews ?? o.pageViews ?? 0,
            videoViews: c.videoViews ?? o.content?.videoViews ?? v.totalViews ?? 0,
            newsViews: c.newsViews ?? o.content?.newsViews ?? 0,
            prayerViews: c.prayerViews ?? o.content?.prayerViews ?? 0
          },
          videos: {
            totalVideos: v.totalVideos ?? archives.length ?? (videoList.length || 0),
            liveStreams: v.liveStreams ?? streams.length ?? 0,
            totalWatchTime: v.totalWatchTime ?? '0h',
            averageViewDuration: v.averageViewDuration ?? '0:00'
          },
          engagement: {
            totalInteractions: o.engagement?.totalInteractions ?? 0,
            averageSessionTime: o.engagement?.averageSessionTime ?? '0:00',
            bounceRate: o.engagement?.bounceRate ?? 0,
            returnVisitors: o.engagement?.returnVisitors ?? 0
          },
          demographics: { byGender: [], byAge: [], bySection: [], byAssociation: [] },
          popular: { pages: popularPages, videos: popularVideos, categories: popularCategories }
        });
      } catch {}
    };
    load();
  }, [timeRange, parishNews, events, galleryImages]);

  const demographics = useMemo(() => {
    const users = listUsers();
    const total = users.length || 1;
    const byGenderMap: Record<string, number> = {};
    const byAgeMap: Record<string, number> = {};
    const bySectionMap: Record<string, number> = {};
    const byAssociationMap: Record<string, number> = {};
    const calcAgeGroup = (dob?: string) => {
      if (!dob) return 'Unknown';
      const d = new Date(dob);
      if (isNaN(d.getTime())) return 'Unknown';
      const age = Math.floor((Date.now() - d.getTime()) / (365.25 * 24 * 3600 * 1000));
      if (age < 13) return '0-12';
      if (age < 18) return '13-17';
      if (age < 25) return '18-24';
      if (age < 35) return '25-34';
      if (age < 46) return '35-45';
      if (age < 61) return '46-60';
      return '61+';
    };
    users.forEach(u => {
      const g = (u.gender || 'unknown').toString();
      byGenderMap[g] = (byGenderMap[g] || 0) + 1;
      const ag = calcAgeGroup(u.dateOfBirth);
      byAgeMap[ag] = (byAgeMap[ag] || 0) + 1;
      const sec = u.section || 'Unknown';
      bySectionMap[sec] = (bySectionMap[sec] || 0) + 1;
      const assoc = u.association || 'None';
      byAssociationMap[assoc] = (byAssociationMap[assoc] || 0) + 1;
    });
    const toArray = (map: Record<string, number>, labelKey: string) =>
      Object.entries(map).map(([key, count]) => ({ [labelKey]: key, count, percentage: Number(((count / total) * 100).toFixed(1)) })) as any[];
    const byGender = toArray(byGenderMap, 'gender');
    const byAge = toArray(byAgeMap, 'ageGroup');
    const bySection = toArray(bySectionMap, 'section');
    const byAssociation = toArray(byAssociationMap, 'association');
    return { byGender, byAge, bySection, byAssociation };
  }, [listUsers]);

  React.useEffect(() => {
    setAnalyticsData(prev => ({ ...prev, demographics }));
  }, [demographics]);

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
                  <div className="summary-value">{
                    (() => {
                      const arr = demographics.byAge.slice().sort((a, b) => b.count - a.count);
                      return arr.length ? `${arr[0].ageGroup} (${arr[0].percentage}%)` : 'N/A';
                    })()
                  }</div>
                </div>
              </div>
              <div className="summary-card">
                <div className="summary-icon">⚖️</div>
                <div className="summary-content">
                  <div className="summary-title">Gender Ratio</div>
                  <div className="summary-value">{
                    (() => {
                      const male = demographics.byGender.find(g => g.gender?.toLowerCase() === 'male')?.percentage || 0;
                      const female = demographics.byGender.find(g => g.gender?.toLowerCase() === 'female')?.percentage || 0;
                      return `${female}% Female, ${male}% Male`;
                    })()
                  }</div>
                </div>
              </div>
              <div className="summary-card">
                <div className="summary-icon">⛪</div>
                <div className="summary-content">
                  <div className="summary-title">Largest Section</div>
                  <div className="summary-value">{
                    (() => {
                      const arr = demographics.bySection.slice().sort((a, b) => b.count - a.count);
                      return arr.length ? `${arr[0].section} (${arr[0].percentage}%)` : 'N/A';
                    })()
                  }</div>
                </div>
              </div>
              <div className="summary-card">
                <div className="summary-icon">🤝</div>
                <div className="summary-content">
                  <div className="summary-title">Association Participation</div>
                  <div className="summary-value">{
                    (() => {
                      const nonNone = demographics.byAssociation.filter(a => a.association && a.association !== 'None');
                      const percent = nonNone.reduce((acc, a) => acc + a.percentage, 0);
                      return `${percent.toFixed(1)}% are members`;
                    })()
                  }</div>
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
