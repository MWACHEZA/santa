import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAdmin } from '../contexts/AdminContext';
import { useAuth } from '../contexts/AuthContext';
import { Menu, X, Globe, LogOut, User, Home, Heart, Camera, Users, Calendar, Newspaper, Phone, DollarSign, Church, BookOpen } from 'lucide-react';
import './Header.css';

const Header: React.FC = () => {
  const placeholderLogo = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%234a7c2a"/><stop offset="100%" stop-color="%232d5016"/></linearGradient></defs><circle cx="40" cy="40" r="38" fill="url(%23g)"/></svg>';
  const [isSideNavOpen, setIsSideNavOpen] = useState(false);
  const dropdownRef = useRef<HTMLLIElement>(null);
  const sideNavRef = useRef<HTMLDivElement>(null);
  const { language, setLanguage, t } = useLanguage();
  const { getActiveAnnouncement } = useAdmin();
  const { user, logout } = useAuth();
  const location = useLocation();
  
  const activeAnnouncement = getActiveAnnouncement();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        // Handle dropdown close if needed
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleSideNav = () => {
    setIsSideNavOpen(!isSideNavOpen);
  };

  const toggleLanguage = () => {
    if (language === 'en') {
      setLanguage('nd');
    } else if (language === 'nd') {
      setLanguage('sn');
    } else {
      setLanguage('en');
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="header">
      {/* Dynamic Announcements Banner */}
      {activeAnnouncement && (
        <div className={`urgent-banner ${activeAnnouncement.type}`}>
          <div className="container">
            <p className="urgent-text">
              📢 {activeAnnouncement.title}: {activeAnnouncement.message}
            </p>
          </div>
        </div>
      )}

      <div className="header-main">
        <div className="container">
          <div className="header-content">
            {/* Logo and Church Name */}
            <div className="logo-section">
              <button
                type="button"
                className="logo"
                onClick={() => globalThis.location.reload()}
              >
                <img 
                  src={placeholderLogo}
                  alt="St. Patrick's Catholic Church Logo" 
                  className="logo-image"
                />
              </button>
              <div className="church-info">
                <h1 className="church-name">St. Patrick's</h1>
                <p className="church-location">Makokoba, Bulawayo</p>
              </div>
            </div>

            {/* User Actions */}
            <div className="user-actions">
              {/* Language Toggle */}
              <div className="language-toggle">
                <button 
                  onClick={toggleLanguage}
                  className="lang-btn"
                  aria-label="Toggle Language"
                >
                  <Globe size={20} />
                  <span>
                    {language === 'en' && t('lang.switch_to_ndebele')}
                    {language === 'nd' && t('lang.switch_to_shona')}
                    {language === 'sn' && t('lang.switch_to_english')}
                  </span>
                </button>
              </div>

              {/* User Info & Logout */}
              {user && (
                <div className="user-info">
                  <div className="user-details">
                    <User size={16} />
                    <span className="username">
                      {user.firstName && user.lastName 
                        ? `${user.firstName} ${user.lastName}` 
                        : user.username}
                    </span>
                    <span className="user-type">({user.role})</span>
                  </div>
                  <button 
                    onClick={logout}
                    className="logout-btn"
                    aria-label="Logout"
                    title="Logout"
                  >
                    <LogOut size={18} />
                    <span className="logout-text">Logout</span>
                  </button>
                </div>
              )}

              {/* Side Navigation Toggle */}
              <button 
                className="side-nav-toggle"
                onClick={toggleSideNav}
                aria-label="Toggle Navigation"
              >
                <Menu size={20} />
                <span>Menu</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Side Navigation Overlay */}
      <button 
        type="button"
        className={`side-nav-overlay ${isSideNavOpen ? 'open' : ''}`}
        onClick={() => setIsSideNavOpen(false)}
      />

      {/* Side Navigation */}
      <nav className={`side-nav ${isSideNavOpen ? 'open' : ''}`} ref={sideNavRef}>
        {/* Side Nav Header */}
        <div className="side-nav-header">
          <button 
            className="side-nav-close"
            onClick={() => setIsSideNavOpen(false)}
            aria-label="Close Navigation"
          >
            <X size={24} />
          </button>
          
          <div className="side-nav-logo">
            <div className="logo">
              <img 
                src={placeholderLogo}
                alt="St. Patrick's Catholic Church Logo" 
                className="logo-image"
              />
            </div>
            <div>
              <h2 className="side-nav-title">St. Patrick's</h2>
              <p className="side-nav-subtitle">Makokoba, Bulawayo</p>
            </div>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="side-nav-content">
          {/* Navigation Links */}
          <div className="side-nav-section">
            <h3 className="side-nav-section-title">Main Navigation</h3>
          <ul className="nav-list">
            <li>
              <Link 
                to="/" 
                className={`nav-link ${isActive('/') ? 'active' : ''}`}
                onClick={() => setIsSideNavOpen(false)}
              >
                <Home className="nav-link-icon" size={20} />
                {t('nav.home')}
              </Link>
            </li>
            <li>
              <Link 
                to="/prayers" 
                className={`nav-link ${isActive('/prayers') ? 'active' : ''}`}
                onClick={() => setIsSideNavOpen(false)}
              >
                <Heart className="nav-link-icon" size={20} />
                Prayers & Daily Devotion
              </Link>
            </li>
            <li>
              <Link 
                to="/gallery" 
                className={`nav-link ${isActive('/gallery') ? 'active' : ''}`}
                onClick={() => setIsSideNavOpen(false)}
              >
                <Camera className="nav-link-icon" size={20} />
                Gallery
              </Link>
            </li>
            <li>
              <Link 
                to="/sacraments" 
                className={`nav-link ${isActive('/sacraments') ? 'active' : ''}`}
                onClick={() => setIsSideNavOpen(false)}
              >
                <Church className="nav-link-icon" size={20} />
                {t('nav.sacraments')}
              </Link>
            </li>
            <li>
              <Link 
                to="/calendar" 
                className={`nav-link ${isActive('/calendar') ? 'active' : ''}`}
                onClick={() => setIsSideNavOpen(false)}
              >
                <Calendar className="nav-link-icon" size={20} />
                Calendar
              </Link>
            </li>
            <li>
              <Link 
                to="/news" 
                className={`nav-link ${isActive('/news') ? 'active' : ''}`}
                onClick={() => setIsSideNavOpen(false)}
              >
                <Newspaper className="nav-link-icon" size={20} />
                News
              </Link>
            </li>
            <li>
              <Link 
                to="/contact" 
                className={`nav-link ${isActive('/contact') ? 'active' : ''}`}
                onClick={() => setIsSideNavOpen(false)}
              >
                <Phone className="nav-link-icon" size={20} />
                {t('nav.contact')}
              </Link>
            </li>
          </ul>
        </div>

        {/* Get Involved Section */}
        <div className="side-nav-section">
          <h3 className="side-nav-section-title">Get Involved</h3>
          <ul className="nav-list">
            <li>
              <Link 
                to="/ministries" 
                className={`nav-link ${isActive('/ministries') ? 'active' : ''}`}
                onClick={() => setIsSideNavOpen(false)}
              >
                <Users className="nav-link-icon" size={20} />
                Ministries
              </Link>
            </li>
            <li>
              <Link 
                to="/outreach" 
                className={`nav-link ${isActive('/outreach') ? 'active' : ''}`}
                onClick={() => setIsSideNavOpen(false)}
              >
                <Heart className="nav-link-icon" size={20} />
                Outreach
              </Link>
            </li>
            <li>
              <Link 
                to="/watch-mass" 
                className={`nav-link ${isActive('/watch-mass') ? 'active' : ''}`}
                onClick={() => setIsSideNavOpen(false)}
              >
                <BookOpen className="nav-link-icon" size={20} />
                Watch Mass
              </Link>
            </li>
          </ul>
        </div>

        {/* Giving Section */}
        <div className="side-nav-section">
          <h3 className="side-nav-section-title">Support</h3>
          <ul className="nav-list">
            <li>
              <Link 
                to="/giving" 
                className={`nav-link nav-link-giving ${isActive('/giving') ? 'active' : ''}`}
                onClick={() => setIsSideNavOpen(false)}
              >
                <DollarSign className="nav-link-icon" size={20} />
                {t('nav.giving')}
              </Link>
            </li>
          </ul>
        </div>
        </div>

        {/* User Section - Outside scrollable area */}
        {user ? (
          <div className="side-nav-user">
            <div className="side-nav-user-info">
              <div className="side-nav-user-avatar">
                {(((user?.firstName && user?.firstName[0]) || (user?.username || 'U')[0]).toUpperCase())}
              </div>
              <div className="side-nav-user-details">
                <h4>
                  {(user?.firstName && user?.lastName) 
                    ? `${user?.firstName} ${user?.lastName}` 
                    : (user?.username || '')}
                </h4>
                <p>{user?.role}</p>
              </div>
            </div>
            
            {user?.role === 'parishioner' && (
              <Link 
                to="/profile" 
                className={`nav-link ${isActive('/profile') ? 'active' : ''}`}
                onClick={() => setIsSideNavOpen(false)}
              >
                <User className="nav-link-icon" size={20} />
                My Profile
              </Link>
            )}
            
            <button 
              onClick={() => {
                logout();
                setIsSideNavOpen(false);
              }}
              className="nav-link"
              style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left' }}
            >
              <LogOut className="nav-link-icon" size={20} />
              Logout
            </button>
          </div>
        ) : (
          <div className="side-nav-section">
            <ul className="nav-list">
              <li>
                <Link 
                  to="/login" 
                  className={`nav-link ${isActive('/login') ? 'active' : ''}`}
                  onClick={() => setIsSideNavOpen(false)}
                >
                  <User className="nav-link-icon" size={20} />
                  Login / Register
                </Link>
              </li>
            </ul>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
