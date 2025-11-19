import React, { createContext, useContext, useMemo, useState, useCallback } from 'react';
import { useAuth, type UserRole, type User } from './AuthContext';
import { api } from '../services/api';

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
  category: 'mass' | 'meeting' | 'social' | 'education' | 'outreach';
  isPublished: boolean;
  createdAt: string;
}

export interface GalleryImage {
  id: string;
  title: string;
  description: string;
  url: string;
  category: 'choir' | 'youth' | 'outreach' | 'mass' | 'events';
  uploadedAt: string;
  isPublished: boolean;
}

export interface Ministry {
  id: string;
  name: string;
  description: string;
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
  category?: string;
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
  publishedDate: string;
  views: number;
  category: 'mass' | 'event' | 'sermon' | 'special';
  createdBy: string;
  createdAt: string;
  isPublished: boolean;
}

export interface LiturgicalInfo {
  date: string;
  season: string;
  color: string;
  readings: {
    firstReading: string;
    psalm: string;
    secondReading?: string;
    gospel: string;
  };
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
  imageUrl: string;
  requirements: string[];
  contactInfo: string;
  isActive: boolean;
  createdAt: string;
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
  section: 'mass_times' | 'confession_times' | 'catechism_times' | 'parish_gallery';
  title: string;
  imageUrl: string;
  isActive: boolean;
  createdAt: string;
}

type Permission = 
  | 'announcements' | 'events' | 'contact' | 'theme' 
  | 'mass_schedule' | 'sacraments' | 'prayers' 
  | 'readings' | 'overview' | 'priest_desk' 
  | 'analytics' | 'prayer_intentions' | 'gallery' 
  | 'news' | 'images' | 'ministries' | 'section_images' | 'videos' | 'users';

interface AdminContextType {
  // Authentication
  isAuthenticated: boolean;
  isLoading: boolean;
  currentUser: User | null;
  hasPermission: (permission: Permission) => boolean;
  
  // Announcements
  announcements: Announcement[];
  addAnnouncement: (announcement: Omit<Announcement, 'id' | 'createdAt'>) => void;
  updateAnnouncement: (id: string, announcement: Partial<Announcement>) => void;
  deleteAnnouncement: (id: string) => void;
  getActiveAnnouncement: () => Announcement | null;
  
  // Events
  events: Event[];
  addEvent: (event: Omit<Event, 'id' | 'createdAt'>) => void;
  updateEvent: (id: string, event: Partial<Event>) => void;
  deleteEvent: (id: string) => void;
  getPublishedEvents: () => Event[];
  
  // Gallery
  galleryImages: GalleryImage[];
  addImage: (image: Omit<GalleryImage, 'id' | 'uploadedAt'>) => void;
  updateImage: (id: string, image: Partial<GalleryImage>) => void;
  deleteImage: (id: string) => void;
  getPublishedImages: () => GalleryImage[];
  
  // Ministries
  ministries: Ministry[];
  addMinistry: (ministry: Omit<Ministry, 'id' | 'createdAt'>) => void;
  updateMinistry: (id: string, ministry: Partial<Ministry>) => void;
  deleteMinistry: (id: string) => void;
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
  addSacrament: (sacrament: Omit<Sacrament, 'id' | 'createdAt'>) => void;
  updateSacrament: (id: string, sacrament: Partial<Sacrament>) => void;
  deleteSacrament: (id: string) => void;
  getActiveSacraments: () => Sacrament[];
  
  // Prayer Intentions
  prayerIntentions: PrayerIntention[];
  addPrayerIntention: (intention: Omit<PrayerIntention, 'id' | 'submittedAt'>) => void;
  updatePrayerIntention: (id: string, intention: Partial<PrayerIntention>) => void;
  deletePrayerIntention: (id: string) => void;
  getPendingIntentions: () => PrayerIntention[];
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

// Role permissions mapping
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    'announcements', 'events', 'contact', 'theme', 'mass_schedule',
    'sacraments', 'prayers', 'readings', 'overview', 'priest_desk',
    'analytics', 'prayer_intentions', 'gallery', 'news', 'images',
    'ministries', 'section_images', 'videos', 'users'
  ],
  secretary: [
    'announcements', 'events', 'contact', 'theme', 'mass_schedule',
    'sacraments', 'prayers', 'readings'
  ],
  priest: [
    'overview', 'announcements', 'events', 'contact', 'priest_desk',
    'prayers', 'readings', 'analytics', 'sacraments', 'prayer_intentions'
  ],
  reporter: [
    'gallery', 'news', 'images', 'analytics', 'ministries', 'section_images', 'videos'
  ],
  parishioner: [],
  vice_secretary: ['announcements', 'events', 'contact']
};

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading: authLoading } = useAuth();
  const [isLoading] = useState(false);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [parishNews, setParishNews] = useState<ParishNews[]>([]);
  const [externalNews, setExternalNews] = useState<ExternalNews[]>([]);
  const [newsArchive, setNewsArchive] = useState<NewsArchive[]>([]);
  const [sectionImages, setSectionImages] = useState<SectionImage[]>([]);
  const [themesOfYear, setThemesOfYear] = useState<ThemeOfYear[]>([]);
  const [saintOfDay] = useState<SaintOfDay | null>(null);
  const [liturgicalInfo] = useState<LiturgicalInfo | null>(null);
  const [contactInfo, setContactInfo] = useState<ContactInfo>({});
  const [massSchedule, setMassSchedule] = useState<MassSchedule>({});
  const [sacraments, setSacraments] = useState<Sacrament[]>([]);
  const [prayerIntentions, setPrayerIntentions] = useState<PrayerIntention[]>([]);

  const hasPermission = useCallback((permission: Permission): boolean => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    const permissions = ROLE_PERMISSIONS[user.role] || [];
    return permissions.includes(permission);
  }, [user]);

  const loadInitialData = useCallback(async () => {
    try {
      const [annRes, evtRes, galRes, minRes, newsRes, contactRes, schedRes, sacRes, prayRes, featRes] = await Promise.allSettled([
        api.announcements.getAll(),
        api.events.getAll(),
        api.gallery.getAll(),
        api.ministries.getAll(),
        api.news.getAll(),
        api.contact.get(),
        api.schedule.getAll(),
        api.sacraments.getAll(),
        api.prayers.getAll(),
        api.gallery.getFeatured?.() ?? Promise.resolve({ success: false })
      ]);

      if (annRes.status === 'fulfilled' && annRes.value?.success) {
        const serverAnnouncements: any[] = (annRes.value.data?.announcements) || (Array.isArray(annRes.value.data) ? annRes.value.data : []);
        const mapped: Announcement[] = serverAnnouncements.map(a => ({
          id: a.id,
          title: a.title,
          message: a.content ?? '',
          type: a.type === 'urgent' ? 'urgent' : a.type === 'event' || a.type === 'mass' ? 'event' : 'info',
          isActive: !!a.is_active,
          createdAt: a.created_at ?? new Date().toISOString(),
          expiresAt: a.end_date ?? undefined
        }));
        setAnnouncements(mapped);
      }

      if (evtRes.status === 'fulfilled' && evtRes.value?.success) {
        const serverEvents: any[] = (evtRes.value.data?.events) || (Array.isArray(evtRes.value.data) ? evtRes.value.data : []);
        const mappedEvts: Event[] = serverEvents.map(e => ({
          id: e.id,
          title: e.title,
          description: e.description ?? '',
          date: e.event_date ?? e.created_at ?? new Date().toISOString(),
          time: e.start_time ?? '',
          location: e.location ?? '',
          category: (e.category_name === 'mass' ? 'mass' : 'social'),
          isPublished: !!e.is_published,
          createdAt: e.created_at ?? new Date().toISOString()
        }));
        setEvents(mappedEvts);
      }

      if (galRes.status === 'fulfilled' && galRes.value?.success) {
        const serverImages: any[] = (galRes.value.data?.images) || (Array.isArray(galRes.value.data) ? galRes.value.data : []);
        const mappedImgs: GalleryImage[] = serverImages.map(i => ({
          id: i.id,
          title: i.title ?? '',
          description: i.description ?? '',
          url: i.image_url ?? i.thumbnail_url ?? '',
          category: 'events',
          uploadedAt: i.upload_date ?? i.created_at ?? new Date().toISOString(),
          isPublished: true
        }));
        setGalleryImages(mappedImgs);
      }

      if (minRes.status === 'fulfilled' && (minRes.value as any)?.success) {
        const arr: any[] = ((minRes.value as any).data?.ministries) || (Array.isArray((minRes.value as any).data) ? (minRes.value as any).data : []);
        const mapped: Ministry[] = arr.map(m => ({
          id: m.id,
          name: m.name,
          description: m.description ?? '',
          imageUrl: m.image_url ?? '',
          contactPerson: m.leader_name ?? m.leader_contact ?? '',
          meetingTime: m.meeting_schedule ?? '',
          isActive: m.is_active ?? true,
          createdAt: m.created_at ?? new Date().toISOString()
        }));
        setMinistries(mapped);
      }

      if (newsRes.status === 'fulfilled' && (newsRes.value as any)?.success) {
        const arr: any[] = ((newsRes.value as any).data?.news) || (Array.isArray((newsRes.value as any).data) ? (newsRes.value as any).data : []);
        const mapped: ParishNews[] = arr.map(n => ({
          id: n.id,
          title: n.title,
          summary: n.summary ?? '',
          content: n.content ?? '',
          category: n.category ?? undefined,
          imageUrl: n.image_url ?? undefined,
          author: n.author_name ?? n.author ?? '',
          authorRole: (n.author_role ?? 'reporter'),
          publishedAt: n.published_at ?? n.created_at ?? new Date().toISOString(),
          isArchived: !!n.is_archived,
          isPublished: !!n.is_published,
          createdAt: n.created_at ?? new Date().toISOString()
        }));
        setParishNews(mapped);
      }

      if (contactRes.status === 'fulfilled' && (contactRes.value as any)?.success) {
        const c: any = (contactRes.value as any).data || {};
        setContactInfo({
          address: c.address ?? undefined,
          phone: Array.isArray(c.phone) ? c.phone : c.phone ? [c.phone] : undefined,
          email: Array.isArray(c.email) ? c.email : c.email ? [c.email] : undefined,
          officeHours: {
            weekdays: (c.office_hours?.weekdays) ?? '',
            saturday: (c.office_hours?.saturday) ?? '',
            sunday: (c.office_hours?.sunday) ?? ''
          },
          staff: Array.isArray(c.staff) ? c.staff.map((s: any) => ({ name: s.name, position: s.position, phone: s.phone, email: s.email })) : []
        });
      }

      if (schedRes.status === 'fulfilled' && (schedRes.value as any)?.success) {
        const entries: any[] = ((schedRes.value as any).data?.schedule) || (Array.isArray((schedRes.value as any).data) ? (schedRes.value as any).data : []);
        const byDay: Record<string, string[]> = {};
        entries.forEach(e => {
          const day = (e.day ?? e.day_of_week ?? '').toLowerCase();
          const time = e.time ?? e.start_time ?? '';
          if (!byDay[day]) byDay[day] = [];
          if (time) byDay[day].push(time);
        });
        setMassSchedule({
          weekdays: (byDay['monday'] || byDay['tuesday'] || byDay['wednesday'] || byDay['thursday'] || byDay['friday']) ? 'See daily schedule' : '',
          saturday: (byDay['saturday'] || []).join(', '),
          sunday: byDay['sunday'] || [],
          confession: (entries.filter(e => (e.type ?? '').toLowerCase() === 'confession').map((e: any) => e.time)) || []
        });
      }

      if (sacRes.status === 'fulfilled' && (sacRes.value as any)?.success) {
        const arr: any[] = ((sacRes.value as any).data?.sacraments) || (Array.isArray((sacRes.value as any).data) ? (sacRes.value as any).data : []);
        const mapped: Sacrament[] = arr.map(s => ({
          id: s.id,
          name: s.name,
          description: s.description ?? '',
          imageUrl: s.image_url ?? '',
          requirements: Array.isArray(s.requirements) ? s.requirements : (typeof s.requirements === 'string' ? s.requirements.split(',').map((x: string) => x.trim()).filter(Boolean) : []),
          contactInfo: s.contact_info ?? s.contact ?? '',
          isActive: s.is_active ?? true,
          createdAt: s.created_at ?? new Date().toISOString()
        }));
        setSacraments(mapped);
      }

      if (prayRes.status === 'fulfilled' && (prayRes.value as any)?.success) {
        const arr: any[] = ((prayRes.value as any).data?.intentions) || (Array.isArray((prayRes.value as any).data) ? (prayRes.value as any).data : []);
        const mapped: PrayerIntention[] = arr.map(p => ({
          id: p.id,
          name: p.requester_name ?? '',
          email: p.requester_email ?? undefined,
          intention: p.intention ?? '',
          isUrgent: !!(p.is_urgent ?? p.urgent),
          isPublic: !!(p.is_public ?? false),
          submittedAt: p.submitted_at ?? p.created_at ?? new Date().toISOString(),
          status: (p.is_approved ? 'approved' : 'pending')
        }));
        setPrayerIntentions(mapped);
      }

      if (featRes.status === 'fulfilled' && (featRes.value as any)?.success) {
        const arr: any[] = ((featRes.value as any).data?.images) || [];
        const mapped: SectionImage[] = arr.map((i: any) => ({
          id: i.id,
          section: 'parish_gallery',
          title: i.title ?? '',
          imageUrl: i.image_url ?? i.thumbnail_url ?? '',
          isActive: true,
          createdAt: i.created_at ?? new Date().toISOString()
        }));
        setSectionImages(mapped);
      }
    } catch (err) {
    }
  }, []);

  React.useEffect(() => {
    if (user && user.role !== 'parishioner') {
      loadInitialData();
    }
  }, [user, loadInitialData]);

  // Announcement methods
  const addAnnouncement = useCallback((announcement: Omit<Announcement, 'id' | 'createdAt'>) => {
    const newAnnouncement: Announcement = {
      ...announcement,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setAnnouncements(prev => [...prev, newAnnouncement]);
  }, []);

  const updateAnnouncement = useCallback((id: string, announcement: Partial<Announcement>) => {
    setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, ...announcement } : a));
  }, []);

  const deleteAnnouncement = useCallback((id: string) => {
    setAnnouncements(prev => prev.filter(a => a.id !== id));
  }, []);

  const getActiveAnnouncement = useCallback((): Announcement | null => {
    const active = announcements.find(a => a.isActive);
    if (!active) return null;
    if (active.expiresAt && new Date(active.expiresAt) < new Date()) {
      updateAnnouncement(active.id, { isActive: false });
      return null;
    }
    return active;
  }, [announcements, updateAnnouncement]);

  // Event methods
  const addEvent = useCallback((event: Omit<Event, 'id' | 'createdAt'>) => {
    const newEvent: Event = {
      ...event,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setEvents(prev => [...prev, newEvent]);
  }, []);

  const updateEvent = useCallback((id: string, event: Partial<Event>) => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, ...event } : e));
  }, []);

  const deleteEvent = useCallback((id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
  }, []);

  const getPublishedEvents = useCallback((): Event[] => {
    return events.filter(event => event.isPublished);
  }, [events]);

  // Gallery methods
  const addImage = useCallback((image: Omit<GalleryImage, 'id' | 'uploadedAt'>) => {
    const newImage: GalleryImage = {
      ...image,
      id: Date.now().toString(),
      uploadedAt: new Date().toISOString()
    };
    setGalleryImages(prev => [...prev, newImage]);
  }, []);

  const updateImage = useCallback((id: string, image: Partial<GalleryImage>) => {
    setGalleryImages(prev => prev.map(i => i.id === id ? { ...i, ...image } : i));
  }, []);

  const deleteImage = useCallback((id: string) => {
    setGalleryImages(prev => prev.filter(i => i.id !== id));
  }, []);

  const getPublishedImages = useCallback((): GalleryImage[] => {
    return galleryImages.filter(img => img.isPublished);
  }, [galleryImages]);

  // Ministry methods
  const addMinistry = useCallback((ministry: Omit<Ministry, 'id' | 'createdAt'>) => {
    const newMinistry: Ministry = {
      ...ministry,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setMinistries(prev => [...prev, newMinistry]);
  }, []);

  const updateMinistry = useCallback((id: string, ministry: Partial<Ministry>) => {
    setMinistries(prev => prev.map(m => m.id === id ? { ...m, ...ministry } : m));
  }, []);

  const deleteMinistry = useCallback((id: string) => {
    setMinistries(prev => prev.filter(m => m.id !== id));
  }, []);

  const getActiveMinistries = useCallback((): Ministry[] => {
    return ministries.filter(ministry => ministry.isActive);
  }, [ministries]);

  // Parish News methods
  const addParishNews = useCallback((news: Omit<ParishNews, 'id' | 'createdAt'>) => {
    const newNews: ParishNews = {
      ...news,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setParishNews(prev => [...prev, newNews]);
  }, []);

  const updateParishNews = useCallback((id: string, news: Partial<ParishNews>) => {
    setParishNews(prev => prev.map(n => n.id === id ? { ...n, ...news } : n));
  }, []);

  const deleteParishNews = useCallback((id: string) => {
    setParishNews(prev => prev.filter(n => n.id !== id));
  }, []);

  const getPublishedParishNews = useCallback((): ParishNews[] => {
    return parishNews.filter(news => news.isPublished && !news.isArchived);
  }, [parishNews]);

  const archiveParishNews = useCallback((id: string) => {
    const newsItem = parishNews.find(n => n.id === id);
    if (newsItem) {
      const archiveItem: NewsArchive = {
        id: Date.now().toString(),
        title: newsItem.title,
        summary: newsItem.summary,
        content: newsItem.content,
        imageUrl: newsItem.imageUrl,
        author: newsItem.author,
        originalPublishDate: newsItem.publishedAt,
        archivedAt: new Date().toISOString(),
        year: new Date(newsItem.publishedAt).getFullYear(),
        month: new Date(newsItem.publishedAt).getMonth() + 1
      };
      setNewsArchive(prev => [...prev, archiveItem]);
      updateParishNews(id, { isArchived: true });
    }
  }, [parishNews, updateParishNews]);

  // External News methods
  const fetchExternalNews = useCallback(async (source: ExternalNews['source']) => {
    try {
      const res = await api.news.getExternal(source);
      let mapped: ExternalNews[] = [];
      if (res && (res as any).success) {
        const items: any[] = (res as any).data?.items || (res as any).data?.news || (Array.isArray((res as any).data) ? (res as any).data : []);
        mapped = items.map((n: any) => ({
          id: String(n.id || n.guid || `${source}-${n.link || n.url || Date.now()}`),
          title: n.title,
          summary: n.summary || n.description || '',
          imageUrl: n.imageUrl || n.image_url || n.thumbnail || undefined,
          externalUrl: n.link || n.url || '',
          source,
          publishedAt: n.publishedAt || n.published_at || n.date || new Date().toISOString(),
          fetchedAt: new Date().toISOString()
        }));
      }

      if (!mapped.length) {
        const rssCandidates: string[] = source === 'vatican'
          ? [
              'https://press.vatican.va/content/salastampa/en/rss.xml',
              'https://www.vatican.va/news_services/or/resources/rss_en.xml',
              'https://www.vaticannews.va/en/rss.xml'
            ]
          : source === 'diocese'
          ? [
              'https://archdioceseofbulawayo.org/feed/',
              'https://archdioceseofbulawayo.org/?feed=rss2',
              'http://archdioceseofbulawayo.org/feed/'
            ]
          : [
              'https://zcbc.co.zw/feed',
              'https://www.cbcz.org.zw/feed'
            ];
        let rssData: any | null = null;
        for (const url of rssCandidates) {
          try {
            const resp = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`);
            if (resp.ok) {
              const json = await resp.json();
              if (json && Array.isArray(json.items) && json.items.length) {
                rssData = json;
                break;
              }
            }
            const proxied = url.startsWith('https://') ? `https://r.jina.ai/${url}` : `https://r.jina.ai/http://${url.replace(/^https?:\/\//,'')}`;
            const resp2 = await fetch(proxied);
            if (resp2.ok) {
              const text = await resp2.text();
              const itemBlocks = text.match(/<item[\s\S]*?<\/item>/g) || text.match(/<entry[\s\S]*?<\/entry>/g);
              if (itemBlocks && itemBlocks.length) {
                const parsed = itemBlocks.map((block) => {
                  const get = (tag: string) => {
                    const m = block.match(new RegExp(`<${tag}[^>]*>([\s\S]*?)<\/${tag}>`));
                    return m ? m[1] : '';
                  };
                  const getAttr = (tag: string, attr: string) => {
                    const m = block.match(new RegExp(`<${tag}[^>]*${attr}="([^"]+)"[^>]*\/>`));
                    return m ? m[1] : '';
                  };
                  return {
                    title: get('title').replace(/<[^>]*>/g, ''),
                    link: get('link') || getAttr('link','href'),
                    description: (get('description') || get('summary')).replace(/<[^>]*>/g, ''),
                    pubDate: get('pubDate') || get('updated') || get('published'),
                    thumbnail: getAttr('enclosure','url') || getAttr('media:content','url') || getAttr('media:thumbnail','url')
                  };
                });
                rssData = { items: parsed };
                break;
              }
            }
          } catch {}
        }
        if (rssData) {
          mapped = rssData.items.slice(0, 12).map((it: any) => ({
            id: String(it.guid || `${source}-${it.link}`),
            title: it.title,
            summary: (it.description || it.summary || '').replace(/<[^>]*>/g, '').slice(0, 280),
            imageUrl: it.thumbnail || it.enclosure || undefined,
            externalUrl: it.link,
            source,
            publishedAt: it.pubDate || it.published || it.updated || new Date().toISOString(),
            fetchedAt: new Date().toISOString()
          }));
        }
      }

      if (mapped.length) {
        setExternalNews(prev => {
          const others = prev.filter(n => n.source !== source);
          return [...others, ...mapped];
        });
      }
    } catch (error) {
      console.error(`Failed to fetch ${source} news:`, error);
    }
  }, []);

  // News Archive methods
  const getNewsArchiveByYear = useCallback((year: number): NewsArchive[] => {
    return newsArchive.filter(item => item.year === year);
  }, [newsArchive]);

  const getNewsArchiveByMonth = useCallback((year: number, month: number): NewsArchive[] => {
    return newsArchive.filter(item => item.year === year && item.month === month);
  }, [newsArchive]);

  // Section Images methods
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
    return sectionImages.filter(img => img.section === section && img.isActive);
  }, [sectionImages]);

  // Theme of Year methods
  const addThemeOfYear = useCallback((theme: Omit<ThemeOfYear, 'id' | 'createdAt'>) => {
    const newTheme: ThemeOfYear = {
      ...theme,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setThemesOfYear(prev => [...prev, newTheme]);
  }, []);

  const updateThemeOfYear = useCallback((id: string, theme: Partial<ThemeOfYear>) => {
    setThemesOfYear(prev => prev.map(t => t.id === id ? { ...t, ...theme } : t));
  }, []);

  const deleteThemeOfYear = useCallback((id: string) => {
    setThemesOfYear(prev => prev.filter(t => t.id !== id));
  }, []);

  const getActiveTheme = useCallback((): ThemeOfYear | null => {
    return themesOfYear.find(t => t.isActive) || null;
  }, [themesOfYear]);

  // Saint of Day & Liturgical methods
  const fetchSaintOfDay = useCallback(async () => {
    try {
      // Mock implementation - replace with actual API call
      console.log('Fetching saint of the day...');
      // In production, this would call a Catholic saints API
    } catch (error) {
      console.error('Failed to fetch saint of the day:', error);
    }
  }, []);

  // Contact & Schedule methods
  const updateContactInfo = useCallback((info: Partial<ContactInfo>) => {
    setContactInfo(prev => ({ ...prev, ...info }));
  }, []);

  const updateMassSchedule = useCallback((schedule: Partial<MassSchedule>) => {
    setMassSchedule(prev => ({ ...prev, ...schedule }));
  }, []);

  // Sacrament methods
  const addSacrament = useCallback((sacrament: Omit<Sacrament, 'id' | 'createdAt'>) => {
    const newSacrament: Sacrament = {
      ...sacrament,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setSacraments(prev => [...prev, newSacrament]);
  }, []);

  const updateSacrament = useCallback((id: string, sacrament: Partial<Sacrament>) => {
    setSacraments(prev => prev.map(s => s.id === id ? { ...s, ...sacrament } : s));
  }, []);

  const deleteSacrament = useCallback((id: string) => {
    setSacraments(prev => prev.filter(s => s.id !== id));
  }, []);

  const getActiveSacraments = useCallback((): Sacrament[] => {
    return sacraments.filter(s => s.isActive);
  }, [sacraments]);

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

  const value = useMemo(() => ({
    // Authentication - only non-parishioners have admin access
    isAuthenticated: !!user && user.role !== 'parishioner',
    isLoading: isLoading || authLoading,
    currentUser: user,
    hasPermission,
    
    // Announcements
    announcements,
    addAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    getActiveAnnouncement,
    
    // Events
    events,
    addEvent,
    updateEvent,
    deleteEvent,
    getPublishedEvents,
    
    // Gallery
    galleryImages,
    addImage,
    updateImage,
    deleteImage,
    getPublishedImages,
    
    // Ministries
    ministries,
    addMinistry,
    updateMinistry,
    deleteMinistry,
    getActiveMinistries,
    
    // News
    parishNews,
    addParishNews,
    updateParishNews,
    deleteParishNews,
    getPublishedParishNews,
    archiveParishNews,
    
    // External News
    externalNews,
    fetchExternalNews,
    
    // News Archive
    newsArchive,
    getNewsArchiveByYear,
    getNewsArchiveByMonth,
    
    // Section Images
    sectionImages,
    addSectionImage,
    updateSectionImage,
    deleteSectionImage,
    getSectionImages,
    
    // Theme of Year
    themesOfYear,
    addThemeOfYear,
    updateThemeOfYear,
    deleteThemeOfYear,
    getActiveTheme,
    
    // Saint & Liturgical
    saintOfDay,
    liturgicalInfo,
    fetchSaintOfDay,
    
    // Contact & Schedule
    contactInfo,
    updateContactInfo,
    massSchedule,
    updateMassSchedule,
    
    // Sacraments
    sacraments,
    addSacrament,
    updateSacrament,
    deleteSacrament,
    getActiveSacraments,
    
    // Prayer Intentions
    prayerIntentions,
    addPrayerIntention,
    updatePrayerIntention,
    deletePrayerIntention,
    getPendingIntentions,
  }), [
    user,
    authLoading,
    isLoading,
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
    prayerIntentions,
    addPrayerIntention,
    updatePrayerIntention,
    deletePrayerIntention,
    getPendingIntentions,
    hasPermission,
  ]);

  return (
    <AdminContext.Provider value={value}>
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