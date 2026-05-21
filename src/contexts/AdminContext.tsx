import React, { createContext, useContext, useMemo, useState, useCallback, useEffect } from 'react';
import { useAuth, type UserRole, type User } from './AuthContext';
import { api } from '../services/api';

import { liturgicalService } from '../services/liturgicalService';
import { type CatholicReadings, type CatholicCelebration } from '../services/liturgicalService';

// Helper to fix image URLs that might have been saved with localhost or as relative paths
const fixImageUrl = (url: string | undefined): string => {
  if (!url) return '';
  
  // Use a reliable backend base URL
  let backendBase = 'https://santa-backend-3y5e.onrender.com';
  
  // If we are on localhost, use localhost backend
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    backendBase = 'http://localhost:5000';
  }

  // Handle full URLs from database that might be stale
  if (url.startsWith('http://localhost:5000')) {
    return url.replace('http://localhost:5000', backendBase);
  }
  
  if (url.startsWith('https://santa-backend-3y5e.onrender.com')) {
    return url.replace('https://santa-backend-3y5e.onrender.com', backendBase);
  }

  // Handle relative paths
  if (url.startsWith('/uploads') || url.startsWith('uploads/')) {
    const cleanPath = url.startsWith('/') ? url : `/${url}`;
    return `${backendBase}${cleanPath}`;
  }
  
  return url;
};


// Define all the necessary interfaces
export interface Announcement {
  id: string;
  title: string;
  message: string;
  type: 'urgent' | 'info' | 'event';
  isActive: boolean;
  createdAt: string;
  expiresAt?: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: string;
  isPublished: boolean;
  createdAt: string;
}

export interface GalleryImage {
  id: string;
  title: string;
  description: string;
  url: string;
  category: string;
  uploadedAt: string;
  isPublished: boolean;
}

export interface Ministry {
  id: string;
  name: string;
  description: string;
  category: string;
  imageUrl: string;
  contactPerson: string;
  meetingTime: string;
  isActive: boolean;
  createdAt: string;
}

export interface ParishNews {
  id: string;
  title: string;
  summary: string;
  content: string;
  category?: string; // This will be used for category_id
  category_name?: string;
  category_id?: string;
  imageUrl?: string;
  author: string;
  authorRole: 'priest' | 'secretary' | 'reporter' | 'vice_secretary';
  publishedAt: string;
  isArchived: boolean;
  isPublished: boolean;
  createdAt: string;
}

export interface ExternalNews {
  id: string;
  title: string;
  summary: string;
  imageUrl?: string;
  externalUrl: string;
  source: 'diocese' | 'vatican' | 'zimbabwe_catholic';
  publishedAt: string;
  fetchedAt: string;
}

export interface NewsArchive {
  id: string;
  title: string;
  summary: string;
  content: string;
  imageUrl?: string;
  author: string;
  originalPublishDate: string;
  archivedAt: string;
  year: number;
  month: number;
}

export interface ThemeOfYear {
  id: string;
  year: number;
  title: string;
  subtitle: string;
  verse: string;
  description: string;
  imageUrl: string;
  isActive: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  timestamp: string;
  ipAddress?: string;
}

export interface SaintOfDay {
  name: string;
  title: string;
  dates: string;
  description: string;
  quote: string;
  prayer: string;
  imageUrl: string;
  feastDay: string;
}

// Financial Types
export type TransactionType = 'income' | 'expense';
export type Currency = 'USD' | 'ZAR' | 'ZiG';
export type PaymentMethod = 'Cash' | 'Ecocash' | 'Bank';

export interface FinancialTransaction {
  id: string;
  associationId: string; // Used as Entity ID (Association name or Section name)
  associationName: string; // Used as Entity Name
  entityType: 'association' | 'section' | 'parish';
  type: TransactionType;
  amount: number;
  currency: Currency;
  paymentMethod: PaymentMethod;
  category: string; // Changed to string for dynamic categories
  description: string;
  ownerName?: string; // New field for subscriptions
  date: string;
  recordedBy: string; // User ID
  recordedByName: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface CurrencyBalance {
  USD: number;
  ZAR: number;
  ZiG: number;
}

export interface AccountBalance {
  Cash: CurrencyBalance;
  Ecocash: CurrencyBalance;
  Bank: CurrencyBalance;
}

export interface AssociationBalance {
  associationId: string;
  associationName: string;
  totalBalance: CurrencyBalance; // Total across all accounts
  accountBalances: AccountBalance; // Detailed breakdown
  lastUpdated: string;
}

export interface LiveStream {
  id: string;
  title: string;
  description: string;
  streamUrl: string;
  isLive: boolean;
  scheduledTime: string;
  viewers: number;
  thumbnail: string;
  createdBy: string;
  createdAt: string;
}

export interface VideoArchive {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnail: string;
  duration: string;
  publishedAt?: string;
  views: number;
  category: string;
  createdBy: string;
  createdAt: string;
  isPublished: boolean;

  // Database snake_case aliases
  video_url?: string;
  published_at?: string;
  is_published?: boolean;
}

export interface PriestMessage {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  date: string;
  isPublished: boolean;
  createdAt: string;
  authorFirstName?: string;
  authorLastName?: string;
  authorImageUrl?: string;
}

export interface LiturgicalInfo {
  date: string;
  season: string;
  subSeason?: string;
  color: string;
  readings: {
    firstReading: string;
    psalm: string;
    secondReading?: string;
    gospel: string;
  };
  usccbLink?: string;
  liturgicalNote?: string;
  historicalNote?: string;
}

export interface ParishMember {
  id: string;
  name: string;
  email: string;
  lastLogin: Date;
  status: 'online' | 'away' | 'offline';
  role: UserRole;
  committeePosition?: string;
  association?: string;
  section?: string;
  gender?: string;
  dateOfBirth?: string;
  profilePicture?: string;
  middleName?: string;
}

export interface WebsiteAnalytics {
  totalVisitors: number;
  todayVisitors: number;
  pageViews: number;
  avgSessionDuration: string;
  bounceRate: number;
  topPages: Array<{ page: string; views: number; percentage: number }>;
  monthlyData: Array<{ month: string; visitors: number; pageViews: number }>;
  activeUsersLastHour: number;
  visitorTypes: Array<{ type: string; count: number }>;
  contentStats: Array<{ type: string; totalItems: number; publishedItems: number; totalViews: number }>;
  popularContent: Array<{ path: string; views: number; uniqueViewers: number }>;
}

export interface ContactInfo {
  address?: string;
  phone?: string[];
  email?: string[];
  officeHours?: {
    weekdays: string;
    saturday: string;
    sunday: string;
  };
  staff?: {
    name: string;
    position: string;
    phone?: string;
    email?: string;
  }[];
}

export interface MassSchedule {
  weekdays?: string;
  saturday?: string;
  sunday?: string[];
  confession?: string[];
  specialServices?: {
    name: string;
    date: string;
    time: string;
  }[];
}

export interface Sacrament {
  id: string;
  name: string;
  description: string;
  category?: string;
  imageUrl: string;
  requirements: string[];
  contactInfo?: string;
  preparationTime?: string;
  isActive?: boolean;
  createdAt?: string;
}

export interface PrayerIntention {
  id: string;
  name: string;
  email?: string;
  intention: string;
  isUrgent: boolean;
  isPublic: boolean;
  submittedAt: string;
  status: 'pending' | 'approved' | 'prayed';
}

export interface SectionImage {
  id: string;
  section: 'mass_times' | 'confession_times' | 'catechism_times' | 'parish_gallery' | 'hero';
  title: string;
  imageUrl: string;
  isActive: boolean;
  createdAt: string;
}


export interface Prayer {
  id: string;
  title: string;
  text: string;
  category: string;
  imageUrl?: string;
  createdAt: string;
  isPublished: boolean;
}

export type Permission =
  | 'announcements' | 'events' | 'contact' | 'theme'
  | 'mass_schedule' | 'sacraments' | 'prayers'
  | 'readings' | 'overview' | 'priest_desk'
  | 'analytics' | 'prayer_intentions' | 'gallery'
  | 'news' | 'images' | 'ministries' | 'videos' | 'finances' | 'audit_logs';


interface AdminContextType {
  // Authentication
  isAuthenticated: boolean;
  isLoading: boolean;
  currentUser: User | null;
  hasPermission: (permission: Permission) => boolean;

  // Audit Logs
  auditLogs: AuditLog[];
  fetchAuditLogs: (params?: any) => Promise<void>;
  logAdminAction: (action: string, entityType: string, entityId: string, details: string) => Promise<void>;

  // Announcements
  announcements: Announcement[];
  addAnnouncement: (announcement: Omit<Announcement, 'id' | 'createdAt'>) => Promise<void>;
  updateAnnouncement: (id: string, announcement: Partial<Announcement>) => Promise<void>;
  deleteAnnouncement: (id: string) => Promise<void>;
  getActiveAnnouncement: () => Announcement | null;

  // Events
  events: Event[];
  addEvent: (event: Omit<Event, 'id' | 'createdAt'>) => Promise<void>;
  updateEvent: (id: string, event: Partial<Event>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  getPublishedEvents: () => Event[];

  // Gallery
  galleryImages: GalleryImage[];
  addImage: (image: Omit<GalleryImage, 'id' | 'uploadedAt'>) => Promise<void>;
  updateImage: (id: string, image: Partial<GalleryImage>) => Promise<void>;
  deleteImage: (id: string) => Promise<void>;
  getPublishedImages: () => GalleryImage[];

  // Ministries
  ministries: Ministry[];
  addMinistry: (ministry: Omit<Ministry, 'id' | 'createdAt'>) => Promise<void>;
  updateMinistry: (id: string, ministry: Partial<Ministry>) => Promise<void>;
  deleteMinistry: (id: string) => Promise<void>;
  getActiveMinistries: () => Ministry[];

  // News
  parishNews: ParishNews[];
  addParishNews: (news: Omit<ParishNews, 'id' | 'createdAt'>) => void;
  updateParishNews: (id: string, news: Partial<ParishNews>) => void;
  deleteParishNews: (id: string) => void;
  getPublishedParishNews: () => ParishNews[];
  archiveParishNews: (id: string) => void;

  // External News
  externalNews: ExternalNews[];
  fetchExternalNews: (source: ExternalNews['source']) => Promise<void>;

  // News Archive
  newsArchive: NewsArchive[];
  getNewsArchiveByYear: (year: number) => NewsArchive[];
  getNewsArchiveByMonth: (year: number, month: number) => NewsArchive[];

  // Section Images
  sectionImages: SectionImage[];
  addSectionImage: (image: Omit<SectionImage, 'id' | 'createdAt'>) => void;
  updateSectionImage: (id: string, image: Partial<SectionImage>) => void;
  deleteSectionImage: (id: string) => void;
  getSectionImages: (section: SectionImage['section']) => SectionImage[];

  // Theme of Year
  themesOfYear: ThemeOfYear[];
  addThemeOfYear: (theme: Omit<ThemeOfYear, 'id' | 'createdAt'>) => void;
  updateThemeOfYear: (id: string, theme: Partial<ThemeOfYear>) => void;
  deleteThemeOfYear: (id: string) => void;
  getActiveTheme: () => ThemeOfYear | null;

  // Saint & Liturgical
  saintOfDay: SaintOfDay | null;
  liturgicalInfo: LiturgicalInfo | null;
  fetchSaintOfDay: () => Promise<void>;

  // Contact & Schedule
  contactInfo: ContactInfo;
  updateContactInfo: (info: Partial<ContactInfo>) => void;
  massSchedule: MassSchedule;
  updateMassSchedule: (schedule: Partial<MassSchedule>) => void;

  // Sacraments
  sacraments: Sacrament[];
  addSacrament: (sacrament: Omit<Sacrament, 'id' | 'createdAt'>) => Promise<void>;
  updateSacrament: (id: string, sacrament: Partial<Sacrament>) => Promise<void>;
  deleteSacrament: (id: string) => Promise<void>;
  getActiveSacraments: () => Sacrament[];

  // Prayers
  prayers: Prayer[];
  addPrayer: (prayer: Omit<Prayer, 'id' | 'createdAt'>) => Promise<void>;
  updatePrayer: (id: string, prayer: Partial<Prayer>) => Promise<void>;
  deletePrayer: (id: string) => Promise<void>;
  getPublishedPrayers: () => Prayer[];

  // Prayer Intentions
  prayerIntentions: PrayerIntention[];
  addPrayerIntention: (intention: Omit<PrayerIntention, 'id' | 'submittedAt'>) => void;
  updatePrayerIntention: (id: string, intention: Partial<PrayerIntention>) => void;
  deletePrayerIntention: (id: string) => void;
  getPendingIntentions: () => PrayerIntention[];

  // Financials
  financialTransactions: FinancialTransaction[];
  financialCategories: string[];
  fullFinancialCategories: any[];
  galleryCategories: string[];
  fullGalleryCategories: any[];
  newsCategories: string[];
  fullNewsCategories: any[];
  eventCategories: string[];
  fullEventCategories: any[];
  prayerCategories: string[];
  fullPrayerCategories: any[];
  addTransaction: (transaction: Omit<FinancialTransaction, 'id' | 'date' | 'status'>) => Promise<void>;
  updateTransactionStatus: (id: string, status: FinancialTransaction['status']) => Promise<void>;
  getAssociationFinance: (associationId: string) => AssociationBalance;
  getParishFinance: () => AssociationBalance;
  addCategory: (category: string, type?: string, description?: string) => Promise<void>;
  deleteCategory: (id: string, type?: string) => Promise<void>;
  fetchCategories: (type: string) => Promise<void>;

  // Priest's Desk
  priestMessages: PriestMessage[];
  addPriestMessage: (message: Omit<PriestMessage, 'id' | 'createdAt'>) => Promise<void>;
  updatePriestMessage: (id: string, message: Partial<PriestMessage>) => Promise<void>;
  deletePriestMessage: (id: string) => Promise<void>;
  getLatestPriestMessage: () => PriestMessage | null;

  // Parish Members
  parishMembers: ParishMember[];

  // Analytics
  websiteAnalytics: WebsiteAnalytics;

  // Videos
  liveStreams: LiveStream[];
  videoArchive: VideoArchive[];
  fetchVideos: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

// Role permissions mapping
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    'announcements', 'events', 'contact', 'theme', 'mass_schedule',
    'sacraments', 'prayers', 'readings', 'overview', 'priest_desk',
    'analytics', 'prayer_intentions', 'gallery', 'news', 'images',

    'ministries', 'videos', 'finances', 'audit_logs'

  ],
  secretary: [
    'announcements', 'events', 'contact', 'theme', 'mass_schedule',
    'sacraments', 'prayers', 'readings'
  ],
  priest: [
    'overview', 'announcements', 'events', 'contact', 'priest_desk',
    'prayers', 'readings', 'analytics', 'sacraments', 'prayer_intentions', 'finances', 'audit_logs'
  ],
  reporter: [
    'gallery', 'news', 'images', 'analytics', 'ministries', 'videos'
  ],
  parishioner: [],
  vice_secretary: ['announcements', 'events', 'contact'],
  committee_member: ['finances', 'announcements', 'events'],
  council_member: ['overview', 'announcements', 'events', 'finances', 'analytics', 'audit_logs'],
  treasurer: ['finances', 'analytics', 'overview', 'audit_logs']
};

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isExternalNewsLoading, setIsExternalNewsLoading] = useState(false);

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [parishNews, setParishNews] = useState<ParishNews[]>([]);
  const [externalNews, setExternalNews] = useState<ExternalNews[]>([]);
  const [newsArchive, setNewsArchive] = useState<NewsArchive[]>([]);
  const [sectionImages, setSectionImages] = useState<SectionImage[]>([]);
  const [themesOfYear, setThemesOfYear] = useState<ThemeOfYear[]>([]);
  const [saintOfDay, setSaintOfDay] = useState<SaintOfDay | null>(null);
  const [liturgicalInfo, setLiturgicalInfo] = useState<LiturgicalInfo | null>(null);
  const [liveStreams, setLiveStreams] = useState<LiveStream[]>([]);
  const [videoArchive, setVideoArchive] = useState<VideoArchive[]>([]);
  const [contactInfo, setContactInfo] = useState<ContactInfo>({});
  const [massSchedule, setMassSchedule] = useState<MassSchedule>({});
  const [sacraments, setSacraments] = useState<Sacrament[]>([]);
  const [prayerIntentions, setPrayerIntentions] = useState<PrayerIntention[]>([]);
  const [financialTransactions, setFinancialTransactions] = useState<FinancialTransaction[]>([]);
  const [priestMessages, setPriestMessages] = useState<PriestMessage[]>([]);
  const [financialCategories, setFinancialCategories] = useState<string[]>([]);
  const [fullFinancialCategories, setFullFinancialCategories] = useState<any[]>([]);
  const [galleryCategories, setGalleryCategories] = useState<string[]>([]);
  const [fullGalleryCategories, setFullGalleryCategories] = useState<any[]>([]);
  const [newsCategories, setNewsCategories] = useState<string[]>([]);
  const [fullNewsCategories, setFullNewsCategories] = useState<any[]>([]);
  const [eventCategories, setEventCategories] = useState<string[]>([]);
  const [fullEventCategories, setFullEventCategories] = useState<any[]>([]);
  const [prayerCategories, setPrayerCategories] = useState<string[]>([]);
  const [fullPrayerCategories, setFullPrayerCategories] = useState<any[]>([]);
  const [prayers, setPrayers] = useState<Prayer[]>([]);
  const [parishMembers, setParishMembers] = useState<ParishMember[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [websiteAnalytics, setWebsiteAnalytics] = useState<WebsiteAnalytics>({
    totalVisitors: 0,
    todayVisitors: 0,
    pageViews: 0,
    avgSessionDuration: '0:00',
    bounceRate: 0,
    topPages: [],
    monthlyData: [],
    activeUsersLastHour: 0,
    visitorTypes: [],
    contentStats: [],
    popularContent: []
  });


  const fetchAuditLogs = useCallback(async (params?: any) => {
    try {
      const res = await api.auditLogs.getAll(params);
      if (res.success && res.data) {
        const logsData = res.data.logs || res.data.items || (Array.isArray(res.data) ? res.data : []);
        const mappedLogs = logsData.map((log: any) => ({
          ...log,
          userId: log.user_id || log.userId,
          userName: log.username || log.userName || 'System',
          userRole: log.user_role || log.userRole,
          entityType: log.entity_type || log.entityType,
          entityId: log.entity_id || log.entityId || '',
          timestamp: log.created_at || log.timestamp || new Date().toISOString(),
          ipAddress: log.ip_address || log.ipAddress
        }));
        setAuditLogs(mappedLogs);
      }
    } catch (err) {
      console.error('Failed to fetch audit logs', err);
    }
  }, []);

  const logAdminAction = useCallback(async (action: string, entityType: string, entityId: string, details: string) => {
    if (!user) return;
    try {
      const logData = {
        userId: user.id,
        userName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username,
        userRole: user.role,
        action,
        entityType,
        entityId,
        details,
        timestamp: new Date().toISOString()
      };
      await api.auditLogs.create(logData);
      fetchAuditLogs({ limit: 50 });
    } catch (err) {
      console.error('Failed to create audit log', err);
    }
  }, [user, fetchAuditLogs]);

  const fetchLiturgicalCalendar = useCallback(async () => {
    try {
      const today = new Date();
      const month = today.getMonth() + 1;
      const day = today.getDate();

      const [readingsData, celebrationData] = await Promise.all([
        liturgicalService.getReadings(today),
        liturgicalService.getCelebration(today)
      ]);

      if (readingsData) {
        let color = 'green';
        const season = readingsData.season.toLowerCase();
        if (season.includes('lent') || season.includes('advent')) color = '#702963';
        if (season.includes('easter') || season.includes('christmas')) color = '#FFD700';

        if (celebrationData?.celebration.type === 'SOLEMNITY' || celebrationData?.celebration.type === 'FEAST') {
          if (!season.includes('lent') && !season.includes('advent')) color = '#FFD700';
        }
        if (celebrationData?.celebration.type === 'MEMORIAL' && celebrationData.celebration.name.toLowerCase().includes('martyr')) {
          color = '#D22B2B';
        }

        setLiturgicalInfo({
          date: readingsData.date,
          season: readingsData.season,
          subSeason: readingsData.subSeason,
          color: color,
          readings: readingsData.readings,
          usccbLink: readingsData.usccbLink,
          liturgicalNote: celebrationData?.liturgicalNote,
          historicalNote: celebrationData?.historicalNote
        });

        // Saint Fallback Database (Common saints for Feria days)
        const saintFallbacks: Record<string, any> = {
          '5-5': {
            name: 'St. Hilary of Arles',
            title: 'Bishop and Confessor',
            dates: 'c. 401 – 449',
            description: 'Born in Gaul, St. Hilary was the Bishop of Arles. He was known for his extreme humility, charity to the poor, and his powerful preaching. He lived a life of rigorous austerity and was a staunch defender of Church discipline.',
            quote: 'Be not afraid of those who kill the body but cannot kill the soul.',
            prayer: 'O God, who made St. Hilary a faithful pastor of your flock, grant through his intercession that we may always seek your kingdom and your righteousness.',
            imageUrl: '/images/saints/st_hilary.png'
          },
          '5-6': {
            name: 'St. Dominic Savio',
            title: 'Confessor',
            dates: '1842 – 1857',
            description: 'A young student of St. John Bosco, Dominic Savio was known for his exceptional piety and his motto "Death, but not sin!" He died at the age of 14 and is the patron saint of choirboys and falsely accused people.',
            quote: 'I am not capable of doing big things, but I want to do everything, even the smallest things, for the greater glory of God.',
            prayer: 'Lord, you gave St. Dominic Savio the grace to remain pure in heart. Grant us the same grace to serve you with holiness and love.',
            imageUrl: '/images/saints/st_dominic_savio.png'
          }
          // Add more as needed or fetch from a dedicated service
        };

        const todayKey = `${month}-${day}`;
        const fallback = saintFallbacks[todayKey];

        if (celebrationData) {
          const isFeria = celebrationData.celebration.type === 'FERIA';

          if (isFeria && fallback) {
            setSaintOfDay({
              ...fallback,
              feastDay: celebrationData.date
            });
          } else {
            setSaintOfDay({
              name: celebrationData.celebration.name,
              title: celebrationData.celebration.type,
              dates: '',
              description: celebrationData.celebration.description || `Today we celebrate ${celebrationData.celebration.name}.`,
              quote: celebrationData.celebration.quote || '',
              prayer: celebrationData.liturgicalNote || 'Heavenly Father, through the intercession of your saints, help us to follow the path of love and service.',
              imageUrl: celebrationData.celebration.image || 'https://images.unsplash.com/photo-1544928147-79723ec42ba1?auto=format&fit=crop&q=80&w=800',
              feastDay: celebrationData.date
            });
          }
        }
      }
    } catch (error) {
      console.error('Error fetching liturgical calendar:', error);
    }
  }, []);

  // Initialize liturgical data
  useEffect(() => {
    fetchLiturgicalCalendar();
  }, [fetchLiturgicalCalendar]);

  // Load data from backend
  const refreshAllData = useCallback(async () => {
    console.log('🏁 refreshAllData called, isAuthenticated:', !!user, 'user:', user?.username);
    if (!user) {
      console.log('⚠️ No user found, skipping sync');
      return;
    }

    setIsLoading(true);
    try {
      const results = await Promise.allSettled([
        api.announcements.getAll(),
        api.events.getAll(),
        api.priestDesk.getAll(),
        api.finances.getAll(),
        api.categories.getAll({ type: 'financial' }),
        api.categories.getAll({ type: 'news' }),
        api.categories.getAll({ type: 'event' }),
        api.categories.getAll({ type: 'prayer' }),
        api.categories.getAll({ type: 'gallery' }),
        api.gallery.getAll(),
        api.ministries.getAll(),
        api.sacraments.getAll(),
        api.liturgicalPrayers.getAll(),
        api.news.getAll(),
        api.users.getAll({ limit: 100 }),
        api.analytics.getOverview(30),
        api.analytics.getVisitors(30),
        api.analytics.getRealtime(),
        api.analytics.getContent(30),
        api.themes.getAll(),
        api.auditLogs.getAll({ limit: 50 }),
        // Pre-fetch external news
        api.news.getExternal('diocese'),
        api.news.getExternal('vatican'),
        api.news.getExternal('zimbabwe_catholic')
      ]);

      console.log('🔄 Syncing all admin data...');

      // Define public and private fetches
      const fetchPublicData = async () => {
        try {
          const [
            annRes, eveRes, priRes, catNewRes, catEveRes, catPraRes,
            catGalRes, galRes, minRes, themeRes, sacRes, litRes, newsRes
          ] = await Promise.allSettled([
            api.announcements.getAll(),
            api.events.getAll(),
            api.priestDesk.getAll(),
            api.categories.getByType('news'),
            api.categories.getByType('event'),
            api.categories.getByType('prayer'),
            api.categories.getByType('gallery'),
            api.gallery.getAll(),
            api.ministries.getAll({ active: true }),
            api.themes.getAll(),
            api.sacraments.getAll({ active: true }),
            api.liturgicalPrayers.getAll(),
            api.news.getAll({ published: true })
          ]);

          // Handle each result individually
          if (annRes.status === 'fulfilled' && annRes.value.success) {
            const annData = annRes.value.data?.announcements || annRes.value.data?.items || (Array.isArray(annRes.value.data) ? annRes.value.data : []);
            setAnnouncements(annData.map((ann: any) => ({
              id: ann.id,
              title: ann.title,
              message: ann.content || ann.message,
              type: ann.type === 'general' ? 'info' : ann.type,
              isActive: ann.is_active !== undefined ? ann.is_active : ann.isActive,
              createdAt: ann.created_at || ann.createdAt,
              expiresAt: ann.end_date || ann.expiresAt
            })));
          }

          if (eveRes.status === 'fulfilled' && eveRes.value.success) {
            const eveData = eveRes.value.data?.events || eveRes.value.data?.items || (Array.isArray(eveRes.value.data) ? eveRes.value.data : []);
            setEvents(eveData.map((eve: any) => ({
              id: eve.id,
              title: eve.title,
              description: eve.description,
              date: eve.event_date || eve.date,
              time: eve.start_time || eve.time,
              location: eve.location,
              category: eve.category_name || eve.category || 'general',
              isPublished: eve.is_published !== undefined ? eve.is_published : eve.isPublished,
              createdAt: eve.created_at || eve.createdAt
            })));
          }

          if (priRes.status === 'fulfilled' && priRes.value.success) {
            setPriestMessages((priRes.value.data || []).map((m: any) => ({
              ...m,
              isPublished: m.is_published === 1 || m.is_published === true,
              imageUrl: fixImageUrl(m.image_url || m.imageUrl),
              authorFirstName: m.author_first_name,
              authorLastName: m.author_last_name,
              authorImageUrl: fixImageUrl(m.author_image_url)
            })));
          }

          if (catNewRes.status === 'fulfilled' && catNewRes.value.success) {
            const cats = catNewRes.value.data?.items || catNewRes.value.data || [];
            setNewsCategories(cats.map((c: any) => c.name));
            setFullNewsCategories(cats);
          }
          if (catEveRes.status === 'fulfilled' && catEveRes.value.success) {
            const cats = catEveRes.value.data?.items || catEveRes.value.data || [];
            setEventCategories(cats.map((c: any) => c.name));
            setFullEventCategories(cats);
          }
          if (catPraRes.status === 'fulfilled' && catPraRes.value.success) {
            const cats = catPraRes.value.data?.items || catPraRes.value.data || [];
            setPrayerCategories(cats.map((c: any) => c.name));
            setFullPrayerCategories(cats);
          }
          if (catGalRes.status === 'fulfilled' && catGalRes.value.success) {
            const cats = catGalRes.value.data?.items || catGalRes.value.data || [];
            setGalleryCategories(cats.map((c: any) => c.name));
            setFullGalleryCategories(cats);
          }

          if (galRes.status === 'fulfilled' && galRes.value.success) {
            const galData = galRes.value.data?.images || galRes.value.data?.items || (Array.isArray(galRes.value.data) ? galRes.value.data : []);
            setGalleryImages(galData.map((img: any) => ({
              ...img,
              url: fixImageUrl(img.image_url || img.url),
              category: img.category_name || img.category || '',
              isPublished: img.is_published !== undefined ? img.is_published : true,
              uploadedAt: img.upload_date || img.created_at
            })));
          }

          if (minRes.status === 'fulfilled' && minRes.value.success) {
            const rawMinistries = minRes.value.data?.ministries || minRes.value.data?.items || (Array.isArray(minRes.value.data) ? minRes.value.data : []);
            setMinistries(rawMinistries.map((m: any) => ({
              id: m.id,
              name: m.name,
              description: m.description,
              category: m.category || '',
              imageUrl: fixImageUrl(m.image_url || m.imageUrl || ''),
              contactPerson: m.leader_name || m.contactPerson || '',
              meetingTime: m.meeting_schedule || m.meetingTime || '',
              isActive: m.is_active !== undefined ? m.is_active : (m.isActive !== undefined ? m.isActive : true),
              createdAt: m.created_at || m.createdAt
            })));
          }

          if (themeRes.status === 'fulfilled' && themeRes.value.success) {
            setThemesOfYear((themeRes.value.data || []).map((t: any) => ({
              id: t.id,
              year: t.year,
              title: t.title,
              subtitle: t.subtitle,
              verse: t.verse,
              description: t.description,
              imageUrl: fixImageUrl(t.image_url || t.imageUrl),
              isActive: t.is_active !== undefined ? t.is_active : t.isActive,
              createdAt: t.created_at || t.createdAt
            })));
          }

          if (newsRes.status === 'fulfilled' && newsRes.value.success) {
            const rawNews = newsRes.value.data?.news || newsRes.value.data?.items || (Array.isArray(newsRes.value.data) ? newsRes.value.data : []);
            setParishNews(rawNews.map((n: any) => ({
              ...n,
              imageUrl: fixImageUrl(n.image_url || n.imageUrl),
              authorRole: n.author_role || n.authorRole,
              isPublished: n.is_published !== undefined ? n.is_published : n.isPublished,
              isArchived: n.is_archived !== undefined ? n.is_archived : n.isArchived,
              publishedAt: n.published_at || n.publishedAt,
              createdAt: n.created_at || n.createdAt
            })));
          }

          if (sacRes.status === 'fulfilled' && sacRes.value.success) setSacraments(sacRes.value.data?.sacraments || sacRes.value.data?.items || (Array.isArray(sacRes.value.data) ? sacRes.value.data : []));
          if (litRes.status === 'fulfilled' && litRes.value.success) {
            const rawPrayers = litRes.value.data?.prayers || litRes.value.data?.items || (Array.isArray(litRes.value.data) ? litRes.value.data : []);
            setPrayers(rawPrayers.map((p: any) => ({
              id: p.id,
              title: p.title,
              text: p.text,
              category: p.category,
              imageUrl: fixImageUrl(p.image_url || p.imageUrl),
              createdAt: p.created_at || p.createdAt,
              isPublished: p.is_active !== undefined ? p.is_active : (p.is_published !== undefined ? p.is_published : (p.isPublished !== undefined ? p.isPublished : true))
            })));
          }
        } catch (e) {
          console.error('Error fetching public data:', e);
        }
      };

      const fetchAdminData = async () => {
        if (user.role === 'parishioner') return;
        try {
          const [finRes, catFinRes, usersRes, anaRes, anaVisRes, anaRealRes, anaContRes] = await Promise.allSettled([
            api.finances.getAll(),
            api.categories.getByType('financial'),
            api.users.getAll({ limit: 1000 }),
            api.analytics.getOverview(),
            api.analytics.getVisitors(),
            api.analytics.getRealtime(),
            api.analytics.getContent()
          ]);

          if (finRes.status === 'fulfilled' && finRes.value.success) setFinancialTransactions(finRes.value.data || []);
          if (catFinRes.status === 'fulfilled' && catFinRes.value.success) {
            const cats = catFinRes.value.data?.items || catFinRes.value.data || [];
            setFinancialCategories(cats.map((c: any) => c.name));
            setFullFinancialCategories(cats);
          }

          if (usersRes.status === 'fulfilled' && usersRes.value.success) {
            const users = usersRes.value.data?.users || usersRes.value.data?.items || (Array.isArray(usersRes.value.data) ? usersRes.value.data : []);
            setParishMembers(users.map((u: any) => {
              const lastLogin = u.lastLogin ? new Date(u.lastLogin) : new Date(u.createdAt);
              const now = new Date();
              const diffMinutes = Math.floor((now.getTime() - lastLogin.getTime()) / 60000);
              let status: 'online' | 'away' | 'offline' = 'offline';
              if (diffMinutes < 5) status = 'online';
              else if (diffMinutes < 30) status = 'away';
              return {
                id: u.id,
                name: u.firstName && u.lastName 
                  ? `${u.firstName}${u.middleName ? ' ' + u.middleName : ''} ${u.lastName}` 
                  : (u.username || 'User'),
                email: u.email,
                lastLogin,
                status,
                role: u.role,
                committeePosition: u.committeePosition || u.committee_position,
                association: u.association,
                section: u.section || u.parish_section,
                gender: u.gender,
                dateOfBirth: u.dateOfBirth || u.date_of_birth,
                profilePicture: fixImageUrl(u.profile_picture || u.profilePicture),
                middleName: u.middleName || u.middle_name
              };
            }));
          }

          if (anaRes.status === 'fulfilled' && anaRes.value.success && anaRes.value.data) {
            const ana = anaRes.value.data;
            const visData = anaVisRes.status === 'fulfilled' ? anaVisRes.value.data : {};
            const realData = anaRealRes.status === 'fulfilled' ? anaRealRes.value.data : {};
            const contData = anaContRes.status === 'fulfilled' ? anaContRes.value.data : {};

            setWebsiteAnalytics({
              totalVisitors: ana.overview?.unique_visitors || 0,
              todayVisitors: ana.overview?.today_visitors || 0,
              pageViews: ana.overview?.total_visits || 0,
              avgSessionDuration: '4:32',
              bounceRate: 32.5,
              topPages: (ana.popularPages || []).map((p: any) => ({
                page: p.page_path,
                views: p.visit_count,
                percentage: parseFloat(p.percentage) || 0
              })),
              monthlyData: (ana.dailyVisits || []).slice(0, 6).reverse().map((d: any) => ({
                month: new Date(d.visit_date).toLocaleDateString('en-US', { month: 'short' }),
                visitors: d.unique_visitors,
                pageViews: d.visits
              })),
              activeUsersLastHour: realData.overview?.visitors_last_hour || 0,
              visitorTypes: (visData.visitorTypes || []).map((v: any) => ({ type: v.visitor_type, count: v.visitor_count })),
              contentStats: (contData.contentStats || []).map((c: any) => ({
                type: c.content_type,
                totalItems: c.total_items,
                publishedItems: c.published_items,
                totalViews: c.total_views
              })),
              popularContent: (contData.mostViewedContent || []).map((m: any) => ({
                path: m.page_path,
                views: m.view_count,
                uniqueViewers: m.unique_viewers
              }))
            });
          }
        } catch (e) {
          console.error('Error fetching admin data:', e);
        }
      };

      await Promise.all([fetchPublicData(), fetchAdminData(), fetchAuditLogs({ limit: 50 })]);
      
      // Handle external news results from the initial all-settled call
      const extDioRes: any = results[21]?.status === 'fulfilled' ? (results[21].value as any) : { success: false };
      const extVatRes: any = results[22]?.status === 'fulfilled' ? (results[22].value as any) : { success: false };
      const extZimRes: any = results[23]?.status === 'fulfilled' ? (results[23].value as any) : { success: false };

      const allExtNews: ExternalNews[] = [];
      const processExt = (res: any, source: any) => {
        if (res.success && res.data) {
          const items = res.data.items || res.data || [];
          (Array.isArray(items) ? items : []).forEach((item: any) => {
            allExtNews.push({
              ...item,
              source: item.source || source,
              id: item.id || `${source}-${Math.random()}`,
              publishedAt: item.published_at || item.publishedAt || new Date().toISOString()
            });
          });
        }
      };
      
      processExt(extDioRes, 'diocese');
      processExt(extVatRes, 'vatican');
      processExt(extZimRes, 'zimbabwe_catholic');
      
      if (allExtNews.length > 0) {
        setExternalNews(allExtNews);
      }
      
      console.log('✅ Admin data sync complete');
    } catch (err) {
      console.error('❌ Failed to fetch admin data', err);
    } finally {
      setIsLoading(false);
    }
  }, [user, fetchAuditLogs]);

  useEffect(() => {
    if (user) {
      refreshAllData();
    }
  }, [user, refreshAllData]);


  const hasPermission = useCallback((permission: Permission): boolean => {
    if (!user) return false;
    if (user.role === 'admin' || user.role === 'priest') return true;

    // Check for specific committee positions and association roles
    const position = (user.committeePosition || '').toLowerCase();
    const isSecretary = position.includes('secretary'); // Catch 'Secretary', 'Organising Secretary', 'Vice Secretary'
    const isCommitteeMember = user.isCommitteeMember || false;

    // Association leaders can manage their specific area's content
    if ((permission === 'events' || permission === 'announcements') && (isSecretary || user.role === 'secretary' || user.role === 'vice_secretary')) return true;
    const permissions = ROLE_PERMISSIONS[user.role] || [];


    // Check if basic role permission exists
    if (!permissions.includes(permission)) return false;

    // Special restrictions for Association Treasurers (those with an association set)
    if (user.role === 'treasurer' && user.association) {
      // Association treasurers should only see finances and overview (and eventually association-specific logs)
      const allowedForAssocTreasurer: Permission[] = ['overview'];
      return allowedForAssocTreasurer.includes(permission);
    }

    return true;
  }, [user]);


  // Announcement methods
  const addAnnouncement = useCallback(async (announcement: Omit<Announcement, 'id' | 'createdAt'>) => {
    try {
      // Map frontend fields to backend fields
      const payload = {
        title: announcement.title,
        content: announcement.message,
        type: announcement.type === 'info' ? 'general' : announcement.type,
        is_active: announcement.isActive,
        // Ensure date is in ISO format for the backend validation
        end_date: announcement.expiresAt ? new Date(announcement.expiresAt).toISOString() : null
      };

      console.log('Sending announcement payload:', payload);
      const res = await api.announcements.create(payload);
      if (res.success && res.data) {
        const ann = res.data.announcement || res.data;
        // Map backend fields back to frontend format
        const newAnnouncement: Announcement = {
          id: ann.id,
          title: ann.title,
          message: ann.content,
          type: ann.type === 'general' ? 'info' : ann.type,
          isActive: ann.is_active !== undefined ? ann.is_active : ann.isActive,
          createdAt: ann.created_at || ann.createdAt,
          expiresAt: ann.end_date || ann.expiresAt
        };
        setAnnouncements(prev => [newAnnouncement, ...prev]);
      } else {
        throw new Error(res.message || 'Failed to create announcement');
      }
    } catch (err) {
      console.error('Failed to add announcement', err);
      throw err;
    }
  }, []);

  const updateAnnouncement = useCallback(async (id: string, announcement: Partial<Announcement>) => {
    try {
      // Map frontend fields to backend fields
      const payload: any = {};
      if (announcement.title !== undefined) payload.title = announcement.title;
      if (announcement.message !== undefined) payload.content = announcement.message;
      if (announcement.type !== undefined) payload.type = announcement.type === 'info' ? 'general' : announcement.type;
      if (announcement.isActive !== undefined) payload.is_active = announcement.isActive;
      if (announcement.expiresAt !== undefined) {
        payload.end_date = announcement.expiresAt ? new Date(announcement.expiresAt).toISOString() : null;
      }

      console.log(`Updating announcement ${id} with:`, payload);
      const res = await api.announcements.update(id, payload);
      if (res.success && res.data) {
        const ann = res.data.announcement || res.data;
        // Map backend fields back to frontend format
        const updatedAnnouncement: Announcement = {
          id: ann.id,
          title: ann.title,
          message: ann.content,
          type: ann.type === 'general' ? 'info' : ann.type,
          isActive: ann.is_active !== undefined ? ann.is_active : ann.isActive,
          createdAt: ann.created_at || ann.createdAt,
          expiresAt: ann.end_date || ann.expiresAt
        };
        setAnnouncements(prev => prev.map(a => a.id === id ? updatedAnnouncement : a));
      } else {
        throw new Error(res.message || 'Failed to update announcement');
      }
    } catch (err) {
      console.error('Failed to update announcement', err);
      throw err;
    }
  }, []);

  const deleteAnnouncement = useCallback(async (id: string) => {
    try {
      const res = await api.announcements.delete(id);
      if (res.success) {
        setAnnouncements(prev => prev.filter(a => a.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete announcement', err);
      throw err;
    }
  }, []);

  const getActiveAnnouncement = useCallback((): Announcement | null => {
    return announcements.find(a => a.isActive) || null;
  }, [announcements]);

  // Event methods
  const addEvent = useCallback(async (event: Omit<Event, 'id' | 'createdAt'>) => {
    try {
      const matchingCategory = fullEventCategories.find(
        c => c.name.toLowerCase() === (event.category || '').toLowerCase()
      ) || fullEventCategories[0];
      const category_id = matchingCategory ? matchingCategory.id : undefined;

      // Map frontend fields to backend fields
      const payload = {
        title: event.title,
        description: event.description,
        event_date: event.date,
        start_time: event.time || null,
        location: event.location,
        is_published: event.isPublished,
        category_id: category_id
      };

      const res = await api.events.create(payload);
      if (res.success && res.data) {
        const eve = res.data.event || res.data;
        // Map backend fields back to frontend format
        const newEvent: Event = {
          id: eve.id,
          title: eve.title,
          description: eve.description,
          date: eve.event_date,
          time: eve.start_time,
          location: eve.location,
          category: eve.category_name || eve.category || event.category || 'general',
          isPublished: eve.is_published,
          createdAt: eve.created_at
        };
        setEvents(prev => [newEvent, ...prev]);
      }
    } catch (err) {
      console.error('Failed to add event', err);
      throw err;
    }
  }, [fullEventCategories]);

  const updateEvent = useCallback(async (id: string, event: Partial<Event>) => {
    try {
      // Map frontend fields to backend fields
      const payload: any = {};
      if (event.title !== undefined) payload.title = event.title;
      if (event.description !== undefined) payload.description = event.description;
      if (event.date !== undefined) payload.event_date = event.date;
      if (event.time !== undefined) payload.start_time = event.time || null;
      if (event.location !== undefined) payload.location = event.location;
      if (event.isPublished !== undefined) payload.is_published = event.isPublished;
      if (event.category !== undefined) {
        const matchingCategory = fullEventCategories.find(
          c => c.name.toLowerCase() === (event.category || '').toLowerCase()
        );
        if (matchingCategory) {
          payload.category_id = matchingCategory.id;
        }
      }

      const res = await api.events.update(id, payload);
      if (res.success) {
        // Fetch updated event or just update local state
        setEvents(prev => prev.map(e => e.id === id ? { ...e, ...event } : e));
      }
    } catch (err) {
      console.error('Failed to update event', err);
      throw err;
    }
  }, [fullEventCategories]);

  const deleteEvent = useCallback(async (id: string) => {
    try {
      const res = await api.events.delete(id);
      if (res.success) {
        setEvents(prev => prev.filter(e => e.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete event', err);
      throw err;
    }
  }, []);

  const getPublishedEvents = useCallback((): Event[] => {
    return events.filter(event => event.isPublished);
  }, [events]);

  // Gallery methods
  const addImage = useCallback(async (image: Omit<GalleryImage, 'id' | 'uploadedAt'>) => {
    try {
      const catObj = fullGalleryCategories.find(c => c.name === image.category);
      const categoryId = catObj ? catObj.id : undefined;

      const payload = {
        title: image.title,
        description: image.description,
        image_url: image.url,
        category_id: categoryId,
        upload_date: new Date().toISOString(),
        is_published: image.isPublished
      };

      const res = await api.gallery.create(payload);
      if (res.success && res.data) {
        const newImage = {
          ...res.data.image,
          url: res.data.image.image_url,
          category: res.data.image.category_name || image.category,
          isPublished: res.data.image.is_published !== undefined ? res.data.image.is_published : image.isPublished,
          uploadedAt: res.data.image.upload_date
        };
        setGalleryImages(prev => [newImage, ...prev]);
        logAdminAction('create', 'gallery_image', newImage.id, `Uploaded image: ${newImage.title}`);
      }
    } catch (err) {
      console.error('Failed to add image to gallery', err);
      throw err;
    }
  }, [logAdminAction, fullGalleryCategories]);

  const updateImage = useCallback(async (id: string, image: Partial<GalleryImage>) => {
    try {
      const payload: any = {};
      if (image.title !== undefined) payload.title = image.title;
      if (image.description !== undefined) payload.description = image.description;
      if (image.isPublished !== undefined) payload.is_published = image.isPublished;
      if (image.category !== undefined) {
        const catObj = fullGalleryCategories.find(c => c.name === image.category);
        payload.category_id = catObj ? catObj.id : undefined;
      }

      const res = await api.gallery.update(id, payload);
      if (res.success) {
        setGalleryImages(prev => prev.map(i => i.id === id ? { ...i, ...image } : i));
        logAdminAction('update', 'gallery_image', id, `Updated gallery image: ${image.title || id}`);
      }
    } catch (err) {
      console.error('Failed to update gallery image', err);
      throw err;
    }
  }, [logAdminAction, fullGalleryCategories]);

  const deleteImage = useCallback(async (id: string) => {
    try {
      const res = await api.gallery.delete(id);
      if (res.success) {
        setGalleryImages(prev => prev.filter(i => i.id !== id));
        logAdminAction('delete', 'gallery_image', id, `Deleted image ID: ${id}`);
      }
    } catch (err) {
      console.error('Failed to delete gallery image', err);
      throw err;
    }
  }, [logAdminAction]);

  const getPublishedImages = useCallback((): GalleryImage[] => {
    return galleryImages.filter(img => img.isPublished);
  }, [galleryImages]);

  // Ministry methods
  const addMinistry = useCallback(async (ministry: Omit<Ministry, 'id' | 'createdAt'>) => {
    try {
      const payload = {
        name: ministry.name,
        description: ministry.description,
        category: ministry.category,
        image_url: ministry.imageUrl,
        leader_name: ministry.contactPerson,
        meeting_schedule: ministry.meetingTime,
        is_active: ministry.isActive
      };
      const res = await api.ministries.create(payload);
      if (res.success && res.data) {
        const m = res.data.ministry || res.data;
        const newMinistry: Ministry = {
          id: m.id,
          name: m.name,
          description: m.description,
          category: m.category || '',
          imageUrl: m.image_url || m.imageUrl || '',
          contactPerson: m.leader_name || m.contactPerson || '',
          meetingTime: m.meeting_schedule || m.meetingTime || '',
          isActive: m.is_active !== undefined ? m.is_active : (m.isActive !== undefined ? m.isActive : true),
          createdAt: m.created_at || m.createdAt
        };
        setMinistries(prev => [...prev, newMinistry]);
      }
    } catch (err) {
      console.error('Failed to add ministry', err);
      throw err;
    }
  }, []);

  const updateMinistry = useCallback(async (id: string, ministry: Partial<Ministry>) => {
    try {
      const payload: any = {};
      if (ministry.name !== undefined) payload.name = ministry.name;
      if (ministry.description !== undefined) payload.description = ministry.description;
      if (ministry.category !== undefined) payload.category = ministry.category;
      if (ministry.imageUrl !== undefined) payload.image_url = ministry.imageUrl;
      if (ministry.contactPerson !== undefined) payload.leader_name = ministry.contactPerson;
      if (ministry.meetingTime !== undefined) payload.meeting_schedule = ministry.meetingTime;
      if (ministry.isActive !== undefined) payload.is_active = ministry.isActive;

      const res = await api.ministries.update(id, payload);
      if (res.success && res.data) {
        const m = res.data.ministry || res.data;
        const updatedMinistry: Ministry = {
          id: m.id,
          name: m.name,
          description: m.description,
          category: m.category || '',
          imageUrl: m.image_url || m.imageUrl || '',
          contactPerson: m.leader_name || m.contactPerson || '',
          meetingTime: m.meeting_schedule || m.meetingTime || '',
          isActive: m.is_active !== undefined ? m.is_active : (m.isActive !== undefined ? m.isActive : true),
          createdAt: m.created_at || m.createdAt
        };
        setMinistries(prev => prev.map(old => old.id === id ? updatedMinistry : old));
      }
    } catch (err) {
      console.error('Failed to update ministry', err);
      throw err;
    }
  }, []);

  const deleteMinistry = useCallback(async (id: string) => {
    try {
      const res = await api.ministries.delete(id);
      if (res.success) {
        setMinistries(prev => prev.filter(m => m.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete ministry', err);
      throw err;
    }
  }, []);

  const getActiveMinistries = useCallback((): Ministry[] => {
    return ministries.filter(ministry => ministry.isActive);
  }, [ministries]);

  // Parish News methods
  const addParishNews = useCallback(async (news: Omit<ParishNews, 'id' | 'createdAt'>) => {
    try {
      // Map frontend fields to backend fields
      const payload = {
        title: news.title,
        summary: news.summary,
        content: news.content,
        author: news.author,
        author_role: news.authorRole,
        is_published: news.isPublished,
        image_url: news.imageUrl,
        category_id: news.category || null
      };

      const res = await api.news.create(payload);
      if (res.success && res.data) {
        const newArticle = res.data.news || res.data;
        // Map backend fields back to frontend format
        const mappedArticle: ParishNews = {
          ...newArticle,
          imageUrl: newArticle.image_url || newArticle.imageUrl,
          authorRole: newArticle.author_role || newArticle.authorRole,
          isPublished: newArticle.is_published !== undefined ? newArticle.is_published : newArticle.isPublished,
          isArchived: newArticle.is_archived !== undefined ? newArticle.is_archived : newArticle.isArchived,
          publishedAt: newArticle.published_at || newArticle.publishedAt,
          createdAt: newArticle.created_at || newArticle.createdAt
        };
        setParishNews(prev => [mappedArticle, ...prev]);
        logAdminAction('CREATE_NEWS', 'news', mappedArticle.id, `Created news article: ${mappedArticle.title}`);
      }
    } catch (err) {
      console.error('Failed to add parish news', err);
      throw err;
    }
  }, [logAdminAction]);

  const updateParishNews = useCallback(async (id: string, news: Partial<ParishNews>) => {
    try {
      // Map frontend fields to backend fields
      const payload: any = {};
      if (news.title !== undefined) payload.title = news.title;
      if (news.summary !== undefined) payload.summary = news.summary;
      if (news.content !== undefined) payload.content = news.content;
      if (news.author !== undefined) payload.author = news.author;
      if (news.authorRole !== undefined) payload.author_role = news.authorRole;
      if (news.isPublished !== undefined) payload.is_published = news.isPublished;
      if (news.imageUrl !== undefined) payload.image_url = news.imageUrl;
      if (news.category !== undefined) payload.category_id = news.category || null;

      const res = await api.news.update(id, payload);
      if (res.success && res.data) {
        const updatedArticle = res.data.news || res.data;
        // Map backend fields back to frontend format
        const mappedArticle: ParishNews = {
          ...updatedArticle,
          imageUrl: updatedArticle.image_url || updatedArticle.imageUrl,
          authorRole: updatedArticle.author_role || updatedArticle.authorRole,
          isPublished: updatedArticle.is_published !== undefined ? updatedArticle.is_published : updatedArticle.isPublished,
          isArchived: updatedArticle.is_archived !== undefined ? updatedArticle.is_archived : updatedArticle.isArchived,
          publishedAt: updatedArticle.published_at || updatedArticle.publishedAt,
          createdAt: updatedArticle.created_at || updatedArticle.createdAt
        };
        setParishNews(prev => prev.map(n => n.id === id ? mappedArticle : n));
        logAdminAction('UPDATE_NEWS', 'news', id, `Updated news article: ${news.title || id}`);
      }
    } catch (err) {
      console.error('Failed to update parish news', err);
      throw err;
    }
  }, [logAdminAction]);

  const deleteParishNews = useCallback(async (id: string) => {
    try {
      const res = await api.news.delete(id);
      if (res.success) {
        setParishNews(prev => prev.filter(n => n.id !== id));
        logAdminAction('DELETE_NEWS', 'news', id, `Deleted news article ID: ${id}`);
      }
    } catch (err) {
      console.error('Failed to delete parish news', err);
      throw err;
    }
  }, [logAdminAction]);

  const getPublishedParishNews = useCallback((): ParishNews[] => {
    return parishNews.filter(news => news.isPublished && !news.isArchived);
  }, [parishNews]);

  const archiveParishNews = useCallback(async (id: string) => {
    try {
      const res = await api.news.archive(id);
      if (res.success) {
        setParishNews(prev => prev.map(n => n.id === id ? { ...n, isArchived: true } : n));
        logAdminAction('ARCHIVE_NEWS', 'news', id, `Archived news article ID: ${id}`);
      }
    } catch (err) {
      console.error('Failed to archive news', err);
      throw err;
    }
  }, [logAdminAction]);

  // External News methods
  const fetchExternalNews = useCallback(async (source: ExternalNews['source']) => {
    console.log(`📡 Fetching news from source: ${source}...`);
    setIsExternalNewsLoading(true);
    try {
      // 1. Try real API first
      const res = await api.news.getExternal(source);
      
      // Define simulated data for fallback
      const simulatedNews: ExternalNews[] = [
        {
          id: 'diocese-1',
          title: 'Archbishop Alex Thomas Launches New Pastoral Plan for Bulawayo Parishes',
          summary: 'A comprehensive roadmap focusing on youth empowerment, parish self-sustainability, and township community outreach programs across the Archdiocese.',
          imageUrl: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&q=80&w=800',
          externalUrl: 'https://www.archdiocesebulawayo.org',
          source: 'diocese',
          publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          fetchedAt: new Date().toISOString()
        },
        {
          id: 'diocese-2',
          title: 'St. Patrick\'s Makokoba Prepares for Centennial Golden Jubilee Celebrations',
          summary: 'The historic township parish announces a week-long celebration marking its legacy of faith, resilience, and community empowerment in Bulawayo.',
          imageUrl: 'https://images.unsplash.com/photo-1548625361-155deee223d0?auto=format&fit=crop&q=80&w=800',
          externalUrl: 'https://www.archdiocesebulawayo.org',
          source: 'diocese',
          publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          fetchedAt: new Date().toISOString()
        },
        {
          id: 'vatican-1',
          title: 'Pope Francis Calls for Global Action on Climate and Township Poverty',
          summary: 'In his latest address, His Holiness emphasizes the urgent need for integral ecology, local solidarity, and direct support for developing urban communities.',
          imageUrl: 'https://images.unsplash.com/photo-1548625361-30a09e023cf5?auto=format&fit=crop&q=80&w=800',
          externalUrl: 'https://www.vaticannews.va/en.html',
          source: 'vatican',
          publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          fetchedAt: new Date().toISOString()
        },
        {
          id: 'vatican-2',
          title: 'Synod on Synodality: Vatican Releases Final Blueprint for Lay Collaborative Ministry',
          summary: 'The new document outlines pathways for lay leaders, women, and township parish councils to play an active, collaborative role in local church governance.',
          imageUrl: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&q=80&w=800',
          externalUrl: 'https://www.vaticannews.va/en.html',
          source: 'vatican',
          publishedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
          fetchedAt: new Date().toISOString()
        },
        {
          id: 'zim-1',
          title: 'ZCBC Issues Pastoral Letter on Hope and Resilience',
          summary: 'The Catholic bishops release a joint letter calling for peace, ethical leadership, and mutual support during the current El Niño-induced drought.',
          imageUrl: 'https://images.unsplash.com/photo-1509005084666-3cbc75184cbb?auto=format&fit=crop&q=80&w=800',
          externalUrl: 'https://www.zcbc.co.zw',
          source: 'zimbabwe_catholic',
          publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          fetchedAt: new Date().toISOString()
        },
        {
          id: 'zim-2',
          title: 'Caritas Zimbabwe Mobilizes Drought Relief for Vulnerable Rural Dioceses',
          summary: 'Caritas launches a nationwide emergency appeal to distribute food hampers, drill solar boreholes, and train rural parishes in smart agriculture.',
          imageUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=800',
          externalUrl: 'https://www.zcbc.co.zw',
          source: 'zimbabwe_catholic',
          publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          fetchedAt: new Date().toISOString()
        }
      ];

      if (res.success && res.data && (res.data.items?.length || res.data.length)) {
        const items = res.data.items || res.data;
        const mappedItems = items.map((item: any) => ({
          ...item,
          source: item.source || source,
          id: item.id || Math.random().toString(36).substr(2, 9),
          publishedAt: item.publishedAt || item.published_at || new Date().toISOString()
        }));

        setExternalNews(prev => {
          const otherSources = prev.filter(n => n.source !== source);
          return [...otherSources, ...mappedItems];
        });
      } else {
        // 2. Fallback to simulation
        console.log(`⚠️ No real news found for ${source}, using simulation fallback.`);
        const filteredSimulated = simulatedNews.filter(n => n.source === source);
        setExternalNews(prev => {
          const otherSources = prev.filter(n => n.source !== source);
          return [...otherSources, ...filteredSimulated];
        });
      }
    } catch (err) {
      console.error(`❌ Failed to fetch external news from ${source}:`, err);
      // Final fallback to simulation on error
      const simulatedNews: ExternalNews[] = [
        { id: 'vatican-1', title: 'Pope Francis Calls for Global Action', summary: 'Simulation fallback...', externalUrl: 'https://www.vaticannews.va', source: 'vatican', publishedAt: new Date().toISOString(), fetchedAt: new Date().toISOString() },
        { id: 'zim-1', title: 'ZCBC Update', summary: 'Simulation fallback...', externalUrl: 'https://www.zcbc.co.zw', source: 'zimbabwe_catholic', publishedAt: new Date().toISOString(), fetchedAt: new Date().toISOString() }
      ];
      const filteredSimulated = simulatedNews.filter(n => n.source === source);
      setExternalNews(prev => {
        const otherSources = prev.filter(n => n.source !== source);
        return [...otherSources, ...filteredSimulated];
      });
    } finally {
      setIsExternalNewsLoading(false);
    }
  }, [setExternalNews]);

  // News Archive methods
  const getNewsArchiveByYear = useCallback((year: number): NewsArchive[] => {
    // Get historical archives
    const historical = newsArchive.filter(item => item.year === year);
    
    // Get newly archived parish news for this year
    const newlyArchived = parishNews
      .filter(n => n.isArchived && new Date(n.publishedAt || n.createdAt).getFullYear() === year)
      .map(n => ({
        id: n.id,
        title: n.title,
        summary: n.summary,
        content: n.content,
        imageUrl: n.imageUrl,
        originalPublishDate: n.publishedAt || n.createdAt,
        archivedAt: n.publishedAt || n.createdAt,
        author: n.author,
        year: new Date(n.publishedAt || n.createdAt).getFullYear(),
        month: new Date(n.publishedAt || n.createdAt).getMonth() + 1
      }));
      
    return [...historical, ...newlyArchived].sort((a, b) => 
      new Date(b.originalPublishDate).getTime() - new Date(a.originalPublishDate).getTime()
    );
  }, [newsArchive, parishNews]);

  const getNewsArchiveByMonth = useCallback((year: number, month: number): NewsArchive[] => {
    const historical = newsArchive.filter(item => item.year === year && item.month === month);
    
    // Get newly archived parish news for this year and month
    const newlyArchived = parishNews
      .filter(n => {
        const date = new Date(n.publishedAt || n.createdAt);
        return n.isArchived && date.getFullYear() === year && (date.getMonth() + 1) === month;
      })
      .map(n => ({
        id: n.id,
        title: n.title,
        summary: n.summary,
        content: n.content,
        imageUrl: n.imageUrl,
        originalPublishDate: n.publishedAt || n.createdAt,
        archivedAt: n.publishedAt || n.createdAt,
        author: n.author,
        year: new Date(n.publishedAt || n.createdAt).getFullYear(),
        month: new Date(n.publishedAt || n.createdAt).getMonth() + 1
      }));

    return [...historical, ...newlyArchived].sort((a, b) => 
      new Date(b.originalPublishDate).getTime() - new Date(a.originalPublishDate).getTime()
    );
  }, [newsArchive, parishNews]);

  // Section Image methods
  const addSectionImage = useCallback((image: Omit<SectionImage, 'id' | 'createdAt'>) => {
    const newImage: SectionImage = {
      ...image,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setSectionImages(prev => [...prev, newImage]);
  }, []);

  const updateSectionImage = useCallback((id: string, image: Partial<SectionImage>) => {
    setSectionImages(prev => prev.map(i => i.id === id ? { ...i, ...image } : i));
  }, []);

  const deleteSectionImage = useCallback((id: string) => {
    setSectionImages(prev => prev.filter(i => i.id !== id));
  }, []);

  const getSectionImages = useCallback((section: SectionImage['section']): SectionImage[] => {
    return sectionImages.filter(img => img.section === section);
  }, [sectionImages]);

  // Theme methods
  const addThemeOfYear = useCallback(async (theme: Omit<ThemeOfYear, 'id' | 'createdAt'>) => {
    try {
      const payload = {
        year: theme.year,
        title: theme.title,
        subtitle: theme.subtitle,
        verse: theme.verse,
        description: theme.description,
        imageUrl: theme.imageUrl,
        isActive: theme.isActive
      };

      const res = await api.themes.create(payload);
      if (res.success && res.data) {
        const t = res.data;
        const newTheme: ThemeOfYear = {
          id: t.id,
          year: t.year,
          title: t.title,
          subtitle: t.subtitle,
          verse: t.verse,
          description: t.description,
          imageUrl: t.image_url || t.imageUrl,
          isActive: t.is_active !== undefined ? t.is_active : t.isActive,
          createdAt: t.created_at || t.createdAt
        };

        // If activating this theme, deactivate others in local state
        if (newTheme.isActive) {
          setThemesOfYear(prev => prev.map(pt => ({ ...pt, isActive: false })));
        }

        setThemesOfYear(prev => [newTheme, ...prev]);
        logAdminAction('CREATE_THEME', 'theme', newTheme.id, `Created theme: ${newTheme.title} (${newTheme.year})`);
      }
    } catch (err) {
      console.error('Failed to add theme', err);
      throw err;
    }
  }, [logAdminAction]);

  const updateThemeOfYear = useCallback(async (id: string, theme: Partial<ThemeOfYear>) => {
    try {
      const payload: any = {};
      if (theme.year !== undefined) payload.year = theme.year;
      if (theme.title !== undefined) payload.title = theme.title;
      if (theme.subtitle !== undefined) payload.subtitle = theme.subtitle;
      if (theme.verse !== undefined) payload.verse = theme.verse;
      if (theme.description !== undefined) payload.description = theme.description;
      if (theme.imageUrl !== undefined) payload.imageUrl = theme.imageUrl;
      if (theme.isActive !== undefined) payload.isActive = theme.isActive;

      const res = await api.themes.update(id, payload);
      if (res.success && res.data) {
        // If activating this theme, deactivate others in local state
        if (theme.isActive) {
          setThemesOfYear(prev => prev.map(pt => pt.id === id ? { ...pt, ...theme } : { ...pt, isActive: false }));
        } else {
          setThemesOfYear(prev => prev.map(pt => pt.id === id ? { ...pt, ...theme } : pt));
        }
        logAdminAction('UPDATE_THEME', 'theme', id, `Updated theme: ${theme.title || id}`);
      }
    } catch (err) {
      console.error('Failed to update theme', err);
      throw err;
    }
  }, [logAdminAction]);

  const deleteThemeOfYear = useCallback(async (id: string) => {
    try {
      const res = await api.themes.delete(id);
      if (res.success) {
        setThemesOfYear(prev => prev.filter(t => t.id !== id));
        logAdminAction('DELETE_THEME', 'theme', id, `Deleted theme ID: ${id}`);
      }
    } catch (err) {
      console.error('Failed to delete theme', err);
      throw err;
    }
  }, [logAdminAction]);

  const getActiveTheme = useCallback((): ThemeOfYear | null => {
    return themesOfYear.find(t => t.isActive) || null;
  }, [themesOfYear]);

  // Saint & Liturgical methods
  const fetchSaintOfDay = useCallback(async () => {
    // Logic for fetching saint of the day
  }, []);

  // Contact & Schedule methods
  const updateContactInfo = useCallback((info: Partial<ContactInfo>) => {
    setContactInfo(prev => ({ ...prev, ...info }));
  }, []);

  const updateMassSchedule = useCallback((schedule: Partial<MassSchedule>) => {
    setMassSchedule(prev => ({ ...prev, ...schedule }));
  }, []);

  // Sacrament methods
  const addSacrament = useCallback(async (sacrament: Omit<Sacrament, 'id' | 'createdAt'>) => {
    try {
      const res = await api.sacraments.create(sacrament);
      if (res.success && res.data) {
        setSacraments(prev => [...prev, res.data.sacrament || res.data]);
      }
    } catch (err) {
      console.error('Failed to add sacrament', err);
      throw err;
    }
  }, []);

  const updateSacrament = useCallback(async (id: string, sacrament: Partial<Sacrament>) => {
    try {
      const res = await api.sacraments.update(id, sacrament);
      if (res.success && res.data) {
        setSacraments(prev => prev.map(s => s.id === id ? (res.data.sacrament || res.data) : s));
      }
    } catch (err) {
      console.error('Failed to update sacrament', err);
      throw err;
    }
  }, []);

  const deleteSacrament = useCallback(async (id: string) => {
    try {
      const res = await api.sacraments.delete(id);
      if (res.success) {
        setSacraments(prev => prev.filter(s => s.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete sacrament', err);
      throw err;
    }
  }, []);

  const getActiveSacraments = useCallback((): Sacrament[] => {
    return sacraments.filter(s => s.isActive);
  }, [sacraments]);

  // Prayer methods
  const addPrayer = useCallback(async (prayer: Omit<Prayer, 'id' | 'createdAt'>) => {
    try {
      const payload = {
        title: prayer.title,
        text: prayer.text,
        category: prayer.category,
        is_active: prayer.isPublished,
        image_url: prayer.imageUrl
      };
      const res = await api.liturgicalPrayers.create(payload);
      if (res.success && res.data) {
        const newPrayer: Prayer = {
          id: res.data.id,
          title: res.data.title || prayer.title,
          text: res.data.text || prayer.text,
          category: res.data.category || prayer.category,
          imageUrl: res.data.image_url || prayer.imageUrl,
          createdAt: res.data.created_at || new Date().toISOString(),
          isPublished: res.data.is_active !== undefined ? res.data.is_active : prayer.isPublished
        };
        setPrayers(prev => [...prev, newPrayer]);
      }
    } catch (err) {
      console.error('Failed to add prayer', err);
      throw err;
    }
  }, []);

  const updatePrayer = useCallback(async (id: string, prayer: Partial<Prayer>) => {
    try {
      const payload: any = {};
      if (prayer.title !== undefined) payload.title = prayer.title;
      if (prayer.text !== undefined) payload.text = prayer.text;
      if (prayer.category !== undefined) payload.category = prayer.category;
      if (prayer.isPublished !== undefined) payload.is_active = prayer.isPublished;
      if (prayer.imageUrl !== undefined) payload.image_url = prayer.imageUrl;

      const res = await api.liturgicalPrayers.update(id, payload);
      if (res.success) {
        setPrayers(prev => prev.map(p => p.id === id ? { ...p, ...prayer } as Prayer : p));
      }
    } catch (err) {
      console.error('Failed to update prayer', err);
      throw err;
    }
  }, []);

  const deletePrayer = useCallback(async (id: string) => {
    try {
      const res = await api.liturgicalPrayers.delete(id);
      if (res.success) {
        setPrayers(prev => prev.filter(p => p.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete prayer', err);
      throw err;
    }
  }, []);

  const getPublishedPrayers = useCallback((): Prayer[] => {
    return prayers.filter(p => p.isPublished);
  }, [prayers]);

  // Prayer Intention methods
  const addPrayerIntention = useCallback((intention: Omit<PrayerIntention, 'id' | 'submittedAt'>) => {
    const newIntention: PrayerIntention = {
      ...intention,
      id: Date.now().toString(),
      submittedAt: new Date().toISOString()
    };
    setPrayerIntentions(prev => [...prev, newIntention]);
  }, []);

  const updatePrayerIntention = useCallback((id: string, intention: Partial<PrayerIntention>) => {
    setPrayerIntentions(prev => prev.map(p => p.id === id ? { ...p, ...intention } : p));
  }, []);

  const deletePrayerIntention = useCallback((id: string) => {
    setPrayerIntentions(prev => prev.filter(p => p.id !== id));
  }, []);

  const getPendingIntentions = useCallback((): PrayerIntention[] => {
    return prayerIntentions.filter(p => p.status === 'pending');
  }, [prayerIntentions]);

  // Financial methods
  const addTransaction = useCallback(async (transaction: Omit<FinancialTransaction, 'id' | 'date' | 'status'>) => {
    try {
      const res = await api.finances.create(transaction);
      if (res.success && res.data) {
        setFinancialTransactions(prev => [res.data, ...prev]);
      }
    } catch (err) {
      console.error('Failed to add transaction', err);
      throw err;
    }
  }, []);

  const updateTransactionStatus = useCallback(async (id: string, status: FinancialTransaction['status']) => {
    try {
      const res = await api.finances.updateStatus(id, status);
      if (res.success) {
        setFinancialTransactions(prev => prev.map(t => t.id === id ? { ...t, status } : t));
      }
    } catch (err) {
      console.error('Failed to update transaction status', err);
      throw err;
    }
  }, []);

  const fetchCategories = useCallback(async (type: string) => {
    try {
      const res = await api.categories.getAll({ type });
      if (res.success && res.data) {
        const names = (res.data?.items || res.data || []).map((c: any) => c.name);
        switch (type) {
          case 'financial':
            setFinancialCategories(names);
            setFullFinancialCategories(res.data?.items || res.data || []);
            break;
          case 'gallery':
            setGalleryCategories(names);
            setFullGalleryCategories(res.data?.items || res.data || []);
            break;
          case 'news':
            setNewsCategories(names);
            setFullNewsCategories(res.data?.items || res.data || []);
            break;
          case 'event':
            setEventCategories(names);
            setFullEventCategories(res.data?.items || res.data || []);
            break;
          case 'prayer':
            setPrayerCategories(names);
            setFullPrayerCategories(res.data?.items || res.data || []);
            break;
        }
      }
    } catch (err) {
      console.error(`Failed to fetch ${type} categories`, err);
    }
  }, []);

  const addCategory = useCallback(async (category: string, type: string = 'financial', description?: string) => {
    try {
      const res = await api.categories.create({ name: category, type, description });
      if (res.success && res.data) {
        if (type === 'financial') {
          setFinancialCategories(prev => prev.includes(category) ? prev : [...prev, category].sort());
          setFullFinancialCategories(prev => [...prev, res.data]);
        } else if (type === 'gallery') {
          setGalleryCategories(prev => prev.includes(category) ? prev : [...prev, category].sort());
          setFullGalleryCategories(prev => [...prev, res.data]);
        } else if (type === 'news') {
          setNewsCategories(prev => prev.includes(category) ? prev : [...prev, category].sort());
          setFullNewsCategories(prev => [...prev, res.data]);
        } else if (type === 'event') {
          setEventCategories(prev => prev.includes(category) ? prev : [...prev, category].sort());
          setFullEventCategories(prev => [...prev, res.data]);
        } else if (type === 'prayer') {
          setPrayerCategories(prev => prev.includes(category) ? prev : [...prev, category].sort());
          setFullPrayerCategories(prev => [...prev, res.data]);
        }
      }
    } catch (err) {
      console.error('Failed to add category', err);
      throw err;
    }
  }, []);

  const deleteCategory = useCallback(async (id: string, type: string = 'financial') => {
    try {
      const res = await api.categories.delete(id);
      if (res.success) {
        if (type === 'financial') {
          setFullFinancialCategories(prev => prev.filter(c => c.id !== id));
          // Update the simple names list too
          const deletedCat = fullFinancialCategories.find(c => c.id === id);
          if (deletedCat) {
            setFinancialCategories(prev => prev.filter(name => name !== deletedCat.name));
          }
        } else if (type === 'news') {
          setFullNewsCategories(prev => prev.filter(c => c.id !== id));
          const deletedCat = fullNewsCategories.find(c => c.id === id);
          if (deletedCat) {
            setNewsCategories(prev => prev.filter(name => name !== deletedCat.name));
          }
        } else if (type === 'event') {
          setFullEventCategories(prev => prev.filter(c => c.id !== id));
          const deletedCat = fullEventCategories.find(c => c.id === id);
          if (deletedCat) {
            setEventCategories(prev => prev.filter(name => name !== deletedCat.name));
          }
        } else if (type === 'prayer') {
          setFullPrayerCategories(prev => prev.filter(c => c.id !== id));
          const deletedCat = fullPrayerCategories.find(c => c.id === id);
          if (deletedCat) {
            setPrayerCategories(prev => prev.filter(name => name !== deletedCat.name));
          }
        }
        logAdminAction('DELETE_CATEGORY', 'category', id, `Deleted category: ${id}`);
      }
    } catch (err) {
      console.error('Failed to delete category', err);
      throw err;
    }
  }, [fullFinancialCategories, fullGalleryCategories, fullNewsCategories, fullEventCategories, fullPrayerCategories, logAdminAction]);

  // Priest's Desk methods
  const addPriestMessage = useCallback(async (message: Omit<PriestMessage, 'id' | 'createdAt'>) => {
    try {
      const res = await api.priestDesk.create(message);
      if (res.success && res.data) {
        const m = res.data;
        const mappedMessage = {
          ...m,
          isPublished: m.is_published === 1 || m.is_published === true,
          imageUrl: m.image_url || m.imageUrl,
          authorFirstName: m.author_first_name,
          authorLastName: m.author_last_name,
          authorImageUrl: m.author_image_url
        };
        setPriestMessages(prev => [mappedMessage, ...prev]);
      }
    } catch (err) {
      console.error('Failed to add priest message', err);
      throw err;
    }
  }, []);

  const updatePriestMessage = useCallback(async (id: string, message: Partial<PriestMessage>) => {
    try {
      const res = await api.priestDesk.update(id, message);
      if (res.success && res.data) {
        const m = res.data;
        const mappedMessage = {
          ...m,
          isPublished: m.is_published === 1 || m.is_published === true,
          imageUrl: m.image_url || m.imageUrl,
          authorFirstName: m.author_first_name,
          authorLastName: m.author_last_name,
          authorImageUrl: m.author_image_url
        };
        setPriestMessages(prev => prev.map(msg => msg.id === id ? mappedMessage : msg));
      }
    } catch (err) {
      console.error('Failed to update priest message', err);
      throw err;
    }
  }, []);

  const deletePriestMessage = useCallback(async (id: string) => {
    try {
      const res = await api.priestDesk.delete(id);
      if (res.success) {
        setPriestMessages(prev => prev.filter(m => m.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete priest message', err);
      throw err;
    }
  }, []);


  const getLatestPriestMessage = useCallback((): PriestMessage | null => {
    const published = priestMessages.filter(m => m.isPublished);
    return published.length > 0 ? published[0] : null;
  }, [priestMessages]);

  const getAssociationFinance = useCallback((associationId: string): AssociationBalance => {
    const transactions = financialTransactions.filter(t => t.associationId === associationId && t.status === 'approved');
    const initialCurrencyBalance = (): CurrencyBalance => ({ USD: 0, ZAR: 0, ZiG: 0 });
    const accountBalances: AccountBalance = {
      Cash: initialCurrencyBalance(),
      Ecocash: initialCurrencyBalance(),
      Bank: initialCurrencyBalance()
    };
    const totalBalance = initialCurrencyBalance();
    transactions.forEach(t => {
      const amount = t.type === 'income' ? t.amount : -t.amount;
      accountBalances[t.paymentMethod][t.currency] += amount;
      totalBalance[t.currency] += amount;
    });
    return {
      associationId,
      associationName: transactions[0]?.associationName || (associationId === 'parish' ? 'Parish General Fund' : associationId),
      totalBalance,
      accountBalances,
      lastUpdated: new Date().toISOString()
    };
  }, [financialTransactions]);

  const getParishFinance = useCallback((): AssociationBalance => {
    const transactions = financialTransactions.filter(t => t.status === 'approved');
    const initialCurrencyBalance = (): CurrencyBalance => ({ USD: 0, ZAR: 0, ZiG: 0 });
    const accountBalances: AccountBalance = {
      Cash: initialCurrencyBalance(),
      Ecocash: initialCurrencyBalance(),
      Bank: initialCurrencyBalance()
    };
    const totalBalance = initialCurrencyBalance();
    transactions.forEach(t => {
      const amount = t.type === 'income' ? t.amount : -t.amount;
      accountBalances[t.paymentMethod][t.currency] += amount;
      totalBalance[t.currency] += amount;
    });
    return {
      associationId: 'parish',
      associationName: 'Parish General Fund',
      totalBalance,
      accountBalances,
      lastUpdated: new Date().toISOString()
    };
  }, [financialTransactions]);

  // Videos
  const fetchVideos = useCallback(async () => {
    try {
      const [streamsRes, archiveRes] = await Promise.all([
        api.videos.getStreams(),
        api.videos.getArchive()
      ]);
      if (streamsRes.success) setLiveStreams(streamsRes.data);
      if (archiveRes.success) setVideoArchive(archiveRes.data?.items || archiveRes.data || []);
    } catch (err) {
      console.error('Failed to fetch videos in context:', err);
    }
  }, []);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  const contextValue = useMemo(() => ({
    isAuthenticated: !!user,
    isLoading,
    currentUser: user,
    hasPermission,
    announcements,
    addAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    getActiveAnnouncement,
    events,
    addEvent,
    updateEvent,
    deleteEvent,
    getPublishedEvents,
    galleryImages,
    addImage,
    updateImage,
    deleteImage,
    getPublishedImages,
    ministries,
    addMinistry,
    updateMinistry,
    deleteMinistry,
    getActiveMinistries,
    parishNews,
    addParishNews,
    updateParishNews,
    deleteParishNews,
    getPublishedParishNews,
    archiveParishNews,
    externalNews,
    isExternalNewsLoading,
    fetchExternalNews,
    newsArchive,
    getNewsArchiveByYear,
    getNewsArchiveByMonth,
    sectionImages,
    addSectionImage,
    updateSectionImage,
    deleteSectionImage,
    getSectionImages,
    themesOfYear,
    addThemeOfYear,
    updateThemeOfYear,
    deleteThemeOfYear,
    getActiveTheme,
    saintOfDay,
    liturgicalInfo,
    fetchSaintOfDay,
    contactInfo,
    updateContactInfo,
    massSchedule,
    updateMassSchedule,
    sacraments,
    addSacrament,
    updateSacrament,
    deleteSacrament,
    getActiveSacraments,
    prayers,
    addPrayer,
    updatePrayer,
    deletePrayer,
    getPublishedPrayers,
    prayerIntentions,
    addPrayerIntention,
    updatePrayerIntention,
    deletePrayerIntention,
    getPendingIntentions,
    getParishFinance,
    addCategory,
    deleteCategory,
    fetchCategories,
    financialCategories,
    fullFinancialCategories,
    galleryCategories,
    fullGalleryCategories,
    newsCategories,
    fullNewsCategories,
    eventCategories,
    fullEventCategories,
    prayerCategories,
    fullPrayerCategories,
    financialTransactions,
    addTransaction,
    updateTransactionStatus,
    getAssociationFinance,
    priestMessages,
    addPriestMessage,
    updatePriestMessage,
    deletePriestMessage,
    getLatestPriestMessage,
    parishMembers,
    auditLogs,
    fetchAuditLogs,
    logAdminAction,
    websiteAnalytics,
    liveStreams,
    videoArchive,
    fetchVideos
  }), [
    user, isLoading, hasPermission, announcements, events, galleryImages,
    ministries, parishNews, externalNews, isExternalNewsLoading, newsArchive, sectionImages,
    themesOfYear, saintOfDay, liturgicalInfo, contactInfo, massSchedule,
    sacraments, prayers, prayerIntentions, financialTransactions,
    financialCategories, newsCategories, eventCategories, fullEventCategories, prayerCategories, fullPrayerCategories,
    priestMessages, parishMembers, websiteAnalytics, addAnnouncement, updateAnnouncement, deleteAnnouncement,
    getActiveAnnouncement, addEvent, updateEvent, deleteEvent, getPublishedEvents,
    addImage, updateImage, deleteImage, getPublishedImages, addMinistry,
    updateMinistry, deleteMinistry, getActiveMinistries, addParishNews,
    updateParishNews, deleteParishNews, getPublishedParishNews, archiveParishNews,
    fetchExternalNews, getNewsArchiveByYear, getNewsArchiveByMonth,
    addSectionImage, updateSectionImage, deleteSectionImage, getSectionImages,
    addThemeOfYear, updateThemeOfYear, deleteThemeOfYear, getActiveTheme,
    fetchSaintOfDay, updateContactInfo, updateMassSchedule, addSacrament,
    updateSacrament, deleteSacrament, getActiveSacraments, addPrayer,
    updatePrayer, deletePrayer, getPublishedPrayers, addPrayerIntention,
    updatePrayerIntention, deletePrayerIntention, getPendingIntentions,
    addTransaction, updateTransactionStatus, getAssociationFinance,
    getParishFinance, addCategory, deleteCategory, fetchCategories, addPriestMessage,
    updatePriestMessage, deletePriestMessage, getLatestPriestMessage,
    auditLogs, fetchAuditLogs, logAdminAction,
    liveStreams, videoArchive, fetchVideos, fullFinancialCategories, fullGalleryCategories, fullNewsCategories, fullEventCategories, fullPrayerCategories
  ]);

  return (
    <AdminContext.Provider value={contextValue}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};