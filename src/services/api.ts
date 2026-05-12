const isProduction = typeof window !== 'undefined' && window.location.hostname.includes('onrender.com');
const API_BASE_URL = isProduction 
  ? 'https://santa-backend-3y5e.onrender.com/api'
  : (process.env.REACT_APP_API_URL || 'http://localhost:5000/api');

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

  // Get base URL
  getBaseUrl() {
    return this.baseURL;
  }

  // Get authentication headers
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    const token = this.token || localStorage.getItem('authToken');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      headers['x-access-token'] = token;
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
      console.log(`🚀 API Request: ${options.method || 'GET'} ${url}`);
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
        headers['x-access-token'] = token;
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
  

  register: (userData: any | FormData) => {
    if (userData instanceof FormData) {
      return apiClient.uploadFile('/auth/register', userData);
    }
    return apiClient.post('/auth/register', userData);
  },

  
  logout: () => apiClient.post('/auth/logout'),
  
  getProfile: () => apiClient.get('/auth/profile'),
  

  updateProfile: (data: any | FormData) => {
    if (data instanceof FormData) {
      return apiClient.uploadFile('/auth/profile', data);
    }
    return apiClient.put('/auth/profile', data);
  },

  
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
    if (type) formData.append('type', type);
    formData.append('file', file);
    return apiClient.uploadFile('/upload/single', formData);
  },
  
  uploadMultiple: (files: File[], type?: string) => {
    const formData = new FormData();
    if (type) formData.append('type', type);
    files.forEach(file => formData.append('files', file));
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
    const qs = `?${queryParams.toString()}`;
    return (async () => {
      const endpoints = [`/admin/users${qs}`, `/users${qs}`];
      for (const ep of endpoints) {
        try {
          const res = await apiClient.get(ep);
          if (res && res.success) return res;
        } catch {}
      }
      return { success: false, data: { users: [] } } as ApiResponse<any>;
    })();
  },

  getById: (id: string) => (async () => {
    const endpoints = [`/admin/users/${id}`, `/users/${id}`];
    for (const ep of endpoints) {
      try {
        const res = await apiClient.get(ep);
        if (res && res.success) return res;
      } catch {}
    }
    return { success: false } as ApiResponse<any>;
  })(),
  
  create: (userData: any) => (async () => {
    const attempts = [
      { ep: '/admin/users', payload: userData },
      { ep: '/users', payload: userData },
      // Fallback to auth/register when admin routes are unavailable
      { ep: '/auth/register', payload: {
        username: userData.username,
        email: userData.email,
        password: userData.password,
        role: userData.role,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
      } }
    ];
    for (const { ep, payload } of attempts) {
      try {
        const res = await apiClient.post(ep, payload);
        if (res && res.success) return res;
      } catch {}
    }
    return { success: false, message: 'Failed to create user' } as ApiResponse<any>;
  })(),
  
  update: (id: string, userData: any) => (async () => {
    const endpoints = [`/admin/users/${id}`, `/users/${id}`];
    for (const ep of endpoints) {
      try {
        const res = await apiClient.put(ep, userData);
        if (res && res.success) return res;
      } catch {}
    }
    return { success: false, message: 'Failed to update user' } as ApiResponse<any>;
  })(),
  
  delete: (id: string) => (async () => {
    const endpoints = [`/admin/users/${id}`, `/users/${id}`];
    for (const ep of endpoints) {
      try {
        const res = await apiClient.delete(ep);
        if (res && res.success) return res;
      } catch {}
    }
    return { success: false, message: 'Failed to delete user' } as ApiResponse<any>;
  })(),
  
  resetPassword: (id: string, newPassword: string) => (async () => {
    const attempts = [
      { ep: `/admin/users/${id}/reset-password`, payload: { newPassword, password: newPassword } },
      { ep: `/users/${id}/reset-password`, payload: { newPassword, password: newPassword } },
    ];
    for (const { ep, payload } of attempts) {
      try {
        const res = await apiClient.patch(ep, payload);
        if (res && res.success) return res;
      } catch {}
    }
    return { success: false, message: 'Failed to reset password' } as ApiResponse<any>;
  })(),
  
  toggle: (id: string) => (async () => {
    const endpoints = [`/admin/users/${id}/toggle`, `/users/${id}/toggle`];
    for (const ep of endpoints) {
      try {
        const res = await apiClient.patch(ep);
        if (res && res.success) return res;
      } catch {}
    }
    return { success: false } as ApiResponse<any>;
  })(),
  
  getStats: () => apiClient.get('/admin/users/stats'),
};

// Contact API
export const contactApi = {
  get: () => apiClient.get('/contact'),
  update: (data: any) => apiClient.put('/contact', data),
  submitReporterApplication: (data: { name: string; surname: string; email: string; message: string }) =>
    apiClient.post('/contact/reporter-application', data),
};

// Schedule API
export const scheduleApi = {
  getAll: () => apiClient.get('/schedule'),
  getById: (id: string) => apiClient.get(`/schedule/${id}`),
  create: (scheduleData: any) => apiClient.post('/schedule', scheduleData),
  update: (id: string, scheduleData: any) => apiClient.put(`/schedule/${id}`, scheduleData),
  delete: (id: string) => apiClient.delete(`/schedule/${id}`),
  updateBulk: (schedules: any[]) => apiClient.put('/schedule/bulk', { schedules }),
  bulkUpdateDay: (day: string, schedules: any[]) => apiClient.put(`/schedule/day/${day}`, { schedules }),
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

export const liturgicalPrayersApi = {
  getAll: (params?: { page?: number; limit?: number; active?: boolean; category?: string }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    return apiClient.get(`/liturgical-prayers?${queryParams.toString()}`);
  },
  
  create: (prayerData: any) => apiClient.post('/liturgical-prayers', prayerData),
  
  update: (id: string, prayerData: any) => apiClient.put(`/liturgical-prayers/${id}`, prayerData),
  
  delete: (id: string) => apiClient.delete(`/liturgical-prayers/${id}`),
  
  getDailyReadings: (date: string) => apiClient.get(`/liturgical-prayers/readings/${date}`),
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
    const qs = `?${queryParams.toString()}`;
    return (async () => {
      const endpoints = [`/videos/streams${qs}`, `/streams${qs}`, `/live-streams${qs}`];
      for (const ep of endpoints) {
        try {
          const res = await apiClient.get(ep);
          if (res && res.success) return res;
        } catch {}
      }
      return { success: false, data: { items: [] } } as ApiResponse<any>;
    })();
  },
  
  createStream: (data: {
    title: string;
    description: string;
    streamUrl: string;
    scheduledTime: string;
    thumbnail?: string;
  }) => (async () => {
    const endpoints = ['/videos/streams', '/streams', '/live-streams'];
    for (const ep of endpoints) {
      try {
        const res = await apiClient.post(ep, data);
        if (res && res.success) return res;
      } catch {}
    }
    return { success: false, message: 'API endpoint not found for creating stream' } as ApiResponse<any>;
  })(),
  
  updateStream: (id: string, data: Partial<{
    title: string;
    description: string;
    streamUrl: string;
    scheduledTime: string;
    thumbnail: string;
    isLive: boolean;
  }>) => (async () => {
    const endpoints = [`/videos/streams/${id}`, `/streams/${id}`, `/live-streams/${id}`];
    for (const ep of endpoints) {
      try {
        const res = await apiClient.put(ep, data);
        if (res && res.success) return res;
      } catch {}
    }
    return { success: false, message: 'Failed to update stream' } as ApiResponse<any>;
  })(),
  
  deleteStream: (id: string) => (async () => {
    const endpoints = [`/videos/streams/${id}`, `/streams/${id}`, `/live-streams/${id}`];
    for (const ep of endpoints) {
      try {
        const res = await apiClient.delete(ep);
        if (res && res.success) return res;
      } catch {}
    }
    return { success: false, message: 'Failed to delete stream' } as ApiResponse<any>;
  })(),
  
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
    const qs = `?${queryParams.toString()}`;
    return (async () => {
      const endpoints = [`/videos/archive${qs}`, `/video-archive${qs}`, `/videos${qs}`];
      for (const ep of endpoints) {
        try {
          const res = await apiClient.get(ep);
          if (res && res.success) return res;
        } catch {}
      }
      return { success: false, data: { items: [] } } as ApiResponse<any>;
    })();
  },
  
  createVideo: (data: {
    title: string;
    description: string;
    videoUrl: string;
    category: string;
    duration?: string;
    thumbnail?: string;
  }) => (async () => {
    const endpoints = ['/videos/archive', '/video-archive', '/videos'];
    for (const ep of endpoints) {
      try {
        const res = await apiClient.post(ep, data);
        if (res && res.success) return res;
      } catch {}
    }
    return { success: false, message: 'API endpoint not found for adding video' } as ApiResponse<any>;
  })(),
  
  updateVideo: (id: string, data: Partial<{
    title: string;
    description: string;
    videoUrl: string;
    category: string;
    duration: string;
    thumbnail: string;
    isPublished: boolean;
  }>) => (async () => {
    const endpoints = [`/videos/archive/${id}`, `/video-archive/${id}`, `/videos/${id}`];
    for (const ep of endpoints) {
      try {
        const res = await apiClient.put(ep, data);
        if (res && res.success) return res;
      } catch {}
    }
    return { success: false, message: 'Failed to update video' } as ApiResponse<any>;
  })(),
  
  deleteVideo: (id: string) => (async () => {
    const endpoints = [`/videos/archive/${id}`, `/video-archive/${id}`, `/videos/${id}`];
    for (const ep of endpoints) {
      try {
        const res = await apiClient.delete(ep);
        if (res && res.success) return res;
      } catch {}
    }
    return { success: false, message: 'Failed to delete video' } as ApiResponse<any>;
  })(),
  
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
    
  startViewer: (id: string) => apiClient.post(`/videos/streams/${id}/viewer/start`),
  stopViewer: (id: string) => apiClient.post(`/videos/streams/${id}/viewer/stop`),
};

// Themes API
export const themesApi = {
  getAll: () => apiClient.get('/themes'),
  getActive: () => apiClient.get('/themes/active'),
  create: (data: any) => apiClient.post('/themes', data),
  update: (id: string, data: any) => apiClient.put(`/themes/${id}`, data),
  delete: (id: string) => apiClient.delete(`/themes/${id}`),
};

// Associations & Sections
export const associationsApi = {
  getAll: () => apiClient.get('/associations'),
};

export const sectionsApi = {
  getAll: () => apiClient.get('/sections'),
};

// Priest's Desk API
export const priestDeskApi = {
  getAll: () => apiClient.get('/priest-desk'),
  create: (data: any) => apiClient.post('/priest-desk', data),
  update: (id: string, data: any) => apiClient.put(`/priest-desk/${id}`, data),
  delete: (id: string) => apiClient.delete(`/priest-desk/${id}`),
};

// Finances API
export const financesApi = {
  getAll: (params?: { entityId?: string; entityType?: string }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    return apiClient.get(`/finances?${queryParams.toString()}`);
  },
  create: (data: any) => apiClient.post('/finances', data),
  updateStatus: (id: string, status: string) => 
    apiClient.patch(`/finances/${id}/status`, { status }),
};

// Audit Logs API
export const auditLogApi = {
  getAll: (params?: { page?: number; limit?: number; userId?: string; entityType?: string; action?: string }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    return apiClient.get(`/audit-logs?${queryParams.toString()}`);
  },
  create: (data: any) => apiClient.post('/audit-logs', data),
  getStats: () => apiClient.get('/audit-logs/stats/overview'),
};

// Health check
export const healthCheck = () => apiClient.get('/health');

// Export the API client for direct use if needed
export { apiClient };

// Set token method for authentication
export const setAuthToken = (token: string | null) => {
  apiClient.setToken(token);
};

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
  liturgicalPrayers: liturgicalPrayersApi,
  gallery: galleryApi,
  ministries: ministriesApi,
  sacraments: sacramentsApi,
  videos: videoApi,
  categories: categoriesApi,
  users: usersApi,
  upload: uploadApi,
  priestDesk: priestDeskApi,
  finances: financesApi,
  auditLogs: auditLogApi,
  themes: themesApi,
  associations: associationsApi,
  sections: sectionsApi,
  healthCheck,
  liturgical: {
    getToday: () => fetch('http://calapi.romcal.net/api/v1/day').then(res => res.json()),
    getDate: (year: number, month: number, day: number) => 
      fetch(`http://calapi.romcal.net/api/v1/dates/${year}/${month}/${day}`).then(res => res.json()),
  },
  apiClient,
  setAuthToken,
};

export default api;
