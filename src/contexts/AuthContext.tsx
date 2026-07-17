import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { api, apiClient } from '../services/api';

export type UserRole = 'admin' | 'secretary' | 'priest' | 'reporter' | 'parishioner' | 'vice_secretary' | 'committee_member' | 'council_member' | 'treasurer';

export interface User {
  id: string;
  username: string;
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  role: UserRole;

  mustChangePassword?: boolean | null;

  dateOfBirth?: string;
  gender?: 'male' | 'female' | null;
  address?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  association?: string;
  isCommitteeMember?: boolean | null;
  committeePosition?: string;
  section?: string;
  profilePicture?: string;
  profilePictureUrl?: string;
  
  // Sacramental & Marital Fields
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
  
  // Ordination (for priests)
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

  association?: string;
  committeePosition?: string;

  role?: UserRole;
  profilePicture?: File | null;
  
  // Sacramental Info
  isBaptized?: boolean;
  baptismDate?: string;
  baptismVenue?: string;
  isConfirmed?: boolean;
  confirmationDate?: string;
  confirmationVenue?: string;
  receivesCommunion?: boolean;
  firstCommunionDate?: string;
  isMarried?: boolean;
  marriageDate?: string;
  marriageVenue?: string;
  spouseName?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<{ 
    success: boolean; 
    role?: UserRole; 
    message?: string; 
    mustChangePassword?: boolean | null 
  }>;
  register: (data: RegistrationData | FormData) => Promise<{ success: boolean; message: string }>;
  logout: () => void;

  listUsers: () => Promise<User[]>;
  createUser: (u: Omit<User, 'id'> & { password: string }) => Promise<{ success: boolean; message: string; data?: User }>;
  updateUser: (id: string, updates: Partial<User> | FormData) => Promise<{ success: boolean; message: string }>;
  deleteUser: (id: string) => Promise<{ success: boolean; message: string }>;
  resetPassword: (id: string) => Promise<{ success: boolean; message: string }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; message: string }>;

}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


// Helper to fix image URLs from backend
const fixUrl = (url: string | undefined): string => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  const backendBase = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000' 
    : (process.env.REACT_APP_API_URL || 'https://st-patricks-makokoba.onrender.com');
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `${backendBase}${cleanPath}`;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('currentUser');
        
        if (token && storedUser) {
          try {
            api.setAuthToken(token);
            setUser(JSON.parse(storedUser));
          } catch (error) {
            try {
              localStorage.removeItem('authToken');
              localStorage.removeItem('currentUser');
            } catch (e) {
              // Ignore errors while cleaning up
            }
          }
        }
      } catch (err) {
        console.warn('Failed to access localStorage during auth initialization:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

  }, []);

  const login = async (identifier: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.auth.login({ username: identifier, password });
      if (res.success && res.data) {
        const { user: rawUser, token } = res.data;
        
        // Map snake_case to camelCase comprehensively
        const userData: User = {
          ...rawUser,
          id: rawUser.id || rawUser._id,
          firstName: rawUser.first_name || rawUser.firstName,
          lastName: rawUser.last_name || rawUser.lastName,
          middleName: rawUser.middle_name || rawUser.middleName,
          phone: rawUser.phone,
          dateOfBirth: rawUser.date_of_birth || rawUser.dateOfBirth,
          gender: rawUser.gender,
          address: rawUser.address,
          emergencyContact: rawUser.emergency_contact || rawUser.emergencyContact,
          emergencyPhone: rawUser.emergency_phone || rawUser.emergencyPhone,
          association: rawUser.association,
          section: rawUser.section || rawUser.parish_section,
          committeePosition: rawUser.committee_position || rawUser.committeePosition,
          isCommitteeMember: rawUser.is_committee_member !== undefined ? rawUser.is_committee_member : rawUser.isCommitteeMember,
          profilePicture: rawUser.profile_picture || rawUser.profilePicture,
          profilePictureUrl: fixUrl(rawUser.profile_picture || rawUser.profilePicture || rawUser.profile_picture_url || rawUser.profilePictureUrl),
          
          // Sacramental fields
          isBaptized: rawUser.is_baptized !== undefined ? rawUser.is_baptized : rawUser.isBaptized,
          baptismDate: rawUser.baptism_date || rawUser.baptismDate,
          baptismVenue: rawUser.baptism_venue || rawUser.baptismVenue,
          isConfirmed: rawUser.is_confirmed !== undefined ? rawUser.is_confirmed : rawUser.isConfirmed,
          confirmationDate: rawUser.confirmation_date || rawUser.confirmationDate,
          confirmationVenue: rawUser.confirmation_venue || rawUser.confirmationVenue,
          receivesCommunion: rawUser.receives_communion !== undefined ? rawUser.receives_communion : rawUser.receivesCommunion,
          firstCommunionDate: rawUser.first_communion_date || rawUser.firstCommunionDate,
          isMarried: rawUser.is_married !== undefined ? rawUser.is_married : rawUser.isMarried,
          marriageDate: rawUser.marriage_date || rawUser.marriageDate,
          marriageVenue: rawUser.marriage_venue || rawUser.marriageVenue,
          spouseName: rawUser.spouse_name || rawUser.spouseName,
          
          mustChangePassword: rawUser.must_change_password !== undefined ? rawUser.must_change_password : rawUser.mustChangePassword
        };

        setUser(userData);
        api.setAuthToken(token);
        try {
          localStorage.setItem('authToken', token);
          localStorage.setItem('currentUser', JSON.stringify(userData));
        } catch (storageErr) {
          console.warn('Failed to persist session to localStorage', storageErr);
        }
        setIsLoading(false);
        return { 
          success: true, 
          role: userData.role,
          mustChangePassword: userData.mustChangePassword
        };
      }
      setIsLoading(false);
      return { success: false, message: res.message || 'Login failed' };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, message: err.message || 'An error occurred during login' };

    }
  };

  const register = async (data: RegistrationData | FormData) => {
    try {
      let payload = data;
      
      // If not FormData, map camelCase to snake_case for backend compatibility
      if (!(data instanceof FormData)) {
        payload = {
          ...data,
          first_name: (data as any).firstName,
          last_name: (data as any).lastName,
          middle_name: (data as any).middleName,
          date_of_birth: (data as any).dateOfBirth,
          emergency_contact: (data as any).emergencyContact,
          emergency_phone: (data as any).emergencyPhone,
          section: (data as any).section || (data as any).parish_section,
          committee_position: (data as any).committeePosition,
          // Explicitly map these just in case
          username: (data as any).username,
          email: (data as any).email,
          password: (data as any).password,
          phone: (data as any).phone,
          gender: (data as any).gender,
          address: (data as any).address,
          association: (data as any).association,
          role: (data as any).role
        } as any;
      }

      const res = await api.auth.register(payload as any);
      if (res.success) {
        return { success: true, message: 'Registration successful' };
      }
      return { success: false, message: res.message || 'Registration failed' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Registration failed' };
    }
  };


  const logout = async () => {
    try {
      await api.auth.logout();
    } catch (err) {
      console.warn('Logout request failed, but clearing local session anyway');
    }
    api.setAuthToken(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    setUser(null);
  };

  const listUsers = async () => {
    try {
      const res = await api.users.getAll();
      const users = res.data?.users || res.data?.items || (Array.isArray(res.data) ? res.data : []);
      
      // Map all users to camelCase
      return users.map((u: any) => ({
        ...u,
        firstName: u.first_name || u.firstName,
        lastName: u.last_name || u.lastName,
        phone: u.phone,
        dateOfBirth: u.date_of_birth || u.dateOfBirth,
        gender: u.gender,
        section: u.section || u.parish_section,
        association: u.association,
        committeePosition: u.committee_position || u.committeePosition,
        profilePictureUrl: u.profile_picture_url || u.profilePictureUrl || u.profile_picture || u.profilePicture
      }));
    } catch (err) {
      return [];
    }
  };

  const createUser = async (u: Omit<User, 'id'> & { password: string }) => {
    try {
      const res = await api.users.create(u as any);
      return { 
        success: res.success, 
        message: res.message || (res.success ? 'User created' : 'Failed to create user'),
        data: res.data
      };
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed to create user' };
    }
  };

  const updateUser = async (id: string, updates: Partial<User> | FormData) => {
    try {
      let res;
      if (user && user.id === id) {
        // Try /auth/profile first, fall back to /users/:id if endpoint not found
        try {
          res = await api.auth.updateProfile(updates);
          // If backend returns 404 or endpoint-not-found, treat as failure
          if (!res.success && (res.message || '').toLowerCase().includes('not found')) {
            throw new Error('endpoint_not_found');
          }
        } catch (profileErr: any) {
          // Fallback: update via /users/:id
          res = await api.users.update(id, updates);
        }
        if (res.success) {
          const userData = res.data?.user || res.data;
          if (userData) {
            const updatedUser = {
              ...user,
              ...userData,
              firstName: userData.first_name || userData.firstName || user.firstName,
              lastName: userData.last_name || userData.lastName || user.lastName,
              middleName: userData.middle_name || userData.middleName || user.middleName,
              dateOfBirth: userData.date_of_birth || userData.dateOfBirth || user.dateOfBirth,
              gender: userData.gender || user.gender,
              section: userData.section || userData.parish_section || user.section,
              association: userData.association || user.association,
              committeePosition: userData.committee_position || userData.committeePosition || user.committeePosition,
              profilePicture: userData.profile_picture || userData.profilePicture || user.profilePicture,
              profilePictureUrl: fixUrl(userData.profile_picture || userData.profilePicture || userData.profile_picture_url || userData.profilePictureUrl) || user.profilePictureUrl,
              isBaptized: userData.is_baptized !== undefined ? userData.is_baptized : (userData.isBaptized !== undefined ? userData.isBaptized : user.isBaptized),
              isConfirmed: userData.is_confirmed !== undefined ? userData.is_confirmed : (userData.isConfirmed !== undefined ? userData.isConfirmed : user.isConfirmed),
              receivesCommunion: userData.receives_communion !== undefined ? userData.receives_communion : (userData.receivesCommunion !== undefined ? userData.receivesCommunion : user.receivesCommunion),
              isMarried: userData.is_married !== undefined ? userData.is_married : (userData.isMarried !== undefined ? userData.isMarried : user.isMarried),
            };
            setUser(updatedUser as User);
            localStorage.setItem('currentUser', JSON.stringify(updatedUser));
          }
        }
      } else {
        res = await api.users.update(id, updates);
      }
      return { success: res.success, message: res.message || (res.success ? 'User updated' : 'Failed to update user') };
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed to update user' };
    }
  };

  const deleteUser = async (id: string) => {
    try {
      const res = await api.users.delete(id);
      return { success: res.success, message: res.message || (res.success ? 'User deleted' : 'Failed to delete user') };
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed to delete user' };
    }
  };

  const resetPassword = async (id: string) => {
    try {
      // For admin reset, we'll provide a temporary password
      const tempPassword = 'Password';
      const res = await api.users.resetPassword(id, tempPassword);
      return { success: res.success, message: res.message || (res.success ? `Password reset to ${tempPassword}` : 'Failed to reset password') };
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed to reset password' };
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      const res = await api.auth.changePassword({ currentPassword, newPassword });
      return { success: res.success, message: res.message || (res.success ? 'Password changed successfully' : 'Failed to change password') };
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed to change password' };

    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    listUsers,
    createUser,
    updateUser,
    deleteUser,
    resetPassword,
    changePassword,
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