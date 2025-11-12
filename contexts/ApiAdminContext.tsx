import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { api, setAuthToken } from '../services/api';
import { useAuth } from './AuthContext';

// Updated types to match backend API
export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'general' | 'urgent' | 'event' | 'mass';
  is_active: boolean;
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
  created_by_username?: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  start_time?: string;
  end_time?: string;
  location?: string;
  category_name?: string;
  category_id?: string;
  image_url?: string;
  is_published: boolean;
  max_attendees?: number;
  current_attendees: number;
  created_at: string;
  updated_at: string;
  created_by_username?: string;
}

export interface ParishNews {
  id: string;
  title: string;
  summary: string;
  content: string;
  category?: string;
  category_id?: string;
  category_name?: string;
  image_url?: string;
  author: string;
  author_role: 'priest' | 'secretary' | 'reporter' | 'vice_secretary';
  is_published: boolean;
  is_archived: boolean;
  published_at?: string;
  archived_at?: string;
  created_at: string;
  updated_at: string;
  created_by_username?: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'news' | 'event' | 'ministry' | 'sacrament' | 'general';
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface GalleryImage {
  id: string;
  title: string;
  description?: string;
  image_url: string;
  thumbnail_url?: string;
  category_name?: string;
  category_id?: string;
  event_title?: string;
  event_id?: string;
  is_featured: boolean;
  upload_date: string;
  created_at: string;
  updated_at: string;
  created_by_username?: string;
}

export interface ContactInfo {
  phone?: string;
  email?: string;
  address?: string;
  emergency_contact?: string;
  office_hours_weekday?: string;
  office_hours_saturday?: string;
  office_hours_sunday?: string;
  updated_at: string;
  updated_by_username?: string;
}

export interface MassSchedule {
  id: string;
  day_of_week: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  time: string;
  language: 'english' | 'isindebele' | 'both';
  type: 'mass' | 'confession' | 'adoration' | 'rosary';
  is_active: boolean;
  created_at: string;
  updated_at: string;
  updated_by_username?: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'priest' | 'secretary' | 'reporter' | 'vice_secretary' | 'parishioner';
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login?: string;
}

export interface PrayerIntention {
  id: string;
  intention: string;
  requester_name?: string;
  requester_email?: string;
  is_anonymous: boolean;
  is_approved: boolean;
  is_urgent: boolean;
  submitted_at: string;
  approved_at?: string;
  approved_by_username?: string;
}

export interface Ministry {
  id: string;
  name: string;
  description?: string;
  leader_name?: string;
  leader_contact?: string;
  meeting_schedule?: string;
  requirements?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by_username?: string;
}

export interface Sacrament {
  id: string;
  name: string;
  description?: string;
  requirements?: string;
  preparation_time?: string;
  contact_person?: string;
  contact_info?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by_username?: string;
}

// Context interface
interface ApiAdminContextType {
  // Loading states
  loading: boolean;
  error: string | null;
  
  // Data
  announcements: Announcement[];
  events: Event[];
  parishNews: ParishNews[];
  categories: Category[];
  galleryImages: GalleryImage[];
  contactInfo: ContactInfo | null;
  massSchedule: MassSchedule[];
  users: User[];
  prayerIntentions: PrayerIntention[];
  ministries: Ministry[];
  sacraments: Sacrament[];
  
  // Announcements
  getActiveAnnouncements: () => Announcement[];
  createAnnouncement: (announcement: Omit<Announcement, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateAnnouncement: (id: string, announcement: Partial<Announcement>) => Promise<void>;
  deleteAnnouncement: (id: string) => Promise<void>;
  toggleAnnouncement: (id: string) => Promise<void>;
  
  // Events
  getUpcomingEvents: () => Event[];
  createEvent: (event: Omit<Event, 'id' | 'created_at' | 'updated_at' | 'current_attendees'>) => Promise<void>;
  updateEvent: (id: string, event: Partial<Event>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  
  // Parish News
  getPublishedParishNews: () => ParishNews[];
  createParishNews: (news: Omit<ParishNews, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateParishNews: (id: string, news: Partial<ParishNews>) => Promise<void>;
  deleteParishNews: (id: string) => Promise<void>;
  archiveParishNews: (id: string) => Promise<void>;
  unarchiveParishNews: (id: string) => Promise<void>;
  
  // Categories
  getCategoriesByType: (type: string) => Category[];
  createCategory: (category: Omit<Category, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateCategory: (id: string, category: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  
  // Gallery
  getFeaturedImages: () => GalleryImage[];
  createGalleryImage: (image: Omit<GalleryImage, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateGalleryImage: (id: string, image: Partial<GalleryImage>) => Promise<void>;
  deleteGalleryImage: (id: string) => Promise<void>;
  
  // Contact Info
  updateContactInfo: (info: Partial<ContactInfo>) => Promise<void>;
  
  // Mass Schedule
  getScheduleByDay: (day: string) => MassSchedule[];
  createScheduleEntry: (schedule: Omit<MassSchedule, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateScheduleEntry: (id: string, schedule: Partial<MassSchedule>) => Promise<void>;
  deleteScheduleEntry: (id: string) => Promise<void>;
  bulkUpdateSchedule: (day: string, schedules: Omit<MassSchedule, 'id' | 'created_at' | 'updated_at'>[]) => Promise<void>;
  
  // Users
  createUser: (user: Omit<User, 'id' | 'created_at' | 'updated_at'> & { password: string }) => Promise<void>;
  updateUser: (id: string, user: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  resetUserPassword: (id: string, newPassword: string) => Promise<void>;
  toggleUser: (id: string) => Promise<void>;
  
  // Prayer Intentions
  getPendingPrayerIntentions: () => PrayerIntention[];
  approvePrayerIntention: (id: string) => Promise<void>;
  deletePrayerIntention: (id: string) => Promise<void>;
  
  // Ministries
  getActiveMinistries: () => Ministry[];
  createMinistry: (ministry: Omit<Ministry, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateMinistry: (id: string, ministry: Partial<Ministry>) => Promise<void>;
  deleteMinistry: (id: string) => Promise<void>;
  toggleMinistry: (id: string) => Promise<void>;
  
  // Sacraments
  getActiveSacraments: () => Sacrament[];
  createSacrament: (sacrament: Omit<Sacrament, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateSacrament: (id: string, sacrament: Partial<Sacrament>) => Promise<void>;
  deleteSacrament: (id: string) => Promise<void>;
  toggleSacrament: (id: string) => Promise<void>;
  
  // Data fetching
  fetchAllData: () => Promise<void>;
  refreshData: () => Promise<void>;
}

const ApiAdminContext = createContext<ApiAdminContextType | undefined>(undefined);

export const ApiAdminProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  
  // Loading states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Data states
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [parishNews, setParishNews] = useState<ParishNews[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const [massSchedule, setMassSchedule] = useState<MassSchedule[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [prayerIntentions, setPrayerIntentions] = useState<PrayerIntention[]>([]);
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [sacraments, setSacraments] = useState<Sacrament[]>([]);

  // Set auth token when user changes
  useEffect(() => {
    if (user) {
      // In a real app, you'd get the token from the auth context
      const token = localStorage.getItem('authToken');
      if (token) {
        setAuthToken(token);
      }
    }
  }, [user]);

  // Utility function to handle API calls
  const handleApiCall = async <T,>(
    apiCall: () => Promise<any>,
    onSuccess?: (data: T) => void,
    showLoading = true
  ) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);
      
      const response = await apiCall();
      
      if (response.success && onSuccess) {
        onSuccess(response.data);
      } else if (!response.success) {
        setError(response.message || 'An error occurred');
      }
      
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      console.error('API call failed:', err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // Fetch all data
  const fetchAllData = async () => {
    if (!user || user.role === 'parishioner') return;
    
    setLoading(true);
    try {
      const [
        announcementsRes,
        eventsRes,
        newsRes,
        categoriesRes,
        galleryRes,
        contactRes,
        scheduleRes,
        usersRes,
        prayersRes,
        ministriesRes,
        sacramentsRes
      ] = await Promise.allSettled([
        api.announcements.getAll(),
        api.events.getAll(),
        api.news.getAll(),
        api.categories.getAll(),
        api.gallery.getAll(),
        api.contact.get(),
        api.schedule.getAll(),
        api.users.getAll(),
        api.prayers.getAll(),
        api.ministries.getAll(),
        api.sacraments.getAll()
      ]);

      if (announcementsRes.status === 'fulfilled' && announcementsRes.value.success) {
        setAnnouncements(announcementsRes.value.data.announcements || []);
      }
      
      if (eventsRes.status === 'fulfilled' && eventsRes.value.success) {
        setEvents(eventsRes.value.data.events || []);
      }
      
      if (newsRes.status === 'fulfilled' && newsRes.value.success) {
        setParishNews(newsRes.value.data.news || []);
      }
      
      if (categoriesRes.status === 'fulfilled' && categoriesRes.value.success) {
        setCategories(categoriesRes.value.data.categories || []);
      }
      
      if (galleryRes.status === 'fulfilled' && galleryRes.value.success) {
        setGalleryImages(galleryRes.value.data.images || []);
      }
      
      if (contactRes.status === 'fulfilled' && contactRes.value.success) {
        setContactInfo(contactRes.value.data.contact || null);
      }
      
      if (scheduleRes.status === 'fulfilled' && scheduleRes.value.success) {
        setMassSchedule(scheduleRes.value.data.raw_schedule || []);
      }
      
      if (usersRes.status === 'fulfilled' && usersRes.value.success) {
        setUsers(usersRes.value.data.users || []);
      }
      
      if (prayersRes.status === 'fulfilled' && prayersRes.value.success) {
        setPrayerIntentions(prayersRes.value.data.intentions || []);
      }
      
      if (ministriesRes.status === 'fulfilled' && ministriesRes.value.success) {
        setMinistries(ministriesRes.value.data.ministries || []);
      }
      
      if (sacramentsRes.status === 'fulfilled' && sacramentsRes.value.success) {
        setSacraments(sacramentsRes.value.data.sacraments || []);
      }
      
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Load data when user changes
  useEffect(() => {
    if (user && user.role !== 'parishioner') {
      fetchAllData();
    }
  }, [user, fetchAllData]);

  // Announcement methods
  const getActiveAnnouncements = () => 
    announcements.filter(a => a.is_active);

  const createAnnouncement = async (announcement: Omit<Announcement, 'id' | 'created_at' | 'updated_at'>) => {
    await handleApiCall(
      () => api.announcements.create(announcement),
      () => fetchAllData()
    );
  };

  const updateAnnouncement = async (id: string, announcement: Partial<Announcement>) => {
    await handleApiCall(
      () => api.announcements.update(id, announcement),
      () => fetchAllData()
    );
  };

  const deleteAnnouncement = async (id: string) => {
    await handleApiCall(
      () => api.announcements.delete(id),
      () => setAnnouncements(prev => prev.filter(a => a.id !== id))
    );
  };

  const toggleAnnouncement = async (id: string) => {
    await handleApiCall(
      () => api.announcements.toggle(id),
      () => fetchAllData()
    );
  };

  // Event methods
  const getUpcomingEvents = () => 
    events.filter(e => e.is_published && new Date(e.event_date) >= new Date());

  const createEvent = async (event: Omit<Event, 'id' | 'created_at' | 'updated_at' | 'current_attendees'>) => {
    await handleApiCall(
      () => api.events.create(event),
      () => fetchAllData()
    );
  };

  const updateEvent = async (id: string, event: Partial<Event>) => {
    await handleApiCall(
      () => api.events.update(id, event),
      () => fetchAllData()
    );
  };

  const deleteEvent = async (id: string) => {
    await handleApiCall(
      () => api.events.delete(id),
      () => setEvents(prev => prev.filter(e => e.id !== id))
    );
  };

  // Parish News methods
  const getPublishedParishNews = () => 
    parishNews.filter(n => n.is_published && !n.is_archived);

  const createParishNews = async (news: Omit<ParishNews, 'id' | 'created_at' | 'updated_at'>) => {
    await handleApiCall(
      () => api.news.create(news),
      () => fetchAllData()
    );
  };

  const updateParishNews = async (id: string, news: Partial<ParishNews>) => {
    await handleApiCall(
      () => api.news.update(id, news),
      () => fetchAllData()
    );
  };

  const deleteParishNews = async (id: string) => {
    await handleApiCall(
      () => api.news.delete(id),
      () => setParishNews(prev => prev.filter(n => n.id !== id))
    );
  };

  const archiveParishNews = async (id: string) => {
    await handleApiCall(
      () => api.news.archive(id),
      () => fetchAllData()
    );
  };

  const unarchiveParishNews = async (id: string) => {
    await handleApiCall(
      () => api.news.unarchive(id),
      () => fetchAllData()
    );
  };

  // Category methods
  const getCategoriesByType = (type: string) => 
    categories.filter(c => c.type === type && c.is_active);

  const createCategory = async (category: Omit<Category, 'id' | 'created_at' | 'updated_at'>) => {
    await handleApiCall(
      () => api.categories.create(category),
      () => fetchAllData()
    );
  };

  const updateCategory = async (id: string, category: Partial<Category>) => {
    await handleApiCall(
      () => api.categories.update(id, category),
      () => fetchAllData()
    );
  };

  const deleteCategory = async (id: string) => {
    await handleApiCall(
      () => api.categories.delete(id),
      () => setCategories(prev => prev.filter(c => c.id !== id))
    );
  };

  // Gallery methods
  const getFeaturedImages = () => 
    galleryImages.filter(img => img.is_featured);

  const createGalleryImage = async (image: Omit<GalleryImage, 'id' | 'created_at' | 'updated_at'>) => {
    await handleApiCall(
      () => api.gallery.create(image),
      () => fetchAllData()
    );
  };

  const updateGalleryImage = async (id: string, image: Partial<GalleryImage>) => {
    await handleApiCall(
      () => api.gallery.update(id, image),
      () => fetchAllData()
    );
  };

  const deleteGalleryImage = async (id: string) => {
    await handleApiCall(
      () => api.gallery.delete(id),
      () => setGalleryImages(prev => prev.filter(img => img.id !== id))
    );
  };

  // Contact Info methods
  const updateContactInfo = async (info: Partial<ContactInfo>) => {
    await handleApiCall(
      () => api.contact.update(info),
      (data: any) => setContactInfo(data.contact)
    );
  };

  // Mass Schedule methods
  const getScheduleByDay = (day: string) => 
    massSchedule.filter(s => s.day_of_week === day && s.is_active);

  const createScheduleEntry = async (schedule: Omit<MassSchedule, 'id' | 'created_at' | 'updated_at'>) => {
    await handleApiCall(
      () => api.schedule.create(schedule),
      () => fetchAllData()
    );
  };

  const updateScheduleEntry = async (id: string, schedule: Partial<MassSchedule>) => {
    await handleApiCall(
      () => api.schedule.update(id, schedule),
      () => fetchAllData()
    );
  };

  const deleteScheduleEntry = async (id: string) => {
    await handleApiCall(
      () => api.schedule.delete(id),
      () => setMassSchedule(prev => prev.filter(s => s.id !== id))
    );
  };

  const bulkUpdateSchedule = async (day: string, schedules: Omit<MassSchedule, 'id' | 'created_at' | 'updated_at'>[]) => {
    await handleApiCall(
      () => api.schedule.bulkUpdateDay(day, schedules),
      () => fetchAllData()
    );
  };

  // User methods
  const createUser = async (user: Omit<User, 'id' | 'created_at' | 'updated_at'> & { password: string }) => {
    await handleApiCall(
      () => api.users.create(user),
      () => fetchAllData()
    );
  };

  const updateUser = async (id: string, user: Partial<User>) => {
    await handleApiCall(
      () => api.users.update(id, user),
      () => fetchAllData()
    );
  };

  const deleteUser = async (id: string) => {
    await handleApiCall(
      () => api.users.delete(id),
      () => setUsers(prev => prev.filter(u => u.id !== id))
    );
  };

  const resetUserPassword = async (id: string, newPassword: string) => {
    await handleApiCall(
      () => api.users.resetPassword(id, newPassword),
      () => {} // No state update needed
    );
  };

  const toggleUser = async (id: string) => {
    await handleApiCall(
      () => api.users.toggle(id),
      () => fetchAllData()
    );
  };

  // Prayer Intention methods
  const getPendingPrayerIntentions = () => 
    prayerIntentions.filter(p => !p.is_approved);

  const approvePrayerIntention = async (id: string) => {
    await handleApiCall(
      () => api.prayers.approve(id),
      () => fetchAllData()
    );
  };

  const deletePrayerIntention = async (id: string) => {
    await handleApiCall(
      () => api.prayers.delete(id),
      () => setPrayerIntentions(prev => prev.filter(p => p.id !== id))
    );
  };

  // Ministry methods
  const getActiveMinistries = () => 
    ministries.filter(m => m.is_active);

  const createMinistry = async (ministry: Omit<Ministry, 'id' | 'created_at' | 'updated_at'>) => {
    await handleApiCall(
      () => api.ministries.create(ministry),
      () => fetchAllData()
    );
  };

  const updateMinistry = async (id: string, ministry: Partial<Ministry>) => {
    await handleApiCall(
      () => api.ministries.update(id, ministry),
      () => fetchAllData()
    );
  };

  const deleteMinistry = async (id: string) => {
    await handleApiCall(
      () => api.ministries.delete(id),
      () => setMinistries(prev => prev.filter(m => m.id !== id))
    );
  };

  const toggleMinistry = async (id: string) => {
    await handleApiCall(
      () => api.ministries.toggle(id),
      () => fetchAllData()
    );
  };

  // Sacrament methods
  const getActiveSacraments = () => 
    sacraments.filter(s => s.is_active);

  const createSacrament = async (sacrament: Omit<Sacrament, 'id' | 'created_at' | 'updated_at'>) => {
    await handleApiCall(
      () => api.sacraments.create(sacrament),
      () => fetchAllData()
    );
  };

  const updateSacrament = async (id: string, sacrament: Partial<Sacrament>) => {
    await handleApiCall(
      () => api.sacraments.update(id, sacrament),
      () => fetchAllData()
    );
  };

  const deleteSacrament = async (id: string) => {
    await handleApiCall(
      () => api.sacraments.delete(id),
      () => setSacraments(prev => prev.filter(s => s.id !== id))
    );
  };

  const toggleSacrament = async (id: string) => {
    await handleApiCall(
      () => api.sacraments.toggle(id),
      () => fetchAllData()
    );
  };

  const refreshData = fetchAllData;

  const value: ApiAdminContextType = {
    // Loading states
    loading,
    error,
    
    // Data
    announcements,
    events,
    parishNews,
    categories,
    galleryImages,
    contactInfo,
    massSchedule,
    users,
    prayerIntentions,
    ministries,
    sacraments,
    
    // Methods
    getActiveAnnouncements,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    toggleAnnouncement,
    
    getUpcomingEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    
    getPublishedParishNews,
    createParishNews,
    updateParishNews,
    deleteParishNews,
    archiveParishNews,
    unarchiveParishNews,
    
    getCategoriesByType,
    createCategory,
    updateCategory,
    deleteCategory,
    
    getFeaturedImages,
    createGalleryImage,
    updateGalleryImage,
    deleteGalleryImage,
    
    updateContactInfo,
    
    getScheduleByDay,
    createScheduleEntry,
    updateScheduleEntry,
    deleteScheduleEntry,
    bulkUpdateSchedule,
    
    createUser,
    updateUser,
    deleteUser,
    resetUserPassword,
    toggleUser,
    
    getPendingPrayerIntentions,
    approvePrayerIntention,
    deletePrayerIntention,
    
    getActiveMinistries,
    createMinistry,
    updateMinistry,
    deleteMinistry,
    toggleMinistry,
    
    getActiveSacraments,
    createSacrament,
    updateSacrament,
    deleteSacrament,
    toggleSacrament,
    
    fetchAllData,
    refreshData
  };

  return (
    <ApiAdminContext.Provider value={value}>
      {children}
    </ApiAdminContext.Provider>
  );
};

export const useApiAdmin = () => {
  const context = useContext(ApiAdminContext);
  if (context === undefined) {
    throw new Error('useApiAdmin must be used within an ApiAdminProvider');
  }
  return context;
};

export default ApiAdminContext;
