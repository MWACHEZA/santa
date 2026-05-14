import React, { useState, useEffect } from 'react';
import { useAdmin, ParishMember } from '../../contexts/AdminContext';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
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
import FinancialManager from '../../components/admin/FinancialManager';
import PriestDeskManager from '../../components/admin/PriestDeskManager';
import AuditLogViewer from '../../components/admin/AuditLogViewer';
import EnhancedProfile from '../../components/EnhancedProfile';
import { 
  Bell, 
  Calendar, 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  DollarSign, 
  FileText, 
  FolderOpen,
  Edit, 
  History, 
  LogOut, 
  Menu, 
  Newspaper, 
  Phone, 
  Plus, 
  Trash2, 
  TrendingUp, 
  User, 
  UserCog, 
  Users, 
  X,
  Heart,
  BarChart3,
  Activity,
  Edit2,
  CalendarDays,
  FolderTree,
  PlusCircle,
  Image,
  BookOpen,
  AlertTriangle,
  Info
} from 'lucide-react';
import './AdminDashboard.css';

type AdminSection = 'overview' | 'announcements' | 'events' | 'gallery' | 'contact' | 'schedule' | 'priests-desk' | 'analytics' | 'prayers' | 'images' | 'users' | 'themes' | 'ministries' | 'prayer-intentions' | 'news' | 'videos' | 'profile' | 'finances' | 'audit-logs';

const AdminDashboard: React.FC = () => {
  console.log('🎯 AdminDashboard rendering...');
  
  // All hooks must be called first, before any conditional returns
  const { 
    announcements, 
    events, 
    galleryImages, 
    getPublishedEvents,
    getPublishedImages,
    hasPermission,
    parishMembers,
    websiteAnalytics,
    auditLogs,
    fetchAuditLogs,
    isLoading: adminLoading
  } = useAdmin();
  
  const { logout, user, isLoading: authLoading } = useAuth();
  const { success: toastSuccess, info: toastInfo } = useToast();
  
  // All useState hooks must be called before any returns
  const [activeSection, setActiveSection] = useState<AdminSection>('overview');
  const [contentDropdownOpen, setContentDropdownOpen] = useState(false);
  const [eventDropdownOpen, setEventDropdownOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [websiteData, setWebsiteData] = useState({
    totalVisitors: 0,
    todayVisitors: 0,
    pageViews: 0,
    avgSessionDuration: '0:00',
    bounceRate: 0,
    topPages: [] as { page: string; views: number; percentage: number }[],
    monthlyData: [] as { month: string; visitors: number; pageViews: number }[],
  });
  // Debug: Log user permissions
  React.useEffect(() => {
    if (user) {
      console.log('Current user:', user);
      console.log('User role:', user.role);
      console.log('Has gallery permission:', hasPermission('gallery'));
      console.log('Has events permission:', hasPermission('events'));
      console.log('Has announcements permission:', hasPermission('announcements'));
      console.log('Has ministries permission:', hasPermission('ministries'));
      console.log('🚀 Initial section set based on permissions');
    }
  }, [hasPermission, user?.role, setActiveSection]);

  // Set initial section based on user permissions
  React.useEffect(() => {
    if (user?.role === 'treasurer') {
      setActiveSection('finances');
    } else if (hasPermission('overview')) {
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

  // Fetch audit logs on mount
  React.useEffect(() => {
    fetchAuditLogs({ limit: 5 });
  }, []);

  React.useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const [overviewRes, pagesRes] = await Promise.all([
          api.analytics.getOverview(30),
          api.analytics.getPages(30)
        ]);
        const o: any = overviewRes.success ? overviewRes.data : {};
        const p: any = pagesRes.success ? pagesRes.data : {};
        const pagesArr: any[] = p.pages || p.items || [];
        const top = pagesArr.slice(0, 5).map((pg: any) => ({
          page: pg.page || pg.title || 'Page',
          views: pg.views || pg.count || 0,
          percentage: pg.percentage || 0
        }));
        setWebsiteData({
          totalVisitors: o.totalVisitors ?? o.visitors?.total ?? 0,
          todayVisitors: o.todayVisitors ?? o.visitors?.today ?? 0,
          pageViews: o.pageViews ?? o.pages?.total ?? 0,
          avgSessionDuration: o.avgSessionDuration ?? o.engagement?.averageSessionTime ?? '0:00',
          bounceRate: o.bounceRate ?? o.engagement?.bounceRate ?? 0,
          topPages: top,
          monthlyData: []
        });
      } catch {}
    };

    loadAnalytics();
  }, []);
  
  console.log('🔍 AdminDashboard state:', {
    user: user?.username,
    userRole: user?.role,
    adminLoading,
    authLoading,
    hasPermission: typeof hasPermission
  });
  
  // Show loading state if still loading
  if (adminLoading || authLoading) {
    console.log('⏳ AdminDashboard showing loading state', { adminLoading, authLoading });
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        width: '100vw',
        flexDirection: 'column',
        backgroundColor: '#2c3e50',
        color: 'white',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 99999
      }}>
        <div className="modern-spinner" style={{ 
          width: '60px', 
          height: '60px', 
          border: '6px solid rgba(255, 255, 255, 0.1)', 
          borderTop: '6px solid #3498db', 
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '20px'
        }}></div>
        <div style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '10px' }}>
          Preparing Admin Dashboard...
        </div>
        <div style={{ fontSize: '1rem', opacity: 0.8, marginBottom: '30px' }}>
          Auth: {authLoading ? '⌛ Verifying' : '✅ Ready'} | Admin: {adminLoading ? '⌛ Syncing' : '✅ Ready'}
        </div>
        <button 
          onClick={() => {
            localStorage.clear();
            window.location.href = '/login';
          }}
          style={{
            padding: '12px 24px',
            background: '#e74c3c',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Something is wrong? Reset & Login Again
        </button>
      </div>
    );
  }
  
  // Check if user has admin access
  if (!user || user.role === 'parishioner') {
    console.log('❌ User does not have admin access');
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        backgroundColor: '#f5f5f5'
      }}>
        <div style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#e74c3c' }}>Access Denied</div>
        <div style={{ fontSize: '0.9rem', color: '#666' }}>
          You don't have permission to access the admin dashboard.
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    toastInfo('Logging out...', 'Session');
    setTimeout(() => {
      logout();
      toastSuccess('Successfully logged out. See you soon!', 'Goodbye');
    }, 800);
  };

  // Get role display name
  const getRoleDisplayName = () => {
    if (!user) return 'User';

    const roleNames: Record<string, string> = {
      admin: 'Admin',
      secretary: 'Secretary',
      priest: 'Priest',
      reporter: 'Reporter',
      vice_secretary: 'Vice Secretary',
      parishioner: 'Parishioner',
      committee_member: 'Committee Member',
      council_member: 'Council Member',
      treasurer: 'Treasurer'
    };

    let displayName = roleNames[user.role] || 'User';

    // If they have a specific position, use that instead of the generic role name
    if (user.committeePosition) {
      const positionMap: Record<string, string> = {
        chairperson: 'Chairperson',
        vice_chairperson: 'Vice Chairperson',
        secretary: 'Secretary',
        vice_secretary: 'Vice Secretary',
        organizing_secretary: 'Organizing Secretary',
        treasurer: 'Treasurer',
        advisor: 'Advisor',
        committee_member: 'Committee Member'
      };
      displayName = positionMap[user.committeePosition] || user.committeePosition;
    }

    // Add association if available
    if (user.association) {
      const associationMap: Record<string, string> = {
        'missionary-childhood-mca': 'MCA',
        'catholic-junior-youth-cja': 'CJA',
        'catholic-senior-youth-cya': 'CYA',
        'catholic-young-adults-cyaa': 'CYAA',
        'most-sacred-heart-jesus': 'Sacred Heart',
        'sodality-our-lady': 'Sodality',
        'st-anne': 'St Anne',
        'st-joseph': 'St Joseph',
        'couples-association': 'Couples',
        'focolare': 'Focolare',
        'womens-forum': 'Women\'s Forum',
        'association-altar-servers': 'Altar Servers'
      };
      const associationName = associationMap[user.association] || user.association;
      displayName = `${displayName} (${associationName})`;
    }

    return displayName;
  };

  const getWelcomeMessage = () => {
    const name = user?.username || user?.firstName || getRoleDisplayName();
    return `Welcome ${name}`;
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
        Date.now() - m.lastLogin.getTime() < 86400000
      ).length
    },
    website: websiteData
  };

  console.log('✅ AdminDashboard rendering main content');
  
  return (
    <div className="admin-dashboard admin-container" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      {/* Debug info */}
      {/* Sidebar */}
      <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <button 
            className="admin-sidebar-close" 
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Close Sidebar"
          >
            <X size={20} />
          </button>
          <div className="admin-logo">
            <img 
              src="/logo.svg" 
              alt="St. Patrick's Admin Logo" 
              className="admin-logo-image"
            />
          </div>
          <h2>{getRoleDisplayName()} Panel</h2>
          <div className="parish-badge">St. Patrick's Parish</div>
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

          {hasPermission('finances') && (
            <button
              className={`nav-item ${activeSection === 'finances' ? 'active' : ''}`}
              onClick={() => setActiveSection('finances')}
            >
              <DollarSign size={20} />
              <span>{user?.role === 'treasurer' && user?.association ? 'Association Finance' : 'Treasury'}</span>
            </button>
          )}
          
          {/* Content Management Dropdown */}
          {(hasPermission('gallery') || hasPermission('ministries') || hasPermission('theme') || hasPermission('images')) && (
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
                <div className="sidebar-submenu">
                  <button
                    className={`sidebar-subitem ${activeSection === 'gallery' ? 'active' : ''}`}
                    onClick={() => {setActiveSection('gallery'); setContentDropdownOpen(false);}}
                  >
                    <Image size={16} />
                    <span>Gallery</span>
                  </button>
                  <button
                    className={`sidebar-subitem ${activeSection === 'ministries' ? 'active' : ''}`}
                    onClick={() => {setActiveSection('ministries'); setContentDropdownOpen(false);}}
                  >
                    <Users size={16} />
                    <span>Ministries</span>
                  </button>
                  <button
                    className={`sidebar-subitem ${activeSection === 'themes' ? 'active' : ''}`}
                    onClick={() => {setActiveSection('themes'); setContentDropdownOpen(false);}}
                  >
                    <BookOpen size={16} />
                    <span>Theme of the Year</span>
                  </button>
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
                <div className="sidebar-submenu">
                  <button
                    className={`sidebar-subitem ${activeSection === 'events' ? 'active' : ''}`}
                    onClick={() => {setActiveSection('events'); setEventDropdownOpen(false);}}
                  >
                    <Calendar size={16} />
                    <span>Events Page</span>
                  </button>
                  <button
                    className={`sidebar-subitem ${activeSection === 'announcements' ? 'active' : ''}`}
                    onClick={() => {setActiveSection('announcements'); setEventDropdownOpen(false);}}
                  >
                    <Bell size={16} />
                    <span>Announcement Page</span>
                  </button>
                  <button
                    className={`sidebar-subitem ${activeSection === 'schedule' ? 'active' : ''}`}
                    onClick={() => {setActiveSection('schedule'); setEventDropdownOpen(false);}}
                  >
                    <Clock size={16} />
                    <span>Mass Schedule</span>
                  </button>
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
          
          {hasPermission('audit_logs') && (
            <button
              className={`nav-item ${activeSection === 'audit-logs' ? 'active' : ''}`}
              onClick={() => setActiveSection('audit-logs')}
            >
              <History size={20} />
              <span>Audit Logs</span>
            </button>
          )}
        </nav>

        <div className="sidebar-footer">
          <p>&copy; 2026 St. Patrick's</p>
          <p className="powered-by">Powered by <span className="santana-highlight">Santa_na</span></p>
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
            <div className="header-left">
              <button 
                className="admin-sidebar-toggle"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                aria-label="Toggle Sidebar"
              >
                <Menu size={20} />
              </button>
              <h1>{getSectionTitle(activeSection)}</h1>
            </div>
            <div className="header-actions">
              <span className="admin-user">{getWelcomeMessage()}</span>
            </div>
          </div>
        </header>

        <div className="admin-content">
          {activeSection === 'overview' && (
            <OverviewSection 
              stats={stats} 
              setActiveSection={setActiveSection} 
              parishMembers={parishMembers} 
              auditLogs={auditLogs}
            />
          )}
          {activeSection === 'announcements' && <AnnouncementManager />}
          {activeSection === 'events' && <EventManager />}
          {activeSection === 'gallery' && <GalleryManager />}
          {activeSection === 'news' && <NewsManagement />}
          {activeSection === 'contact' && <ContactSection />}
          {activeSection === 'schedule' && <ScheduleSection />}
          {activeSection === 'priests-desk' && <PriestDeskManager />}
          {activeSection === 'prayers' && <PrayerManager />}
          {activeSection === 'analytics' && <Analytics />}
          {activeSection === 'videos' && <VideoManager />}
          {activeSection === 'themes' && <ThemeManagementSection />}
          {activeSection === 'ministries' && <MinistryManagementSection />}
          {activeSection === 'prayer-intentions' && <PrayerIntentionManagementSection />}
          {activeSection === 'profile' && <EnhancedProfile />}
          {activeSection === 'users' && <UserManagement />}
          {activeSection === 'finances' && <FinancialManager />}
          {activeSection === 'audit-logs' && <AuditLogViewer />}
        </div>
      </main>

      {/* Custom Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="modal-overlay logout-modal-overlay">
          <div className="modal logout-confirm-modal">
            <div className="modal-header">
              <h3>Confirm Logout</h3>
              <button className="btn-close" onClick={() => setShowLogoutConfirm(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="logout-icon-container">
                <LogOut size={48} className="logout-warning-icon" />
              </div>
              <p>Are you sure you want to end your session?</p>
              <p className="logout-subtext">You will need to login again to access the admin panel.</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowLogoutConfirm(false)}>
                Stay Logged In
              </button>
              <button className="btn btn-danger" onClick={confirmLogout}>
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
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
    'prayer-intentions': 'Prayer Intentions',
    profile: 'My Profile',
    finances: 'Financial Management',
    'audit-logs': 'Central Audit Logs'
  };
  return sectionTitles[section] || 'Unknown Section';
};



// Overview Section Component
const OverviewSection: React.FC<{ 
  stats: any; 
  setActiveSection: (section: AdminSection) => void;
  parishMembers: ParishMember[];
  auditLogs: any[];
}> = ({ stats, setActiveSection, parishMembers, auditLogs }) => {
  const { getActiveAnnouncement, hasPermission } = useAdmin();
  const activeAnnouncement = getActiveAnnouncement();

  return (
    <div className="overview-section">
      {/* Quick Stats Cards */}
      <div className="stats-grid">
        {hasPermission('announcements') && (
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
        )}

        {hasPermission('events') && (
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
        )}

        {hasPermission('gallery') && (
          <div className="stat-card clickable" onClick={() => setActiveSection('gallery')}>
            <div className="stat-icon stat-gallery">
              <Image size={20} />
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.publishedImages}</div>
              <div className="stat-label">Gallery Images</div>
              <div className="stat-sublabel">{stats.totalImages} total</div>
            </div>
          </div>
        )}

        {hasPermission('analytics') && (
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
        )}
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="action-buttons">
          {hasPermission('announcements') && (
            <button className="action-btn primary" onClick={() => setActiveSection('announcements')}>
              <Plus size={16} />
              New Announcement
            </button>
          )}
          {hasPermission('events') && (
            <button className="action-btn secondary" onClick={() => setActiveSection('events')}>
              <Calendar size={16} />
              New Event
            </button>
          )}
          {hasPermission('news') && (
            <button className="action-btn tertiary" onClick={() => setActiveSection('news')}>
              <Newspaper size={16} />
              Post News
            </button>
          )}
          {hasPermission('finances') && (
            <button className="action-btn quaternary" onClick={() => setActiveSection('finances')}>
              <DollarSign size={16} />
              Finance Record
            </button>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="recent-activity">
        <h3>Recent Activity</h3>
        <div className="activity-list">
          {auditLogs && auditLogs.length > 0 ? (
            auditLogs.slice(0, 5).map((log) => {
              // Helper to get icon based on entityType
              const getIcon = () => {
                const type = log.entityType?.toLowerCase();
                if (type?.includes('announcement')) return <Bell size={16} />;
                if (type?.includes('event')) return <Calendar size={16} />;
                if (type?.includes('finance') || type?.includes('transaction')) return <DollarSign size={16} />;
                if (type?.includes('user')) return <User size={16} />;
                if (type?.includes('gallery') || type?.includes('image')) return <Image size={16} />;
                return <Activity size={16} />;
              };

              // Format relative time helper
              const formatRelativeTime = (timestamp: string) => {
                try {
                  const date = new Date(timestamp);
                  const now = new Date();
                  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
                  
                  if (diffInSeconds < 60) return 'Just now';
                  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
                  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
                  return `${Math.floor(diffInSeconds / 86400)} days ago`;
                } catch (e) {
                  return 'Recently';
                }
              };

              return (
                <div className="activity-item" key={log.id}>
                  <div className="activity-icon">
                    {getIcon()}
                  </div>
                  <div className="activity-content">
                    <div className="activity-title">
                      <strong>{log.userName}</strong> {log.action} {log.entityType?.replace(/_/g, ' ')}
                    </div>
                    <div className="activity-time">{formatRelativeTime(log.timestamp)}</div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-4 text-muted">
              <History size={24} className="mb-2 opacity-50" />
              <p>No recent activity found</p>
            </div>
          )}
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
                  <div className="member-name-row">
                    <div className="member-name">{member.name}</div>
                    {member.role !== 'parishioner' && (
                      <span className={`member-role-badge role-${member.role.replace('_', '-')}`}>
                        {member.role === 'committee_member' ? 'Committee' : 
                         member.role.charAt(0).toUpperCase() + member.role.slice(1).replace('_', ' ')}
                      </span>
                    )}
                  </div>
                  <div className="member-subtitle">
                    {member.committeePosition && (
                      <span className="member-position">
                        {member.committeePosition.charAt(0).toUpperCase() + member.committeePosition.slice(1).replace('_', ' ')}
                      </span>
                    )}
                    {member.association && (
                      <span className="member-assoc">
                        {member.committeePosition ? ` • ` : ''}
                        {member.association.split('-').map(w => w.toUpperCase()).join(' ')}
                      </span>
                    )}
                  </div>
                  <div className="member-time">
                    {member.status === 'online' ? 'Active now' : 
                     `${Math.floor((Date.now() - member.lastLogin.getTime()) / 60000)} min ago`}
                  </div>
                </div>
                <div className={`member-status ${member.status}`}></div>
              </div>
            ))}
          </div>
          {hasPermission('analytics') && (
            <button 
              className="btn btn-sm btn-secondary"
              onClick={() => setActiveSection('analytics')}
            >
              View All Members
            </button>
          )}
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

// Contact Section Component
const ContactSection: React.FC = () => {
  const [contactInfo, setContactInfo] = useState({
    phone: '',
    email: '',
    address: '',
    emergencyPhone: '',
    office: {
      weekdays: '',
      saturday: '',
      sunday: ''
    }
  });

  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    api.contact.get().then((res: any) => {
      if (res.success && res.data) {
        setContactInfo(res.data);
      }
    }).catch((err: any) => console.error('Failed to fetch contact info', err));
  }, []);

  const handleSave = async () => {
    try {
      await api.contact.update(contactInfo);
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to save contact info', err);
    }
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
              <label htmlFor="contact-phone">Main Phone Number</label>
              <input
                id="contact-phone"
                type="text"
                value={contactInfo.phone}
                onChange={(e) => setContactInfo({...contactInfo, phone: e.target.value})}
                disabled={!isEditing}
              />
            </div>
            <div className="form-group">
              <label htmlFor="contact-email">Email Address</label>
              <input
                id="contact-email"
                type="email"
                value={contactInfo.email}
                onChange={(e) => setContactInfo({...contactInfo, email: e.target.value})}
                disabled={!isEditing}
              />
            </div>
          </div>

        <div className="form-group">
          <label htmlFor="contact-address">Church Address</label>
          <textarea
            id="contact-address"
            value={contactInfo.address}
            onChange={(e) => setContactInfo({...contactInfo, address: e.target.value})}
            disabled={!isEditing}
            rows={3}
          />
        </div>

        <div className="form-group">
          <label htmlFor="contact-emergency">Emergency Contact</label>
          <input
            id="contact-emergency"
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
              <label htmlFor="office-weekdays">Weekdays</label>
              <input
                id="office-weekdays"
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
              <label htmlFor="office-saturday">Saturday</label>
              <input
                id="office-saturday"
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
              <label htmlFor="office-sunday">Sunday</label>
              <input
                id="office-sunday"
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
  const [massSchedule, setMassSchedule] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<any | null>(null);
  const [formSchedule, setFormSchedule] = useState({ day: '', times: '', language: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { success, error } = useToast();

  const fetchSchedules = () => {
    api.schedule.getAll().then((res: any) => {
      console.log('📅 Schedule fetch result:', res);
      if (res.success) {
        // res.data is already normalized to an array in scheduleApi.getAll
        setMassSchedule(res.data || []);
      }
    }).catch((err: any) => console.error('Failed to fetch schedule', err));
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const handleAddClick = () => {
    setEditingSchedule(null);
    setFormSchedule({ day: '', times: '', language: '' });
    setShowModal(true);
  };

  const handleEditClick = (schedule: any) => {
    setEditingSchedule(schedule);
    setFormSchedule({
      day: schedule.day,
      times: Array.isArray(schedule.times) ? schedule.times.join(', ') : schedule.times,
      language: schedule.language || ''
    });
    setShowModal(true);
  };

  const handleDeleteClick = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this schedule?')) {
      try {
        await api.schedule.delete(id);
        success('Schedule deleted successfully');
        fetchSchedules();
      } catch (err) {
        error('Failed to delete schedule');
      }
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSchedule.day || !formSchedule.times) {
      error('Please fill in Day and Mass Times');
      return;
    }

    setIsSubmitting(true);
    try {
      const timesArray = formSchedule.times.split(',').map(t => t.trim()).filter(t => t !== '');
      const scheduleData = {
        day: formSchedule.day,
        times: timesArray,
        language: formSchedule.language
      };

      console.log('🚀 Sending schedule data:', scheduleData);
      let result;
      if (editingSchedule) {
        result = await api.schedule.update(editingSchedule.id || editingSchedule._id, scheduleData);
      } else {
        result = await api.schedule.create(scheduleData);
      }

      if (result.success) {
        success(`Schedule for ${formSchedule.day} ${editingSchedule ? 'updated' : 'added'} successfully`);
        setShowModal(false);
        fetchSchedules();
      } else {
        error(result.message || 'Failed to save schedule');
      }
    } catch (err: any) {
      console.error('Save schedule error:', err);
      error(err.message || 'Failed to save schedule');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="schedule-section">
      <div className="section-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <h3>Mass Schedule Management</h3>
        <button 
          className="btn btn-primary"
          onClick={handleAddClick}
        >
          <Plus size={16} />
          Add Schedule Day
        </button>
      </div>

      <div className="schedule-grid">
        {massSchedule && Array.isArray(massSchedule) && massSchedule.map((schedule) => (
          <div key={schedule.id || schedule._id || schedule.day} className="schedule-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>
              <h4 style={{ margin: 0, color: 'var(--primary-green)' }}>{schedule.day}</h4>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <button 
                  className="btn-icon" 
                  onClick={() => handleEditClick(schedule)}
                  title="Edit Day Schedule"
                >
                  <Edit2 size={14} />
                </button>
                <button 
                  className="btn-icon danger" 
                  onClick={() => handleDeleteClick(schedule.id || schedule._id)}
                  title="Delete Day Schedule"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <div className="times-section" style={{ marginBottom: '0.75rem' }}>
              <strong style={{ fontSize: '0.85rem', color: '#666', display: 'block', marginBottom: '0.25rem' }}>Mass Times:</strong>
              <p style={{ margin: 0, fontWeight: 600 }}>{Array.isArray(schedule.times) ? schedule.times.join(', ') : schedule.times}</p>
            </div>
            <div className="language-section">
              <strong style={{ fontSize: '0.85rem', color: '#666', display: 'block', marginBottom: '0.25rem' }}>Languages:</strong>
              <p style={{ margin: 0, opacity: 0.8 }}>{schedule.language || 'Not specified'}</p>
            </div>
          </div>
        ))}
        {(!massSchedule || massSchedule.length === 0) && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: '#999', background: '#f9f9f9', borderRadius: '12px', border: '2px dashed #eee' }}>
            <CalendarDays size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
            <p>No schedules found. Click "Add Schedule Day" to create one.</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal rectangular">
            <div className="modal-header">
              <h3>{editingSchedule ? `Edit Schedule: ${editingSchedule.day}` : 'Add Day Schedule'}</h3>
              <button className="btn-close" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-content" style={{ padding: '1.5rem', maxHeight: '80vh', overflowY: 'auto' }}>
              <form onSubmit={handleFormSubmit} className="modern-form">
                <div className="form-group">
                  <label htmlFor="schedule-day">Day of the Week</label>
                  <input
                    id="schedule-day"
                    type="text"
                    placeholder="e.g., Sunday, Monday, or Feast Days"
                    value={formSchedule.day}
                    onChange={(e) => setFormSchedule({ ...formSchedule, day: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="schedule-times">Mass Times (separated by commas)</label>
                  <input
                    id="schedule-times"
                    type="text"
                    placeholder="e.g., 7:00 AM, 9:00 AM"
                    value={formSchedule.times}
                    onChange={(e) => setFormSchedule({ ...formSchedule, times: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="schedule-lang">Languages</label>
                  <input
                    id="schedule-lang"
                    type="text"
                    placeholder="e.g., English & IsiNdebele"
                    value={formSchedule.language}
                    onChange={(e) => setFormSchedule({ ...formSchedule, language: e.target.value })}
                  />
                </div>
                <div className="form-actions" style={{ marginTop: '1.5rem' }}>
                  <button type="submit" className="btn btn-success" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : 'Save Schedule'}
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)} disabled={isSubmitting}>
                    Cancel
                  </button>
                </div>
              </form>
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
  const { success, error } = useToast();
  const [showAddTheme, setShowAddTheme] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedThemeImageFile, setSelectedThemeImageFile] = useState<File | null>(null);
  const [editingThemeId, setEditingThemeId] = useState<string | null>(null);
  const [newTheme, setNewTheme] = useState({
    year: new Date().getFullYear(),
    title: '',
    subtitle: '',
    verse: '',
    description: '',
    imageUrl: '',
    isActive: false
  });

  const resetThemeForm = () => {
    setNewTheme({
      year: new Date().getFullYear(),
      title: '',
      subtitle: '',
      verse: '',
      description: '',
      imageUrl: '',
      isActive: false
    });
    setSelectedThemeImageFile(null);
    setEditingThemeId(null);
    setShowAddTheme(false);
  };

  const handleAddTheme = async () => {
    if (!newTheme.title) {
      error('Please enter a theme title');
      return;
    }

    setIsSubmitting(true);
    try {
      let finalImageUrl = newTheme.imageUrl;
      
      // Upload image if selected
      if (selectedThemeImageFile) {
        const uploadRes = await api.upload.uploadSingle(selectedThemeImageFile, 'themes');
        if (uploadRes.success && uploadRes.data.url) {
          finalImageUrl = uploadRes.data.url;
        }
      }
      
      const themePayload = {
        ...newTheme,
        year: parseInt(newTheme.year.toString()),
        imageUrl: finalImageUrl
      };

      if (editingThemeId) {
        await updateThemeOfYear(editingThemeId, themePayload);
        success(`Theme for ${newTheme.year} updated successfully`);
      } else {
        await addThemeOfYear(themePayload);
        success(`Theme for ${newTheme.year} added successfully`);
      }
      
      resetThemeForm();
    } catch (err) {
      console.error('Failed to save theme:', err);
      error('Failed to save theme. Please try again.');
    } finally {
      setIsSubmitting(false);
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

  const handleEditTheme = (theme: any) => {
    setNewTheme({
      year: theme.year,
      title: theme.title,
      subtitle: theme.subtitle || '',
      verse: theme.verse || '',
      description: theme.description || '',
      imageUrl: theme.imageUrl || '',
      isActive: theme.isActive || false
    });
    setEditingThemeId(theme.id);
    setShowAddTheme(true);
  };

  return (
    <div className="theme-management-section">
      <div className="section-header">
        <h3>Theme of the Year Management</h3>
        <button 
          className="btn btn-primary"
          onClick={() => { resetThemeForm(); setShowAddTheme(true); }}
        >
          <Plus size={16} />
          Add New Theme
        </button>
      </div>

      {showAddTheme && (
        <div className="modal-overlay">
          <div className="modal rectangular">
            <div className="modal-header">
              <h3>{editingThemeId ? 'Edit Theme' : 'Add New Theme'}</h3>
              <button className="btn-close" onClick={resetThemeForm}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-content" style={{ padding: '1.5rem', maxHeight: '80vh', overflowY: 'auto' }}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="theme-year">Year</label>
                  <input
                    id="theme-year"
                    type="number"
                    value={newTheme.year}
                    onChange={(e) => setNewTheme({...newTheme, year: parseInt(e.target.value)})}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="theme-title">Title</label>
                  <input
                    id="theme-title"
                    type="text"
                    placeholder="Theme title"
                    value={newTheme.title}
                    onChange={(e) => setNewTheme({...newTheme, title: e.target.value})}
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="theme-subtitle">Subtitle</label>
                <input
                  id="theme-subtitle"
                  type="text"
                  placeholder="Theme subtitle"
                  value={newTheme.subtitle}
                  onChange={(e) => setNewTheme({...newTheme, subtitle: e.target.value})}
                  disabled={isSubmitting}
                />
              </div>
              <div className="form-group">
                <label htmlFor="theme-verse">Bible Verse</label>
                <input
                  id="theme-verse"
                  type="text"
                  placeholder="Bible verse reference"
                  value={newTheme.verse}
                  onChange={(e) => setNewTheme({...newTheme, verse: e.target.value})}
                  disabled={isSubmitting}
                />
              </div>
              <div className="form-group">
                <label htmlFor="theme-description">Description</label>
                <textarea
                  id="theme-description"
                  placeholder="Theme description"
                  value={newTheme.description}
                  onChange={(e) => setNewTheme({...newTheme, description: e.target.value})}
                  rows={4}
                  disabled={isSubmitting}
                />
              </div>
              <ImageUpload
                label="Theme Image"
                onImageSelect={handleThemeImageSelect}
                onImageRemove={handleThemeImageRemove}
                currentImageUrl={newTheme.imageUrl || undefined}
                maxSizeInMB={3}
              />
              <div className="form-group">
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    checked={newTheme.isActive}
                    onChange={(e) => setNewTheme({...newTheme, isActive: e.target.checked})}
                    disabled={isSubmitting}
                  />
                  <span className="checkmark"></span>
                  Set as current Active Theme (deactivates others)
                </label>
              </div>
              <div className="form-actions" style={{ marginTop: '1.5rem' }}>
                <button 
                  className="btn btn-success" 
                  onClick={handleAddTheme}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : (editingThemeId ? 'Save Changes' : 'Add Theme')}
                </button>
                <button 
                  className="btn btn-secondary" 
                  onClick={resetThemeForm}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
              </div>
            </div>
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
                  className="btn btn-secondary"
                  onClick={() => handleEditTheme(theme)}
                >
                  <Edit size={16} />
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
  const { success, error } = useToast();
  
  const [showAddMinistry, setShowAddMinistry] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [ministryToDelete, setMinistryToDelete] = useState<string | null>(null);
  const [editingMinistryId, setEditingMinistryId] = useState<string | null>(null);

  const [newMinistry, setNewMinistry] = useState({
    name: '',
    description: '',
    imageUrl: '',
    contactPerson: '',
    category: '',
    meetingTime: '',
    isActive: true
  });

  const handleEdit = (ministry: any) => {
    setEditingMinistryId(ministry.id);
    setNewMinistry({
      name: ministry.name,
      description: ministry.description,
      imageUrl: ministry.imageUrl,
      contactPerson: ministry.contactPerson || '',
      category: ministry.category || '',
      meetingTime: ministry.meetingTime || '',
      isActive: ministry.isActive !== undefined ? ministry.isActive : true
    });
    setShowAddMinistry(true);
  };

  const handleAddMinistry = async () => {
    if (newMinistry.name && newMinistry.description) {
      setIsSubmitting(true);
      try {
        let finalImageUrl = newMinistry.imageUrl;
        
        if (selectedImageFile) {
          const uploadRes = await api.upload.uploadSingle(selectedImageFile, 'ministries');
          if (uploadRes.success && uploadRes.data.url) {
            finalImageUrl = uploadRes.data.url;
          }
        }
        
        if (editingMinistryId) {
          await updateMinistry(editingMinistryId, {
            ...newMinistry,
            imageUrl: finalImageUrl
          });
          success(`Ministry "${newMinistry.name}" updated successfully`);
        } else {
          await addMinistry({
            ...newMinistry,
            imageUrl: finalImageUrl
          });
          success(`Ministry "${newMinistry.name}" added successfully`);
        }
        
        handleCancel();
      } catch (err) {
        error(editingMinistryId ? 'Failed to update ministry' : 'Failed to add ministry');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleCancel = () => {
    setNewMinistry({
      name: '',
      description: '',
      imageUrl: '',
      contactPerson: '',
      category: '',
      meetingTime: '',
      isActive: true
    });
    setSelectedImageFile(null);
    setEditingMinistryId(null);
    setShowAddMinistry(false);
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await updateMinistry(id, { isActive: !currentStatus });
      success(`Ministry ${!currentStatus ? 'activated' : 'deactivated'}`);
    } catch (err) {
      error('Failed to update status');
    }
  };

  const confirmDelete = (id: string) => {
    setMinistryToDelete(id);
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    if (!ministryToDelete) return;
    setIsSubmitting(true);
    try {
      await deleteMinistry(ministryToDelete);
      success('Ministry deleted successfully');
      setShowDeleteConfirm(false);
      setMinistryToDelete(null);
    } catch (err) {
      error('Failed to delete ministry');
    } finally {
      setIsSubmitting(false);
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
        <div className="modal-overlay">
          <div className="modal rectangular">
            <div className="modal-header">
              <h3>{editingMinistryId ? 'Edit Ministry' : 'Add New Ministry'}</h3>
              <button className="btn-close" onClick={handleCancel}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-content" style={{ padding: '1.5rem', maxHeight: '80vh', overflowY: 'auto' }}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="ministry-name">Ministry Name</label>
                  <input
                    id="ministry-name"
                    type="text"
                    placeholder="Ministry name"
                    value={newMinistry.name}
                    onChange={(e) => setNewMinistry({...newMinistry, name: e.target.value})}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="ministry-contact">Contact Person</label>
                  <input
                    id="ministry-contact"
                    type="text"
                    placeholder="Contact person"
                    value={newMinistry.contactPerson}
                    onChange={(e) => setNewMinistry({...newMinistry, contactPerson: e.target.value})}
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="ministry-description">Description</label>
                <textarea
                  id="ministry-description"
                  placeholder="Ministry description"
                  value={newMinistry.description}
                  onChange={(e) => setNewMinistry({...newMinistry, description: e.target.value})}
                  rows={3}
                  disabled={isSubmitting}
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select
                  value={newMinistry.category}
                  onChange={(e) => setNewMinistry({...newMinistry, category: e.target.value})}
                  disabled={isSubmitting}
                >
                  <option value="">Select Category</option>
                  <option value="Youth Ministries">Youth Ministries</option>
                  <option value="Women's Associations">Women's Associations</option>
                  <option value="Children's Ministry">Children's Ministry</option>
                  <option value="Men's Guild">Men's Guild</option>
                  <option value="Prayer Groups">Prayer Groups</option>
                  <option value="Liturgical Ministry">Liturgical Ministry</option>
                  <option value="Committees">Committees</option>
                  <option value="Other Ministries">Other Ministries</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="ministry-meeting">Meeting Time</label>
                <input
                  id="ministry-meeting"
                  type="text"
                  placeholder="Meeting time"
                  value={newMinistry.meetingTime}
                  onChange={(e) => setNewMinistry({...newMinistry, meetingTime: e.target.value})}
                  disabled={isSubmitting}
                />
              </div>
              <ImageUpload
                label="Ministry Image"
                onImageSelect={handleImageSelect}
                onImageRemove={handleImageRemove}
                currentImageUrl={newMinistry.imageUrl || undefined}
                maxSizeInMB={2}
              />
              <div className="form-actions" style={{ marginTop: '1.5rem' }}>
                <button 
                  className="btn btn-success" 
                  onClick={handleAddMinistry}
                  disabled={isSubmitting || !newMinistry.name || !newMinistry.description}
                >
                  {isSubmitting ? (editingMinistryId ? 'Saving...' : 'Adding...') : (editingMinistryId ? 'Save Changes' : 'Add Ministry')}
                </button>
                <button 
                  className="btn btn-secondary" 
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
              </div>
            </div>
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
                  className="btn btn-primary"
                  onClick={() => handleEdit(ministry)}
                  title="Edit Ministry"
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  className={`btn ${ministry.isActive ? 'btn-success' : 'btn-secondary'}`}
                  onClick={() => handleToggleActive(ministry.id, ministry.isActive)}
                  title={ministry.isActive ? 'Deactivate' : 'Activate'}
                >
                  {ministry.isActive ? 'Active' : 'Inactive'}
                </button>
                <button 
                  className="btn btn-danger"
                  onClick={() => confirmDelete(ministry.id)}
                  title="Delete Ministry"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="modal confirm-modal rectangular">
            <div className="modal-header">
              <h3>Confirm Deletion</h3>
              <button className="btn-close" onClick={() => setShowDeleteConfirm(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-content">
              <p>Are you sure you want to delete this ministry? This action cannot be undone.</p>
              <div className="form-actions">
                <button 
                  className="btn btn-secondary" 
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-danger" 
                  onClick={handleDelete}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Deleting...' : 'Delete Ministry'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
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
      if (selectedSacramentImageFile) {
        console.log('Sacrament image file selected:', selectedSacramentImageFile.name);
      }
      
      addSacrament({
        ...newSacrament,
        imageUrl: finalImageUrl,
        requirements: newSacrament.requirements.filter(req => req.trim() !== '')
      });
      
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
            <label htmlFor="sacrament-name">Sacrament Name</label>
            <input
              id="sacrament-name"
              type="text"
              placeholder="Sacrament name"
              value={newSacrament.name}
              onChange={(e) => setNewSacrament({...newSacrament, name: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label htmlFor="sacrament-desc">Description</label>
            <textarea
              id="sacrament-desc"
              placeholder="Sacrament description"
              value={newSacrament.description}
              onChange={(e) => setNewSacrament({...newSacrament, description: e.target.value})}
              rows={3}
            />
          </div>
          <div className="form-group">
            <label>Requirements</label>
            {newSacrament.requirements.map((req, index) => (
              <div key={`${req}-${index}`} className="requirement-row">
                <input
                  id={`req-${index}`}
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
            <label htmlFor="sacrament-contact">Contact Information</label>
            <input
              id="sacrament-contact"
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
            currentImageUrl={newSacrament.imageUrl === '/api/placeholder/300/200' ? undefined : newSacrament.imageUrl}
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
                    <li key={`${req}-${index}`}>{req}</li>
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
            <label htmlFor="image-section">Section</label>
            <select
              id="image-section"
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
            <label htmlFor="image-title">Title</label>
            <input
              id="image-title"
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
            currentImageUrl={newImage.imageUrl === '/api/placeholder/400/300' ? undefined : newImage.imageUrl}
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
            <h4>{section.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</h4>
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
export const PlaceholderSections = {};
