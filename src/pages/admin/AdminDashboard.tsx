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
import { api } from '../../services/api';

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
<<<<<<< HEAD
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  // All useEffect hooks must also be called before any returns
=======
  const [parishMembers, setParishMembers] = useState<ParishMember[]>([]);
  const [websiteData, setWebsiteData] = useState({
    totalVisitors: 0,
    todayVisitors: 0,
    pageViews: 0,
    avgSessionDuration: '0:00',
    bounceRate: 0,
    topPages: [] as { page: string; views: number; percentage: number }[],
    monthlyData: [] as { month: string; visitors: number; pageViews: number }[],
  });

>>>>>>> 59124fe9bac7e6937579955e0d27d1c221fc2546
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
<<<<<<< HEAD
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
=======
    const candidates: { section: AdminSection; perm: Parameters<typeof hasPermission>[0] }[] = [
      { section: 'overview', perm: 'overview' },
      { section: 'announcements', perm: 'announcements' },
      { section: 'events', perm: 'events' },
      { section: 'gallery', perm: 'gallery' },
      { section: 'news', perm: 'news' },
      { section: 'priests-desk', perm: 'priest_desk' }
    ];
    const firstAllowed = candidates.find(c => hasPermission(c.perm));
    if (firstAllowed) setActiveSection(firstAllowed.section);
>>>>>>> 59124fe9bac7e6937579955e0d27d1c221fc2546
  }, [hasPermission]);

  // Fetch audit logs on mount
  React.useEffect(() => {
    fetchAuditLogs({ limit: 5 });
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
<<<<<<< HEAD
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    toastInfo('Logging out...', 'Session');
    setTimeout(() => {
=======
    if (globalThis.confirm?.('Are you sure you want to logout?')) {
>>>>>>> 59124fe9bac7e6937579955e0d27d1c221fc2546
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

  // Get welcome message based on role
  const getWelcomeMessage = () => {
    const name = user?.username || user?.firstName || getRoleDisplayName();
    return `Welcome ${name}`;
  };

<<<<<<< HEAD
=======
  React.useEffect(() => {
    const loadMembers = async () => {
      try {
        const res = await api.users.getAll();
        const arr: any[] = (res.data?.users) || (Array.isArray(res.data) ? res.data : []);
        const mapped: ParishMember[] = arr.map(u => {
          const last = new Date(u.last_login ?? u.updated_at ?? u.created_at ?? Date.now());
          const diff = Date.now() - last.getTime();
          const status: ParishMember['status'] = diff < 10 * 60 * 1000 ? 'online' : diff < 30 * 60 * 1000 ? 'away' : 'offline';
          const name = [u.firstName, u.lastName].filter(Boolean).join(' ') || u.username || u.email || '';
          return { id: u.id, name, email: u.email || '', lastLogin: last, status };
        });
        setParishMembers(mapped);
      } catch {}
    };

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

    loadMembers();
    loadAnalytics();
  }, []);

>>>>>>> 59124fe9bac7e6937579955e0d27d1c221fc2546
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
      <aside className="admin-sidebar">
        <div className="sidebar-header">
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

<<<<<<< HEAD
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
=======
        <MainContent 
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          stats={stats}
          parishMembers={parishMembers}
        />
>>>>>>> 59124fe9bac7e6937579955e0d27d1c221fc2546
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

const MainContent: React.FC<{ 
  activeSection: AdminSection; 
  setActiveSection: (section: AdminSection) => void; 
  stats: any; 
  parishMembers: ParishMember[] 
}> = ({ activeSection, setActiveSection, stats, parishMembers }) => {
  return (
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
  );
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
<<<<<<< HEAD
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
            <div className="stat-icon gallery">
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
=======
        <button type="button" className="stat-card clickable" aria-label="Go to announcements" onClick={() => setActiveSection('announcements')}>
          <div className="stat-icon announcements">
            <Bell size={20} />
          </div>
          <div className="stat-content">
            <div className="stat-number">{stats.activeAnnouncements}</div>
            <div className="stat-label">Active Announcements</div>
            <div className="stat-sublabel">{stats.totalAnnouncements} total</div>
          </div>
        </button>

        <button type="button" className="stat-card clickable" aria-label="Go to events" onClick={() => setActiveSection('events')}>
          <div className="stat-icon events">
            <Calendar size={20} />
          </div>
          <div className="stat-content">
            <div className="stat-number">{stats.publishedEvents}</div>
            <div className="stat-label">Published Events</div>
            <div className="stat-sublabel">{stats.totalEvents} total</div>
          </div>
        </button>

        <button type="button" className="stat-card clickable" aria-label="Go to gallery" onClick={() => setActiveSection('gallery')}>
          <div className="stat-icon gallery">
            <Image size={20} />
          </div>
          <div className="stat-content">
            <div className="stat-number">{stats.publishedImages}</div>
            <div className="stat-label">Gallery Images</div>
            <div className="stat-sublabel">{stats.totalImages} total</div>
          </div>
        </button>

        <button type="button" className="stat-card clickable" aria-label="Go to analytics" onClick={() => setActiveSection('analytics')}>
          <div className="stat-icon users">
            <Users size={20} />
          </div>
          <div className="stat-content">
            <div className="stat-number">{stats.parishMembers.online}</div>
            <div className="stat-label">Parish Members Online</div>
            <div className="stat-sublabel">{stats.parishMembers.total} total members</div>
          </div>
        </button>
>>>>>>> 59124fe9bac7e6937579955e0d27d1c221fc2546
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

<<<<<<< HEAD
=======





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
    if (globalThis.confirm?.('Are you sure you want to delete this message?')) {
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
                  <label htmlFor="message-title">Message Title *</label>
                  <input
                    id="message-title"
                    type="text"
                    value={currentMessage.title}
                    onChange={(e) => setCurrentMessage({...currentMessage, title: e.target.value})}
                    placeholder="Enter message title"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="message-date">Message Date *</label>
                  <input
                    id="message-date"
                    type="date"
                    value={currentMessage.date}
                    onChange={(e) => setCurrentMessage({...currentMessage, date: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="message-expiration">Expiration Date *</label>
                <input
                  id="message-expiration"
                  type="date"
                  value={currentMessage.expirationDate}
                  onChange={(e) => setCurrentMessage({...currentMessage, expirationDate: e.target.value})}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
                <small>Message will automatically disappear from home page after this date</small>
              </div>

              <div className="form-group">
                <label htmlFor="message-content">Message Content *</label>
                <textarea
                  id="message-content"
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

export const AnalyticsSection: React.FC<{
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
              {websiteData.monthlyData.map((month: any) => (
                <div key={month.month} className="bar-group">
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
            {websiteData.topPages.map((page: any) => (
              <div key={page.page} className="page-row">
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
                       `Last seen ${Math.floor((Date.now() - member.lastLogin.getTime()) / 60000)} min ago`}
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
              <h4>{parishMembers.filter(m => Date.now() - m.lastLogin.getTime() < 86400000).length}</h4>
              <p>Active Members Today</p>
              <span className="summary-change positive">Highest this week</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
>>>>>>> 59124fe9bac7e6937579955e0d27d1c221fc2546

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

  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    api.schedule.getAll().then((res: any) => {
      if (res.success && res.data) {
        setMassSchedule(res.data);
      }
    }).catch((err: any) => console.error('Failed to fetch schedule', err));
  }, []);

  const handleSave = async () => {
    try {
      await api.schedule.updateBulk(massSchedule);
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to save schedule', err);
    }
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
              <label htmlFor={`times-${schedule.day}`}>Mass Times</label>
              <input
                id={`times-${schedule.day}`}
                type="text"
                value={schedule.times.join(', ')}
                onChange={(e) => updateSchedule(index, 'times', e.target.value.split(', '))}
                disabled={!isEditing}
                placeholder="e.g., 7:00 AM, 9:00 AM"
              />
            </div>
            <div className="language-section">
              <label htmlFor={`language-${schedule.day}`}>Languages</label>
              <input
                id={`language-${schedule.day}`}
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

<<<<<<< HEAD
=======
// User Management Section Component
export const UserManagementSection: React.FC = () => {
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
    if (globalThis.confirm?.('Are you sure you want to delete this user?')) {
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
                <label htmlFor="reset-password">New Password:</label>
                <input
                  id="reset-password"
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
                <label htmlFor="confirm-password">Confirm Password:</label>
                <input
                  id="confirm-password"
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
>>>>>>> 59124fe9bac7e6937579955e0d27d1c221fc2546

// Theme Management Section
const ThemeManagementSection: React.FC = () => {
  const { themesOfYear, addThemeOfYear, updateThemeOfYear, deleteThemeOfYear } = useAdmin();
  const { success, error } = useToast();
  const [showAddTheme, setShowAddTheme] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedThemeImageFile, setSelectedThemeImageFile] = useState<File | null>(null);
  const [newTheme, setNewTheme] = useState({
    year: new Date().getFullYear(),
    title: '',
    subtitle: '',
    verse: '',
    description: '',
    imageUrl: '',
    isActive: false
  });

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
      
      await addThemeOfYear({
        ...newTheme,
        year: parseInt(newTheme.year.toString()),
        imageUrl: finalImageUrl
      });
      
      success(`Theme for ${newTheme.year} added successfully`);
      
      // Reset form
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
      setShowAddTheme(false);
    } catch (err) {
      console.error('Failed to add theme:', err);
      error('Failed to add theme. Please try again.');
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
              <label htmlFor="theme-year">Year</label>
              <input
                id="theme-year"
                type="number"
                value={newTheme.year}
<<<<<<< HEAD
                onChange={(e) => setNewTheme({...newTheme, year: parseInt(e.target.value)})}
                disabled={isSubmitting}
=======
                onChange={(e) => setNewTheme({...newTheme, year: Number.parseInt(e.target.value)})}
>>>>>>> 59124fe9bac7e6937579955e0d27d1c221fc2546
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
<<<<<<< HEAD
            currentImageUrl={newTheme.imageUrl || undefined}
=======
            currentImageUrl={newTheme.imageUrl === '/api/placeholder/400/300' ? undefined : newTheme.imageUrl}
>>>>>>> 59124fe9bac7e6937579955e0d27d1c221fc2546
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
          <div className="form-actions">
            <button 
              className="btn btn-success" 
              onClick={handleAddTheme}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Adding...' : 'Add Theme'}
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={() => setShowAddTheme(false)}
              disabled={isSubmitting}
            >
              Cancel
            </button>
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
        <div className="add-ministry-form">
          <h4>{editingMinistryId ? 'Edit Ministry' : 'Add New Ministry'}</h4>
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
<<<<<<< HEAD
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
            <label>Meeting Time</label>
=======
            <label htmlFor="ministry-meeting">Meeting Time</label>
>>>>>>> 59124fe9bac7e6937579955e0d27d1c221fc2546
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
<<<<<<< HEAD
            currentImageUrl={newMinistry.imageUrl || undefined}
=======
            currentImageUrl={newMinistry.imageUrl === '/api/placeholder/300/200' ? undefined : newMinistry.imageUrl}
>>>>>>> 59124fe9bac7e6937579955e0d27d1c221fc2546
            maxSizeInMB={2}
          />
          <div className="form-actions">
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

<<<<<<< HEAD
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
=======
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
            <label htmlFor="sacrament-description">Description</label>
            <textarea
              id="sacrament-description"
              placeholder="Sacrament description"
              value={newSacrament.description}
              onChange={(e) => setNewSacrament({...newSacrament, description: e.target.value})}
              rows={3}
            />
          </div>
          <div className="form-group">
            <span className="form-label">Requirements</span>
            {newSacrament.requirements.map((req, index) => (
              <div key={`${req}-${index}`} className="requirement-row">
                <input
                  id={`req-${index}`}
                  type="text"
                  placeholder="Requirement"
                  value={req}
                  onChange={(e) => updateRequirement(index, e.target.value)}
                />
>>>>>>> 59124fe9bac7e6937579955e0d27d1c221fc2546
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
<<<<<<< HEAD
            </div>
          </div>
        </div>
      )}
=======
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
>>>>>>> 59124fe9bac7e6937579955e0d27d1c221fc2546
    </div>
  );
};

<<<<<<< HEAD
=======
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
>>>>>>> 59124fe9bac7e6937579955e0d27d1c221fc2546

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
