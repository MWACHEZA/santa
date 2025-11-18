import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { api } from '../services/api';

export type UserRole = 'admin' | 'secretary' | 'priest' | 'reporter' | 'parishioner' | 'vice_secretary';

export interface User {
  id: string;
  username: string;
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  mustChangePassword?: boolean;
  dateOfBirth?: string;
  gender?: 'male' | 'female';
  address?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  
  // Parish Membership Information (optional for parishioners)
  association?: string;
  section?: string;
  
  // Sacramental Information (for parishioners)
  isBaptized?: boolean | null;
  baptismDate?: string;
  baptismVenue?: string;
  
  isConfirmed?: boolean | null;
  confirmationDate?: string;
  confirmationVenue?: string;
  
  receivesCommunion?: boolean | null;
  firstCommunionDate?: string;
  
  isMarried?: boolean | null;
  marriageDate?: string;
  marriageVenue?: string;
  spouseName?: string;
  
  // Priest-specific Information (for priests only)
  ordinationDate?: string;
  ordinationVenue?: string;
  ordainedBy?: string;
  
  createdAt?: string;
  updatedAt?: string;
}

interface RegistrationData {
  username: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  phone: string;
  password: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | '';
  address?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  section?: string;
  association?: string; // Single association (for Register.tsx)
  associations?: string[]; // Multiple associations (for ModernRegister.tsx)
  profilePicture?: File | null;
  role?: UserRole;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<{ success: boolean; role?: UserRole; message?: string; mustChangePassword?: boolean }>;
  register: (data: RegistrationData) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  saveProfile: (updates: Partial<User>) => Promise<{ success: boolean; message: string }>;
  // Admin user management helpers
  listUsers: () => User[];
  createUser: (u: Omit<User, 'id'> & { password: string }) => { success: boolean; message: string };
  updateUser: (id: string, updates: Partial<User>) => { success: boolean; message: string };
  deleteUser: (id: string) => { success: boolean; message: string };
  resetPassword: (id: string) => { success: boolean; message: string };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Type for default users with password (for development only)
// interface DefaultUser extends User {
//   password: string;
// }

// Default users with more realistic test accounts
type StoredUser = User & { password: string };

const defaultUsers: StoredUser[] = [
  // Admin account (full access)
  { 
    id: '1',
    username: 'admin', 
    password: 'admin123', 
    role: 'admin' as UserRole,
    email: 'admin@stpatricks.org',
    firstName: 'Admin',
    lastName: 'User',
    phone: '+263 77 123 4567',
    dateOfBirth: '1980-01-15',
    address: 'Church Office, Makokoba Township, Bulawayo',
    emergencyContact: 'Parish Office',
    emergencyPhone: '+263 77 000 0001',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  // Parishioner account (basic access)
  { 
    id: '2',
    username: 'parishioner', 
    password: 'parishioner123', 
    role: 'parishioner' as UserRole,
    email: 'john.doe@example.com',
    firstName: 'John',
    lastName: 'Doe',
    phone: '+263 77 765 4321',
    dateOfBirth: '1985-06-20',
    address: '123 Main Street, Makokoba Township, Bulawayo',
    emergencyContact: 'Jane Doe',
    emergencyPhone: '+263 77 765 4322',
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z'
  },
  // Priest account
  { 
    id: '3',
    username: 'priest', 
    password: 'priest123', 
    role: 'priest' as UserRole,
    email: 'father.michael@stpatricks.org',
    firstName: 'Father Michael',
    lastName: 'O\'Connor',
    phone: '+263 77 123 9876',
    dateOfBirth: '1975-03-10',
    address: 'Parish House, St. Patrick\'s Catholic Church, Bulawayo',
    emergencyContact: 'Bishop\'s Office',
    emergencyPhone: '+263 77 000 0002',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  // Secretary account
  { 
    id: '4',
    username: 'secretary', 
    password: 'secretary123', 
    role: 'secretary' as UserRole,
    email: 'mary.secretary@stpatricks.org',
    firstName: 'Mary',
    lastName: 'Chikwanha',
    phone: '+263 77 987 6543',
    dateOfBirth: '1990-08-25',
    address: '456 Church Avenue, Makokoba Township, Bulawayo',
    emergencyContact: 'Peter Chikwanha',
    emergencyPhone: '+263 77 987 6544',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  // Reporter account
  { 
    id: '5',
    username: 'reporter', 
    password: 'reporter123', 
    role: 'reporter' as UserRole,
    email: 'sarah.reporter@stpatricks.org',
    firstName: 'Sarah',
    lastName: 'Moyo',
    phone: '+263 77 555 1234',
    dateOfBirth: '1992-12-05',
    address: '789 Community Road, Makokoba Township, Bulawayo',
    emergencyContact: 'David Moyo',
    emergencyPhone: '+263 77 555 1235',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

const parseNullableBoolean = (value: any): boolean | null | undefined => {
  if (value === undefined) return undefined;
  if (value === null || value === '') return null;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  if (typeof value === 'string') {
    const normalized = value.toLowerCase();
    if (['true', '1'].includes(normalized)) return true;
    if (['false', '0'].includes(normalized)) return false;
  }
  return null;
};

const transformApiUser = (apiUser: any): User => ({
  id: apiUser.id,
  username: apiUser.username,
  email: apiUser.email ?? apiUser.emailAddress ?? undefined,
  phone: apiUser.phone ?? apiUser.phoneNumber ?? undefined,
  firstName: apiUser.firstName ?? apiUser.first_name ?? undefined,
  lastName: apiUser.lastName ?? apiUser.last_name ?? undefined,
  role: apiUser.role,
  mustChangePassword: apiUser.mustChangePassword ?? apiUser.must_change_password ?? undefined,
  dateOfBirth: apiUser.dateOfBirth ?? apiUser.date_of_birth ?? undefined,
  gender: apiUser.gender ?? undefined,
  address: apiUser.address ?? undefined,
  emergencyContact: apiUser.emergencyContact ?? apiUser.emergency_contact ?? undefined,
  emergencyPhone: apiUser.emergencyPhone ?? apiUser.emergency_phone ?? undefined,
  association: apiUser.association ?? apiUser.associationName ?? undefined,
  section: apiUser.section ?? apiUser.sectionName ?? undefined,
  isBaptized: parseNullableBoolean(apiUser.isBaptized ?? apiUser.is_baptized),
  baptismDate: apiUser.baptismDate ?? apiUser.baptism_date ?? undefined,
  baptismVenue: apiUser.baptismVenue ?? apiUser.baptism_venue ?? undefined,
  isConfirmed: parseNullableBoolean(apiUser.isConfirmed ?? apiUser.is_confirmed),
  confirmationDate: apiUser.confirmationDate ?? apiUser.confirmation_date ?? undefined,
  confirmationVenue: apiUser.confirmationVenue ?? apiUser.confirmation_venue ?? undefined,
  receivesCommunion: parseNullableBoolean(apiUser.receivesCommunion ?? apiUser.receives_communion),
  firstCommunionDate: apiUser.firstCommunionDate ?? apiUser.first_communion_date ?? undefined,
  isMarried: parseNullableBoolean(apiUser.isMarried ?? apiUser.is_married),
  marriageDate: apiUser.marriageDate ?? apiUser.marriage_date ?? undefined,
  marriageVenue: apiUser.marriageVenue ?? apiUser.marriage_venue ?? undefined,
  spouseName: apiUser.spouseName ?? apiUser.spouse_name ?? undefined,
  ordinationDate: apiUser.ordinationDate ?? apiUser.ordination_date ?? undefined,
  ordinationVenue: apiUser.ordinationVenue ?? apiUser.ordination_venue ?? undefined,
  ordainedBy: apiUser.ordainedBy ?? apiUser.ordained_by ?? undefined,
  createdAt: apiUser.createdAt ?? apiUser.created_at ?? undefined,
  updatedAt: apiUser.updatedAt ?? apiUser.updated_at ?? undefined,
});

// Local user store helpers (persisted in localStorage)
const USER_STORE_KEY = 'userStore';
function loadUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(USER_STORE_KEY);
    if (raw) return JSON.parse(raw);
    localStorage.setItem(USER_STORE_KEY, JSON.stringify(defaultUsers));
    return defaultUsers;
  } catch {
    return defaultUsers;
  }
}
function saveUsers(users: StoredUser[]) {
  localStorage.setItem(USER_STORE_KEY, JSON.stringify(users));
}
function findUserByIdentifier(users: StoredUser[], identifier: string): StoredUser | undefined {
  const trimmedId = identifier.trim();
  const idLower = trimmedId.toLowerCase();
  
  return users.find(u =>
    u.username.toLowerCase() === idLower ||
    (u.email?.toLowerCase() === idLower) ||
    (u.phone?.replace(/\s+/g, '') === trimmedId.replace(/\s+/g, ''))
  );
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('currentUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const persistUser = useCallback((rawUser: any | null) => {
    if (!rawUser) {
      setUser(null);
      localStorage.removeItem('currentUser');
      return null;
    }
    const mappedUser = transformApiUser(rawUser);
    setUser(mappedUser);
    localStorage.setItem('currentUser', JSON.stringify(mappedUser));
    return mappedUser;
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      const response = await api.auth.getProfile();
      if (response.success && response.data?.user) {
        persistUser(response.data.user);
      }
    } catch (error) {
      console.error('Profile sync error:', error);
    }
  }, [persistUser]);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (token) {
          api.setAuthToken(token);
          await refreshProfile();
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        localStorage.removeItem('authToken');
        persistUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [persistUser, refreshProfile]);

  const login = async (identifier: string, password: string): Promise<{ success: boolean; role?: UserRole; message?: string; mustChangePassword?: boolean }> => {
    setIsLoading(true);
    const trimmedIdentifier = identifier.trim();
    const normalizedIdentifier = trimmedIdentifier.toLowerCase();
    const trimmedPassword = password.trim();

    try {
      try {
        const response = await api.auth.login({
          username: identifier,
          password
        });

        if (response.success && response.data?.user) {
          const { user: apiUser, token, refreshToken } = response.data as any;
          if (token) {
            api.setAuthToken(token);
            localStorage.setItem('authToken', token);
          }
          if (refreshToken) {
            localStorage.setItem('refreshToken', refreshToken);
          }
          const mappedUser = persistUser(apiUser);
          const mustChange = mappedUser?.mustChangePassword === true || trimmedPassword === 'Password';
          if (mustChange && mappedUser) {
            localStorage.setItem('pendingPasswordChangeUser', mappedUser.username);
            return { success: true, role: mappedUser.role, message: 'Password change required', mustChangePassword: true };
          }
          return { success: true, role: mappedUser?.role, message: `Welcome ${mappedUser?.firstName || mappedUser?.username || 'back'}!` };
        }
      } catch (error) {
        console.warn('API login failed, attempting local fallback', error);
      }

      await new Promise(resolve => setTimeout(resolve, 500));

      const users = loadUsers();
      const foundUser = findUserByIdentifier(users, normalizedIdentifier) || findUserByIdentifier(users, trimmedIdentifier);
      const isPasswordValid = foundUser && foundUser.password === trimmedPassword;

      if (foundUser && isPasswordValid) {
        const mappedUser = persistUser(foundUser);
        if (mappedUser) {
          const mustChange = mappedUser.mustChangePassword === true || trimmedPassword === 'Password';
          if (mustChange) {
            localStorage.setItem('pendingPasswordChangeUser', mappedUser.username);
            return { success: true, role: mappedUser.role, message: 'Password change required', mustChangePassword: true };
          }
          return { success: true, role: mappedUser.role, message: `Welcome ${mappedUser.firstName || mappedUser.username}!` };
        }
      }

      return {
        success: false,
        message: 'Invalid credentials. Please check your email/phone and password.'
      };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegistrationData): Promise<{ success: boolean; message: string }> => {
    try {
      setIsLoading(true);
      
      // Handle profile picture upload if present
      let profilePictureUrl = undefined;
      if (data.profilePicture) {
        try {
          const uploadResponse = await api.upload.uploadSingle(data.profilePicture, 'profile');
          if (uploadResponse.success && uploadResponse.data?.url) {
            profilePictureUrl = uploadResponse.data.url;
          }
        } catch (uploadError) {
          console.warn('Profile picture upload failed, continuing without it:', uploadError);
        }
      }
      
      const response = await api.auth.register({
        username: data.username, // Use provided username instead of email prefix
        email: data.email,
        password: data.password,
        role: 'parishioner',
        firstName: data.firstName,
        lastName: data.lastName,
        middleName: data.middleName || undefined,
        phone: data.phone,
        dateOfBirth: data.dateOfBirth || undefined,
        gender: data.gender || undefined,
        address: data.address || undefined,
        emergencyContact: data.emergencyContact || undefined,
        emergencyPhone: data.emergencyPhone || undefined,
        section: data.section || undefined,
        association: Array.isArray(data.associations) ? data.associations[0] : data.association || undefined,
        profilePicture: profilePictureUrl || undefined
      });

      if (response.success) {
        // Also persist locally in userStore for development/non-API flow
        const users = loadUsers();
        const newUser: StoredUser = {
          id: (Date.now()).toString(),
          username: (data.email?.split('@')[0] || data.phone || `${data.firstName}${data.lastName}`).toLowerCase(),
          email: data.email,
          phone: data.phone,
          firstName: data.firstName,
          lastName: data.lastName,
          role: 'parishioner',
          password: data.password,
          mustChangePassword: false,
          dateOfBirth: data.dateOfBirth || undefined,
          address: data.address || undefined,
          emergencyContact: data.emergencyContact || undefined,
          emergencyPhone: data.emergencyPhone || undefined,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        users.push(newUser);
        saveUsers(users);
        
        return {
          success: true,
          message: 'Registration successful! Please sign in with your credentials.'
        };
      } else {
        return {
          success: false,
          message: response.message || 'Registration failed. Please try again.'
        };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: 'Registration failed. Please check your internet connection and try again.'
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    persistUser(null);
    api.setAuthToken(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('pendingPasswordChangeUser');
    // Clear any admin context data as well
    localStorage.removeItem('adminUser');
    localStorage.removeItem('adminToken');
    // Force reload to clear all state and redirect to login
    window.location.href = '/login';
  };

  const saveProfile = async (updates: Partial<User>) => {
    try {
      const response = await api.auth.updateProfile(updates);
      if (response.success && response.data?.user) {
        persistUser(response.data.user);
        return { success: true, message: response.message || 'Profile updated successfully' };
      }
      return { success: false, message: response.message || 'Failed to update profile' };
    } catch (error) {
      console.error('Profile update error:', error);
      return {
        success: false,
        message: 'Failed to update profile. Please try again.'
      };
    }
  };

  // Admin user management (local-only implementation)
  const listUsers = (): User[] => loadUsers().map(({ password, ...u }) => u);
  const createUser = (u: Omit<User, 'id'> & { password: string }) => {
    const users = loadUsers();
    if (findUserByIdentifier(users, u.username) || (u.email && findUserByIdentifier(users, u.email)) || (u.phone && findUserByIdentifier(users, u.phone))) {
      return { success: false, message: 'User with same identifier already exists' };
    }
    const now = new Date().toISOString();
    const newUser: StoredUser = { 
      ...u, 
      id: (Date.now()).toString(),
      createdAt: now,
      updatedAt: now
    } as StoredUser;
    users.push(newUser);
    saveUsers(users);
    return { success: true, message: 'User created' };
  };
  const updateUser = (id: string, updates: Partial<User>) => {
    const users = loadUsers();
    const idx = users.findIndex(u => u.id === id);
    if (idx === -1) return { success: false, message: 'User not found' };
    users[idx] = { ...users[idx], ...updates, updatedAt: new Date().toISOString() } as StoredUser;
    saveUsers(users);
    
    // If updating current user, update the user state and localStorage
    if (user && user.id === id) {
      const updatedUser = { ...user, ...updates, updatedAt: new Date().toISOString() };
      setUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    }
    
    return { success: true, message: 'User updated' };
  };
  const deleteUser = (id: string) => {
    const users = loadUsers();
    const next = users.filter(u => u.id !== id);
    saveUsers(next);
    return { success: true, message: 'User deleted' };
  };
  const resetPassword = (id: string) => {
    const users = loadUsers();
    const idx = users.findIndex(u => u.id === id);
    if (idx === -1) return { success: false, message: 'User not found' };
    users[idx].password = 'Password';
    users[idx].mustChangePassword = true;
    saveUsers(users);
    return { success: true, message: "Password reset to 'Password' and must change on next login" };
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    refreshProfile,
    saveProfile,
    listUsers,
    createUser,
    updateUser,
    deleteUser,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
// User and UserRole types are already defined at the top of the file