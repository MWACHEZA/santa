import React, { useState } from 'react';
import { useAdmin } from '../../contexts/AdminContext';
import { useAuth } from '../../contexts/AuthContext';
import AnnouncementManager from '../../components/admin/AnnouncementManager';
import GalleryManager from '../../components/admin/GalleryManager';
import EventManager from '../../components/admin/EventManager';
import PrayerManager from '../../components/admin/PrayerManager';
import ImageManager from '../../components/admin/ImageManager';
import UserManagement from '../../components/admin/UserManagement';
import NewsManagement from './NewsManagement';
import Analytics from './Analytics';
import VideoManager from '../../components/admin/VideoManager';
import ImageUpload from '../../components/admin/ImageUpload';
import EnhancedProfile from '../../components/EnhancedProfile';
import { 
  LogOut, 
  Bell, 
  Calendar, 
  Image, 
  Phone, 
  Clock, 
  Users,
  User,
  BarChart3,
  Settings,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  BookOpen,
  TrendingUp,
  Activity,
  Heart,
  UserCog,
  Shield,
  AlertTriangle,
  Info,
  Newspaper,
  ChevronDown,
  ChevronUp,
  FolderOpen,
  CalendarDays,
  X
} from 'lucide-react';
import './AdminDashboard.css';

type AdminSection = 'overview' | 'announcements' | 'events' | 'gallery' | 'contact' | 'schedule' | 'priests-desk' | 'analytics' | 'prayers' | 'images' | 'users' | 'themes' | 'ministries' | 'sacraments' | 'section-images' | 'prayer-intentions' | 'news' | 'videos' | 'profile';

// Types for parish members
interface ParishMember {
  id: string;
  name: string;
  email: string;
  lastLogin: Date;
  status: 'online' | 'away' | 'offline';
}

const AdminDashboard: React.FC = () => {
  const { 
    announcements, 
    events, 
    galleryImages, 
    getActiveAnnouncement,
    getPublishedEvents,
    getPublishedImages,
    hasPermission
  } = useAdmin();
  
  const { logout, user } = useAuth();
  
  const [activeSection, setActiveSection] = useState<AdminSection>('overview');
  const [contentDropdownOpen, setContentDropdownOpen] = useState(false);
  const [eventDropdownOpen, setEventDropdownOpen] = useState(false);

  // Debug: Log user permissions
  React.useEffect(() => {
    if (user) {
      console.log('Current user:', user);
      console.log('User role:', user.role);
      console.log('Has gallery permission:', hasPermission('gallery'));
      console.log('Has events permission:', hasPermission('events'));
      console.log('Has announcements permission:', hasPermission('announcements'));
      console.log('Has ministries permission:', hasPermission('ministries'));
    }
  }, [user, hasPermission]);

  // Set initial section based on user permissions
  React.useEffect(() => {
    if (hasPermission('overview')) {
      setActiveSection('overview');
    } else if (hasPermission('announcements')) {
      setActiveSection('announcements');
    } else if (hasPermission('events')) {
      setActiveSection('events');
    } else if (hasPermission('gallery')) {
      setActiveSection('gallery');
    } else if (hasPermission('news')) {
      setActiveSection('news');
    } else if (hasPermission('priest_desk')) {
      setActiveSection('priests-desk');
    }
  }, [hasPermission]);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  // Get role display name
  const getRoleDisplayName = () => {
    const roleNames = {
      admin: 'Admin',
      secretary: 'Secretary',
      priest: 'Priest',
      reporter: 'Reporter',
      vice_secretary: 'Vice Secretary',
      parishioner: 'Parishioner'
    };
    return user?.role ? roleNames[user.role] : 'User';
  };

  // Get welcome message based on role
  const getWelcomeMessage = () => {
    const name = user?.username || user?.firstName || getRoleDisplayName();
    return `Welcome ${name}`;
  };

  // Mock data for parish members and website analytics
  const parishMembers: ParishMember[] = [
    { id: '1', name: 'John Doe', email: 'john@example.com', lastLogin: new Date(), status: 'online' as const },
    { id: '2', name: 'Mary Smith', email: 'mary@example.com', lastLogin: new Date(Date.now() - 300000), status: 'online' as const },
    { id: '3', name: 'Peter Johnson', email: 'peter@example.com', lastLogin: new Date(Date.now() - 600000), status: 'online' as const },
    { id: '4', name: 'Sarah Wilson', email: 'sarah@example.com', lastLogin: new Date(Date.now() - 1800000), status: 'away' as const },
    { id: '5', name: 'Michael Brown', email: 'michael@example.com', lastLogin: new Date(Date.now() - 86400000), status: 'offline' as const }
  ];

  const websiteAnalytics = {
    totalVisitors: 15420,
    todayVisitors: 234,
    pageViews: 45680,
    avgSessionDuration: '4:32',
    bounceRate: 32.5,
    topPages: [
      { page: 'Home', views: 12450, percentage: 27.3 },
      { page: 'Mass Times', views: 8920, percentage: 19.5 },
      { page: 'Events', views: 6780, percentage: 14.8 },
      { page: 'Gallery', views: 5430, percentage: 11.9 },
      { page: 'Contact', views: 4200, percentage: 9.2 }
    ],
    monthlyData: [
      { month: 'Jan', visitors: 1200, pageViews: 3600 },
      { month: 'Feb', visitors: 1450, pageViews: 4200 },
      { month: 'Mar', visitors: 1680, pageViews: 4890 },
      { month: 'Apr', visitors: 1920, pageViews: 5760 },
      { month: 'May', visitors: 2100, pageViews: 6300 },
      { month: 'Jun', visitors: 1850, pageViews: 5550 }
    ]
  };

  const stats = {
    totalAnnouncements: announcements.length,
    activeAnnouncements: announcements.filter(a => a.isActive).length,
    totalEvents: events.length,
    publishedEvents: getPublishedEvents().length,
    totalImages: galleryImages.length,
    publishedImages: getPublishedImages().length,
    parishMembers: {
      total: parishMembers.length,
      online: parishMembers.filter(m => m.status === 'online').length,
      away: parishMembers.filter(m => m.status === 'away').length,
      offline: parishMembers.filter(m => m.status === 'offline').length,
      activeToday: parishMembers.filter(m => 
        new Date().getTime() - m.lastLogin.getTime() < 86400000
      ).length
    },
    website: websiteAnalytics
  };

  return (
    <div className="admin-dashboard admin-container">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <div className="admin-logo">
            <img 
              src="/api/placeholder/60/60" 
              alt="St. Patrick's Admin Logo" 
              className="admin-logo-image"
            />
          </div>
          <h2>{getRoleDisplayName()} Panel</h2>
          <p>St. Patrick's</p>
        </div>

        <nav className="sidebar-nav">
          {hasPermission('overview') && (
            <button
              className={`nav-item ${activeSection === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveSection('overview')}
            >
              <BarChart3 size={20} />
              <span>Overview</span>
            </button>
          )}
          
          {/* Content Management Dropdown */}
          {(hasPermission('gallery') || hasPermission('section_images') || hasPermission('ministries') || hasPermission('theme') || hasPermission('sacraments') || hasPermission('images')) && (
            <div className="nav-dropdown">
              <button
                className={`nav-item dropdown-toggle ${contentDropdownOpen ? 'active' : ''}`}
                onClick={() => {
                  console.log('Content dropdown clicked, current state:', contentDropdownOpen);
                  setContentDropdownOpen(!contentDropdownOpen);
                }}
              >
                <FolderOpen size={20} />
                <span>Content Management</span>
                {contentDropdownOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {contentDropdownOpen && (
                <div className="dropdown-menu">
                  {hasPermission('section_images') && (
                    <button
                      className={`dropdown-item ${activeSection === 'section-images' ? 'active' : ''}`}
                      onClick={() => {setActiveSection('section-images'); setContentDropdownOpen(false);}}
                    >
                      <Image size={16} />
                      <span>Section Images</span>
                    </button>
                  )}
                  {hasPermission('gallery') && (
                    <button
                      className={`dropdown-item ${activeSection === 'gallery' ? 'active' : ''}`}
                      onClick={() => {setActiveSection('gallery'); setContentDropdownOpen(false);}}
                    >
                      <Image size={16} />
                      <span>Gallery</span>
                    </button>
                  )}
                  {hasPermission('ministries') && (
                    <button
                      className={`dropdown-item ${activeSection === 'ministries' ? 'active' : ''}`}
                      onClick={() => {setActiveSection('ministries'); setContentDropdownOpen(false);}}
                    >
                      <Users size={16} />
                      <span>Ministries</span>
                    </button>
                  )}
                  {hasPermission('theme') && (
                    <button
                      className={`dropdown-item ${activeSection === 'themes' ? 'active' : ''}`}
                      onClick={() => {setActiveSection('themes'); setContentDropdownOpen(false);}}
                    >
                      <BookOpen size={16} />
                      <span>Theme of the Year</span>
                    </button>
                  )}
                  {hasPermission('sacraments') && (
                    <button
                      className={`dropdown-item ${activeSection === 'sacraments' ? 'active' : ''}`}
                      onClick={() => {setActiveSection('sacraments'); setContentDropdownOpen(false);}}
                    >
                      <Heart size={16} />
                      <span>Sacraments</span>
                    </button>
                  )}
                  {hasPermission('images') && (
                    <button
                      className={`dropdown-item ${activeSection === 'images' ? 'active' : ''}`}
                      onClick={() => {setActiveSection('images'); setContentDropdownOpen(false);}}
                    >
                      <Image size={16} />
                      <span>Images</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Event Management Dropdown */}
          {(hasPermission('events') || hasPermission('announcements') || hasPermission('mass_schedule')) && (
            <div className="nav-dropdown">
              <button
                className={`nav-item dropdown-toggle ${eventDropdownOpen ? 'active' : ''}`}
                onClick={() => {
                  console.log('Event dropdown clicked, current state:', eventDropdownOpen);
                  setEventDropdownOpen(!eventDropdownOpen);
                }}
              >
                <CalendarDays size={20} />
                <span>Event Management</span>
                {eventDropdownOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {eventDropdownOpen && (
                <div className="dropdown-menu">
                  {hasPermission('events') && (
                    <button
                      className={`dropdown-item ${activeSection === 'events' ? 'active' : ''}`}
                      onClick={() => {setActiveSection('events'); setEventDropdownOpen(false);}}
                    >
                      <Calendar size={16} />
                      <span>Events Page</span>
                    </button>
                  )}
                  {hasPermission('announcements') && (
                    <button
                      className={`dropdown-item ${activeSection === 'announcements' ? 'active' : ''}`}
                      onClick={() => {setActiveSection('announcements'); setEventDropdownOpen(false);}}
                    >
                      <Bell size={16} />
                      <span>Announcement Page</span>
                    </button>
                  )}
                  {hasPermission('mass_schedule') && (
                    <button
                      className={`dropdown-item ${activeSection === 'schedule' ? 'active' : ''}`}
                      onClick={() => {setActiveSection('schedule'); setEventDropdownOpen(false);}}
                    >
                      <Clock size={16} />
                      <span>Mass Schedule</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
          
          {hasPermission('news') && (
            <button
              className={`nav-item ${activeSection === 'news' ? 'active' : ''}`}
              onClick={() => setActiveSection('news')}
            >
              <Newspaper size={20} />
              <span>News</span>
            </button>
          )}
          
          {hasPermission('contact') && (
            <button
              className={`nav-item ${activeSection === 'contact' ? 'active' : ''}`}
              onClick={() => setActiveSection('contact')}
            >
              <Phone size={20} />
              <span>Contact Info</span>
            </button>
          )}
          
          {hasPermission('priest_desk') && (
            <button
              className={`nav-item ${activeSection === 'priests-desk' ? 'active' : ''}`}
              onClick={() => setActiveSection('priests-desk')}
            >
              <BookOpen size={20} />
              <span>Priest's Desk</span>
            </button>
          )}
          
          {hasPermission('prayers') && (
            <button
              className={`nav-item ${activeSection === 'prayers' ? 'active' : ''}`}
              onClick={() => setActiveSection('prayers')}
            >
              <Heart size={20} />
              <span>Prayers & Readings</span>
            </button>
          )}
          
          {hasPermission('analytics') && (
            <button
              className={`nav-item ${activeSection === 'analytics' ? 'active' : ''}`}
              onClick={() => setActiveSection('analytics')}
            >
              <TrendingUp size={20} />
              <span>Analytics</span>
            </button>
          )}
          
          {(hasPermission('videos') || user?.role === 'admin' || user?.role === 'reporter') && (
            <button
              className={`nav-item ${activeSection === 'videos' ? 'active' : ''}`}
              onClick={() => setActiveSection('videos')}
            >
              <Activity size={20} />
              <span>Video Management</span>
            </button>
          )}
          
          {/* Profile section - available to all admin users */}
          <button
            className={`nav-item ${activeSection === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveSection('profile')}
          >
            <User size={20} />
            <span>My Profile</span>
          </button>
          
          {user?.role === 'admin' && (
            <button
              className={`nav-item ${activeSection === 'users' ? 'active' : ''}`}
              onClick={() => setActiveSection('users')}
            >
              <UserCog size={20} />
              <span>User Management</span>
            </button>
          )}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <header className="admin-header">
          <div className="header-content">
            <h1>{getSectionTitle(activeSection)}</h1>
            <div className="header-actions">
              <span className="admin-user">{getWelcomeMessage()}</span>
            </div>
          </div>
        </header>

        <div className="admin-content">
          {activeSection === 'overview' && <OverviewSection stats={stats} setActiveSection={setActiveSection} parishMembers={parishMembers} />}
          {activeSection === 'announcements' && <AnnouncementManager />}
          {activeSection === 'events' && <EventManager />}
          {activeSection === 'gallery' && <GalleryManager />}
          {activeSection === 'news' && <NewsManagement />}
          {activeSection === 'contact' && <ContactSection />}
          {activeSection === 'schedule' && <ScheduleSection />}
          {activeSection === 'priests-desk' && <PriestsDeskSection />}
          {activeSection === 'prayers' && <PrayerManager />}
          {activeSection === 'images' && <ImageManager />}
          {activeSection === 'analytics' && <Analytics />}
          {activeSection === 'videos' && <VideoManager />}
          {activeSection === 'themes' && <ThemeManagementSection />}
          {activeSection === 'ministries' && <MinistryManagementSection />}
          {activeSection === 'sacraments' && <SacramentManagementSection />}
          {activeSection === 'section-images' && <SectionImageManagementSection />}
          {activeSection === 'prayer-intentions' && <PrayerIntentionManagementSection />}
          {activeSection === 'profile' && <EnhancedProfile />}
          {activeSection === 'users' && <UserManagement />}
        </div>
      </main>
    </div>
  );
};

const getSectionTitle = (section: AdminSection): string => {
  const sectionTitles = {
    overview: 'Dashboard Overview',
    announcements: 'Manage Announcements',
    events: 'Manage Events',
    gallery: 'Manage Gallery',
    news: 'News Management',
    contact: 'Contact Information',
    schedule: 'Mass Schedule',
    'priests-desk': 'Priest\'s Desk Messages',
    analytics: 'Website Analytics',
    videos: 'Video Management',
    prayers: 'Manage Prayers & Daily Readings',
    images: 'Image Management',
    users: 'User Management',
    themes: 'Theme of the Year',
    ministries: 'Manage Ministries',
    sacraments: 'Manage Sacraments',
    'section-images': 'Section Images',
    'prayer-intentions': 'Prayer Intentions',
    profile: 'My Profile'
  };
  return sectionTitles[section] || 'Unknown Section';
};

// Overview Section Component
const OverviewSection: React.FC<{ 
  stats: any; 
  setActiveSection: (section: AdminSection) => void;
  parishMembers: ParishMember[];
}> = ({ stats, setActiveSection, parishMembers }) => {
  const { getActiveAnnouncement } = useAdmin();
  const activeAnnouncement = getActiveAnnouncement();

  return (
    <div className="overview-section">
      {/* Quick Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card clickable" onClick={() => setActiveSection('announcements')}>
          <div className="stat-icon announcements">
            <Bell size={20} />
          </div>
          <div className="stat-content">
            <div className="stat-number">{stats.activeAnnouncements}</div>
            <div className="stat-label">Active Announcements</div>
            <div className="stat-sublabel">{stats.totalAnnouncements} total</div>
          </div>
        </div>

        <div className="stat-card clickable" onClick={() => setActiveSection('events')}>
          <div className="stat-icon events">
            <Calendar size={20} />
          </div>
          <div className="stat-content">
            <div className="stat-number">{stats.publishedEvents}</div>
            <div className="stat-label">Published Events</div>
            <div className="stat-sublabel">{stats.totalEvents} total</div>
          </div>
        </div>

        <div className="stat-card clickable" onClick={() => setActiveSection('gallery')}>
          <div className="stat-icon gallery">
            <Image size={20} />
          </div>
          <div className="stat-content">
            <div className="stat-number">{stats.publishedImages}</div>
            <div className="stat-label">Gallery Images</div>
            <div className="stat-sublabel">{stats.totalImages} total</div>
          </div>
        </div>

        <div className="stat-card clickable" onClick={() => setActiveSection('analytics')}>
          <div className="stat-icon users">
            <Users size={20} />
          </div>
          <div className="stat-content">
            <div className="stat-number">{stats.parishMembers.online}</div>
            <div className="stat-label">Parish Members Online</div>
            <div className="stat-sublabel">{stats.parishMembers.total} total members</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="action-buttons">
          <button className="action-btn primary" onClick={() => setActiveSection('announcements')}>
            <Plus size={16} />
            New Announcement
          </button>
          <button className="action-btn secondary" onClick={() => setActiveSection('events')}>
            <Calendar size={16} />
            Add Event
          </button>
          <button className="action-btn tertiary" onClick={() => setActiveSection('gallery')}>
            <Image size={16} />
            Upload Images
          </button>
          <button className="action-btn quaternary" onClick={() => setActiveSection('users')}>
            <UserCog size={16} />
            Manage Users
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="recent-activity">
        <h3>Recent Activity</h3>
        <div className="activity-list">
          <div className="activity-item">
            <div className="activity-icon">
              <Bell size={16} />
            </div>
            <div className="activity-content">
              <div className="activity-title">New announcement published</div>
              <div className="activity-time">2 hours ago</div>
            </div>
          </div>
          <div className="activity-item">
            <div className="activity-icon">
              <Calendar size={16} />
            </div>
            <div className="activity-content">
              <div className="activity-title">Christmas Mass schedule updated</div>
              <div className="activity-time">1 day ago</div>
            </div>
          </div>
          <div className="activity-item">
            <div className="activity-icon">
              <Image size={16} />
            </div>
            <div className="activity-content">
              <div className="activity-title">5 new gallery images uploaded</div>
              <div className="activity-time">3 days ago</div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Parish Members */}
      <div className="parish-members-overview">
        <h3>Active Parish Members</h3>
        <div className="members-summary">
          <div className="member-status-card online">
            <div className="status-indicator"></div>
            <div className="status-info">
              <span className="status-count">{stats.parishMembers.online}</span>
              <span className="status-label">Online Now</span>
            </div>
          </div>
          <div className="member-status-card away">
            <div className="status-indicator"></div>
            <div className="status-info">
              <span className="status-count">{stats.parishMembers.away}</span>
              <span className="status-label">Away</span>
            </div>
          </div>
          <div className="member-status-card offline">
            <div className="status-indicator"></div>
            <div className="status-info">
              <span className="status-count">{stats.parishMembers.offline}</span>
              <span className="status-label">Offline</span>
            </div>
          </div>
        </div>
        <div className="recent-members">
          <h4>Recently Active</h4>
          <div className="member-list">
            {parishMembers.filter(m => m.status !== 'offline').slice(0, 3).map(member => (
              <div key={member.id} className="member-item">
                <div className={`member-avatar ${member.status}`}>
                  {member.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="member-info">
                  <div className="member-name">{member.name}</div>
                  <div className="member-time">
                    {member.status === 'online' ? 'Active now' : 
                     `${Math.floor((new Date().getTime() - member.lastLogin.getTime()) / 60000)} min ago`}
                  </div>
                </div>
                <div className={`member-status ${member.status}`}></div>
              </div>
            ))}
          </div>
          <button 
            className="btn btn-sm btn-secondary"
            onClick={() => setActiveSection('analytics')}
          >
            View All Members
          </button>
        </div>
      </div>

      {/* Current Announcement Preview */}
      {activeAnnouncement && (
        <div className="current-announcement">
          <h3>Current Active Announcement</h3>
          <div className="announcement-preview">
            <div className={`announcement-type ${activeAnnouncement.type}`}>
              {activeAnnouncement.type === 'urgent' && <AlertTriangle size={16} />}
              {activeAnnouncement.type === 'info' && <Info size={16} />}
              {activeAnnouncement.type === 'event' && <Calendar size={16} />}
              {activeAnnouncement.type}
            </div>
            <h4>{activeAnnouncement.title}</h4>
            <p>{activeAnnouncement.message}</p>
            <button 
              className="btn btn-sm btn-primary"
              onClick={() => setActiveSection('announcements')}
            >
              Manage Announcements
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Placeholder components for other sections
const AnnouncementsSection: React.FC = () => (
  <div className="section-placeholder">
    <Bell size={48} />
    <h3>Announcements Management</h3>
    <p>Create, edit, and manage parish announcements</p>
    <button className="btn btn-primary">
      <Plus size={20} />
      Add New Announcement
    </button>
  </div>
);

const EventsSection: React.FC = () => (
  <div className="section-placeholder">
    <Calendar size={48} />
    <h3>Events Management</h3>
    <p>Manage parish events and community calendar</p>
    <button className="btn btn-primary">
      <Plus size={20} />
      Add New Event
    </button>
  </div>
);

const GallerySection: React.FC = () => (
  <div className="section-placeholder">
    <Image size={48} />
    <h3>Gallery Management</h3>
    <p>Upload and organize parish photos</p>
    <button className="btn btn-primary">
      <Plus size={20} />
      Upload Images
    </button>
  </div>
);



const PriestsDeskSection: React.FC = () => {
  const [messages, setMessages] = useState([
    {
      id: '1',
      title: 'A Message of Hope and Unity',
      date: '2024-12-30',
      expirationDate: '2025-01-31',
      publishedAt: '2024-12-15T10:30:00Z',
      isPublished: true,
      content: `Dear beloved parishioners and friends,

As we approach the end of this year and look forward to 2025, I am filled with gratitude for the many blessings God has bestowed upon our parish community. Despite the challenges we have faced, our faith has remained strong, and our unity has grown deeper.

The theme for 2025, "Hope does not disappoint" (Romans 5:5), reminds us that our hope is anchored in Christ. In the coming year, let us continue to be instruments of God's love and mercy in our community. Let us reach out to those in need, welcome the stranger, and be beacons of hope in our neighborhood.

I encourage each of you to participate actively in our parish life - through our ministries, our liturgical celebrations, and our community outreach programs. Together, we can make St. Patrick's a true home for all who seek God's love.

May God bless you and your families abundantly in the coming year.

In Christ,
Fr. Joseph Sibanda
Parish Priest`
    }
  ]);

  const [currentMessage, setCurrentMessage] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    expirationDate: '',
    content: ''
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showNewMessageForm, setShowNewMessageForm] = useState(false);

  const handlePublishMessage = () => {
    const now = new Date().toISOString();
    const newMessage = {
      id: Date.now().toString(),
      ...currentMessage,
      publishedAt: now,
      isPublished: true
    };
    
    setMessages([newMessage, ...messages]);
    setCurrentMessage({
      title: '',
      date: new Date().toISOString().split('T')[0],
      expirationDate: '',
      content: ''
    });
    setShowNewMessageForm(false);
    setIsEditing(false);
  };

  const handleEditMessage = (message: any) => {
    setCurrentMessage({
      title: message.title,
      date: message.date,
      expirationDate: message.expirationDate,
      content: message.content
    });
    setEditingId(message.id);
    setIsEditing(true);
  };

  const handleUpdateMessage = () => {
    setMessages(messages.map(msg => 
      msg.id === editingId 
        ? { ...msg, ...currentMessage }
        : msg
    ));
    setEditingId(null);
    setIsEditing(false);
    setCurrentMessage({
      title: '',
      date: new Date().toISOString().split('T')[0],
      expirationDate: '',
      content: ''
    });
  };

  const handleDeleteMessage = (id: string) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      setMessages(messages.filter(msg => msg.id !== id));
    }
  };

  const isExpired = (expirationDate: string) => {
    return new Date(expirationDate) < new Date();
  };

  return (
    <div className="priests-desk-section">
      <div className="section-header">
        <h2>Priest's Desk Messages</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowNewMessageForm(true)}
        >
          <Plus size={20} />
          Add New Message
        </button>
      </div>

      {/* Messages List */}
      <div className="messages-list">
        {messages.map(message => (
          <div key={message.id} className={`message-card ${isExpired(message.expirationDate) ? 'expired' : ''}`}>
            <div className="message-header">
              <h3>{message.title}</h3>
              <div className="message-actions">
                <button 
                  className="btn btn-outline btn-sm"
                  onClick={() => handleEditMessage(message)}
                >
                  <Edit size={16} />
                </button>
                <button 
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDeleteMessage(message.id)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <div className="message-meta">
              <span className="message-date">📅 {new Date(message.date).toLocaleDateString()}</span>
              <span className="expiration-date">⏰ Expires: {new Date(message.expirationDate).toLocaleDateString()}</span>
              <span className="published-date">📤 Published: {new Date(message.publishedAt).toLocaleString()}</span>
              <span className={`status ${isExpired(message.expirationDate) ? 'expired' : 'active'}`}>
                {isExpired(message.expirationDate) ? '❌ Expired' : '✅ Active'}
              </span>
            </div>
            <div className="message-content">
              {message.content.substring(0, 200)}...
            </div>
          </div>
        ))}
      </div>

      {/* New/Edit Message Form */}
      {(showNewMessageForm || isEditing) && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{editingId ? 'Edit Message' : 'New Message'}</h3>
              <button 
                className="btn-close"
                onClick={() => {
                  setShowNewMessageForm(false);
                  setIsEditing(false);
                  setEditingId(null);
                  setCurrentMessage({
                    title: '',
                    date: new Date().toISOString().split('T')[0],
                    expirationDate: '',
                    content: ''
                  });
                }}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="message-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Message Title *</label>
                  <input
                    type="text"
                    value={currentMessage.title}
                    onChange={(e) => setCurrentMessage({...currentMessage, title: e.target.value})}
                    placeholder="Enter message title"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Message Date *</label>
                  <input
                    type="date"
                    value={currentMessage.date}
                    onChange={(e) => setCurrentMessage({...currentMessage, date: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Expiration Date *</label>
                <input
                  type="date"
                  value={currentMessage.expirationDate}
                  onChange={(e) => setCurrentMessage({...currentMessage, expirationDate: e.target.value})}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
                <small>Message will automatically disappear from home page after this date</small>
              </div>

              <div className="form-group">
                <label>Message Content *</label>
                <textarea
                  value={currentMessage.content}
                  onChange={(e) => setCurrentMessage({...currentMessage, content: e.target.value})}
                  rows={12}
                  placeholder="Enter your message content..."
                  required
                />
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => {
                    setShowNewMessageForm(false);
                    setIsEditing(false);
                    setEditingId(null);
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-success"
                  onClick={editingId ? handleUpdateMessage : handlePublishMessage}
                  disabled={!currentMessage.title || !currentMessage.content || !currentMessage.expirationDate}
                >
                  {editingId ? 'Update Message' : 'Publish Message'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const AnalyticsSection: React.FC<{
  websiteData: any;
  parishMembers: ParishMember[];
}> = ({ websiteData, parishMembers }) => {

  return (
    <div className="analytics-section">
      {/* Key Metrics Overview */}
      <div className="analytics-overview">
        <div className="metric-card primary">
          <div className="metric-icon">
            <Activity size={32} />
          </div>
          <div className="metric-content">
            <div className="metric-number">{websiteData.totalVisitors.toLocaleString()}</div>
            <div className="metric-label">Total Visitors</div>
            <div className="metric-change positive">+12% this month</div>
          </div>
        </div>

        <div className="metric-card secondary">
          <div className="metric-icon">
            <Eye size={32} />
          </div>
          <div className="metric-content">
            <div className="metric-number">{websiteData.pageViews.toLocaleString()}</div>
            <div className="metric-label">Page Views</div>
            <div className="metric-change positive">+8% this month</div>
          </div>
        </div>

        <div className="metric-card tertiary">
          <div className="metric-icon">
            <Users size={32} />
          </div>
          <div className="metric-content">
            <div className="metric-number">{parishMembers.filter(m => m.status === 'online').length}</div>
            <div className="metric-label">Active Members</div>
            <div className="metric-change">{parishMembers.length} total</div>
          </div>
        </div>

        <div className="metric-card quaternary">
          <div className="metric-icon">
            <Clock size={32} />
          </div>
          <div className="metric-content">
            <div className="metric-number">{websiteData.avgSessionDuration}</div>
            <div className="metric-label">Avg. Session</div>
            <div className="metric-change positive">+15s this month</div>
          </div>
        </div>
      </div>

      {/* Charts and Graphs */}
      <div className="analytics-charts">
        {/* Monthly Traffic Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Monthly Website Traffic</h3>
            <TrendingUp size={20} />
          </div>
          <div className="chart-container">
            <div className="bar-chart">
              {websiteData.monthlyData.map((month: any, index: number) => (
                <div key={index} className="bar-group">
                  <div className="bar-container">
                    <div 
                      className="bar visitors" 
                      style={{ height: `${(month.visitors / 2500) * 100}%` }}
                      title={`${month.visitors} visitors`}
                    ></div>
                    <div 
                      className="bar pageviews" 
                      style={{ height: `${(month.pageViews / 7000) * 100}%` }}
                      title={`${month.pageViews} page views`}
                    ></div>
                  </div>
                  <div className="bar-label">{month.month}</div>
                </div>
              ))}
            </div>
            <div className="chart-legend">
              <div className="legend-item">
                <div className="legend-color visitors"></div>
                <span>Visitors</span>
              </div>
              <div className="legend-item">
                <div className="legend-color pageviews"></div>
                <span>Page Views</span>
              </div>
            </div>
          </div>
        </div>

        {/* Top Pages */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Most Popular Pages</h3>
            <BarChart3 size={20} />
          </div>
          <div className="pages-chart">
            {websiteData.topPages.map((page: any, index: number) => (
              <div key={index} className="page-row">
                <div className="page-info">
                  <span className="page-name">{page.page}</span>
                  <span className="page-views">{page.views.toLocaleString()}</span>
                </div>
                <div className="page-bar">
                  <div 
                    className="page-fill" 
                    style={{ width: `${page.percentage}%` }}
                  ></div>
                  <span className="page-percentage">{page.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Parish Members Status */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Parish Members Activity</h3>
            <Users size={20} />
          </div>
          <div className="members-chart">
            <div className="status-distribution">
              <div className="status-pie">
                <div className="pie-segment online" style={{ 
                  '--percentage': `${(parishMembers.filter(m => m.status === 'online').length / parishMembers.length) * 100}%` 
                } as React.CSSProperties}></div>
                <div className="pie-segment away" style={{ 
                  '--percentage': `${(parishMembers.filter(m => m.status === 'away').length / parishMembers.length) * 100}%` 
                } as React.CSSProperties}></div>
                <div className="pie-segment offline" style={{ 
                  '--percentage': `${(parishMembers.filter(m => m.status === 'offline').length / parishMembers.length) * 100}%` 
                } as React.CSSProperties}></div>
              </div>
              <div className="status-legend">
                <div className="legend-item">
                  <div className="status-dot online"></div>
                  <span>Online ({parishMembers.filter(m => m.status === 'online').length})</span>
                </div>
                <div className="legend-item">
                  <div className="status-dot away"></div>
                  <span>Away ({parishMembers.filter(m => m.status === 'away').length})</span>
                </div>
                <div className="legend-item">
                  <div className="status-dot offline"></div>
                  <span>Offline ({parishMembers.filter(m => m.status === 'offline').length})</span>
                </div>
              </div>
            </div>
            <div className="members-list">
              <h4>Recently Active Members</h4>
              {parishMembers.slice(0, 5).map((member) => (
                <div key={member.id} className="member-row">
                  <div className="member-avatar">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="member-details">
                    <span className="member-name">{member.name}</span>
                    <span className="member-last-seen">
                      {member.status === 'online' ? 'Active now' : 
                       `Last seen ${Math.floor((new Date().getTime() - member.lastLogin.getTime()) / 60000)} min ago`}
                    </span>
                  </div>
                  <div className={`member-status-indicator ${member.status}`}></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Engagement Metrics */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Engagement Overview</h3>
            <Heart size={20} />
          </div>
          <div className="engagement-grid">
            <div className="engagement-metric">
              <div className="metric-circle">
                <div className="circle-progress" style={{ '--progress': '67' } as React.CSSProperties}>
                  <span>67%</span>
                </div>
              </div>
              <div className="metric-info">
                <h4>Return Visitors</h4>
                <p>Users who visited multiple times</p>
              </div>
            </div>
            <div className="engagement-metric">
              <div className="metric-circle">
                <div className="circle-progress" style={{ '--progress': `${100 - websiteData.bounceRate}` } as React.CSSProperties}>
                  <span>{(100 - websiteData.bounceRate).toFixed(0)}%</span>
                </div>
              </div>
              <div className="metric-info">
                <h4>Engagement Rate</h4>
                <p>Users who viewed multiple pages</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="analytics-summary">
        <h3>Today's Highlights</h3>
        <div className="summary-grid">
          <div className="summary-card">
            <div className="summary-icon">
              <Activity size={24} />
            </div>
            <div className="summary-content">
              <h4>{websiteData.todayVisitors}</h4>
              <p>Visitors Today</p>
              <span className="summary-change positive">+23 from yesterday</span>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon">
              <Clock size={24} />
            </div>
            <div className="summary-content">
              <h4>9:30 AM</h4>
              <p>Peak Activity Time</p>
              <span className="summary-change">Sunday Mass preparation</span>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon">
              <Users size={24} />
            </div>
            <div className="summary-content">
              <h4>{parishMembers.filter(m => new Date().getTime() - m.lastLogin.getTime() < 86400000).length}</h4>
              <p>Active Members Today</p>
              <span className="summary-change positive">Highest this week</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Contact Section Component
const ContactSection: React.FC = () => {
  const [contactInfo, setContactInfo] = useState({
    phone: '+263 9 123 456',
    email: 'info@stpatricksmakokoba.org',
    address: '123 Church Street, Makokoba, Bulawayo, Zimbabwe',
    emergencyPhone: '+263 9 987 654',
    office: {
      weekdays: '8:00 AM - 5:00 PM',
      saturday: '8:00 AM - 12:00 PM',
      sunday: 'Closed (Except for services)'
    }
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    // Save contact info to context/localStorage
    localStorage.setItem('churchContactInfo', JSON.stringify(contactInfo));
    setIsEditing(false);
  };

  return (
    <div className="contact-section">
      <div className="section-header">
        <h3>Contact Information Management</h3>
        <button 
          className={`btn ${isEditing ? 'btn-success' : 'btn-primary'}`}
          onClick={isEditing ? handleSave : () => setIsEditing(true)}
        >
          {isEditing ? 'Save Changes' : 'Edit Contact Info'}
        </button>
      </div>

      <div className="contact-form">
        <div className="form-row">
          <div className="form-group">
            <label>Main Phone Number</label>
            <input
              type="text"
              value={contactInfo.phone}
              onChange={(e) => setContactInfo({...contactInfo, phone: e.target.value})}
              disabled={!isEditing}
            />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              value={contactInfo.email}
              onChange={(e) => setContactInfo({...contactInfo, email: e.target.value})}
              disabled={!isEditing}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Church Address</label>
          <textarea
            value={contactInfo.address}
            onChange={(e) => setContactInfo({...contactInfo, address: e.target.value})}
            disabled={!isEditing}
            rows={3}
          />
        </div>

        <div className="form-group">
          <label>Emergency Contact</label>
          <input
            type="text"
            value={contactInfo.emergencyPhone}
            onChange={(e) => setContactInfo({...contactInfo, emergencyPhone: e.target.value})}
            disabled={!isEditing}
          />
        </div>

        <div className="office-hours">
          <h4>Office Hours</h4>
          <div className="form-row">
            <div className="form-group">
              <label>Weekdays</label>
              <input
                type="text"
                value={contactInfo.office.weekdays}
                onChange={(e) => setContactInfo({
                  ...contactInfo, 
                  office: {...contactInfo.office, weekdays: e.target.value}
                })}
                disabled={!isEditing}
              />
            </div>
            <div className="form-group">
              <label>Saturday</label>
              <input
                type="text"
                value={contactInfo.office.saturday}
                onChange={(e) => setContactInfo({
                  ...contactInfo, 
                  office: {...contactInfo.office, saturday: e.target.value}
                })}
                disabled={!isEditing}
              />
            </div>
            <div className="form-group">
              <label>Sunday</label>
              <input
                type="text"
                value={contactInfo.office.sunday}
                onChange={(e) => setContactInfo({
                  ...contactInfo, 
                  office: {...contactInfo.office, sunday: e.target.value}
                })}
                disabled={!isEditing}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Schedule Section Component
const ScheduleSection: React.FC = () => {
  const [massSchedule, setMassSchedule] = useState([
    { day: 'Sunday', times: ['7:00 AM', '9:00 AM', '11:00 AM', '6:00 PM'], language: 'English & IsiNdebele' },
    { day: 'Monday', times: ['6:00 AM', '6:00 PM'], language: 'English' },
    { day: 'Tuesday', times: ['6:00 AM', '6:00 PM'], language: 'English' },
    { day: 'Wednesday', times: ['6:00 AM', '6:00 PM'], language: 'English' },
    { day: 'Thursday', times: ['6:00 AM', '6:00 PM'], language: 'English' },
    { day: 'Friday', times: ['6:00 AM', '6:00 PM'], language: 'English' },
    { day: 'Saturday', times: ['7:00 AM', '6:00 PM'], language: 'English' }
  ]);

  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    localStorage.setItem('churchMassSchedule', JSON.stringify(massSchedule));
    setIsEditing(false);
  };

  const updateSchedule = (dayIndex: number, field: string, value: any) => {
    const updated = [...massSchedule];
    updated[dayIndex] = { ...updated[dayIndex], [field]: value };
    setMassSchedule(updated);
  };

  return (
    <div className="schedule-section">
      <div className="section-header">
        <h3>Mass Schedule Management</h3>
        <button 
          className={`btn ${isEditing ? 'btn-success' : 'btn-primary'}`}
          onClick={isEditing ? handleSave : () => setIsEditing(true)}
        >
          {isEditing ? 'Save Schedule' : 'Edit Schedule'}
        </button>
      </div>

      <div className="schedule-grid">
        {massSchedule.map((schedule, index) => (
          <div key={schedule.day} className="schedule-card">
            <h4>{schedule.day}</h4>
            <div className="times-section">
              <label>Mass Times</label>
              <input
                type="text"
                value={schedule.times.join(', ')}
                onChange={(e) => updateSchedule(index, 'times', e.target.value.split(', '))}
                disabled={!isEditing}
                placeholder="e.g., 7:00 AM, 9:00 AM"
              />
            </div>
            <div className="language-section">
              <label>Languages</label>
              <input
                type="text"
                value={schedule.language}
                onChange={(e) => updateSchedule(index, 'language', e.target.value)}
                disabled={!isEditing}
                placeholder="e.g., English & IsiNdebele"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// User Management Section Component
const UserManagementSection: React.FC = () => {
  const [users, setUsers] = useState([
    { id: '1', username: 'parishioner', email: 'parishioner@example.com', role: 'user', status: 'active', lastLogin: '2024-01-15' },
    { id: '2', username: 'admin', email: 'admin@stpatricks.org', role: 'admin', status: 'active', lastLogin: '2024-01-16' }
  ]);

  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', email: '', role: 'user', password: '' });
  
  // Password reset modal state
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetUserId, setResetUserId] = useState('');
  const [resetUserName, setResetUserName] = useState('');
  const [resetPassword, setResetPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetPasswordError, setResetPasswordError] = useState('');

  const handleAddUser = () => {
    const user = {
      id: Date.now().toString(),
      ...newUser,
      status: 'active',
      lastLogin: 'Never'
    };
    setUsers([...users, user]);
    setNewUser({ username: '', email: '', role: 'user', password: '' });
    setShowAddUser(false);
  };

  const handleResetPassword = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setResetUserId(userId);
      setResetUserName(user.username);
      setShowResetPassword(true);
      setResetPassword('');
      setConfirmPassword('');
      setResetPasswordError('');
    }
  };

  const handleConfirmPasswordReset = () => {
    // Validate passwords
    if (!resetPassword || !confirmPassword) {
      setResetPasswordError('Please enter both password fields');
      return;
    }
    
    if (resetPassword.length < 6) {
      setResetPasswordError('Password must be at least 6 characters long');
      return;
    }
    
    if (resetPassword !== confirmPassword) {
      setResetPasswordError('Passwords do not match');
      return;
    }
    
    // Update user password (in real app, this would call an API)
    setUsers(users.map(user => 
      user.id === resetUserId 
        ? { ...user, password: resetPassword }
        : user
    ));
    
    // Close modal and reset state
    setShowResetPassword(false);
    setResetUserId('');
    setResetUserName('');
    setResetPassword('');
    setConfirmPassword('');
    setResetPasswordError('');
    
    alert(`Password successfully reset for user: ${resetUserName}`);
  };

  const handleCancelPasswordReset = () => {
    setShowResetPassword(false);
    setResetUserId('');
    setResetUserName('');
    setResetPassword('');
    setConfirmPassword('');
    setResetPasswordError('');
  };

  // Function to prevent copy/paste
  const handlePasswordInputEvents = (e: React.ClipboardEvent<HTMLInputElement> | React.KeyboardEvent<HTMLInputElement>) => {
    if (e.type === 'paste' || e.type === 'copy' || e.type === 'cut') {
      e.preventDefault();
      return false;
    }
    
    // Prevent Ctrl+V, Ctrl+C, Ctrl+X
    if (e.type === 'keydown') {
      const keyEvent = e as React.KeyboardEvent<HTMLInputElement>;
      if (keyEvent.ctrlKey && (keyEvent.key === 'v' || keyEvent.key === 'c' || keyEvent.key === 'x')) {
        e.preventDefault();
        return false;
      }
    }
  };

  const handleToggleStatus = (userId: string) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' }
        : user
    ));
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(user => user.id !== userId));
    }
  };

  return (
    <div className="user-management-section">
      <div className="section-header">
        <h3>User Management</h3>
        <button 
          className="btn btn-primary"
          onClick={() => setShowAddUser(true)}
        >
          <Plus size={16} />
          Add New User
        </button>
      </div>

      {showAddUser && (
        <div className="add-user-form">
          <h4>Add New User</h4>
          <div className="form-row">
            <input
              type="text"
              placeholder="Username"
              value={newUser.username}
              onChange={(e) => setNewUser({...newUser, username: e.target.value})}
            />
            <input
              type="email"
              placeholder="Email"
              value={newUser.email}
              onChange={(e) => setNewUser({...newUser, email: e.target.value})}
            />
            <select
              value={newUser.role}
              onChange={(e) => setNewUser({...newUser, role: e.target.value})}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            <input
              type="password"
              placeholder="Password"
              value={newUser.password}
              onChange={(e) => setNewUser({...newUser, password: e.target.value})}
            />
          </div>
          <div className="form-actions">
            <button className="btn btn-success" onClick={handleAddUser}>Add User</button>
            <button className="btn btn-secondary" onClick={() => setShowAddUser(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="users-table">
        <table>
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Last Login</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`role-badge ${user.role}`}>
                    {user.role === 'admin' ? <Shield size={12} /> : <Users size={12} />}
                    {user.role}
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${user.status}`}>
                    {user.status}
                  </span>
                </td>
                <td>{user.lastLogin}</td>
                <td className="actions">
                  <button 
                    className="btn-icon"
                    onClick={() => handleResetPassword(user.id)}
                    title="Reset Password"
                  >
                    <Settings size={16} />
                  </button>
                  <button 
                    className="btn-icon"
                    onClick={() => handleToggleStatus(user.id)}
                    title={user.status === 'active' ? 'Deactivate' : 'Activate'}
                  >
                    {user.status === 'active' ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  <button 
                    className="btn-icon danger"
                    onClick={() => handleDeleteUser(user.id)}
                    title="Delete User"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Password Reset Modal */}
      {showResetPassword && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Reset Password for {resetUserName}</h3>
            </div>
            <div className="modal-body">
              {resetPasswordError && (
                <div className="error-message">
                  <AlertTriangle size={16} />
                  {resetPasswordError}
                </div>
              )}
              <div className="form-group">
                <label>New Password:</label>
                <input
                  type="password"
                  value={resetPassword}
                  onChange={(e) => setResetPassword(e.target.value)}
                  onPaste={handlePasswordInputEvents}
                  onCopy={handlePasswordInputEvents}
                  onCut={handlePasswordInputEvents}
                  onKeyDown={handlePasswordInputEvents}
                  placeholder="Enter new password (min 6 characters)"
                  autoComplete="new-password"
                />
              </div>
              <div className="form-group">
                <label>Confirm Password:</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onPaste={handlePasswordInputEvents}
                  onCopy={handlePasswordInputEvents}
                  onCut={handlePasswordInputEvents}
                  onKeyDown={handlePasswordInputEvents}
                  placeholder="Confirm new password"
                  autoComplete="new-password"
                />
              </div>
              <div className="password-requirements">
                <small>
                  • Password must be at least 6 characters long<br/>
                  • Copy/paste is disabled for security
                </small>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-success" 
                onClick={handleConfirmPasswordReset}
                disabled={!resetPassword || !confirmPassword}
              >
                Reset Password
              </button>
              <button 
                className="btn btn-secondary" 
                onClick={handleCancelPasswordReset}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Theme Management Section
const ThemeManagementSection: React.FC = () => {
  const { themesOfYear, addThemeOfYear, updateThemeOfYear, deleteThemeOfYear } = useAdmin();
  const [showAddTheme, setShowAddTheme] = useState(false);
  const [selectedThemeImageFile, setSelectedThemeImageFile] = useState<File | null>(null);
  const [newTheme, setNewTheme] = useState({
    year: new Date().getFullYear(),
    title: '',
    subtitle: '',
    verse: '',
    description: '',
    imageUrl: '/api/placeholder/400/300',
    isActive: false
  });

  const handleAddTheme = async () => {
    if (newTheme.title && newTheme.verse) {
      let finalImageUrl = newTheme.imageUrl;
      
      // If an image file was selected, we would upload it here
      if (selectedThemeImageFile) {
        // In a real implementation, you would upload the file to your server
        // finalImageUrl = await uploadImageToServer(selectedThemeImageFile);
        console.log('Theme image file selected:', selectedThemeImageFile.name);
      }
      
      addThemeOfYear({
        ...newTheme,
        imageUrl: finalImageUrl
      });
      
      // Reset form
      setNewTheme({
        year: new Date().getFullYear(),
        title: '',
        subtitle: '',
        verse: '',
        description: '',
        imageUrl: '/api/placeholder/400/300',
        isActive: false
      });
      setSelectedThemeImageFile(null);
      setShowAddTheme(false);
    }
  };

  const handleThemeImageSelect = (file: File, previewUrl: string) => {
    setSelectedThemeImageFile(file);
    setNewTheme(prev => ({
      ...prev,
      imageUrl: previewUrl
    }));
  };

  const handleThemeImageRemove = () => {
    setSelectedThemeImageFile(null);
    setNewTheme(prev => ({
      ...prev,
      imageUrl: '/api/placeholder/400/300'
    }));
  };

  return (
    <div className="theme-management-section">
      <div className="section-header">
        <h3>Theme of the Year Management</h3>
        <button 
          className="btn btn-primary"
          onClick={() => setShowAddTheme(true)}
        >
          <Plus size={16} />
          Add New Theme
        </button>
      </div>

      {showAddTheme && (
        <div className="add-theme-form">
          <h4>Add New Theme</h4>
          <div className="form-row">
            <div className="form-group">
              <label>Year</label>
              <input
                type="number"
                value={newTheme.year}
                onChange={(e) => setNewTheme({...newTheme, year: parseInt(e.target.value)})}
              />
            </div>
            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                placeholder="Theme title"
                value={newTheme.title}
                onChange={(e) => setNewTheme({...newTheme, title: e.target.value})}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Subtitle</label>
            <input
              type="text"
              placeholder="Theme subtitle"
              value={newTheme.subtitle}
              onChange={(e) => setNewTheme({...newTheme, subtitle: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label>Bible Verse</label>
            <input
              type="text"
              placeholder="Bible verse reference"
              value={newTheme.verse}
              onChange={(e) => setNewTheme({...newTheme, verse: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              placeholder="Theme description"
              value={newTheme.description}
              onChange={(e) => setNewTheme({...newTheme, description: e.target.value})}
              rows={4}
            />
          </div>
          <ImageUpload
            label="Theme Image"
            onImageSelect={handleThemeImageSelect}
            onImageRemove={handleThemeImageRemove}
            currentImageUrl={newTheme.imageUrl !== '/api/placeholder/400/300' ? newTheme.imageUrl : undefined}
            maxSizeInMB={3}
          />
          <div className="form-actions">
            <button className="btn btn-success" onClick={handleAddTheme}>Add Theme</button>
            <button className="btn btn-secondary" onClick={() => setShowAddTheme(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="themes-list">
        {themesOfYear.map(theme => (
          <div key={theme.id} className="theme-card">
            <div className="theme-preview">
              <img src={theme.imageUrl} alt={theme.title} />
            </div>
            <div className="theme-details">
              <h4>{theme.title} ({theme.year})</h4>
              <p className="theme-verse">{theme.verse}</p>
              <p>{theme.description}</p>
              <div className="theme-actions">
                <button 
                  className={`btn ${theme.isActive ? 'btn-success' : 'btn-secondary'}`}
                  onClick={() => updateThemeOfYear(theme.id, { isActive: !theme.isActive })}
                >
                  {theme.isActive ? 'Active' : 'Inactive'}
                </button>
                <button 
                  className="btn btn-danger"
                  onClick={() => deleteThemeOfYear(theme.id)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Ministry Management Section
const MinistryManagementSection: React.FC = () => {
  const { ministries, addMinistry, updateMinistry, deleteMinistry } = useAdmin();
  const [showAddMinistry, setShowAddMinistry] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [newMinistry, setNewMinistry] = useState({
    name: '',
    description: '',
    imageUrl: '/api/placeholder/300/200',
    contactPerson: '',
    meetingTime: '',
    isActive: true
  });

  const handleAddMinistry = async () => {
    if (newMinistry.name && newMinistry.description) {
      let finalImageUrl = newMinistry.imageUrl;
      
      // If an image file was selected, we would upload it here
      // For now, we'll use the preview URL or placeholder
      if (selectedImageFile) {
        // In a real implementation, you would upload the file to your server
        // finalImageUrl = await uploadImageToServer(selectedImageFile);
        console.log('Image file selected:', selectedImageFile.name);
      }
      
      addMinistry({
        ...newMinistry,
        imageUrl: finalImageUrl
      });
      
      // Reset form
      setNewMinistry({
        name: '',
        description: '',
        imageUrl: '/api/placeholder/300/200',
        contactPerson: '',
        meetingTime: '',
        isActive: true
      });
      setSelectedImageFile(null);
      setShowAddMinistry(false);
    }
  };

  const handleImageSelect = (file: File, previewUrl: string) => {
    setSelectedImageFile(file);
    setNewMinistry(prev => ({
      ...prev,
      imageUrl: previewUrl
    }));
  };

  const handleImageRemove = () => {
    setSelectedImageFile(null);
    setNewMinistry(prev => ({
      ...prev,
      imageUrl: '/api/placeholder/300/200'
    }));
  };

  return (
    <div className="ministry-management-section">
      <div className="section-header">
        <h3>Ministry Management</h3>
        <button 
          className="btn btn-primary"
          onClick={() => setShowAddMinistry(true)}
        >
          <Plus size={16} />
          Add New Ministry
        </button>
      </div>

      {showAddMinistry && (
        <div className="add-ministry-form">
          <h4>Add New Ministry</h4>
          <div className="form-row">
            <div className="form-group">
              <label>Ministry Name</label>
              <input
                type="text"
                placeholder="Ministry name"
                value={newMinistry.name}
                onChange={(e) => setNewMinistry({...newMinistry, name: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Contact Person</label>
              <input
                type="text"
                placeholder="Contact person"
                value={newMinistry.contactPerson}
                onChange={(e) => setNewMinistry({...newMinistry, contactPerson: e.target.value})}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              placeholder="Ministry description"
              value={newMinistry.description}
              onChange={(e) => setNewMinistry({...newMinistry, description: e.target.value})}
              rows={3}
            />
          </div>
          <div className="form-group">
            <label>Meeting Time</label>
            <input
              type="text"
              placeholder="Meeting time"
              value={newMinistry.meetingTime}
              onChange={(e) => setNewMinistry({...newMinistry, meetingTime: e.target.value})}
            />
          </div>
          <ImageUpload
            label="Ministry Image"
            onImageSelect={handleImageSelect}
            onImageRemove={handleImageRemove}
            currentImageUrl={newMinistry.imageUrl !== '/api/placeholder/300/200' ? newMinistry.imageUrl : undefined}
            maxSizeInMB={2}
          />
          <div className="form-actions">
            <button className="btn btn-success" onClick={handleAddMinistry}>Add Ministry</button>
            <button className="btn btn-secondary" onClick={() => setShowAddMinistry(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="ministries-grid">
        {ministries.map(ministry => (
          <div key={ministry.id} className="ministry-card">
            <div className="ministry-image">
              <img src={ministry.imageUrl} alt={ministry.name} />
            </div>
            <div className="ministry-content">
              <h4>{ministry.name}</h4>
              <p>{ministry.description}</p>
              <div className="ministry-meta">
                <p><strong>Contact:</strong> {ministry.contactPerson}</p>
                <p><strong>Meeting:</strong> {ministry.meetingTime}</p>
              </div>
              <div className="ministry-actions">
                <button 
                  className={`btn ${ministry.isActive ? 'btn-success' : 'btn-secondary'}`}
                  onClick={() => updateMinistry(ministry.id, { isActive: !ministry.isActive })}
                >
                  {ministry.isActive ? 'Active' : 'Inactive'}
                </button>
                <button 
                  className="btn btn-danger"
                  onClick={() => deleteMinistry(ministry.id)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Sacrament Management Section
const SacramentManagementSection: React.FC = () => {
  const { sacraments, addSacrament, updateSacrament, deleteSacrament } = useAdmin();
  const [showAddSacrament, setShowAddSacrament] = useState(false);
  const [selectedSacramentImageFile, setSelectedSacramentImageFile] = useState<File | null>(null);
  const [newSacrament, setNewSacrament] = useState({
    name: '',
    description: '',
    imageUrl: '/api/placeholder/300/200',
    requirements: [''],
    contactInfo: '',
    isActive: true
  });

  const handleAddSacrament = async () => {
    if (newSacrament.name && newSacrament.description) {
      let finalImageUrl = newSacrament.imageUrl;
      
      // If an image file was selected, we would upload it here
      if (selectedSacramentImageFile) {
        // In a real implementation, you would upload the file to your server
        // finalImageUrl = await uploadImageToServer(selectedSacramentImageFile);
        console.log('Sacrament image file selected:', selectedSacramentImageFile.name);
      }
      
      addSacrament({
        ...newSacrament,
        imageUrl: finalImageUrl,
        requirements: newSacrament.requirements.filter(req => req.trim() !== '')
      });
      
      // Reset form
      setNewSacrament({
        name: '',
        description: '',
        imageUrl: '/api/placeholder/300/200',
        requirements: [''],
        contactInfo: '',
        isActive: true
      });
      setSelectedSacramentImageFile(null);
      setShowAddSacrament(false);
    }
  };

  const handleSacramentImageSelect = (file: File, previewUrl: string) => {
    setSelectedSacramentImageFile(file);
    setNewSacrament(prev => ({
      ...prev,
      imageUrl: previewUrl
    }));
  };

  const handleSacramentImageRemove = () => {
    setSelectedSacramentImageFile(null);
    setNewSacrament(prev => ({
      ...prev,
      imageUrl: '/api/placeholder/300/200'
    }));
  };

  const addRequirement = () => {
    setNewSacrament({
      ...newSacrament,
      requirements: [...newSacrament.requirements, '']
    });
  };

  const updateRequirement = (index: number, value: string) => {
    const updatedRequirements = [...newSacrament.requirements];
    updatedRequirements[index] = value;
    setNewSacrament({
      ...newSacrament,
      requirements: updatedRequirements
    });
  };

  const removeRequirement = (index: number) => {
    setNewSacrament({
      ...newSacrament,
      requirements: newSacrament.requirements.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="sacrament-management-section">
      <div className="section-header">
        <h3>Sacrament Management</h3>
        <button 
          className="btn btn-primary"
          onClick={() => setShowAddSacrament(true)}
        >
          <Plus size={16} />
          Add New Sacrament
        </button>
      </div>

      {showAddSacrament && (
        <div className="add-sacrament-form">
          <h4>Add New Sacrament</h4>
          <div className="form-group">
            <label>Sacrament Name</label>
            <input
              type="text"
              placeholder="Sacrament name"
              value={newSacrament.name}
              onChange={(e) => setNewSacrament({...newSacrament, name: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              placeholder="Sacrament description"
              value={newSacrament.description}
              onChange={(e) => setNewSacrament({...newSacrament, description: e.target.value})}
              rows={3}
            />
          </div>
          <div className="form-group">
            <label>Requirements</label>
            {newSacrament.requirements.map((req, index) => (
              <div key={index} className="requirement-row">
                <input
                  type="text"
                  placeholder="Requirement"
                  value={req}
                  onChange={(e) => updateRequirement(index, e.target.value)}
                />
                <button 
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={() => removeRequirement(index)}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            <button type="button" className="btn btn-secondary btn-sm" onClick={addRequirement}>
              Add Requirement
            </button>
          </div>
          <div className="form-group">
            <label>Contact Information</label>
            <input
              type="text"
              placeholder="Contact information"
              value={newSacrament.contactInfo}
              onChange={(e) => setNewSacrament({...newSacrament, contactInfo: e.target.value})}
            />
          </div>
          <ImageUpload
            label="Sacrament Image"
            onImageSelect={handleSacramentImageSelect}
            onImageRemove={handleSacramentImageRemove}
            currentImageUrl={newSacrament.imageUrl !== '/api/placeholder/300/200' ? newSacrament.imageUrl : undefined}
            maxSizeInMB={2}
          />
          <div className="form-actions">
            <button className="btn btn-success" onClick={handleAddSacrament}>Add Sacrament</button>
            <button className="btn btn-secondary" onClick={() => setShowAddSacrament(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="sacraments-grid">
        {sacraments.map(sacrament => (
          <div key={sacrament.id} className="sacrament-card">
            <div className="sacrament-image">
              <img src={sacrament.imageUrl} alt={sacrament.name} />
            </div>
            <div className="sacrament-content">
              <h4>{sacrament.name}</h4>
              <p>{sacrament.description}</p>
              <div className="sacrament-requirements">
                <h5>Requirements:</h5>
                <ul>
                  {sacrament.requirements.map((req, index) => (
                    <li key={index}>{req}</li>
                  ))}
                </ul>
              </div>
              <p><strong>Contact:</strong> {sacrament.contactInfo}</p>
              <div className="sacrament-actions">
                <button 
                  className={`btn ${sacrament.isActive ? 'btn-success' : 'btn-secondary'}`}
                  onClick={() => updateSacrament(sacrament.id, { isActive: !sacrament.isActive })}
                >
                  {sacrament.isActive ? 'Active' : 'Inactive'}
                </button>
                <button 
                  className="btn btn-danger"
                  onClick={() => deleteSacrament(sacrament.id)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Section Image Management Section
const SectionImageManagementSection: React.FC = () => {
  const { sectionImages, addSectionImage, updateSectionImage, deleteSectionImage } = useAdmin();
  const [showAddImage, setShowAddImage] = useState(false);
  const [selectedSectionImageFile, setSelectedSectionImageFile] = useState<File | null>(null);
  const [newImage, setNewImage] = useState({
    section: 'mass_times' as const,
    title: '',
    imageUrl: '/api/placeholder/400/300',
    isActive: true
  });

  const handleAddImage = async () => {
    if (newImage.title && newImage.imageUrl) {
      let finalImageUrl = newImage.imageUrl;
      
      // If an image file was selected, we would upload it here
      if (selectedSectionImageFile) {
        // In a real implementation, you would upload the file to your server
        // finalImageUrl = await uploadImageToServer(selectedSectionImageFile);
        console.log('Section image file selected:', selectedSectionImageFile.name);
      }
      
      addSectionImage({
        ...newImage,
        imageUrl: finalImageUrl
      });
      
      // Reset form
      setNewImage({
        section: 'mass_times' as const,
        title: '',
        imageUrl: '/api/placeholder/400/300',
        isActive: true
      });
      setSelectedSectionImageFile(null);
      setShowAddImage(false);
    }
  };

  const handleSectionImageSelect = (file: File, previewUrl: string) => {
    setSelectedSectionImageFile(file);
    setNewImage(prev => ({
      ...prev,
      imageUrl: previewUrl
    }));
  };

  const handleSectionImageRemove = () => {
    setSelectedSectionImageFile(null);
    setNewImage(prev => ({
      ...prev,
      imageUrl: '/api/placeholder/400/300'
    }));
  };

  const groupedImages = sectionImages.reduce((acc, image) => {
    if (!acc[image.section]) {
      acc[image.section] = [];
    }
    acc[image.section].push(image);
    return acc;
  }, {} as Record<string, typeof sectionImages>);

  return (
    <div className="section-image-management">
      <div className="section-header">
        <h3>Section Image Management</h3>
        <button 
          className="btn btn-primary"
          onClick={() => setShowAddImage(true)}
        >
          <Plus size={16} />
          Add New Image
        </button>
      </div>

      {showAddImage && (
        <div className="add-image-form">
          <h4>Add New Section Image</h4>
          <div className="form-group">
            <label>Section</label>
            <select
              value={newImage.section}
              onChange={(e) => setNewImage({...newImage, section: e.target.value as any})}
            >
              <option value="mass_times">Mass Times</option>
              <option value="confession_times">Confession Times</option>
              <option value="catechism_times">Catechism Times</option>
              <option value="parish_gallery">Parish Gallery</option>
            </select>
          </div>
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              placeholder="Image title"
              value={newImage.title}
              onChange={(e) => setNewImage({...newImage, title: e.target.value})}
            />
          </div>
          <ImageUpload
            label="Section Image"
            onImageSelect={handleSectionImageSelect}
            onImageRemove={handleSectionImageRemove}
            currentImageUrl={newImage.imageUrl !== '/api/placeholder/400/300' ? newImage.imageUrl : undefined}
            maxSizeInMB={3}
          />
          <div className="form-actions">
            <button className="btn btn-success" onClick={handleAddImage}>Add Image</button>
            <button className="btn btn-secondary" onClick={() => setShowAddImage(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="images-by-section">
        {Object.entries(groupedImages).map(([section, images]) => (
          <div key={section} className="section-group">
            <h4>{section.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</h4>
            <div className="images-grid">
              {images.map(image => (
                <div key={image.id} className="image-card">
                  <div className="image-preview">
                    <img src={image.imageUrl} alt={image.title} />
                  </div>
                  <div className="image-details">
                    <h5>{image.title}</h5>
                    <div className="image-actions">
                      <button 
                        className={`btn ${image.isActive ? 'btn-success' : 'btn-secondary'}`}
                        onClick={() => updateSectionImage(image.id, { isActive: !image.isActive })}
                      >
                        {image.isActive ? 'Active' : 'Inactive'}
                      </button>
                      <button 
                        className="btn btn-danger"
                        onClick={() => deleteSectionImage(image.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Prayer Intention Management Section
const PrayerIntentionManagementSection: React.FC = () => {
  const { prayerIntentions, updatePrayerIntention, deletePrayerIntention, getPendingIntentions } = useAdmin();
  const pendingIntentions = getPendingIntentions();

  return (
    <div className="prayer-intention-management">
      <div className="section-header">
        <h3>Prayer Intentions</h3>
        <div className="intention-stats">
          <span className="stat-badge">
            {pendingIntentions.length} Pending
          </span>
          <span className="stat-badge">
            {prayerIntentions.filter(p => p.status === 'approved').length} Approved
          </span>
        </div>
      </div>

      <div className="intentions-list">
        {prayerIntentions.map(intention => (
          <div key={intention.id} className={`intention-card ${intention.isUrgent ? 'urgent' : ''}`}>
            <div className="intention-header">
              <div className="intention-meta">
                <h4>{intention.name}</h4>
                {intention.email && <span className="email">{intention.email}</span>}
                <span className="date">{new Date(intention.submittedAt).toLocaleDateString()}</span>
              </div>
              <div className="intention-badges">
                {intention.isUrgent && <span className="badge urgent">Urgent</span>}
                {intention.isPublic && <span className="badge public">Public</span>}
                <span className={`badge status ${intention.status}`}>{intention.status}</span>
              </div>
            </div>
            <div className="intention-content">
              <p>{intention.intention}</p>
            </div>
            <div className="intention-actions">
              {intention.status === 'pending' && (
                <>
                  <button 
                    className="btn btn-success"
                    onClick={() => updatePrayerIntention(intention.id, { status: 'approved' })}
                  >
                    Approve
                  </button>
                  <button 
                    className="btn btn-primary"
                    onClick={() => updatePrayerIntention(intention.id, { status: 'prayed' })}
                  >
                    Mark as Prayed
                  </button>
                </>
              )}
              {intention.status === 'approved' && (
                <button 
                  className="btn btn-primary"
                  onClick={() => updatePrayerIntention(intention.id, { status: 'prayed' })}
                >
                  Mark as Prayed
                </button>
              )}
              <button 
                className="btn btn-danger"
                onClick={() => deletePrayerIntention(intention.id)}
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {prayerIntentions.length === 0 && (
        <div className="empty-state">
          <BookOpen size={48} />
          <h4>No Prayer Intentions</h4>
          <p>Prayer intentions submitted by parishioners will appear here.</p>
        </div>
      )}
    </div>
  );
};


export default AdminDashboard;
