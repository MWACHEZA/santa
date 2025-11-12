import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | '';
  address?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  section?: string;
  associations?: string[];
  role?: UserRole;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<{ success: boolean; role?: UserRole; message?: string; mustChangePassword?: boolean }>;
  register: (data: RegistrationData) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
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
  const [isLoading, setIsLoading] = useState<boolean>(true); // Start with loading true
  const [user, setUser] = useState<User | null>(null); // Start with null, will be set after hydration

  // Initialize user from localStorage on mount
  useEffect(() => {
    const initializeAuth = () => {
      console.log('🔄 Initializing auth state...');
      try {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser);
          console.log('✅ Found saved user:', parsedUser.username);
          setUser(parsedUser);
        } else {
          console.log('ℹ️ No saved user found');
        }
      } catch (error) {
        console.error('❌ Error parsing saved user:', error);
        // Clear corrupted data
        localStorage.removeItem('currentUser');
        localStorage.removeItem('authToken');
      } finally {
        console.log('✅ Auth initialization complete, setting loading to false');
        setIsLoading(false); // Auth state is now ready
      }
    };

    // Add a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.log('⚠️ Auth initialization timeout, forcing loading to false');
      setIsLoading(false);
    }, 5000); // 5 second timeout

    initializeAuth();

    // Clear timeout if initialization completes normally
    return () => clearTimeout(timeoutId);
  }, []);

  const login = async (identifier: string, password: string): Promise<{ success: boolean; role?: UserRole; message?: string; mustChangePassword?: boolean }> => {
    // Set loading state during login
    console.log('🔐 Starting login process...');
    setIsLoading(true);
    
    // Trim whitespace from inputs
    const trimmedIdentifier = identifier.trim();
    const trimmedPassword = password.trim();

    try {
      // Try API login first
      const response = await api.auth.login({ 
        username: identifier, // Can be username, email, or phone
        password 
      });

      if (response.success && response.data) {
        const userData = response.data;
        const newUser: User = {
          id: userData.id,
          username: userData.username,
          email: userData.email,
          phone: userData.phone,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: userData.role,
          mustChangePassword: userData.mustChangePassword
        };
        
        const mustChange = newUser.mustChangePassword === true || trimmedPassword === 'Password';
        if (mustChange) {
          localStorage.setItem('pendingPasswordChangeUser', newUser.username);
          setIsLoading(false);
          return { success: true, role: newUser.role, message: 'Password change required', mustChangePassword: true };
        } else {
          console.log('✅ API Login successful, setting user:', newUser.username);
          setUser(newUser);
          localStorage.setItem('currentUser', JSON.stringify(newUser));
          localStorage.setItem('authToken', (response as any).token || '');
          setIsLoading(false);
          return { success: true, role: newUser.role, message: `Welcome ${newUser.username}!` };
        }
      }
    } catch (error) {
      // Silently fall back to local authentication when API is unavailable
      // This is expected behavior in development/offline mode
    }

    try {
      // Fallback to default users for development and local user store
      await new Promise(resolve => setTimeout(resolve, 500));

      const users = loadUsers();
      const foundUser = findUserByIdentifier(users, trimmedIdentifier);
      const isPasswordValid = foundUser && foundUser.password === trimmedPassword;

      if (foundUser && isPasswordValid) {
        const newUser: User = { 
          id: foundUser.id,
          username: foundUser.username,
          email: foundUser.email,
          phone: foundUser.phone,
          firstName: foundUser.firstName,
          lastName: foundUser.lastName,
          role: foundUser.role,
          mustChangePassword: foundUser.mustChangePassword,
          dateOfBirth: foundUser.dateOfBirth,
          address: foundUser.address,
          emergencyContact: foundUser.emergencyContact,
          emergencyPhone: foundUser.emergencyPhone,
          createdAt: foundUser.createdAt,
          updatedAt: foundUser.updatedAt
        };
        
        const mustChange = newUser.mustChangePassword === true || trimmedPassword === 'Password';
        if (mustChange) {
          localStorage.setItem('pendingPasswordChangeUser', newUser.username);
          setIsLoading(false);
          return { success: true, role: newUser.role, message: 'Password change required', mustChangePassword: true };
        } else {
          console.log('✅ Local Login successful, setting user:', newUser.username);
          setUser(newUser);
          localStorage.setItem('currentUser', JSON.stringify(newUser));
          setIsLoading(false);
          return { success: true, role: foundUser.role, message: `Welcome ${foundUser.firstName || foundUser.username}!` };
        }
      }

      setIsLoading(false);
      return {
        success: false,
        message: 'Invalid credentials. Please check your email/phone and password.'
      };
    } catch (error) {
      setIsLoading(false);
      return {
        success: false,
        message: 'An error occurred during login. Please try again.'
      };
    }
  };

  const register = async (data: RegistrationData): Promise<{ success: boolean; message: string }> => {
    try {
      setIsLoading(true);
      const response = await api.auth.register({
        username: data.email.split('@')[0], // Use email prefix as username
        email: data.email,
        password: data.password,
        role: 'parishioner',
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        dateOfBirth: data.dateOfBirth || undefined,
        address: data.address || undefined,
        emergencyContact: data.emergencyContact || undefined,
        emergencyPhone: data.emergencyPhone || undefined
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
    setUser(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
    localStorage.removeItem('pendingPasswordChangeUser');
    // Clear any admin context data as well
    localStorage.removeItem('adminUser');
    localStorage.removeItem('adminToken');
    // Force reload to clear all state and redirect to login
    window.location.href = '/login';
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