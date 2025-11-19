// API Service for St. Patrick's Catholic Church
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any[];
}

export interface PaginatedResponse<T = any> extends ApiResponse<T> {
  data: {
    items?: T[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  } & T;
}

// API Client Class
class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('authToken');
  }

  // Set authentication token
  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  }

  // Get authentication headers
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    const token = this.token || localStorage.getItem('authToken');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  // Generic request method
  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const config: RequestInit = {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
        credentials: 'include',
      };

      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data?.message || `HTTP error! status: ${response.status}`;
        const err = new Error(errorMessage);
        throw err;
      }

      return data;
    } catch (error) {
      // Only log unexpected errors, not connection refused (expected in development)
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        // Connection refused - API server not running (expected in development)
        throw error;
      } else {
        const msg = (error as any)?.message || '';
        const isAuthError = typeof msg === 'string' && (
          msg.includes('Invalid credentials') ||
          msg.includes('Authentication required') ||
          msg.includes('Insufficient permissions') ||
          msg.includes('Unauthorized')
        );
        if (!isAuthError) {
          console.error('API request failed:', error);
        }
        throw error;
      }
    }
  }

  // HTTP Methods
  async get<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // File upload method
  async uploadFile<T = any>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const headers: HeadersInit = {};
      const token = this.token || localStorage.getItem('authToken');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('File upload failed:', error);
      throw error;
    }
  }
}

// Create API client instance
const apiClient = new ApiClient(API_BASE_URL);

// Authentication API
export const authApi = {
  login: (credentials: { username: string; password: string }) =>
    apiClient.post('/auth/login', credentials),
  
  register: (userData: { 
    username: string; 
    email: string; 
    password: string; 
    role?: string;
    firstName?: string;
    lastName?: string;
    middleName?: string;
    phone?: string;
    dateOfBirth?: string;
    gender?: string;
    address?: string;
    emergencyContact?: string;
    emergencyPhone?: string;
    section?: string;
    association?: string;
    profilePicture?: File | null;
  }) =>
    apiClient.post('/auth/register', userData),
  
  logout: () => apiClient.post('/auth/logout'),
  
  getProfile: () => apiClient.get('/auth/profile'),
  
  updateProfile: (data: Record<string, any>) =>
    apiClient.put('/auth/profile', data),
  
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    apiClient.put('/auth/change-password', data),
  
  refreshToken: (refreshToken: string) =>
    apiClient.post('/auth/refresh', { refreshToken }),
  
  verifyToken: () => apiClient.get('/auth/verify'),
};

// News API
export const newsApi = {
  getAll: (params?: { page?: number; limit?: number; category?: string; search?: string; published?: boolean; archived?: boolean }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    return apiClient.get(`/news?${queryParams.toString()}`);
  },
  
  getById: (id: string) => apiClient.get(`/news/${id}`),
  
  create: (newsData: any) => apiClient.post('/news', newsData),
  
  update: (id: string, newsData: any) => apiClient.put(`/news/${id}`, newsData),
  
  delete: (id: string) => apiClient.delete(`/news/${id}`),
  
  archive: (id: string) => apiClient.patch(`/news/${id}/archive`),
  
  unarchive: (id: string) => apiClient.patch(`/news/${id}/unarchive`),
  
  getStats: () => apiClient.get('/news/stats/overview'),

  // External aggregated news (Vatican, Diocese, ZCBC)
  getExternal: (source: 'diocese' | 'vatican' | 'zimbabwe_catholic') => {
    // Try common backend routes; whichever exists will respond
    const endpoints = [
      `/news/external?source=${source}`,
      `/external/news?source=${source}`,
      `/external/${source}`
    ];
    // Attempt endpoints sequentially
    return (async () => {
      for (const ep of endpoints) {
        try {
          const res = await apiClient.get(ep);
          if (res && res.success) return res;
        } catch {}
      }
      // Fallback empty response
      return { success: false, data: { items: [] } } as ApiResponse<any>;
    })();
  },
};

// Categories API
export const categoriesApi = {
  getAll: (params?: { page?: number; limit?: number; type?: string; active?: boolean }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    return apiClient.get(`/categories?${queryParams.toString()}`);
  },
  
  getByType: (type: string) => apiClient.get(`/categories/type/${type}`),
  
  getById: (id: string) => apiClient.get(`/categories/${id}`),
  
  create: (categoryData: any) => apiClient.post('/categories', categoryData),
  
  update: (id: string, categoryData: any) => apiClient.put(`/categories/${id}`, categoryData),
  
  delete: (id: string) => apiClient.delete(`/categories/${id}`),
  
  getUsage: (id: string) => apiClient.get(`/categories/${id}/usage`),
  
  getStats: () => apiClient.get('/categories/stats/overview'),
};

// File Upload API
export const uploadApi = {
  uploadSingle: (file: File, type?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (type) formData.append('type', type);
    return apiClient.uploadFile('/upload/single', formData);
  },
  
  uploadMultiple: (files: File[], type?: string) => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    if (type) formData.append('type', type);
    return apiClient.uploadFile('/upload/multiple', formData);
  },
  
  getFiles: (params?: { page?: number; limit?: number; mimeType?: string }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    return apiClient.get(`/upload?${queryParams.toString()}`);
  },
  
  getFileInfo: (id: string) => apiClient.get(`/upload/${id}`),
  
  deleteFile: (id: string) => apiClient.delete(`/upload/${id}`),
};

// Announcements API
export const announcementsApi = {
  getAll: (params?: { page?: number; limit?: number; type?: string; active?: boolean }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    return apiClient.get(`/announcements?${queryParams.toString()}`);
  },
  
  getActive: () => apiClient.get('/announcements/active'),
  
  getById: (id: string) => apiClient.get(`/announcements/${id}`),
  
  create: (announcementData: any) => apiClient.post('/announcements', announcementData),
  
  update: (id: string, announcementData: any) => apiClient.put(`/announcements/${id}`, announcementData),
  
  delete: (id: string) => apiClient.delete(`/announcements/${id}`),
  
  toggle: (id: string) => apiClient.patch(`/announcements/${id}/toggle`),
  
  getByType: (type: string) => apiClient.get(`/announcements/type/${type}`),
  
  getStats: () => apiClient.get('/announcements/stats/overview'),
};

// Events API
export const eventsApi = {
  getAll: (params?: { page?: number; limit?: number; category?: string; upcoming?: boolean; past?: boolean; published?: boolean }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    return apiClient.get(`/events?${queryParams.toString()}`);
  },
  
  getUpcoming: (limit?: number) => {
    const queryParams = limit ? `?limit=${limit}` : '';
    return apiClient.get(`/events/upcoming${queryParams}`);
  },
  
  getById: (id: string) => apiClient.get(`/events/${id}`),
  
  create: (eventData: any) => apiClient.post('/events', eventData),
  
  update: (id: string, eventData: any) => apiClient.put(`/events/${id}`, eventData),
  
  delete: (id: string) => apiClient.delete(`/events/${id}`),
  
  register: (id: string) => apiClient.post(`/events/${id}/register`),
  
  getByDateRange: (start: string, end: string) => apiClient.get(`/events/date-range/${start}/${end}`),
  
  getStats: () => apiClient.get('/events/stats/overview'),
};

// Users API (Admin routes)
export const usersApi = {
  getAll: (params?: { page?: number; limit?: number; role?: string; active?: boolean; search?: string }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    return apiClient.get(`/admin/users?${queryParams.toString()}`);
  },
  
  getById: (id: string) => apiClient.get(`/admin/users/${id}`),
  
  create: (userData: any) => apiClient.post('/admin/users', userData),
  
  update: (id: string, userData: any) => apiClient.put(`/admin/users/${id}`, userData),
  
  delete: (id: string) => apiClient.delete(`/admin/users/${id}`),
  
  resetPassword: (id: string, newPassword: string) => 
    apiClient.patch(`/admin/users/${id}/reset-password`, { newPassword, password: newPassword }),
  
  toggle: (id: string) => apiClient.patch(`/admin/users/${id}/toggle`),
  
  getStats: () => apiClient.get('/admin/users/stats'),
};

// Contact API
export const contactApi = {
  get: () => apiClient.get('/contact'),
  
  update: (contactData: any) => apiClient.put('/contact', contactData),
  
  getHistory: () => apiClient.get('/contact/history'),
};

// Schedule API
export const scheduleApi = {
  getAll: (params?: { day?: string; type?: string; active?: boolean }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    return apiClient.get(`/schedule?${queryParams.toString()}`);
  },
  
  getByDay: (day: string) => apiClient.get(`/schedule/day/${day}`),
  
  getById: (id: string) => apiClient.get(`/schedule/${id}`),
  
  create: (scheduleData: any) => apiClient.post('/schedule', scheduleData),
  
  update: (id: string, scheduleData: any) => apiClient.put(`/schedule/${id}`, scheduleData),
  
  delete: (id: string) => apiClient.delete(`/schedule/${id}`),
  
  toggle: (id: string) => apiClient.patch(`/schedule/${id}/toggle`),
  
  bulkUpdateDay: (day: string, schedule: any[]) => 
    apiClient.put(`/schedule/day/${day}/bulk`, { schedule }),
  
  getStats: () => apiClient.get('/schedule/stats/overview'),
};

// Analytics API
export const analyticsApi = {
  track: (data: { page_path: string; referrer?: string; user_agent?: string; session_id?: string }) =>
    apiClient.post('/analytics/track', data),
  
  getOverview: (days?: number) => {
    const queryParams = days ? `?days=${days}` : '';
    return apiClient.get(`/analytics/overview${queryParams}`);
  },
  
  getPages: (days?: number, page?: string) => {
    const queryParams = new URLSearchParams();
    if (days) queryParams.append('days', days.toString());
    if (page) queryParams.append('page', page);
    return apiClient.get(`/analytics/pages?${queryParams.toString()}`);
  },
  
  getVisitors: (days?: number) => {
    const queryParams = days ? `?days=${days}` : '';
    return apiClient.get(`/analytics/visitors${queryParams}`);
  },
  
  getRealtime: () => apiClient.get('/analytics/realtime'),
  
  getContent: (days?: number) => {
    const queryParams = days ? `?days=${days}` : '';
    return apiClient.get(`/analytics/content${queryParams}`);
  },
  
  cleanup: (days?: number) => {
    const queryParams = days ? `?days=${days}` : '';
    return apiClient.delete(`/analytics/cleanup${queryParams}`);
  },
};

// Prayer Intentions API
export const prayersApi = {
  getAll: (params?: { page?: number; limit?: number; approved?: boolean; urgent?: boolean }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    return apiClient.get(`/prayers?${queryParams.toString()}`);
  },
  
  submit: (prayerData: any) => apiClient.post('/prayers', prayerData),
  
  approve: (id: string) => apiClient.patch(`/prayers/${id}/approve`),
  
  delete: (id: string) => apiClient.delete(`/prayers/${id}`),
  
  getPending: () => apiClient.get('/prayers/pending'),
  
  getStats: () => apiClient.get('/prayers/stats/overview'),
};

// Gallery API
export const galleryApi = {
  getAll: (params?: { page?: number; limit?: number; category?: string; featured?: boolean; event_id?: string }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    return apiClient.get(`/gallery?${queryParams.toString()}`);
  },
  
  getFeatured: (limit?: number) => {
    const queryParams = limit ? `?limit=${limit}` : '';
    return apiClient.get(`/gallery/featured${queryParams}`);
  },
  
  getById: (id: string) => apiClient.get(`/gallery/${id}`),
  
  create: (galleryData: any) => apiClient.post('/gallery', galleryData),
  
  update: (id: string, galleryData: any) => apiClient.put(`/gallery/${id}`, galleryData),
  
  delete: (id: string) => apiClient.delete(`/gallery/${id}`),
};

// Ministries API
export const ministriesApi = {
  getAll: (params?: { page?: number; limit?: number; active?: boolean; search?: string }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    return apiClient.get(`/ministries?${queryParams.toString()}`);
  },
  
  getActive: () => apiClient.get('/ministries/active'),
  
  getById: (id: string) => apiClient.get(`/ministries/${id}`),
  
  create: (ministryData: any) => apiClient.post('/ministries', ministryData),
  
  update: (id: string, ministryData: any) => apiClient.put(`/ministries/${id}`, ministryData),
  
  delete: (id: string) => apiClient.delete(`/ministries/${id}`),
  
  toggle: (id: string) => apiClient.patch(`/ministries/${id}/toggle`),
};

// Sacraments API
export const sacramentsApi = {
  getAll: (params?: { page?: number; limit?: number; active?: boolean; search?: string }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    return apiClient.get(`/sacraments?${queryParams.toString()}`);
  },
  
  getActive: () => apiClient.get('/sacraments/active'),
  
  getById: (id: string) => apiClient.get(`/sacraments/${id}`),
  
  create: (sacramentData: any) => apiClient.post('/sacraments', sacramentData),
  
  update: (id: string, sacramentData: any) => apiClient.put(`/sacraments/${id}`, sacramentData),
  
  delete: (id: string) => apiClient.delete(`/sacraments/${id}`),
  
  toggle: (id: string) => apiClient.patch(`/sacraments/${id}/toggle`),
};

// Export the API client for direct use if needed
export { apiClient };

// Set token method for authentication
export const setAuthToken = (token: string | null) => {
  apiClient.setToken(token);
};

// Video API
export const videoApi = {
  // Live Streams
  getStreams: (params?: { active?: boolean; scheduled?: boolean }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    return apiClient.get(`/videos/streams?${queryParams.toString()}`);
  },
  
  createStream: (data: {
    title: string;
    description: string;
    streamUrl: string;
    scheduledTime: string;
    thumbnail?: string;
  }) => apiClient.post('/videos/streams', data),
  
  updateStream: (id: string, data: Partial<{
    title: string;
    description: string;
    streamUrl: string;
    scheduledTime: string;
    thumbnail: string;
    isLive: boolean;
  }>) => apiClient.put(`/videos/streams/${id}`, data),
  
  deleteStream: (id: string) => apiClient.delete(`/videos/streams/${id}`),
  
  // Video Archive
  getArchive: (params?: { 
    page?: number; 
    limit?: number; 
    category?: string; 
    published?: boolean;
    search?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    return apiClient.get(`/videos/archive?${queryParams.toString()}`);
  },
  
  createVideo: (data: {
    title: string;
    description: string;
    videoUrl: string;
    category: string;
    duration?: string;
    thumbnail?: string;
  }) => apiClient.post('/videos/archive', data),
  
  updateVideo: (id: string, data: Partial<{
    title: string;
    description: string;
    videoUrl: string;
    category: string;
    duration: string;
    thumbnail: string;
    isPublished: boolean;
  }>) => apiClient.put(`/videos/archive/${id}`, data),
  
  deleteVideo: (id: string) => apiClient.delete(`/videos/archive/${id}`),
  
  // Analytics
  getVideoAnalytics: (params?: { 
    timeRange?: string; 
    videoId?: string; 
    category?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    return apiClient.get(`/videos/analytics?${queryParams.toString()}`);
  },
  
  incrementViews: (id: string, type: 'stream' | 'archive') => 
    apiClient.post(`/videos/${type}/${id}/view`),
};

// Health check
export const healthCheck = () => apiClient.get('/health');

// Main API object
export const api = {
  auth: authApi,
  news: newsApi,
  events: eventsApi,
  announcements: announcementsApi,
  contact: contactApi,
  schedule: scheduleApi,
  analytics: analyticsApi,
  prayers: prayersApi,
  gallery: galleryApi,
  ministries: ministriesApi,
  sacraments: sacramentsApi,
  videos: videoApi,
  categories: categoriesApi,
  users: usersApi,
  upload: uploadApi,
  healthCheck,
  setAuthToken,
};
