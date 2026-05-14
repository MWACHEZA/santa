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


export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('currentUser');
      
      if (token && storedUser) {
        try {
          api.setAuthToken(token);
          setUser(JSON.parse(storedUser));
        } catch (error) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('currentUser');
        }

      }
      setIsLoading(false);
    };

    initializeAuth();

  }, []);

  const login = async (identifier: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.auth.login({ username: identifier, password });
      if (res.success && res.data) {
        const { user: rawUser, token } = res.data;
        
        // Map snake_case to camelCase
        const userData: User = {
          ...rawUser,
          firstName: rawUser.first_name,
          lastName: rawUser.last_name,
          phone: rawUser.phone,
          mustChangePassword: rawUser.must_change_password
        };

        setUser(userData);
        api.setAuthToken(token);
        localStorage.setItem('authToken', token);
        localStorage.setItem('currentUser', JSON.stringify(userData));
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

      const res = await api.auth.register(data as any);
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
      return res.data?.users || [];
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
              firstName: userData.firstName || userData.first_name || user.firstName,
              lastName: userData.lastName || userData.last_name || user.lastName,
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