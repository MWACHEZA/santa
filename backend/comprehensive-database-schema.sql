-- ============================================================================
-- ST. PATRICK'S CATHOLIC CHURCH - COMPREHENSIVE DATABASE SCHEMA
-- ============================================================================
-- This unified schema handles all data storage for the parish management system
-- including users, media, prayers, events, sacraments, and more.
-- ============================================================================

-- Drop existing database if it exists and create new one
DROP DATABASE IF EXISTS st_patricks_db;
CREATE DATABASE st_patricks_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE st_patricks_db;

-- ============================================================================
-- CORE USER MANAGEMENT
-- ============================================================================

-- Users table - Central user management
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  middle_name VARCHAR(50),
  phone VARCHAR(20),
  date_of_birth DATE,
  gender ENUM('male', 'female') NOT NULL,
  address TEXT,
  emergency_contact VARCHAR(100),
  emergency_phone VARCHAR(20),
  role ENUM('admin', 'priest', 'secretary', 'reporter', 'parishioner') NOT NULL DEFAULT 'parishioner',
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,
  profile_picture_id VARCHAR(36),
  section_id VARCHAR(36),
  association_id VARCHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_login TIMESTAMP NULL,
  
  INDEX idx_username (username),
  INDEX idx_email (email),
  INDEX idx_role (role),
  INDEX idx_active (is_active),
  INDEX idx_section (section_id),
  INDEX idx_association (association_id)
);

-- User sessions for authentication
CREATE TABLE user_sessions (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id VARCHAR(36) NOT NULL,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_token (session_token),
  INDEX idx_user (user_id),
  INDEX idx_expires (expires_at)
);

-- ============================================================================
-- ORGANIZATIONAL STRUCTURE
-- ============================================================================

-- Parish sections (e.g., Youth, Women's Guild, Men's Fellowship)
CREATE TABLE sections (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  leader_id VARCHAR(36),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (leader_id) REFERENCES users(id) ON SET NULL,
  INDEX idx_name (name),
  INDEX idx_active (is_active)
);

-- Parish associations (e.g., Choir, Altar Servers, Catechists)
CREATE TABLE associations (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  coordinator_id VARCHAR(36),
  section_id VARCHAR(36),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (coordinator_id) REFERENCES users(id) ON SET NULL,
  FOREIGN KEY (section_id) REFERENCES sections(id) ON SET NULL,
  INDEX idx_name (name),
  INDEX idx_section (section_id),
  INDEX idx_active (is_active)
);

-- ============================================================================
-- MEDIA MANAGEMENT SYSTEM
-- ============================================================================

-- Media files - Comprehensive media storage
CREATE TABLE media_files (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  filename VARCHAR(255) NOT NULL,
  original_filename VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_url VARCHAR(500),
  file_type ENUM('image', 'video', 'audio', 'document', 'other') NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  file_size BIGINT NOT NULL,
  width INT NULL, -- For images/videos
  height INT NULL, -- For images/videos
  duration INT NULL, -- For videos/audio (in seconds)
  alt_text VARCHAR(255),
  caption TEXT,
  description TEXT,
  uploaded_by VARCHAR(36) NOT NULL,
  is_public BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_type (file_type),
  INDEX idx_uploader (uploaded_by),
  INDEX idx_public (is_public),
  INDEX idx_featured (is_featured),
  INDEX idx_created (created_at)
);

-- Media categories for organization
CREATE TABLE media_categories (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  parent_id VARCHAR(36),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (parent_id) REFERENCES media_categories(id) ON DELETE SET NULL,
  INDEX idx_name (name),
  INDEX idx_parent (parent_id),
  INDEX idx_active (is_active)
);

-- Media file categories relationship
CREATE TABLE media_file_categories (
  media_file_id VARCHAR(36),
  category_id VARCHAR(36),
  PRIMARY KEY (media_file_id, category_id),
  
  FOREIGN KEY (media_file_id) REFERENCES media_files(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES media_categories(id) ON DELETE CASCADE
);

-- ============================================================================
-- CONTENT MANAGEMENT
-- ============================================================================

-- News and announcements
CREATE TABLE news_articles (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(250) UNIQUE NOT NULL,
  content LONGTEXT NOT NULL,
  excerpt TEXT,
  featured_image_id VARCHAR(36),
  author_id VARCHAR(36) NOT NULL,
  status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
  is_featured BOOLEAN DEFAULT false,
  is_urgent BOOLEAN DEFAULT false,
  published_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (featured_image_id) REFERENCES media_files(id) ON SET NULL,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_slug (slug),
  INDEX idx_status (status),
  INDEX idx_featured (is_featured),
  INDEX idx_urgent (is_urgent),
  INDEX idx_published (published_at),
  INDEX idx_author (author_id)
);

-- Events and calendar
CREATE TABLE events (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  location VARCHAR(200),
  start_datetime DATETIME NOT NULL,
  end_datetime DATETIME,
  all_day BOOLEAN DEFAULT false,
  recurring BOOLEAN DEFAULT false,
  recurrence_pattern VARCHAR(100), -- JSON string for recurrence rules
  event_type ENUM('mass', 'meeting', 'celebration', 'sacrament', 'other') DEFAULT 'other',
  organizer_id VARCHAR(36),
  max_attendees INT,
  registration_required BOOLEAN DEFAULT false,
  registration_deadline DATETIME,
  is_public BOOLEAN DEFAULT true,
  featured_image_id VARCHAR(36),
  created_by VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (organizer_id) REFERENCES users(id) ON SET NULL,
  FOREIGN KEY (featured_image_id) REFERENCES media_files(id) ON SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_start_date (start_datetime),
  INDEX idx_end_date (end_datetime),
  INDEX idx_type (event_type),
  INDEX idx_public (is_public),
  INDEX idx_organizer (organizer_id)
);

-- Event registrations
CREATE TABLE event_registrations (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  event_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  status ENUM('registered', 'confirmed', 'cancelled') DEFAULT 'registered',
  notes TEXT,
  registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_registration (event_id, user_id),
  INDEX idx_event (event_id),
  INDEX idx_user (user_id),
  INDEX idx_status (status)
);

-- ============================================================================
-- SPIRITUAL CONTENT
-- ============================================================================

-- Prayers and devotions
CREATE TABLE prayers (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  title VARCHAR(200) NOT NULL,
  content LONGTEXT NOT NULL,
  prayer_type ENUM('daily', 'novena', 'rosary', 'liturgical', 'personal', 'other') DEFAULT 'other',
  language ENUM('en', 'nd', 'sn') DEFAULT 'en',
  audio_file_id VARCHAR(36),
  image_id VARCHAR(36),
  author VARCHAR(100),
  source VARCHAR(200),
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_by VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (audio_file_id) REFERENCES media_files(id) ON SET NULL,
  FOREIGN KEY (image_id) REFERENCES media_files(id) ON SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_type (prayer_type),
  INDEX idx_language (language),
  INDEX idx_featured (is_featured),
  INDEX idx_active (is_active)
);

-- Daily readings
CREATE TABLE daily_readings (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  reading_date DATE NOT NULL UNIQUE,
  first_reading TEXT,
  first_reading_reference VARCHAR(100),
  psalm TEXT,
  psalm_reference VARCHAR(100),
  second_reading TEXT,
  second_reading_reference VARCHAR(100),
  gospel TEXT,
  gospel_reference VARCHAR(100),
  reflection TEXT,
  created_by VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_date (reading_date)
);

-- ============================================================================
-- SACRAMENTS MANAGEMENT
-- ============================================================================

-- Sacrament types
CREATE TABLE sacrament_types ( 
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  requirements TEXT,
  preparation_time_days INT DEFAULT 30,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_name (name),
  INDEX idx_active (is_active)
);

-- Sacrament requests and records
CREATE TABLE sacrament_records (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  sacrament_type_id VARCHAR(36) NOT NULL,
  recipient_id VARCHAR(36) NOT NULL,
  priest_id VARCHAR(36),
  scheduled_date DATETIME,
  completed_date DATETIME,
  status ENUM('requested', 'approved', 'scheduled', 'completed', 'cancelled') DEFAULT 'requested',
  notes TEXT,
  certificate_number VARCHAR(50),
  certificate_file_id VARCHAR(36),
  created_by VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (sacrament_type_id) REFERENCES sacrament_types(id) ON DELETE CASCADE,
  FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (priest_id) REFERENCES users(id) ON SET NULL,
  FOREIGN KEY (certificate_file_id) REFERENCES media_files(id) ON SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_type (sacrament_type_id),
  INDEX idx_recipient (recipient_id),
  INDEX idx_priest (priest_id),
  INDEX idx_status (status),
  INDEX idx_scheduled (scheduled_date)
);

-- ============================================================================
-- MINISTRIES AND OUTREACH
-- ============================================================================

-- Ministries
CREATE TABLE ministries (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  leader_id VARCHAR(36),
  meeting_schedule VARCHAR(200),
  contact_info TEXT,
  image_id VARCHAR(36),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (leader_id) REFERENCES users(id) ON SET NULL,
  FOREIGN KEY (image_id) REFERENCES media_files(id) ON SET NULL,
  INDEX idx_name (name),
  INDEX idx_active (is_active),
  INDEX idx_leader (leader_id)
);

-- Ministry members
CREATE TABLE ministry_members (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  ministry_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  role VARCHAR(50) DEFAULT 'member',
  joined_date DATE DEFAULT (CURRENT_DATE),
  is_active BOOLEAN DEFAULT true,
  
  FOREIGN KEY (ministry_id) REFERENCES ministries(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_membership (ministry_id, user_id),
  INDEX idx_ministry (ministry_id),
  INDEX idx_user (user_id),
  INDEX idx_active (is_active)
);

-- ============================================================================
-- FINANCIAL MANAGEMENT
-- ============================================================================

-- Donation categories
CREATE TABLE donation_categories (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_name (name),
  INDEX idx_active (is_active)
);

-- Donations and offerings
CREATE TABLE donations (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  donor_id VARCHAR(36),
  category_id VARCHAR(36) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  donation_method ENUM('cash', 'check', 'card', 'online', 'mobile_money') NOT NULL,
  reference_number VARCHAR(100),
  is_anonymous BOOLEAN DEFAULT false,
  notes TEXT,
  receipt_file_id VARCHAR(36),
  recorded_by VARCHAR(36) NOT NULL,
  donation_date DATE DEFAULT (CURRENT_DATE),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (donor_id) REFERENCES users(id) ON SET NULL,
  FOREIGN KEY (category_id) REFERENCES donation_categories(id) ON DELETE CASCADE,
  FOREIGN KEY (receipt_file_id) REFERENCES media_files(id) ON SET NULL,
  FOREIGN KEY (recorded_by) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_donor (donor_id),
  INDEX idx_category (category_id),
  INDEX idx_date (donation_date),
  INDEX idx_method (donation_method)
);

-- ============================================================================
-- COMMUNICATION SYSTEM
-- ============================================================================

-- Messages and notifications
CREATE TABLE messages (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  sender_id VARCHAR(36),
  recipient_id VARCHAR(36),
  subject VARCHAR(200),
  content TEXT NOT NULL,
  message_type ENUM('personal', 'announcement', 'notification', 'system') DEFAULT 'personal',
  priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP NULL,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (sender_id) REFERENCES users(id) ON SET NULL,
  FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_sender (sender_id),
  INDEX idx_recipient (recipient_id),
  INDEX idx_type (message_type),
  INDEX idx_read (is_read),
  INDEX idx_sent (sent_at)
);

-- Prayer intentions
CREATE TABLE prayer_intentions (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  requester_id VARCHAR(36),
  intention TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT false,
  is_urgent BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT false,
  approved_by VARCHAR(36),
  approved_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (requester_id) REFERENCES users(id) ON SET NULL,
  FOREIGN KEY (approved_by) REFERENCES users(id) ON SET NULL,
  INDEX idx_requester (requester_id),
  INDEX idx_approved (is_approved),
  INDEX idx_urgent (is_urgent),
  INDEX idx_created (created_at)
);

-- ============================================================================
-- SYSTEM CONFIGURATION
-- ============================================================================

-- System settings
CREATE TABLE system_settings (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT,
  setting_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  updated_by VARCHAR(36),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (updated_by) REFERENCES users(id) ON SET NULL,
  INDEX idx_key (setting_key),
  INDEX idx_public (is_public)
);

-- Audit log for tracking changes
CREATE TABLE audit_log (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id VARCHAR(36),
  action VARCHAR(100) NOT NULL,
  table_name VARCHAR(100) NOT NULL,
  record_id VARCHAR(36),
  old_values JSON,
  new_values JSON,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON SET NULL,
  INDEX idx_user (user_id),
  INDEX idx_action (action),
  INDEX idx_table (table_name),
  INDEX idx_created (created_at)
);

-- User associations junction table (many-to-many relationship)
CREATE TABLE user_associations (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id VARCHAR(36) NOT NULL,
  association_id VARCHAR(36) NOT NULL,
  joined_date DATE DEFAULT (CURRENT_DATE),
  is_active BOOLEAN DEFAULT true,
  role_in_association VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (association_id) REFERENCES associations(id) ON DELETE CASCADE,
  UNIQUE (user_id, association_id),
  INDEX idx_user (user_id),
  INDEX idx_association (association_id),
  INDEX idx_active (is_active)
);

-- ============================================================================
-- FOREIGN KEY CONSTRAINTS (Added after table creation)
-- ============================================================================

-- Add foreign key constraints for user profile pictures and organizational structure
ALTER TABLE users 
ADD CONSTRAINT fk_user_profile_picture 
FOREIGN KEY (profile_picture_id) REFERENCES media_files(id) ON SET NULL;

ALTER TABLE users 
ADD CONSTRAINT fk_user_section 
FOREIGN KEY (section_id) REFERENCES sections(id) ON SET NULL;

ALTER TABLE users 
ADD CONSTRAINT fk_user_association 
FOREIGN KEY (association_id) REFERENCES associations(id) ON SET NULL;

-- ============================================================================
-- DEFAULT DATA INSERTION
-- ============================================================================

-- Insert default sacrament types
INSERT INTO sacrament_types (id, name, description, preparation_time_days) VALUES
(UUID(), 'Baptism', 'The sacrament of initiation into the Christian faith', 14),
(UUID(), 'Confirmation', 'The sacrament of strengthening faith', 90),
(UUID(), 'Holy Communion', 'First reception of the Eucharist', 60),
(UUID(), 'Marriage', 'The sacrament of matrimony', 180),
(UUID(), 'Anointing of the Sick', 'Sacrament for healing and comfort', 0);

-- Insert default donation categories
INSERT INTO donation_categories (id, name, description) VALUES
(UUID(), 'Tithe', 'Regular tithe offerings'),
(UUID(), 'Building Fund', 'Contributions for church construction and maintenance'),
(UUID(), 'Missions', 'Support for missionary work'),
(UUID(), 'Charity', 'Donations for helping the needy'),
(UUID(), 'Special Collections', 'Special occasion collections');

-- Insert default media categories
INSERT INTO media_categories (id, name, description) VALUES
(UUID(), 'Gallery', 'General photo gallery'),
(UUID(), 'Events', 'Event photos and videos'),
(UUID(), 'Ministries', 'Ministry-related media'),
(UUID(), 'Sacraments', 'Sacrament ceremony media'),
(UUID(), 'News', 'News article media'),
(UUID(), 'Prayers', 'Prayer and devotion media');

-- Insert St. Patrick's specific sections
INSERT INTO sections (id, name, description) VALUES
(UUID(), 'St Gabriel', 'St Gabriel section'),
(UUID(), 'St Augustine', 'St Augustine section'),
(UUID(), 'St Mary Magdalena', 'St Mary Magdalena section'),
(UUID(), 'St Michael', 'St Michael section'),
(UUID(), 'St Stephen', 'St Stephen section'),
(UUID(), 'St Francis of Assisi', 'St Francis of Assisi section'),
(UUID(), 'St Monica', 'St Monica section'),
(UUID(), 'St Theresa', 'St Theresa section'),
(UUID(), 'St Bernadette', 'St Bernadette section'),
(UUID(), 'St Philomina', 'St Philomina section'),
(UUID(), 'St Peter', 'St Peter section'),
(UUID(), 'St Bernard', 'St Bernard section'),
(UUID(), 'St Veronica', 'St Veronica section'),
(UUID(), 'St Paul', 'St Paul section'),
(UUID(), 'St Luke', 'St Luke section'),
(UUID(), 'St Basil', 'St Basil section'),
(UUID(), 'St Anthony', 'St Anthony section');

-- Insert St. Patrick's specific associations
INSERT INTO associations (id, name, description) VALUES
(UUID(), 'Missionary Childhood (MCA)', 'Missionary Childhood Association'),
(UUID(), 'Catholic Junior Youth Association (CJA)', 'Catholic Junior Youth Association'),
(UUID(), 'Catholic Senior Youth Association (CYA)', 'Catholic Senior Youth Association'),
(UUID(), 'Catholic Young Adults Association (CYAA)', 'Catholic Young Adults Association'),
(UUID(), 'Most Sacred Heart of Jesus', 'Most Sacred Heart of Jesus devotion'),
(UUID(), 'Sodality of Our Lady', 'Sodality of Our Lady'),
(UUID(), 'St Anne', 'St Anne association'),
(UUID(), 'St Joseph', 'St Joseph association'),
(UUID(), 'Couples Association', 'Married couples association'),
(UUID(), 'Focolare', 'Focolare movement'),
(UUID(), 'Women''s Forum', 'Women''s Forum'),
(UUID(), 'Association of Altar Servers', 'Association of Altar Servers');

-- Insert default system settings
INSERT INTO system_settings (setting_key, setting_value, setting_type, description, is_public) VALUES
('church_name', 'St. Patrick''s Catholic Church', 'string', 'Official church name', true),
('church_address', 'Makokoba, Bulawayo, Zimbabwe', 'string', 'Church physical address', true),
('church_phone', '+263 9 123456', 'string', 'Church contact phone', true),
('church_email', 'info@stpatricks.com', 'string', 'Church contact email', true),
('mass_times', '{"sunday": ["6:00 AM", "8:00 AM", "10:00 AM"], "weekday": ["6:00 AM"]}', 'json', 'Mass schedule', true),
('max_file_size', '10485760', 'number', 'Maximum file upload size in bytes (10MB)', false),
('allowed_file_types', '["jpg", "jpeg", "png", "gif", "pdf", "doc", "docx", "mp4", "mp3"]', 'json', 'Allowed file upload types', false);

-- Insert default admin user (password: admin123)
INSERT INTO users (id, username, email, password_hash, first_name, last_name, role, is_active, email_verified) 
VALUES (
  'admin-uuid-1234', 
  'admin', 
  'admin@stpatricks.com', 
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PZvO.e', 
  'System', 
  'Administrator', 
  'admin', 
  true,
  true
);

-- Insert default priest user (password: priest123)
INSERT INTO users (id, username, email, password_hash, first_name, last_name, role, is_active, email_verified, gender) 
VALUES (
  'priest-uuid-1234', 
  'priest', 
  'priest@stpatricks.com', 
  '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 
  'Father', 
  'Patrick', 
  'priest', 
  true,
  true,
  'male'
);

-- Insert default parishioner user (password: parish123)
INSERT INTO users (id, username, email, password_hash, first_name, last_name, role, is_active, email_verified, gender) 
VALUES (
  'parish-uuid-1234', 
  'parishioner', 
  'parishioner@stpatricks.com', 
  '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 
  'Test', 
  'Parishioner', 
  'parishioner', 
  true,
  true,
  'female'
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- ============================================================================

-- Additional composite indexes for common queries
CREATE INDEX idx_users_role_active ON users(role, is_active);
CREATE INDEX idx_events_date_public ON events(start_datetime, is_public);
CREATE INDEX idx_news_status_published ON news_articles(status, published_at);
CREATE INDEX idx_media_type_public ON media_files(file_type, is_public);
CREATE INDEX idx_donations_date_category ON donations(donation_date, category_id);
CREATE INDEX idx_messages_recipient_read ON messages(recipient_id, is_read);

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================

-- Display success message
SELECT 'St. Patrick\'s Catholic Church database schema created successfully!' as message;
SELECT COUNT(*) as total_tables FROM information_schema.tables WHERE table_schema = 'st_patricks_db';
