import React, { createContext, useContext, useMemo, useState, useEffect, useCallback } from 'react';
import { useAuth, type UserRole, type User } from './AuthContext';
import * as api from '../services/api';

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
  | 'news' | 'images' | 'ministries' | 'section_images' | 'videos';

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
    'ministries', 'section_images', 'videos'
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
  const [externalNews] = useState<ExternalNews[]>([]);
  const [newsArchive, setNewsArchive] = useState<NewsArchive[]>([]);
  const [sectionImages, setSectionImages] = useState<SectionImage[]>([]);
  const [themesOfYear, setThemesOfYear] = useState<ThemeOfYear[]>([]);
  const [saintOfDay] = useState<SaintOfDay | null>(null);
  const [liturgicalInfo] = useState<LiturgicalInfo | null>(null);
  const [contactInfo, setContactInfo] = useState<ContactInfo>({});
  const [massSchedule, setMassSchedule] = useState<MassSchedule>({});
  const [sacraments, setSacraments] = useState<Sacrament[]>([]);
  const [prayerIntentions, setPrayerIntentions] = useState<PrayerIntention[]>([]);

  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    const permissions = ROLE_PERMISSIONS[user.role] || [];
    return permissions.includes(permission);
  };

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          annResp,
          eventsResp,
          galleryResp,
          newsResp,
          ministriesResp,
          sacramentsResp,
          contactResp,
          scheduleResp,
          prayersResp
        ] = await Promise.all([
          api.announcementsApi.getAll(),
          api.eventsApi.getAll(),
          api.galleryApi.getAll(),
          api.newsApi.getAll(),
          api.ministriesApi.getAll(),
          api.sacramentsApi.getAll(),
          api.contactApi.get(),
          api.scheduleApi.getAll(),
          api.prayersApi.getAll()
        ]);

        if (annResp.success) setAnnouncements(annResp.data.announcements || []);
        if (eventsResp.success) setEvents(eventsResp.data.events || []);
        if (galleryResp.success) {
          const mappedGallery = (galleryResp.data.gallery || []).map((img: any) => ({
            id: img.id,
            title: img.title,
            description: img.description,
            url: img.image_url,
            category: img.category_name?.toLowerCase() || 'general',
            uploadedAt: img.created_at,
            isPublished: img.is_published
          }));
          setGalleryImages(mappedGallery);
        }
        if (newsResp.success) {
          const mappedNews = (newsResp.data.news || []).map((n: any) => ({
            id: n.id,
            title: n.title,
            summary: n.summary,
            content: n.content,
            category: n.category_name,
            imageUrl: n.image_url,
            author: n.author,
            authorRole: n.author_role,
            publishedAt: n.published_at,
            isArchived: n.is_archived,
            isPublished: n.is_published,
            createdAt: n.created_at
          }));
          setParishNews(mappedNews);
        }
        if (ministriesResp.success) setMinistries(ministriesResp.data.ministries || []);
        if (sacramentsResp.success) setSacraments(sacramentsResp.data.sacraments || []);
        if (contactResp.success) setContactInfo(contactResp.data || {});
        if (scheduleResp.success) setMassSchedule(scheduleResp.data || {});
        if (prayersResp.success) setPrayerIntentions(prayersResp.data.prayers || []);
      } catch (error) {
        console.error('Failed to fetch admin data:', error);
      }
    };

    if (user && user.role !== 'parishioner') {
      fetchData();
    }
  }, [user]);

  // Announcement methods
  const addAnnouncement = useCallback(async (announcement: Omit<Announcement, 'id' | 'createdAt'>) => {
    try {
      const response = await api.announcementsApi.create({
        title: announcement.title,
        content: announcement.message,
        type: announcement.type,
        is_active: announcement.isActive,
        end_date: announcement.expiresAt
      });
      if (response.success) {
        const ann = response.data.announcement;
        setAnnouncements(prev => [...prev, {
          id: ann.id,
          title: ann.title,
          message: ann.content,
          type: ann.type,
          isActive: ann.is_active,
          createdAt: ann.created_at,
          expiresAt: ann.end_date
        }]);
      }
    } catch (error) {
      console.error('Failed to add announcement:', error);
    }
  }, []);

  const updateAnnouncement = useCallback(async (id: string, announcement: Partial<Announcement>) => {
    try {
      const apiData: any = {};
      if (announcement.title !== undefined) apiData.title = announcement.title;
      if (announcement.message !== undefined) apiData.content = announcement.message;
      if (announcement.type !== undefined) apiData.type = announcement.type;
      if (announcement.isActive !== undefined) apiData.is_active = announcement.isActive;
      if (announcement.expiresAt !== undefined) apiData.end_date = announcement.expiresAt;

      const response = await api.announcementsApi.update(id, apiData);
      if (response.success) {
        setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, ...announcement } : a));
      }
    } catch (error) {
      console.error('Failed to update announcement:', error);
    }
  }, []);

  const deleteAnnouncement = useCallback(async (id: string) => {
    try {
      const response = await api.announcementsApi.delete(id);
      if (response.success) {
        setAnnouncements(prev => prev.filter(a => a.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete announcement:', error);
    }
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
  const addEvent = useCallback(async (event: Omit<Event, 'id' | 'createdAt'>) => {
    try {
      const response = await api.eventsApi.create({
        title: event.title,
        description: event.description,
        event_date: event.date,
        start_time: event.time,
        location: event.location,
        category_name: event.category,
        is_published: event.isPublished
      });
      if (response.success) {
        const e = response.data.event;
        setEvents(prev => [...prev, {
          id: e.id,
          title: e.title,
          description: e.description,
          date: e.event_date,
          time: e.start_time,
          location: e.location,
          category: event.category,
          isPublished: e.is_published,
          createdAt: e.created_at
        }]);
      }
    } catch (error) {
      console.error('Failed to add event:', error);
    }
  }, []);

  const updateEvent = useCallback(async (id: string, event: Partial<Event>) => {
    try {
      const apiData: any = {};
      if (event.title !== undefined) apiData.title = event.title;
      if (event.description !== undefined) apiData.description = event.description;
      if (event.date !== undefined) apiData.event_date = event.date;
      if (event.time !== undefined) apiData.start_time = event.time;
      if (event.location !== undefined) apiData.location = event.location;
      if (event.isPublished !== undefined) apiData.is_published = event.isPublished;

      const response = await api.eventsApi.update(id, apiData);
      if (response.success) {
        setEvents(prev => prev.map(e => e.id === id ? { ...e, ...event } : e));
      }
    } catch (error) {
      console.error('Failed to update event:', error);
    }
  }, []);

  const deleteEvent = useCallback(async (id: string) => {
    try {
      const response = await api.eventsApi.delete(id);
      if (response.success) {
        setEvents(prev => prev.filter(e => e.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete event:', error);
    }
  }, []);

  const getPublishedEvents = useCallback((): Event[] => {
    return events.filter(event => event.isPublished);
  }, [events]);

  // Gallery methods
  const addImage = useCallback(async (image: Omit<GalleryImage, 'id' | 'uploadedAt'>) => {
    try {
      const response = await api.galleryApi.create({
        title: image.title,
        description: image.description,
        image_url: image.url,
        is_published: image.isPublished,
        category_name: image.category // The backend might expect a category_id, but let's see
      });
      if (response.success) {
        const newImg = response.data.gallery;
        setGalleryImages(prev => [...prev, {
          id: newImg.id,
          title: newImg.title,
          description: newImg.description,
          url: newImg.image_url,
          category: image.category,
          uploadedAt: newImg.created_at,
          isPublished: newImg.is_published
        }]);
      }
    } catch (error) {
      console.error('Failed to add image:', error);
    }
  }, []);

  const updateImage = useCallback(async (id: string, image: Partial<GalleryImage>) => {
    try {
      const apiData: any = {};
      if (image.title !== undefined) apiData.title = image.title;
      if (image.description !== undefined) apiData.description = image.description;
      if (image.url !== undefined) apiData.image_url = image.url;
      if (image.isPublished !== undefined) apiData.is_published = image.isPublished;
      
      const response = await api.galleryApi.update(id, apiData);
      if (response.success) {
        setGalleryImages(prev => prev.map(i => i.id === id ? { ...i, ...image } : i));
      }
    } catch (error) {
      console.error('Failed to update image:', error);
    }
  }, []);

  const deleteImage = useCallback(async (id: string) => {
    try {
      const response = await api.galleryApi.delete(id);
      if (response.success) {
        setGalleryImages(prev => prev.filter(i => i.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete image:', error);
    }
  }, []);

  const getPublishedImages = useCallback((): GalleryImage[] => {
    return galleryImages.filter(img => img.isPublished);
  }, [galleryImages]);

  // Ministry methods
  const addMinistry = useCallback(async (ministry: Omit<Ministry, 'id' | 'createdAt'>) => {
    try {
      const response = await api.ministriesApi.create({
        name: ministry.name,
        description: ministry.description,
        image_url: ministry.imageUrl,
        contact_person: ministry.contactPerson,
        meeting_time: ministry.meetingTime,
        is_active: ministry.isActive
      });
      if (response.success) {
        const m = response.data.ministry;
        setMinistries(prev => [...prev, {
          id: m.id,
          name: m.name,
          description: m.description,
          imageUrl: m.image_url,
          contactPerson: m.leader_name,
          meetingTime: m.meeting_schedule,
          isActive: m.is_active,
          createdAt: m.created_at
        }]);
      }
    } catch (error) {
      console.error('Failed to add ministry:', error);
    }
  }, []);

  const updateMinistry = useCallback(async (id: string, ministry: Partial<Ministry>) => {
    try {
      const apiData: any = {};
      if (ministry.name !== undefined) apiData.name = ministry.name;
      if (ministry.description !== undefined) apiData.description = ministry.description;
      if (ministry.imageUrl !== undefined) apiData.image_url = ministry.imageUrl;
      if (ministry.contactPerson !== undefined) apiData.leader_name = ministry.contactPerson;
      if (ministry.meetingTime !== undefined) apiData.meeting_schedule = ministry.meetingTime;
      if (ministry.isActive !== undefined) apiData.is_active = ministry.isActive;

      const response = await api.ministriesApi.update(id, apiData);
      if (response.success) {
        setMinistries(prev => prev.map(m => m.id === id ? { ...m, ...ministry } : m));
      }
    } catch (error) {
      console.error('Failed to update ministry:', error);
    }
  }, []);

  const deleteMinistry = useCallback(async (id: string) => {
    try {
      const response = await api.ministriesApi.delete(id);
      if (response.success) {
        setMinistries(prev => prev.filter(m => m.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete ministry:', error);
    }
  }, []);

  const getActiveMinistries = useCallback((): Ministry[] => {
    return ministries.filter(ministry => ministry.isActive);
  }, [ministries]);

  // Parish News methods
  const addParishNews = useCallback(async (news: Omit<ParishNews, 'id' | 'createdAt'>) => {
    try {
      const response = await api.newsApi.create({
        title: news.title,
        summary: news.summary,
        content: news.content,
        author: news.author,
        author_role: news.authorRole,
        image_url: news.imageUrl,
        is_published: news.isPublished,
        is_archived: false
      });
      if (response.success) {
        const n = response.data.news;
        setParishNews(prev => [...prev, {
          id: n.id,
          title: n.title,
          summary: n.summary,
          content: n.content,
          category: n.category_name,
          imageUrl: n.image_url,
          author: n.author,
          authorRole: n.author_role,
          publishedAt: n.published_at,
          isArchived: n.is_archived,
          isPublished: n.is_published,
          createdAt: n.created_at
        }]);
      }
    } catch (error) {
      console.error('Failed to add news:', error);
    }
  }, []);

  const updateParishNews = useCallback(async (id: string, news: Partial<ParishNews>) => {
    try {
      const apiData: any = {};
      if (news.title !== undefined) apiData.title = news.title;
      if (news.summary !== undefined) apiData.summary = news.summary;
      if (news.content !== undefined) apiData.content = news.content;
      if (news.author !== undefined) apiData.author = news.author;
      if (news.authorRole !== undefined) apiData.author_role = news.authorRole;
      if (news.imageUrl !== undefined) apiData.image_url = news.imageUrl;
      if (news.isPublished !== undefined) apiData.is_published = news.isPublished;
      if (news.isArchived !== undefined) apiData.is_archived = news.isArchived;

      const response = await api.newsApi.update(id, apiData);
      if (response.success) {
        setParishNews(prev => prev.map(n => n.id === id ? { ...n, ...news } : n));
      }
    } catch (error) {
      console.error('Failed to update news:', error);
    }
  }, []);

  const deleteParishNews = useCallback(async (id: string) => {
    try {
      const response = await api.newsApi.delete(id);
      if (response.success) {
        setParishNews(prev => prev.filter(n => n.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete news:', error);
    }
  }, []);

  const getPublishedParishNews = useCallback((): ParishNews[] => {
    return parishNews.filter(news => news.isPublished && !news.isArchived);
  }, [parishNews]);

  const archiveParishNews = useCallback(async (id: string) => {
    try {
      const response = await api.newsApi.archive(id);
      if (response.success) {
        setParishNews(prev => prev.map(n => n.id === id ? { ...n, isArchived: true } : n));
      }
    } catch (error) {
      console.error('Failed to archive news:', error);
    }
  }, []);

  // External News methods
  const fetchExternalNews = useCallback(async (source: ExternalNews['source']) => {
    try {
      // Mock implementation - replace with actual API call in production
      console.log(`Fetching news from ${source}`);
      // In production, this would call an external API
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
  const addSacrament = useCallback(async (sacrament: Omit<Sacrament, 'id' | 'createdAt'>) => {
    try {
      const response = await api.sacramentsApi.create({
        name: sacrament.name,
        description: sacrament.description,
        image_url: sacrament.imageUrl,
        requirements: sacrament.requirements.join('\n'),
        contact_info: sacrament.contactInfo,
        is_active: sacrament.isActive
      });
      if (response.success) {
        const s = response.data.sacrament;
        setSacraments(prev => [...prev, {
          id: s.id,
          name: s.name,
          description: s.description,
          imageUrl: s.image_url,
          requirements: s.requirements ? s.requirements.split('\n') : [],
          contactInfo: s.contact_person,
          isActive: s.is_active,
          createdAt: s.created_at
        }]);
      }
    } catch (error) {
      console.error('Failed to add sacrament:', error);
    }
  }, []);

  const updateSacrament = useCallback(async (id: string, sacrament: Partial<Sacrament>) => {
    try {
      const apiData: any = {};
      if (sacrament.name !== undefined) apiData.name = sacrament.name;
      if (sacrament.description !== undefined) apiData.description = sacrament.description;
      if (sacrament.imageUrl !== undefined) apiData.image_url = sacrament.imageUrl;
      if (sacrament.requirements !== undefined) apiData.requirements = sacrament.requirements.join('\n');
      if (sacrament.contactInfo !== undefined) apiData.contact_person = sacrament.contactInfo;
      if (sacrament.isActive !== undefined) apiData.is_active = sacrament.isActive;

      const response = await api.sacramentsApi.update(id, apiData);
      if (response.success) {
        setSacraments(prev => prev.map(s => s.id === id ? { ...s, ...sacrament } : s));
      }
    } catch (error) {
      console.error('Failed to update sacrament:', error);
    }
  }, []);

  const deleteSacrament = useCallback(async (id: string) => {
    try {
      const response = await api.sacramentsApi.delete(id);
      if (response.success) {
        setSacraments(prev => prev.filter(s => s.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete sacrament:', error);
    }
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